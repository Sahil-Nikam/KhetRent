package com.khetrent.service;

import com.khetrent.dto.CategoryResponse;
import com.khetrent.dto.EquipmentRequest;
import com.khetrent.dto.EquipmentResponse;
import com.khetrent.exception.ConflictException;
import com.khetrent.exception.ResourceNotFoundException;
import com.khetrent.model.*;
import com.khetrent.repository.BookingRepository;
import com.khetrent.repository.EquipmentRepository;
import com.khetrent.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    public EquipmentService(EquipmentRepository equipmentRepository,
                            UserRepository userRepository,
                            BookingRepository bookingRepository) {
        this.equipmentRepository = equipmentRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories() {
        return Arrays.stream(EquipmentCategory.values())
                .map(CategoryResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EquipmentResponse> browseEquipment(String keyword, String categoryStr,
                                                    String location, BigDecimal maxPrice,
                                                    String availabilityStr) {
        // Normalise empty strings to null so JPQL treats them as "no filter"
        String kw = StringUtils.hasText(keyword) ? keyword.trim() : null;
        String loc = StringUtils.hasText(location) ? location.trim() : null;

        EquipmentCategory category = null;
        if (StringUtils.hasText(categoryStr)) {
            try {
                category = EquipmentCategory.valueOf(categoryStr.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // unknown category string → treat as no filter
            }
        }

        EquipmentAvailability availability = EquipmentAvailability.AVAILABLE;
        if (StringUtils.hasText(availabilityStr)) {
            try {
                availability = EquipmentAvailability.valueOf(availabilityStr.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {
                // unknown availability string → treat as AVAILABLE default
            }
        }

        return equipmentRepository.searchEquipment(kw, category, loc, maxPrice, availability)
                .stream()
                .map(EquipmentResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public EquipmentResponse addEquipment(EquipmentRequest request, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + ownerEmail));

        if (owner.getRole() != Role.OWNER) {
            throw new AccessDeniedException("Only equipment owners can list equipment.");
        }

        Equipment equipment = new Equipment(
                owner,
                request.getName(),
                request.getCategory(),
                request.getDescription(),
                request.getPricePerDay(),
                request.getPricePerHour(),
                request.getLocation(),
                request.getCity(),
                request.getState(),
                request.getPincode(),
                request.getImageUrl(),
                request.getSpecifications(),
                request.getAvailability() != null ? request.getAvailability() : EquipmentAvailability.AVAILABLE
        );

        Equipment saved = equipmentRepository.save(equipment);
        return new EquipmentResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<EquipmentResponse> getMyEquipment(String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + ownerEmail));

        return equipmentRepository.findByOwnerId(owner.getId()).stream()
                .map(EquipmentResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EquipmentResponse getEquipmentDetails(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with id: " + id));

        return new EquipmentResponse(equipment);
    }

    @Transactional
    public EquipmentResponse updateEquipment(Long id, EquipmentRequest request, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + ownerEmail));

        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with id: " + id));

        if (!equipment.getOwner().getId().equals(owner.getId())) {
            throw new AccessDeniedException("You are not authorized to edit this equipment. Only the owner can make changes.");
        }

        equipment.setName(request.getName());
        equipment.setCategory(request.getCategory());
        equipment.setDescription(request.getDescription());
        equipment.setPricePerDay(request.getPricePerDay());
        equipment.setPricePerHour(request.getPricePerHour());
        equipment.setLocation(request.getLocation());
        equipment.setCity(request.getCity());
        equipment.setState(request.getState());
        equipment.setPincode(request.getPincode());
        equipment.setImageUrl(request.getImageUrl());
        equipment.setSpecifications(request.getSpecifications());
        if (request.getAvailability() != null) {
            equipment.setAvailability(request.getAvailability());
        }

        Equipment updated = equipmentRepository.save(equipment);
        return new EquipmentResponse(updated);
    }

    @Transactional
    public Map<String, Object> deleteEquipment(Long id, String ownerEmail) {
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + ownerEmail));

        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with id: " + id));

        if (!equipment.getOwner().getId().equals(owner.getId())) {
            throw new AccessDeniedException("You are not authorized to delete this equipment. Only the owner can delete it.");
        }

        // 1. If it has PENDING or ACCEPTED bookings, reject with 409 Conflict
        boolean hasActiveBookings = bookingRepository.existsByEquipmentIdAndStatusIn(
                id,
                Arrays.asList(BookingStatus.PENDING, BookingStatus.ACCEPTED)
        );

        if (hasActiveBookings) {
            throw new ConflictException("Cannot delete equipment: Active bookings (PENDING or ACCEPTED) exist for this equipment.");
        }

        // 2. Check total booking count
        long totalBookings = bookingRepository.countByEquipmentId(id);

        Map<String, Object> result = new HashMap<>();
        if (totalBookings > 0) {
            // Past booking history exists -> never permanently delete, set availability to UNAVAILABLE
            equipment.setAvailability(EquipmentAvailability.UNAVAILABLE);
            equipmentRepository.save(equipment);

            result.put("deletedPermanently", false);
            result.put("availability", EquipmentAvailability.UNAVAILABLE.name());
            result.put("message", "Equipment has past booking history. Permanent deletion prevented; availability status has been set to UNAVAILABLE.");
        } else {
            // 0 bookings -> permanent deletion allowed
            equipmentRepository.delete(equipment);

            result.put("deletedPermanently", true);
            result.put("message", "Equipment permanently deleted successfully.");
        }

        return result;
    }
}
