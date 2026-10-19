namespace ParkingLotSlotAllocator.Services;

using ParkingLotSlotAllocator.DataStructures;
using ParkingLotSlotAllocator.Models;

public record AllocationAction(ParkingSlot Slot, Vehicle Vehicle, ParkingTicket Ticket, DateTime Timestamp);

public class ParkingLotManager
{
    private static ParkingLotManager? _instance;
    public static ParkingLotManager Instance => _instance ??= new ParkingLotManager();

    // All slots stored in a fast indexed list
    public List<ParkingSlot> AllSlots { get; } = new();

    // DSA Component 1: Min-Heap Priority Queues for nearest slot allocation (O(log N))
    private readonly Dictionary<SlotType, MinHeapPriorityQueue<ParkingSlot>> _availableHeaps = new();

    // DSA Component 2: Hash Table for instant vehicle & ticket lookup (O(1))
    public VehicleHashTable HashTable { get; } = new();

    // DSA Component 3: FIFO Queue for vehicles waiting during peak hours
    public WaitingQueue<Vehicle> EntranceQueue { get; } = new();

    // DSA Component 4: LIFO Stack for undoing allocations & tracking audit history
    public TransactionStack<AllocationAction> AllocationHistory { get; } = new();

    public decimal TotalRevenue { get; private set; } = 0m;
    public int TotalVehiclesParkedToday { get; private set; } = 0;

    public event Action? OnLotUpdated;

    public ParkingLotManager()
    {
        InitializeParkingLot();
    }

    public void InitializeParkingLot()
    {
        AllSlots.Clear();
        _availableHeaps.Clear();
        HashTable.Clear();
        EntranceQueue.Clear();
        AllocationHistory.Clear();

        foreach (SlotType type in Enum.GetValues<SlotType>())
        {
            _availableHeaps[type] = new MinHeapPriorityQueue<ParkingSlot>();
        }

        // Create a realistic multi-floor parking structure (Floors 1-2, Sections A-D, total 48 slots)
        int floors = 2;
        char[] sections = { 'A', 'B', 'C', 'D' };
        int slotsPerSection = 6;

        foreach (int floor in Enumerable.Range(1, floors))
        {
            foreach (char section in sections)
            {
                for (int num = 1; num <= slotsPerSection; num++)
                {
                    string id = $"{section}{floor}-{num:D2}";
                    
                    // Assign slot type intelligently
                    SlotType type;
                    if (num == 1) type = SlotType.Handicap;
                    else if (num == 2 && section == 'A') type = SlotType.VIP;
                    else if (num == 3 && (section == 'A' || section == 'B')) type = SlotType.ElectricVehicle;
                    else if (num == 6) type = SlotType.Compact;
                    else type = SlotType.Standard;

                    // Calculate distance from entrance (entrance is near Floor 1, Section A)
                    double baseSectionDist = (section - 'A') * 12.0;
                    double floorPenalty = (floor - 1) * 35.0;
                    double slotDist = (num * 4.5);
                    double totalDist = 8.0 + baseSectionDist + floorPenalty + slotDist;

                    decimal rate = type switch
                    {
                        SlotType.VIP => 25.00m,
                        SlotType.ElectricVehicle => 20.00m,
                        SlotType.Handicap => 10.00m,
                        SlotType.Compact => 12.00m,
                        _ => 15.00m
                    };

                    var slot = new ParkingSlot(id, floor, section, num, type, totalDist, rate);
                    AllSlots.Add(slot);
                    _availableHeaps[type].Insert(slot);
                }
            }
        }

        // Seed with a few initial parked cars to give a realistic, vibrant live view
        SeedInitialVehicles();
        OnLotUpdated?.Invoke();
    }

    private void SeedInitialVehicles()
    {
        var sampleVehicles = new[]
        {
            new Vehicle("NYC-4821", VehicleType.Electric, "Ocean Blue", "Alexander Reed"),
            new Vehicle("CA-9042", VehicleType.SUV, "Pearl White", "Sophia Chen"),
            new Vehicle("TX-3190", VehicleType.Sedan, "Space Gray", "David Miller"),
            new Vehicle("FL-7714", VehicleType.Hatchback, "Ruby Red", "Emma Watson"),
            new Vehicle("WA-5582", VehicleType.Electric, "Mint Green", "Liam Patel")
        };

        foreach (var v in sampleVehicles)
        {
            AllocateSlot(v, isSeeding: true);
        }
    }

    public (bool Success, ParkingSlot? Slot, ParkingTicket? Ticket, string Message) AllocateSlot(Vehicle vehicle, bool isSeeding = false)
    {
        // Check if vehicle is already parked
        if (HashTable.TryGetSlotByPlate(vehicle.LicensePlate, out var existingSlot))
        {
            return (false, existingSlot, null, $"Vehicle {vehicle.LicensePlate} is already parked in Slot {existingSlot?.SlotId}!");
        }

        // Determine target slot type based on vehicle
        SlotType targetType = vehicle.Type switch
        {
            VehicleType.Electric => SlotType.ElectricVehicle,
            VehicleType.Motorcycle => SlotType.Compact,
            _ => SlotType.Standard
        };

        // Try preferred type heap first, then fallback to Standard, then any
        ParkingSlot? selectedSlot = null;
        if (_availableHeaps.TryGetValue(targetType, out var heap) && !heap.IsEmpty)
        {
            selectedSlot = heap.ExtractMin();
        }
        else if (targetType != SlotType.Standard && _availableHeaps[SlotType.Standard].Count > 0)
        {
            selectedSlot = _availableHeaps[SlotType.Standard].ExtractMin();
        }
        else
        {
            // Check any available heap
            foreach (var kvp in _availableHeaps)
            {
                if (!kvp.Value.IsEmpty)
                {
                    selectedSlot = kvp.Value.ExtractMin();
                    break;
                }
            }
        }

        if (selectedSlot == null)
        {
            // Lot is full! Add vehicle to the FIFO Waiting Queue
            EntranceQueue.Enqueue(vehicle);
            OnLotUpdated?.Invoke();
            return (false, null, null, $"Parking Lot is full! Vehicle {vehicle.LicensePlate} added to Waiting Queue (Position: #{EntranceQueue.Count}).");
        }

        // Assign vehicle to slot
        selectedSlot.Status = SlotStatus.Occupied;
        selectedSlot.CurrentVehicle = vehicle;

        var ticket = new ParkingTicket(vehicle.TicketId, vehicle.LicensePlate, selectedSlot.SlotId, vehicle.Type, selectedSlot.HourlyRate);
        HashTable.RegisterVehicle(vehicle.LicensePlate, selectedSlot, ticket);

        if (!isSeeding)
        {
            AllocationHistory.Push(new AllocationAction(selectedSlot, vehicle, ticket, DateTime.Now));
            TotalVehiclesParkedToday++;
        }

        OnLotUpdated?.Invoke();
        return (true, selectedSlot, ticket, $"Allocated closest slot {selectedSlot.SlotId} (Distance: {selectedSlot.DistanceFromEntrance:F1}m, Rate: ${selectedSlot.HourlyRate}/hr).");
    }

    public (bool Success, ParkingTicket? Ticket, string Message) ReleaseSlot(string query)
    {
        ParkingSlot? slot = null;
        ParkingTicket? ticket = null;

        // Try finding by plate or ticket
        if (HashTable.TryGetSlotByPlate(query, out slot))
        {
            HashTable.TryGetTicketById(slot!.CurrentVehicle?.TicketId ?? "", out ticket);
        }
        else if (HashTable.TryGetTicketById(query, out ticket) && ticket != null)
        {
            HashTable.TryGetSlotByPlate(ticket.LicensePlate, out slot);
        }

        if (slot == null || slot.CurrentVehicle == null)
        {
            return (false, null, $"No active parked vehicle found for query '{query}'.");
        }

        var vehicle = slot.CurrentVehicle;
        ticket ??= new ParkingTicket(vehicle.TicketId, vehicle.LicensePlate, slot.SlotId, vehicle.Type, slot.HourlyRate);

        decimal fee = ticket.CalculateFee(DateTime.Now);
        ticket.IsPaid = true;
        TotalRevenue += fee;

        // Unregister from hash table
        HashTable.Remove(vehicle.LicensePlate, ticket.TicketId);

        // Reset slot and reinsert into priority queue (Min-Heap)
        slot.Status = SlotStatus.Available;
        slot.CurrentVehicle = null;
        _availableHeaps[slot.Type].Insert(slot);

        // If there are vehicles waiting in the FIFO Queue, allocate the next one automatically!
        if (!EntranceQueue.IsEmpty)
        {
            var nextVehicle = EntranceQueue.Dequeue();
            AllocateSlot(nextVehicle);
        }

        OnLotUpdated?.Invoke();
        return (true, ticket, $"Slot {slot.SlotId} released. Vehicle {vehicle.LicensePlate} departed. Total Fee: ${fee:F2}.");
    }

    public (bool Success, string Message) UndoLastAllocation()
    {
        if (AllocationHistory.IsEmpty)
        {
            return (false, "No recent allocation to undo.");
        }

        var lastAction = AllocationHistory.Pop();
        var slot = lastAction.Slot;
        var vehicle = lastAction.Vehicle;
        var ticket = lastAction.Ticket;

        if (slot.CurrentVehicle?.LicensePlate == vehicle.LicensePlate)
        {
            HashTable.Remove(vehicle.LicensePlate, ticket.TicketId);
            slot.Status = SlotStatus.Available;
            slot.CurrentVehicle = null;
            _availableHeaps[slot.Type].Insert(slot);

            OnLotUpdated?.Invoke();
            return (true, $"Undid allocation of slot {slot.SlotId} for vehicle {vehicle.LicensePlate}.");
        }

        return (false, $"Cannot undo: vehicle {vehicle.LicensePlate} is no longer in slot {slot.SlotId}.");
    }

    public int TotalSlotsCount => AllSlots.Count;
    public int OccupiedSlotsCount => AllSlots.Count(s => !s.IsAvailable);
    public int AvailableSlotsCount => AllSlots.Count(s => s.IsAvailable);
    public double OccupancyPercentage => TotalSlotsCount > 0 ? (double)OccupiedSlotsCount / TotalSlotsCount * 100.0 : 0.0;
}
