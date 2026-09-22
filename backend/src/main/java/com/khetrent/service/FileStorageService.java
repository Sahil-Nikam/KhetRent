package com.khetrent.service;

import com.khetrent.exception.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.*;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadLocation = Paths.get("uploads/equipment").toAbsolutePath().normalize();
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(".jpg", ".jpeg", ".png", ".webp");
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    public FileStorageService() {
        try {
            Files.createDirectories(this.uploadLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not initialize upload folder at: " + uploadLocation, ex);
        }
    }

    public String storeEquipmentImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No image file provided.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("Image file size exceeds maximum limit of 10MB.");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg");
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex).toLowerCase();
        }

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Invalid image format (" + extension + "). Only JPG, JPEG, PNG, and WebP are allowed.");
        }

        String sanitizedBaseName = originalFilename.substring(0, dotIndex > 0 ? dotIndex : originalFilename.length())
                .replaceAll("[^a-zA-Z0-9_-]", "_");
        if (sanitizedBaseName.length() > 30) {
            sanitizedBaseName = sanitizedBaseName.substring(0, 30);
        }

        String uniqueFileName = UUID.randomUUID().toString() + "_" + sanitizedBaseName + extension;

        try {
            Path targetLocation = this.uploadLocation.resolve(uniqueFileName);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }
            return "/uploads/equipment/" + uniqueFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Failed to save image file: " + uniqueFileName, ex);
        }
    }
}
