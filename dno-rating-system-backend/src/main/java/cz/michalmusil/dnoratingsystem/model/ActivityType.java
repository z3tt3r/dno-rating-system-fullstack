package cz.michalmusil.dnoratingsystem.model;

public enum ActivityType {
    AGRICULTURE_FORESTRY_FISHING("Agriculture, Forestry and Fishing", 0.9),
    MINING_QUARRYING("Mining and Quarrying", 1.3),
    MANUFACTURING_PHARMA_FIREARMS_TOBACCO("Manufacturing - Pharmaceuticals, Firearms, Tobacco", 1.25),
    MANUFACTURING_ELECTRONICS_HARDWARE_FOOD_BEVERAGE("Manufacturing - Electronics, Hardware, Food & Beverage", 1.0),
    MANUFACTURING_AUTOMOTIVE_OTHER("Manufacturing - Automotive and Other", 1.08),
    ENERGY_GAS_WATER_WASTE("Energy, Gas, Water Supply & Waste Management", 1.1),
    CONSTRUCTION("Construction", 1.1),
    RETAIL_WHOLESALE_MARKETING("Retail, Wholesale & Marketing", 1.15),
    TRANSPORTATION_STORAGE("Transportation and Storage", 1.1),
    ACCOMMODATION_FOOD_SERVICE("Accommodation and Food Service Activities", 1.0),
    ICT("Information and Communication Technology (ICT)", 1.25),
    REAL_ESTATE_PROFESSIONAL_SERVICES("Real Estate and Professional Services", 1.1),
    PUBLIC_SERVICES_EDUCATION_HEALTHCARE("Public Services, Education & Healthcare", 1.2),
    GAMBLING_SPORTS_CLUBS("Gambling and Sports Clubs", 2.0),
    ARTS_ENTERTAINMENT_OTHER_SERVICES("Arts, Entertainment and Other Services", 1.0);

    private final String description;
    private final double index;

    ActivityType(String description, double index) {
        this.description = description;
        this.index = index;
    }

    public String getDescription() {
        return description;
    }

    public double getIndex() {
        return index;
    }

    public static ActivityType fromDescription(String description) {
        for (ActivityType type : ActivityType.values()) {
            if (type.getDescription().equalsIgnoreCase(description)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown activity description: " + description);
    }
}