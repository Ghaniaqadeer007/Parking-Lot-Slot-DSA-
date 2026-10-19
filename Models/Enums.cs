namespace ParkingLotSlotAllocator.Models;

public enum VehicleType
{
    Sedan,
    SUV,
    Hatchback,
    Electric,
    Motorcycle,
    Van
}

public enum SlotType
{
    Standard,
    Compact,
    ElectricVehicle,
    VIP,
    Handicap
}

public enum SlotStatus
{
    Available,
    Occupied,
    Reserved,
    Maintenance
}
