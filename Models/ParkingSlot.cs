namespace ParkingLotSlotAllocator.Models;

public class ParkingSlot : IComparable<ParkingSlot>
{
    public string SlotId { get; set; } = string.Empty;
    public int Floor { get; set; } = 1;
    public char Section { get; set; } = 'A';
    public int Number { get; set; } = 1;
    public SlotType Type { get; set; } = SlotType.Standard;
    public SlotStatus Status { get; set; } = SlotStatus.Available;
    public Vehicle? CurrentVehicle { get; set; }
    public double DistanceFromEntrance { get; set; } = 10.0;
    public decimal HourlyRate { get; set; } = 15.00m;

    public bool IsAvailable => Status == SlotStatus.Available && CurrentVehicle == null;

    public ParkingSlot() { }

    public ParkingSlot(string id, int floor, char section, int number, SlotType type, double distance, decimal rate = 15.00m)
    {
        SlotId = id;
        Floor = floor;
        Section = section;
        Number = number;
        Type = type;
        DistanceFromEntrance = distance;
        HourlyRate = rate;
        Status = SlotStatus.Available;
    }

    public int CompareTo(ParkingSlot? other)
    {
        if (other == null) return 1;
        // Primary criterion: Distance from entrance (Min-Heap finds closest)
        int distCompare = DistanceFromEntrance.CompareTo(other.DistanceFromEntrance);
        if (distCompare != 0) return distCompare;
        // Secondary: Floor
        int floorCompare = Floor.CompareTo(other.Floor);
        if (floorCompare != 0) return floorCompare;
        // Tertiary: SlotId
        return string.Compare(SlotId, other.SlotId, StringComparison.Ordinal);
    }

    public override string ToString() => $"{SlotId} ({Type}, Floor {Floor}, {DistanceFromEntrance:F1}m)";
}
