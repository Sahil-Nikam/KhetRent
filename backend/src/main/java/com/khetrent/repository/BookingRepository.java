package com.khetrent.repository;

import com.khetrent.model.Booking;
import com.khetrent.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    long countByEquipmentId(Long equipmentId);
    boolean existsByEquipmentIdAndStatusIn(Long equipmentId, Collection<BookingStatus> statuses);

    @Query("SELECT COALESCE(SUM(b.totalPrice), 0.00) FROM Booking b WHERE b.equipment.owner.id = :ownerId AND b.status = :status")
    BigDecimal calculateTotalEarningsByOwnerIdAndStatus(@Param("ownerId") Long ownerId, @Param("status") BookingStatus status);

    long countByEquipmentOwnerIdAndStatus(Long ownerId, BookingStatus status);

    @Query("SELECT b FROM Booking b JOIN FETCH b.equipment e JOIN FETCH b.farmer f JOIN FETCH e.owner o WHERE o.id = :ownerId ORDER BY b.createdAt DESC")
    List<Booking> findByEquipmentOwnerIdOrderByCreatedAtDesc(@Param("ownerId") Long ownerId);

    @Query("SELECT b FROM Booking b JOIN FETCH b.equipment e JOIN FETCH e.owner o JOIN FETCH b.farmer f WHERE f.id = :farmerId ORDER BY b.createdAt DESC")
    List<Booking> findByFarmerIdOrderByCreatedAtDesc(@Param("farmerId") Long farmerId);
}
