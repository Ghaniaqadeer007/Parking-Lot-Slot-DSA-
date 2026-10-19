namespace ParkingLotSlotAllocator.Models;

public class Vehicle
{
    public string LicensePlate { get; set; } = string.Empty;
    public VehicleType Type { get; set; } = VehicleType.Sedan;
    public string ColorName { get; set; } = "Silver";
    public string OwnerName { get; set; } = "Visitor";
    public DateTime EntryTime { get; set; } = DateTime.Now;
    public string TicketId { get; set; } = string.Empty;

    public Vehicle() { }

    public Vehicle(string licensePlate, VehicleType type, string colorName, string ownerName)
    {
        LicensePlate = licensePlate;
        Type = type;
        ColorName = colorName;
        OwnerName = ownerName;
        EntryTime = DateTime.Now;
        TicketId = "TKT-" + Guid.NewGuid().ToString()[..6].ToUpper();
    }
}
