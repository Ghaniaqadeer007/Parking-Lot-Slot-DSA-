namespace ParkingLotSlotAllocator.Services;

using ParkingLotSlotAllocator.DataStructures;
using ParkingLotSlotAllocator.Models;

public class ParkingService
{
    private static ParkingService? _instance;
    public static ParkingService Instance => _instance ??= new ParkingService();

    // Synchronization lock for shared state across all requests (PRD Section 8)
    private readonly object _sync = new();

    // DSA 1: Indexed Min-Heap for free slots (PopMin O(log n), Remove O(log n), Peek O(1))
    public IndexedMinHeap FreeHeap { get; } = new();

    // DSA 2: Hash Map for O(1) vehicle and booking lookups
    public Dictionary<string, Booking> BookingsByPlate { get; } = new(StringComparer.OrdinalIgnoreCase);

    // DSA 3: Array of 100 slots for O(1) status access
    private readonly Booking?[] _slotBookings = new Booking?[101];

    // DSA 4: Active holds and FIFO queue for expiry (120 seconds hold time)
    private readonly Dictionary<int, Hold> _activeHolds = new();
    private readonly Queue<Hold> _holdQueue = new();

    // DSA 5: FIFO Waiting list when garage is full
    public Queue<WaitingTicket> WaitingList { get; } = new();

    // DSA Audit Log for Sir Sultan & Examiner demo panel
    public List<DsaLogEntry> AuditLog { get; } = new();

    public const int TotalCapacity = 100;

    public event Action? OnStateChanged;

    public ParkingService()
    {
        InitializeGarage();
    }

    public void InitializeGarage()
    {
        lock (_sync)
        {
            FreeHeap.Clear();
            BookingsByPlate.Clear();
            Array.Clear(_slotBookings, 0, _slotBookings.Length);
            _activeHolds.Clear();
            _holdQueue.Clear();
            WaitingList.Clear();
            AuditLog.Clear();

            // Populate all 100 slots in order (1 = closest to gate, 100 = farthest)
            for (int i = 1; i <= TotalCapacity; i++)
            {
                FreeHeap.Push(i);
            }

            LogDsa("Heap.Initialize()", "O(N log N)", "Initialized 100 slots in Min-Heap (Root = 1)");

            // Seed with a few initial cars from PRD proposal example (A, B, C)
            SeedProposalExample();
        }
        OnStateChanged?.Invoke();
    }

    private void SeedProposalExample()
    {
        // Example from PRD proposal: Cars get slots 1, 2, 3 in order
        CreateBookingInternal("LEA-101", "Ali Raza", "0300-1234567", "#722F37", "closest", null, null);
        CreateBookingInternal("LHR-502", "Fatima Noor", null, "#B7A89A", "closest", null, null);
        CreateBookingInternal("ISB-789", "Hamza Tariq", null, "#337046", "closest", null, null);
        CreateBookingInternal("KHI-404", "Ayesha Khan", null, "#B07329", "closest", null, null);
        CreateBookingInternal("MUL-912", "Bilal Ahmed", null, "#E8DCC6", "closest", null, null);
    }

    public void ReleaseExpiredHolds()
    {
        lock (_sync)
        {
            while (_holdQueue.Count > 0)
            {
                var oldest = _holdQueue.Peek();
                if (oldest.IsExpired)
                {
                    _holdQueue.Dequeue();
                    if (_activeHolds.TryGetValue(oldest.SlotNumber, out var active) && active.HoldId == oldest.HoldId)
                    {
                        _activeHolds.Remove(oldest.SlotNumber);
                        FreeHeap.Push(oldest.SlotNumber);
                        LogDsa("Heap.Push(slot)", "O(log n)", $"Hold expired for Slot {oldest.SlotNumber}. Returned to Min-Heap.");
                    }
                }
                else
                {
                    break; // holds are ordered chronologically; if head hasn't expired, none after it has
                }
            }
        }
    }

    public (bool Success, Hold? Hold, string Message) HoldSlot(int slotNumber)
    {
        lock (_sync)
        {
            ReleaseExpiredHolds();

            if (slotNumber < 1 || slotNumber > TotalCapacity)
            {
                return (false, null, "Invalid slot number.");
            }

            if (_activeHolds.ContainsKey(slotNumber))
            {
                return (false, null, $"Slot {slotNumber} is already held by another driver.");
            }

            if (_slotBookings[slotNumber] != null)
            {
                return (false, null, $"Slot {slotNumber} is already occupied.");
            }

            if (!FreeHeap.Contains(slotNumber))
            {
                return (false, null, $"Slot {slotNumber} is not currently available.");
            }

            // Remove from free heap so nobody else can take it
            FreeHeap.Remove(slotNumber);
            var hold = new Hold { SlotNumber = slotNumber };
            _activeHolds[slotNumber] = hold;
            _holdQueue.Enqueue(hold);

            LogDsa("Heap.Remove(slot)", "O(log n)", $"Held Slot {slotNumber} for 120s (HoldId: {hold.HoldId})");
            OnStateChanged?.Invoke();
            return (true, hold, $"Slot {slotNumber} held for 120 seconds.");
        }
    }

    public (bool Success, string Message) ReleaseHold(int slotNumber, string holdId)
    {
        lock (_sync)
        {
            if (_activeHolds.TryGetValue(slotNumber, out var hold) && hold.HoldId == holdId)
            {
                _activeHolds.Remove(slotNumber);
                FreeHeap.Push(slotNumber);
                LogDsa("Heap.Push(slot)", "O(log n)", $"Driver released hold on Slot {slotNumber}. Returned to Min-Heap.");
                OnStateChanged?.Invoke();
                return (true, $"Hold released for Slot {slotNumber}.");
            }
            return (false, "Hold not found or already expired.");
        }
    }

    public (bool Success, Booking? Booking, string Message) CreateBooking(
        string plate,
        string ownerName,
        string? phone,
        string carColor,
        string mode,
        int? requestedSlot,
        string? holdId)
    {
        lock (_sync)
        {
            ReleaseExpiredHolds();
            var result = CreateBookingInternal(plate, ownerName, phone, carColor, mode, requestedSlot, holdId);
            OnStateChanged?.Invoke();
            return result;
        }
    }

    private (bool Success, Booking? Booking, string Message) CreateBookingInternal(
        string plate,
        string ownerName,
        string? phone,
        string carColor,
        string mode,
        int? requestedSlot,
        string? holdId)
    {
        plate = plate.Trim().ToUpperInvariant();

        if (string.IsNullOrEmpty(plate) || plate.Length < 3 || plate.Length > 10)
        {
            return (false, null, "Please enter a valid plate (3 to 10 alphanumeric characters).");
        }

        // F-04: Check if plate is already parked (Hash Map O(1))
        if (BookingsByPlate.TryGetValue(plate, out var existing))
        {
            LogDsa("Map.TryGetValue(plate)", "O(1)", $"Plate {plate} already parked in Slot {existing.SlotNumber}.");
            return (false, existing, $"This car is already parked in slot {existing.SlotNumber}.");
        }

        int targetSlot = -1;

        if (mode.Equals("closest", StringComparison.OrdinalIgnoreCase))
        {
            // F-12: Closest slot mode -> PopMin from Min-Heap in O(log n)
            if (FreeHeap.IsEmpty)
            {
                // Garage full
                WaitingList.Enqueue(new WaitingTicket { Plate = plate, OwnerName = ownerName, CarColor = carColor });
                LogDsa("Queue.Enqueue(car)", "O(1)", $"Garage full! Vehicle {plate} added to waiting list.");
                return (false, null, "GARAGE_FULL: The parking garage is currently full.");
            }

            targetSlot = FreeHeap.PopMin();
            LogDsa("Heap.PopMin()", "O(log n)", $"Extracted closest free slot: Slot {targetSlot}");
        }
        else
        {
            // Chosen slot mode (manual slot selection)
            if (!requestedSlot.HasValue || requestedSlot.Value < 1 || requestedSlot.Value > TotalCapacity)
            {
                return (false, null, "Please select a valid slot from 1 to 100.");
            }

            int slot = requestedSlot.Value;

            // Check if user holds this slot
            if (!string.IsNullOrEmpty(holdId) && _activeHolds.TryGetValue(slot, out var hold) && hold.HoldId == holdId)
            {
                _activeHolds.Remove(slot); // consume hold
                targetSlot = slot;
                LogDsa("Hold.Consume()", "O(1)", $"Consumed active hold for Slot {slot}");
            }
            else if (FreeHeap.Contains(slot))
            {
                // Remove from heap in O(log n)
                FreeHeap.Remove(slot);
                targetSlot = slot;
                LogDsa("Heap.Remove(slot)", "O(log n)", $"Driver picked free Slot {slot}. Removed from Min-Heap.");
            }
            else
            {
                return (false, null, $"Slot {slot} was just taken by someone else.");
            }
        }

        // Record booking in Hash Map (O(1)) and Array (O(1))
        var booking = new Booking
        {
            Plate = plate,
            OwnerName = string.IsNullOrWhiteSpace(ownerName) ? "Driver" : ownerName.Trim(),
            Phone = phone?.Trim(),
            CarColor = string.IsNullOrWhiteSpace(carColor) ? "#722F37" : carColor,
            SlotNumber = targetSlot,
            AssignedBy = mode.Equals("closest", StringComparison.OrdinalIgnoreCase) ? "closest" : "chosen",
            EnteredAt = DateTime.Now
        };

        BookingsByPlate[plate] = booking;
        _slotBookings[targetSlot] = booking;

        LogDsa("Map.Add(plate, booking)", "O(1)", $"Registered plate {plate} -> Slot {targetSlot}");
        return (true, booking, $"Successfully booked slot {targetSlot}.");
    }

    public (bool Success, Booking? Booking, string Message) FindCar(string plate)
    {
        lock (_sync)
        {
            plate = plate.Trim().ToUpperInvariant();
            if (BookingsByPlate.TryGetValue(plate, out var booking))
            {
                LogDsa("Map.Find(plate)", "O(1)", $"Found plate {plate} in Slot {booking.SlotNumber}");
                return (true, booking, $"Car {plate} is parked in slot {booking.SlotNumber}.");
            }

            LogDsa("Map.Find(plate)", "O(1)", $"Plate {plate} not found");
            return (false, null, $"No car found with plate {plate}.");
        }
    }

    public (bool Success, int SlotNumber, int MinutesParked, string Message) Leave(string plate)
    {
        lock (_sync)
        {
            plate = plate.Trim().ToUpperInvariant();
            if (!BookingsByPlate.TryGetValue(plate, out var booking))
            {
                return (false, 0, 0, $"No active parking found for plate {plate}.");
            }

            int slot = booking.SlotNumber;
            int minutes = Math.Max(1, (int)(DateTime.Now - booking.EnteredAt).TotalMinutes);

            // Clear from array and dictionary
            _slotBookings[slot] = null;
            BookingsByPlate.Remove(plate);

            // Push slot back into Min-Heap in O(log n)
            FreeHeap.Push(slot);
            LogDsa("Heap.Push(slot)", "O(log n)", $"Vehicle {plate} departed. Slot {slot} returned to Min-Heap root balance.");

            // Check if any car is waiting in FIFO Queue
            if (WaitingList.Count > 0)
            {
                var waiting = WaitingList.Dequeue();
                CreateBookingInternal(waiting.Plate, waiting.OwnerName, null, waiting.CarColor, "closest", null, null);
                LogDsa("Queue.Dequeue()", "O(1)", $"Dispatched waiting vehicle {waiting.Plate} into freed slot.");
            }

            OnStateChanged?.Invoke();
            return (true, slot, minutes, $"Vehicle {plate} has departed from Slot {slot}. Parked for {minutes} minute(s).");
        }
    }

    public List<SlotInfo> GetAllSlots()
    {
        lock (_sync)
        {
            ReleaseExpiredHolds();
            var list = new List<SlotInfo>(TotalCapacity);
            int closestFree = FreeHeap.Count > 0 ? FreeHeap.Peek() : -1;

            for (int i = 1; i <= TotalCapacity; i++)
            {
                var booking = _slotBookings[i];
                SlotState state;

                if (booking != null)
                {
                    state = SlotState.Taken;
                }
                else if (_activeHolds.ContainsKey(i))
                {
                    state = SlotState.Held;
                }
                else if (i == closestFree)
                {
                    state = SlotState.Recommended;
                }
                else
                {
                    state = SlotState.Free;
                }

                var slot = SlotInfo.Create(i, state);
                if (booking != null)
                {
                    slot.CarColor = booking.CarColor;
                    slot.Plate = booking.Plate;
                    slot.OwnerName = booking.OwnerName;
                }
                list.Add(slot);
            }

            return list;
        }
    }

    public int FreeCount => FreeHeap.Count;
    public int TakenCount => BookingsByPlate.Count;
    public int HeldCount => _activeHolds.Count;
    public int ClosestFreeSlot => FreeHeap.Count > 0 ? FreeHeap.Peek() : -1;

    private void LogDsa(string op, string complexity, string details)
    {
        AuditLog.Insert(0, new DsaLogEntry(op, complexity, details, DateTime.Now));
        if (AuditLog.Count > 50) AuditLog.RemoveAt(AuditLog.Count - 1);
    }
}
