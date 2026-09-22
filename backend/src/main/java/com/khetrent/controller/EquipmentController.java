package com.khetrent.controller;

import com.khetrent.dto.ApiResponse;
import com.khetrent.dto.CategoryResponse;
import com.khetrent.dto.EquipmentRequest;
import com.khetrent.dto.EquipmentResponse;
import com.khetrent.service.EquipmentService;
import com.khetrent.service.FileStorageService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {

    private final EquipmentService equipmentService;
    private final FileStorageService fileStorageService;

    public EquipmentController(EquipmentService equipmentService, FileStorageService fileStorageService) {
        this.equipmentService = equipmentService;
        this.fileStorageService = fileStorageService;
    }

    // ── Owner-only: Upload Image ─────────────────────────────────────────────
    @PostMapping("/upload-image")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadEquipmentImage(
            @RequestParam("file") MultipartFile file) {
        String imageUrl = fileStorageService.storeEquipmentImage(file);
        Map<String, String> response = new HashMap<>();
        response.put("imageUrl", imageUrl);
        return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", response));
    }

    // ── Public: Browse / Search ──────────────────────────────────────────────
    @GetMapping("/browse")
    public ResponseEntity<ApiResponse<List<EquipmentResponse>>> browseEquipment(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String availability) {
        List<EquipmentResponse> results = equipmentService.browseEquipment(
                keyword, category, location, maxPrice, availability);
        return ResponseEntity.ok(ApiResponse.success("Equipment browse results", results));
    }

    // ── Public: Categories ───────────────────────────────────────────────────
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories() {
        List<CategoryResponse> categories = equipmentService.getCategories();
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", categories));
    }

    @PostMapping
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<EquipmentResponse>> addEquipment(
            @Valid @RequestBody EquipmentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        EquipmentResponse response = equipmentService.addEquipment(request, userDetails.getUsername());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Equipment listed successfully", response));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<List<EquipmentResponse>>> getMyEquipment(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<EquipmentResponse> equipmentList = equipmentService.getMyEquipment(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("My equipment retrieved successfully", equipmentList));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EquipmentResponse>> getEquipmentDetails(@PathVariable Long id) {
        EquipmentResponse response = equipmentService.getEquipmentDetails(id);
        return ResponseEntity.ok(ApiResponse.success("Equipment details retrieved successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<EquipmentResponse>> updateEquipment(
            @PathVariable Long id,
            @Valid @RequestBody EquipmentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        EquipmentResponse response = equipmentService.updateEquipment(id, request, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Equipment updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteEquipment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        Map<String, Object> result = equipmentService.deleteEquipment(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success((String) result.get("message"), result));
    }
}
