namespace ParkingLotSlotAllocator.Models;

public class ParkingTicket
{
    public string TicketId { get; set; } = string.Empty;
    public string LicensePlate { get; set; } = string.Empty;
    public string SlotId { get; set; } = string.Empty;
    public VehicleType VehicleType { get; set; }
    public DateTime EntryTime { get; set; }
    public DateTime? ExitTime { get; set; }
    public decimal HourlyRate { get; set; }
    public decimal TotalAmount { get; set; }
    public bool IsPaid { get; set; }

    public TimeSpan Duration => (ExitTime ?? DateTime.Now) - EntryTime;

    public ParkingTicket() { }

    public ParkingTicket(string ticketId, string licensePlate, string slotId, VehicleType type, decimal rate)
    {
        TicketId = ticketId;
        LicensePlate = licensePlate;
        SlotId = slotId;
        VehicleType = type;
        EntryTime = DateTime.Now;
        HourlyRate = rate;
        IsPaid = false;
    }

    public decimal CalculateFee(DateTime exitTime)
    {
        ExitTime = exitTime;
        var duration = exitTime - EntryTime;
        double hours = Math.Max(0.5, Math.Ceiling(duration.TotalHours));
        TotalAmount = Math.Round((decimal)hours * HourlyRate, 2);
        return TotalAmount;
    }
}
