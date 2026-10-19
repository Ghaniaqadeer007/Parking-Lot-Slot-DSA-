namespace ParkingLotSlotAllocator.Models;

public enum SlotState
{
    Free,
    Recommended,
    Selected,
    Held,
    Arriving,
    Taken
}

public class Booking
{
    public string Plate { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string CarColor { get; set; } = "#722F37";
    public int SlotNumber { get; set; }
    public string AssignedBy { get; set; } = "closest"; // "closest" or "chosen"
    public DateTime EnteredAt { get; set; } = DateTime.Now;
}

public class Hold
{
    public string HoldId { get; set; } = Guid.NewGuid().ToString("N")[..8];
    public int SlotNumber { get; set; }
    public DateTime ExpiresAt { get; set; } = DateTime.Now.AddSeconds(120);

    public bool IsExpired => DateTime.Now > ExpiresAt;
    public int RemainingSeconds => Math.Max(0, (int)(ExpiresAt - DateTime.Now).TotalSeconds);
}

public class SlotInfo
{
    public int SlotNumber { get; set; }
    public SlotState Status { get; set; } = SlotState.Free;
    public int Row { get; set; }
    public int Column { get; set; }
    public int Band { get; set; }
    public int Position { get; set; } // 0 = above aisle, 1 = below
    public double DistanceFromEntrance { get; set; }
    public string? CarColor { get; set; }
    public string? Plate { get; set; }
    public string? OwnerName { get; set; }

    public static SlotInfo Create(int slotNumber, SlotState status = SlotState.Free)
    {
        int row = (slotNumber - 1) / 10;
        int col = (slotNumber - 1) % 10;
        int band = row / 2;
        int pos = row % 2;
        double dist = 8.0 + (row * 9.0) + (col * 4.5);

        return new SlotInfo
        {
            SlotNumber = slotNumber,
            Status = status,
            Row = row,
            Column = col,
            Band = band,
            Position = pos,
            DistanceFromEntrance = dist
        };
    }
}

public class WaitingTicket
{
    public string TicketId { get; set; } = "WAIT-" + Guid.NewGuid().ToString("N")[..6].ToUpper();
    public string Plate { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public string CarColor { get; set; } = "#722F37";
    public DateTime QueuedAt { get; set; } = DateTime.Now;
}

public record DsaLogEntry(string Operation, string Complexity, string Details, DateTime Timestamp);
