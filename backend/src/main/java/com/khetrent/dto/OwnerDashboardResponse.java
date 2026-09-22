package com.khetrent.dto;

import java.math.BigDecimal;
import java.util.List;

public class OwnerDashboardResponse {

    private BigDecimal totalEarnings;
    private long activeEquipmentCount;
    private long totalEquipmentCount;
    private long pendingBookingsCount;
    private long completedRentalsCount;
    private String ownerName;
    private String ownerEmail;
    private List<EquipmentResponse> equipmentList;
    private List<BookingResponse> bookingRequests;

    public OwnerDashboardResponse() {
        this.totalEarnings = BigDecimal.ZERO;
    }

    public OwnerDashboardResponse(BigDecimal totalEarnings, long activeEquipmentCount,
                                  long totalEquipmentCount, long pendingBookingsCount,
                                  long completedRentalsCount, String ownerName,
                                  String ownerEmail, List<EquipmentResponse> equipmentList,
                                  List<BookingResponse> bookingRequests) {
        this.totalEarnings = (totalEarnings != null) ? totalEarnings : BigDecimal.ZERO;
        this.activeEquipmentCount = activeEquipmentCount;
        this.totalEquipmentCount = totalEquipmentCount;
        this.pendingBookingsCount = pendingBookingsCount;
        this.completedRentalsCount = completedRentalsCount;
        this.ownerName = ownerName;
        this.ownerEmail = ownerEmail;
        this.equipmentList = equipmentList;
        this.bookingRequests = bookingRequests;
    }

    public BigDecimal getTotalEarnings() {
        return totalEarnings;
    }

    public void setTotalEarnings(BigDecimal totalEarnings) {
        this.totalEarnings = totalEarnings;
    }

    public long getActiveEquipmentCount() {
        return activeEquipmentCount;
    }

    public void setActiveEquipmentCount(long activeEquipmentCount) {
        this.activeEquipmentCount = activeEquipmentCount;
    }

    public long getTotalEquipmentCount() {
        return totalEquipmentCount;
    }

    public void setTotalEquipmentCount(long totalEquipmentCount) {
        this.totalEquipmentCount = totalEquipmentCount;
    }

    public long getPendingBookingsCount() {
        return pendingBookingsCount;
    }

    public void setPendingBookingsCount(long pendingBookingsCount) {
        this.pendingBookingsCount = pendingBookingsCount;
    }

    public long getCompletedRentalsCount() {
        return completedRentalsCount;
    }

    public void setCompletedRentalsCount(long completedRentalsCount) {
        this.completedRentalsCount = completedRentalsCount;
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

    public List<EquipmentResponse> getEquipmentList() {
        return equipmentList;
    }

    public void setEquipmentList(List<EquipmentResponse> equipmentList) {
        this.equipmentList = equipmentList;
    }

    public List<BookingResponse> getBookingRequests() {
        return bookingRequests;
    }

    public void setBookingRequests(List<BookingResponse> bookingRequests) {
        this.bookingRequests = bookingRequests;
    }
}
