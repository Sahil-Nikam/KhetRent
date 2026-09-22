package com.khetrent.model;

public enum EquipmentCategory {
    TRACTOR("Tractors", "Standard, mini, and 4WD tractors for tilling, hauling, and heavy farm work"),
    HARVESTER("Harvesters & Combines", "Grain, paddy, and sugarcane combine harvesters and cutters"),
    TILLAGE("Tillage Equipment", "Rotavators, disc harrows, cultivators, and MB ploughs"),
    SEEDING_PLANTING("Seeding & Planting", "Seed drills, transplanters, and planter implements"),
    SPRAYER("Crop Protection & Sprayers", "Boom sprayers, orchard mist blowers, and drone sprayers"),
    IRRIGATION("Pumps & Irrigation", "Submersible pumps, diesel pump sets, and drip equipment"),
    TRAILER_TRANSPORT("Trailers & Haulage", "Tractor tipping trailers and cargo transport equipment"),
    HARVEST_POST_HARVEST("Post-Harvest Tools", "Threshers, winnowers, and grain driers"),
    OTHER("Other Farm Implements", "Post hole diggers, ditchers, and miscellaneous tools");

    private final String displayName;
    private final String description;

    EquipmentCategory(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
