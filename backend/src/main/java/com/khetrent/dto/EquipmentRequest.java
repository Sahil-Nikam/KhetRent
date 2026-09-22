package com.khetrent.dto;

import com.khetrent.model.EquipmentAvailability;
import com.khetrent.model.EquipmentCategory;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public class EquipmentRequest {

    @NotBlank(message = "Equipment name is required")
    @Size(max = 150, message = "Equipment name cannot exceed 150 characters")
    private String name;

    @NotNull(message = "Equipment category is required")
    private EquipmentCategory category;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Price per day is required")
    @DecimalMin(value = "0.01", message = "Price per day must be greater than 0")
    private BigDecimal pricePerDay;

    @DecimalMin(value = "0.00", message = "Price per hour must be positive")
    private BigDecimal pricePerHour;

    @NotBlank(message = "Location is required")
    @Size(max = 200, message = "Location cannot exceed 200 characters")
    private String location;

    @Size(max = 100, message = "City cannot exceed 100 characters")
    private String city;

    @Size(max = 100, message = "State cannot exceed 100 characters")
    private String state;

    @Pattern(regexp = "^$|^[0-9]{6}$", message = "Pincode must be exactly 6 digits")
    private String pincode;

    @Size(max = 500, message = "Image URL cannot exceed 500 characters")
    private String imageUrl;

    @Size(max = 500, message = "Specifications cannot exceed 500 characters")
    private String specifications;

    private EquipmentAvailability availability;

    public EquipmentRequest() {
    }

    public EquipmentRequest(String name, EquipmentCategory category, String description,
                          BigDecimal pricePerDay, BigDecimal pricePerHour, String location,
                          String city, String state, String pincode, String imageUrl,
                          String specifications, EquipmentAvailability availability) {
        this.name = name;
        this.category = category;
        this.description = description;
        this.pricePerDay = pricePerDay;
        this.pricePerHour = pricePerHour;
        this.location = location;
        this.city = city;
        this.state = state;
        this.pincode = pincode;
        this.imageUrl = imageUrl;
        this.specifications = specifications;
        this.availability = availability;
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
}
