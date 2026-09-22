package com.khetrent.dto;

import com.khetrent.model.Booking;
import com.khetrent.model.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class BookingResponse {

    private Long id;
    private Long equipmentId;
    private String equipmentName;
    private String equipmentCategory;
    private String equipmentImageUrl;
    private String ownerName;
    private String ownerPhone;
    private String farmerName;
    private String farmerPhone;
    private BookingStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalPrice;
    private LocalDateTime createdAt;

    public BookingResponse() {
    }

    public BookingResponse(Booking booking) {
        this.id = booking.getId();
        if (booking.getEquipment() != null) {
            this.equipmentId = booking.getEquipment().getId();
            this.equipmentName = booking.getEquipment().getName();
            this.equipmentCategory = booking.getEquipment().getCategory() != null ? booking.getEquipment().getCategory().name() : null;
            this.equipmentImageUrl = booking.getEquipment().getImageUrl();
            if (booking.getEquipment().getOwner() != null) {
                this.ownerName = booking.getEquipment().getOwner().getName();
                this.ownerPhone = booking.getEquipment().getOwner().getPhone();
            }
        }
        if (booking.getFarmer() != null) {
            this.farmerName = booking.getFarmer().getName();
            this.farmerPhone = booking.getFarmer().getPhone();
        }
        this.status = booking.getStatus();
        this.startDate = booking.getStartDate();
        this.endDate = booking.getEndDate();
        this.totalPrice = booking.getTotalPrice();
        this.createdAt = booking.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEquipmentId() {
        return equipmentId;
    }

    public void setEquipmentId(Long equipmentId) {
        this.equipmentId = equipmentId;
    }

    public String getEquipmentName() {
        return equipmentName;
    }

    public void setEquipmentName(String equipmentName) {
        this.equipmentName = equipmentName;
    }

    public String getEquipmentCategory() {
        return equipmentCategory;
    }

    public void setEquipmentCategory(String equipmentCategory) {
        this.equipmentCategory = equipmentCategory;
    }

    public String getEquipmentImageUrl() {
        return equipmentImageUrl;
    }

    public void setEquipmentImageUrl(String equipmentImageUrl) {
        this.equipmentImageUrl = equipmentImageUrl;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getOwnerPhone() {
        return ownerPhone;
    }

    public void setOwnerPhone(String ownerPhone) {
        this.ownerPhone = ownerPhone;
    }

    public String getFarmerName() {
        return farmerName;
    }

    public void setFarmerName(String farmerName) {
        this.farmerName = farmerName;
    }

    public String getFarmerPhone() {
        return farmerPhone;
    }

    public void setFarmerPhone(String farmerPhone) {
        this.farmerPhone = farmerPhone;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
