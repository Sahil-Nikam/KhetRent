package com.khetrent.controller;

import com.khetrent.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestRoleController {

    @GetMapping("/owner-only")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<String>> ownerOnlyEndpoint() {
        return ResponseEntity.ok(ApiResponse.success("Access granted: Owner role verified", "Owner portal access"));
    }

    @GetMapping("/farmer-only")
    @PreAuthorize("hasRole('FARMER')")
    public ResponseEntity<ApiResponse<String>> farmerOnlyEndpoint() {
        return ResponseEntity.ok(ApiResponse.success("Access granted: Farmer role verified", "Farmer portal access"));
    }
}
