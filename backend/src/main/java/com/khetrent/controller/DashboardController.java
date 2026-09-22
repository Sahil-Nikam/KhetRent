package com.khetrent.controller;

import com.khetrent.dto.ApiResponse;
import com.khetrent.dto.OwnerDashboardResponse;
import com.khetrent.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/owner")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<OwnerDashboardResponse>> getOwnerDashboard(
            @AuthenticationPrincipal UserDetails userDetails) {
        OwnerDashboardResponse response = dashboardService.getOwnerDashboard(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Owner dashboard data retrieved successfully", response));
    }
}
