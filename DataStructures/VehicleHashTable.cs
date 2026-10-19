namespace ParkingLotSlotAllocator.DataStructures;

using ParkingLotSlotAllocator.Models;

/// <summary>
/// A Hash Table structure providing O(1) average-time complexity lookups
/// for vehicles parked in the facility by their unique license plate or ticket number.
/// </summary>
public class VehicleHashTable
{
    private readonly Dictionary<string, ParkingSlot> _byLicensePlate = new(StringComparer.OrdinalIgnoreCase);
    private readonly Dictionary<string, ParkingTicket> _byTicketId = new(StringComparer.OrdinalIgnoreCase);

    public int Count => _byLicensePlate.Count;

    public void RegisterVehicle(string licensePlate, ParkingSlot slot, ParkingTicket ticket)
    {
        _byLicensePlate[licensePlate] = slot;
        _byTicketId[ticket.TicketId] = ticket;
    }

    public bool TryGetSlotByPlate(string licensePlate, out ParkingSlot? slot)
    {
        return _byLicensePlate.TryGetValue(licensePlate, out slot);
    }

    public bool TryGetTicketById(string ticketId, out ParkingTicket? ticket)
    {
        return _byTicketId.TryGetValue(ticketId, out ticket);
    }

    public bool Remove(string licensePlate, string ticketId)
    {
        bool r1 = _byLicensePlate.Remove(licensePlate);
        bool r2 = _byTicketId.Remove(ticketId);
        return r1 || r2;
    }

    public IEnumerable<ParkingSlot> GetAllOccupiedSlots() => _byLicensePlate.Values;
    public IEnumerable<ParkingTicket> GetAllActiveTickets() => _byTicketId.Values;

    public void Clear()
    {
        _byLicensePlate.Clear();
        _byTicketId.Clear();
    }
}
