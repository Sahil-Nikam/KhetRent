package com.khetrent.repository;

import com.khetrent.model.Equipment;
import com.khetrent.model.EquipmentAvailability;
import com.khetrent.model.EquipmentCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {
    List<Equipment> findByOwnerId(Long ownerId);
    Optional<Equipment> findByIdAndOwnerId(Long id, Long ownerId);

    long countByOwnerIdAndAvailability(Long ownerId, EquipmentAvailability availability);
    long countByOwnerId(Long ownerId);

    /**
     * Public browse/search — all parameters are optional (null = skip that filter).
     * keyword matches against name, description, specifications, location, city.
     */
    @Query("""
        SELECT e FROM Equipment e
        WHERE (:keyword IS NULL OR
               LOWER(e.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
               LOWER(e.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
               LOWER(e.specifications) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
               LOWER(e.city) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
               LOWER(e.location) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:category IS NULL OR e.category = :category)
          AND (:location IS NULL OR
               LOWER(e.location) LIKE LOWER(CONCAT('%', :location, '%')) OR
               LOWER(e.city) LIKE LOWER(CONCAT('%', :location, '%')) OR
               LOWER(e.state) LIKE LOWER(CONCAT('%', :location, '%')))
          AND (:maxPrice IS NULL OR e.pricePerDay <= :maxPrice)
          AND (:availability IS NULL OR e.availability = :availability)
        ORDER BY e.createdAt DESC
    """)
    List<Equipment> searchEquipment(
            @Param("keyword") String keyword,
            @Param("category") EquipmentCategory category,
            @Param("location") String location,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("availability") EquipmentAvailability availability
    );
}
