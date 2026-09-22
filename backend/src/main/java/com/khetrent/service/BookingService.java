package com.khetrent.service;

import com.khetrent.dto.BookingRequest;
import com.khetrent.dto.BookingResponse;
import com.khetrent.exception.BadRequestException;
import com.khetrent.exception.ResourceNotFoundException;
import com.khetrent.model.*;
import com.khetrent.repository.BookingRepository;
import com.khetrent.repository.EquipmentRepository;
import com.khetrent.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;

    public BookingService(BookingRepository bookingRepository,
                          EquipmentRepository equipmentRepository,
                          UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.equipmentRepository = equipmentRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public BookingResponse createBooking(BookingRequest request, String farmerEmail) {
        User farmer = userRepository.findByEmail(farmerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + farmerEmail));

        Equipment equipment = equipmentRepository.findById(request.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with id: " + request.getEquipmentId()));

        if (equipment.getAvailability() != EquipmentAvailability.AVAILABLE) {
            throw new BadRequestException("Equipment is currently unavailable for booking.");
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("End date cannot be before start date.");
        }

        long days = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        if (days <= 0) {
            days = 1;
        }

        BigDecimal totalPrice = equipment.getPricePerDay().multiply(BigDecimal.valueOf(days));

        Booking booking = new Booking(
                equipment,
                farmer,
                BookingStatus.PENDING,
                request.getStartDate(),
                request.getEndDate(),
                totalPrice
        );

        Booking saved = bookingRepository.save(booking);
        return new BookingResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(String farmerEmail) {
        User farmer = userRepository.findByEmail(farmerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + farmerEmail));

        return bookingRepository.findByFarmerIdOrderByCreatedAtDesc(farmer.getId())
                .stream()
                .map(BookingResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getOwnerBookings(String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + ownerEmail));

        if (owner.getRole() != Role.OWNER) {
            throw new AccessDeniedException("Access denied: Only equipment owners can access owner bookings.");
        }

        return bookingRepository.findByEquipmentOwnerIdOrderByCreatedAtDesc(owner.getId())
                .stream()
                .map(BookingResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookingResponse updateBookingStatus(Long bookingId, BookingStatus status, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + ownerEmail));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        if (!booking.getEquipment().getOwner().getId().equals(owner.getId())) {
            throw new AccessDeniedException("Access denied: You are not authorized to update this booking request.");
        }

        booking.setStatus(status);
        Booking updated = bookingRepository.save(booking);
        return new BookingResponse(updated);
    }
}
