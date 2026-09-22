package com.khetrent.dto;

import com.khetrent.model.Equipment;
import com.khetrent.model.EquipmentAvailability;
import com.khetrent.model.EquipmentCategory;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class EquipmentResponse {

    private Long id;
    private Long ownerId;
    private String ownerName;
    private String ownerEmail;
    private String ownerPhone;
    private String name;
    private EquipmentCategory category;
    private String categoryDisplayName;
    private String description;
    private BigDecimal pricePerDay;
    private BigDecimal pricePerHour;
    private String location;
    private String city;
    private String state;
    private String pincode;
    private String imageUrl;
    private String specifications;
    private EquipmentAvailability availability;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public EquipmentResponse() {
    }

    public EquipmentResponse(Equipment equipment) {
        this.id = equipment.getId();
        if (equipment.getOwner() != null) {
            this.ownerId = equipment.getOwner().getId();
            this.ownerName = equipment.getOwner().getName();
            this.ownerEmail = equipment.getOwner().getEmail();
            this.ownerPhone = equipment.getOwner().getPhone();
        }
        this.name = equipment.getName();
        this.category = equipment.getCategory();
        if (equipment.getCategory() != null) {
            this.categoryDisplayName = equipment.getCategory().getDisplayName();
        }
        this.description = equipment.getDescription();
        this.pricePerDay = equipment.getPricePerDay();
        this.pricePerHour = equipment.getPricePerHour();
        this.location = equipment.getLocation();
        this.city = equipment.getCity();
        this.state = equipment.getState();
        this.pincode = equipment.getPincode();
        this.imageUrl = equipment.getImageUrl();
        this.specifications = equipment.getSpecifications();
        this.availability = equipment.getAvailability();
        this.createdAt = equipment.getCreatedAt();
        this.updatedAt = equipment.getUpdatedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getOwnerEmail() {
        return ownerEmail;
    }

    public void setOwnerEmail(String ownerEmail) {
        this.ownerEmail = ownerEmail;
    }

    public String getOwnerPhone() {
        return ownerPhone;
    }

    public void setOwnerPhone(String ownerPhone) {
        this.ownerPhone = ownerPhone;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public EquipmentCategory getCategory() {
        return category;
    }

    public void setCategory(EquipmentCategory category) {
        this.category = category;
    }

    public String getCategoryDisplayName() {
        return categoryDisplayName;
    }

    public void setCategoryDisplayName(String categoryDisplayName) {
        this.categoryDisplayName = categoryDisplayName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPricePerDay() {
        return pricePerDay;
    }

    public void setPricePerDay(BigDecimal pricePerDay) {
        this.pricePerDay = pricePerDay;
    }

    public BigDecimal getPricePerHour() {
        return pricePerHour;
    }

    public void setPricePerHour(BigDecimal pricePerHour) {
        this.pricePerHour = pricePerHour;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getSpecifications() {
        return specifications;
    }

    public void setSpecifications(String specifications) {
        this.specifications = specifications;
    }

    public EquipmentAvailability getAvailability() {
        return availability;
    }

    public void setAvailability(EquipmentAvailability availability) {
        this.availability = availability;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
