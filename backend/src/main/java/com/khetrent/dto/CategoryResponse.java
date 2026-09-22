package com.khetrent.dto;

import com.khetrent.model.EquipmentCategory;

public class CategoryResponse {

    private String name;
    private String displayName;
    private String description;

    public CategoryResponse() {
    }

    public CategoryResponse(EquipmentCategory category) {
        this.name = category.name();
        this.displayName = category.getDisplayName();
        this.description = category.getDescription();
    }

    public CategoryResponse(String name, String displayName, String description) {
        this.name = name;
        this.displayName = displayName;
        this.description = description;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
