package com.khetrent.service;

import com.khetrent.dto.BookingResponse;
import com.khetrent.dto.EquipmentResponse;
import com.khetrent.dto.OwnerDashboardResponse;
import com.khetrent.exception.ResourceNotFoundException;
import com.khetrent.model.BookingStatus;
import com.khetrent.model.EquipmentAvailability;
import com.khetrent.model.Role;
import com.khetrent.model.User;
import com.khetrent.repository.BookingRepository;
import com.khetrent.repository.EquipmentRepository;
import com.khetrent.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;

    public DashboardService(BookingRepository bookingRepository,
                            EquipmentRepository equipmentRepository,
                            UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.equipmentRepository = equipmentRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public OwnerDashboardResponse getOwnerDashboard(String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + ownerEmail));

        if (owner.getRole() != Role.OWNER) {
            throw new AccessDeniedException("Access denied: Only equipment owners can access the owner dashboard.");
        }

        // 1. Total Earnings strictly from COMPLETED bookings
        BigDecimal totalEarnings = bookingRepository.calculateTotalEarningsByOwnerIdAndStatus(
                owner.getId(),
                BookingStatus.COMPLETED
        );

        // 2. Active Equipment count (availability = AVAILABLE)
        long activeEquipmentCount = equipmentRepository.countByOwnerIdAndAvailability(
                owner.getId(),
                EquipmentAvailability.AVAILABLE
        );

        // 3. Total equipment owned
        long totalEquipmentCount = equipmentRepository.countByOwnerId(owner.getId());

        // 4. Pending Booking Requests count
        long pendingBookingsCount = bookingRepository.countByEquipmentOwnerIdAndStatus(
                owner.getId(),
                BookingStatus.PENDING
        );

        // 5. Completed Rentals count
        long completedRentalsCount = bookingRepository.countByEquipmentOwnerIdAndStatus(
                owner.getId(),
                BookingStatus.COMPLETED
        );

        // 6. Owner's Equipment List
        List<EquipmentResponse> equipmentList = equipmentRepository.findByOwnerId(owner.getId()).stream()
                .map(EquipmentResponse::new)
                .collect(Collectors.toList());

        // 7. Owner's Booking Requests
        List<BookingResponse> bookingRequests = bookingRepository.findByEquipmentOwnerIdOrderByCreatedAtDesc(owner.getId())
                .stream()
                .map(BookingResponse::new)
                .collect(Collectors.toList());

        return new OwnerDashboardResponse(
                totalEarnings,
                activeEquipmentCount,
                totalEquipmentCount,
                pendingBookingsCount,
                completedRentalsCount,
                owner.getName(),
                owner.getEmail(),
                equipmentList,
                bookingRequests
        );
    }
}
