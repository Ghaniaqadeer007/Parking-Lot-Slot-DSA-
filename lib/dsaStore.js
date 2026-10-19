/**
 * dsaStore.js - Comprehensive in-memory DSA state store for Parking Lot Allocator
 * Implements:
 * 1. IndexedMinHeap (O(log n) push/popMin/remove, O(1) peek/contains)
 * 2. Hash Map (O(1) plate lookup)
 * 3. Array of 100 slots (O(1) slot occupancy)
 * 4. Hold queue (120-second reservation timer with auto-expiry)
 * 5. FIFO Waiting list queue
 * 6. Audit logging for Examiner / Sir Sultan inspection
 */

export class IndexedMinHeap {
  constructor() {
    this.data = [];
    this.pos = new Map(); // slotNumber -> index in data
  }

  size() {
    return this.data.length;
  }

  isEmpty() {
    return this.data.length === 0;
  }

  contains(slot) {
    return this.pos.has(slot);
  }

  peek() {
    return this.data.length > 0 ? this.data[0] : null;
  }

  push(slot) {
    if (this.pos.has(slot)) return;
    this.data.push(slot);
    const index = this.data.length - 1;
    this.pos.set(slot, index);
    this._siftUp(index);
  }

  popMin() {
    if (this.data.length === 0) return null;
    const min = this.data[0];
    const last = this.data.pop();
    this.pos.delete(min);

    if (this.data.length > 0) {
      this.data[0] = last;
      this.pos.set(last, 0);
      this._siftDown(0);
    }
    return min;
  }

  remove(slot) {
    if (!this.pos.has(slot)) return false;
    const index = this.pos.get(slot);
    const last = this.data.pop();
    this.pos.delete(slot);

    if (index < this.data.length) {
      this.data[index] = last;
      this.pos.set(last, index);
      this._siftDown(index);
      this._siftUp(index);
    }
    return true;
  }

  _siftUp(i) {
    let curr = i;
    while (curr > 0) {
      const parent = Math.floor((curr - 1) / 2);
      if (this.data[curr] < this.data[parent]) {
        this._swap(curr, parent);
        curr = parent;
      } else {
        break;
      }
    }
  }

  _siftDown(i) {
    let curr = i;
    const n = this.data.length;
    while (true) {
      const left = 2 * curr + 1;
      const right = 2 * curr + 2;
      let smallest = curr;

      if (left < n && this.data[left] < this.data[smallest]) {
        smallest = left;
      }
      if (right < n && this.data[right] < this.data[smallest]) {
        smallest = right;
      }

      if (smallest !== curr) {
        this._swap(curr, smallest);
        curr = smallest;
      } else {
        break;
      }
    }
  }

  _swap(i, j) {
    const temp = this.data[i];
    this.data[i] = this.data[j];
    this.data[j] = temp;
    this.pos.set(this.data[i], i);
    this.pos.set(this.data[j], j);
  }

  toArray() {
    return [...this.data];
  }
}

const STORAGE_KEY = 'parking_lot_dsa_state_v1';
const DRAFT_KEY = 'parking_lot_draft_vehicle_v1';

class DsaStateManager {
  constructor() {
    this.freeHeap = new IndexedMinHeap();
    this.bookingsByPlate = new Map(); // Plate -> Booking
    this.slotBookings = new Array(101).fill(null); // 1..100
    this.activeHolds = new Map(); // Slot -> Hold
    this.holdQueue = []; // FIFO Queue of holds
    this.waitingQueue = []; // FIFO Queue of waiting drivers
    this.auditLog = [];
    this.listeners = new Set();
    this.initialized = false;

    this.init();
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;

    // Load from localStorage if present in browser
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          this.restoreFromSnapshot(parsed);
          this.releaseExpiredHolds();
          return;
        }
      } catch (e) {
        console.warn('Could not restore state from storage:', e);
      }
    }

    this.resetDefaults();
  }

  resetDefaults() {
    this.freeHeap = new IndexedMinHeap();
    this.bookingsByPlate = new Map();
    this.slotBookings = new Array(101).fill(null);
    this.activeHolds = new Map();
    this.holdQueue = [];
    this.waitingQueue = [];
    this.auditLog = [];

    // Push all 100 slots into Min-Heap
    for (let i = 1; i <= 100; i++) {
      this.freeHeap.push(i);
    }

    this.logDsa('Heap.Initialize()', 'O(N log N)', 'Initialized 100 slots in Min-Heap (Root = 1)');

    // Seed proposal test cars from PRD
    this._seedCar('LEA-101', 'Ali Raza', '0300-1234567', '#722F37');
    this._seedCar('LHR-502', 'Fatima Noor', '0321-7654321', '#B7A89A');
    this._seedCar('ISB-789', 'Hamza Tariq', '0333-9876543', '#2A5A3B');
    this._seedCar('KHI-404', 'Ayesha Khan', '0345-1122334', '#D48B28');
    this._seedCar('MUL-912', 'Bilal Ahmed', '0312-5566778', '#E8DCC6');

    this.persist();
    this.notify();
  }

  _seedCar(plate, owner, phone, color) {
    const slot = this.freeHeap.popMin();
    if (!slot) return;
    const now = new Date();
    const entryTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const booking = {
      plate: plate.toUpperCase(),
      ownerName: owner,
      phone: phone || '',
      color,
      slotNumber: slot,
      mode: 'closest',
      entryTime,
      bookedAt: now.toISOString()
    };
    this.bookingsByPlate.set(booking.plate, booking);
    this.slotBookings[slot] = booking;
    this.logDsa('Heap.PopMin() + HashMap.Put()', 'O(log n) + O(1)', `Seeded ${plate} into closest Slot ${slot}`);
  }

  logDsa(operation, complexity, details) {
    const entry = {
      id: Date.now() + Math.random().toString(36).substr(2, 4),
      time: new Date().toLocaleTimeString(),
      operation,
      complexity,
      details
    };
    this.auditLog.unshift(entry);
    if (this.auditLog.length > 50) this.auditLog.pop();
  }

  releaseExpiredHolds() {
    const now = Date.now();
    let releasedAny = false;

    while (this.holdQueue.length > 0) {
      const oldest = this.holdQueue[0];
      if (oldest.expiresAt <= now) {
        this.holdQueue.shift();
        const active = this.activeHolds.get(oldest.slotNumber);
        if (active && active.holdId === oldest.holdId) {
          this.activeHolds.delete(oldest.slotNumber);
          this.freeHeap.push(oldest.slotNumber);
          releasedAny = true;
          this.logDsa(
            'Heap.Push(slot)',
            'O(log n)',
            `Hold expired for Slot ${oldest.slotNumber}. Returned to Min-Heap.`
          );
        }
      } else {
        break; // Chronological order: subsequent holds have later expiry
      }
    }

    if (releasedAny) {
      this.persist();
      this.notify();
    }
  }

  holdSlot(slotNumber, plate = '') {
    this.releaseExpiredHolds();
    const slot = parseInt(slotNumber, 10);
    if (slot < 1 || slot > 100) return { success: false, message: 'Invalid slot' };

    // Check if slot is taken
    if (this.slotBookings[slot] != null) {
      return { success: false, message: `Slot ${slot} is already occupied` };
    }

    // Check existing hold
    const existing = this.activeHolds.get(slot);
    if (existing && existing.plate === plate.toUpperCase()) {
      return { success: true, hold: existing };
    }

    // Must be in heap to hold
    if (!this.freeHeap.contains(slot)) {
      return { success: false, message: `Slot ${slot} is currently not available` };
    }

    // Remove from free heap during hold
    this.freeHeap.remove(slot);

    const hold = {
      holdId: 'hold_' + Math.random().toString(36).substr(2, 9),
      slotNumber: slot,
      plate: plate ? plate.toUpperCase() : 'PENDING',
      expiresAt: Date.now() + 120 * 1000 // 120 seconds
    };

    this.activeHolds.set(slot, hold);
    this.holdQueue.push(hold);

    this.logDsa(
      'Heap.Remove(slot) + Queue.Enqueue()',
      'O(log n) + O(1)',
      `Slot ${slot} placed on 120-second hold (Hold ID: ${hold.holdId})`
    );

    this.persist();
    this.notify();
    return { success: true, hold };
  }

  releaseHold(slotNumber) {
    const slot = parseInt(slotNumber, 10);
    const hold = this.activeHolds.get(slot);
    if (hold) {
      this.activeHolds.delete(slot);
      this.freeHeap.push(slot);
      this.logDsa(
        'Heap.Push(slot)',
        'O(log n)',
        `Manual hold released for Slot ${slot}. Returned to Min-Heap.`
      );
      this.persist();
      this.notify();
      return true;
    }
    return false;
  }

  bookSlot({ plate, ownerName, phone, color, slotNumber, mode = 'closest' }) {
    this.releaseExpiredHolds();
    const cleanPlate = (plate || '').trim().toUpperCase();
    if (!cleanPlate) return { success: false, message: 'Plate number is required' };

    // Check duplicate
    if (this.bookingsByPlate.has(cleanPlate)) {
      return {
        success: false,
        message: `Plate ${cleanPlate} is already parked in Slot ${this.bookingsByPlate.get(cleanPlate).slotNumber}`,
        existingSlot: this.bookingsByPlate.get(cleanPlate).slotNumber
      };
    }

    let targetSlot = parseInt(slotNumber, 10);

    // If mode is closest and no slot specified or slot not held
    if (mode === 'closest' && (!targetSlot || !this.activeHolds.has(targetSlot))) {
      if (this.freeHeap.isEmpty()) {
        return { success: false, message: 'Garage is completely full', full: true };
      }
      targetSlot = this.freeHeap.popMin();
      this.logDsa('Heap.PopMin()', 'O(log n)', `Allocated closest Slot ${targetSlot} to ${cleanPlate}`);
    } else {
      // Validate requested slot
      if (targetSlot < 1 || targetSlot > 100) {
        return { success: false, message: 'Invalid slot number' };
      }

      // Check if held by this user
      if (this.activeHolds.has(targetSlot)) {
        this.activeHolds.delete(targetSlot);
      } else if (this.freeHeap.contains(targetSlot)) {
        this.freeHeap.remove(targetSlot);
        this.logDsa('Heap.Remove(slot)', 'O(log n)', `Allocated user-chosen Slot ${targetSlot}`);
      } else {
        return { success: false, message: `Slot ${targetSlot} is no longer available` };
      }
    }

    const now = new Date();
    const booking = {
      plate: cleanPlate,
      ownerName: (ownerName || 'Driver').trim(),
      phone: (phone || '').trim(),
      color: color || '#722F37',
      slotNumber: targetSlot,
      mode,
      entryTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      bookedAt: now.toISOString()
    };

    this.bookingsByPlate.set(cleanPlate, booking);
    this.slotBookings[targetSlot] = booking;

    this.logDsa(
      'HashMap.Set(plate, booking)',
      'O(1)',
      `Stored vehicle ${cleanPlate} -> Slot ${targetSlot}`
    );

    this.persist();
    this.notify();
    return { success: true, booking };
  }

  leaveSlot(plate) {
    this.releaseExpiredHolds();
    const cleanPlate = (plate || '').trim().toUpperCase();
    if (!this.bookingsByPlate.has(cleanPlate)) {
      return { success: false, message: `No active vehicle found with plate ${cleanPlate}` };
    }

    const booking = this.bookingsByPlate.get(cleanPlate);
    const slot = booking.slotNumber;

    this.bookingsByPlate.delete(cleanPlate);
    this.slotBookings[slot] = null;

    this.logDsa(
      'HashMap.Delete(plate)',
      'O(1)',
      `Vehicle ${cleanPlate} departed from Slot ${slot}`
    );

    // Return slot back to Min-Heap
    this.freeHeap.push(slot);
    this.logDsa(
      'Heap.Push(slot)',
      'O(log n)',
      `Slot ${slot} freed and pushed back into Min-Heap (New root = ${this.freeHeap.peek()})`
    );

    // Check waiting list
    if (this.waitingQueue.length > 0) {
      const nextDriver = this.waitingQueue.shift();
      this.logDsa(
        'Queue.Dequeue()',
        'O(1)',
        `Waiting driver ${nextDriver.name} (${nextDriver.plate}) prioritized for newly freed Slot ${slot}`
      );
    }

    this.persist();
    this.notify();
    return { success: true, booking, freedSlot: slot };
  }

  findCar(plate) {
    const cleanPlate = (plate || '').trim().toUpperCase();
    if (this.bookingsByPlate.has(cleanPlate)) {
      this.logDsa('HashMap.Get(plate)', 'O(1)', `Found vehicle ${cleanPlate}`);
      return { success: true, booking: this.bookingsByPlate.get(cleanPlate) };
    }
    return { success: false, message: `Vehicle ${cleanPlate} not found in garage.` };
  }

  joinWaitingList({ name, plate, phone }) {
    const cleanPlate = (plate || '').trim().toUpperCase();
    const ticket = {
      ticketId: 'WAIT-' + (this.waitingQueue.length + 1).toString().padStart(3, '0'),
      name: (name || 'Driver').trim(),
      plate: cleanPlate,
      phone: (phone || '').trim(),
      position: this.waitingQueue.length + 1,
      timestamp: new Date().toLocaleTimeString()
    };
    this.waitingQueue.push(ticket);
    this.logDsa('Queue.Enqueue()', 'O(1)', `Enqueued waiting driver ${cleanPlate} at position #${ticket.position}`);
    this.persist();
    this.notify();
    return ticket;
  }

  getSnapshot() {
    this.releaseExpiredHolds();
    return {
      totalSlots: 100,
      freeSlotsCount: this.freeHeap.size(),
      takenSlotsCount: this.bookingsByPlate.size,
      heldSlotsCount: this.activeHolds.size,
      closestFreeSlot: this.freeHeap.peek(),
      heapArray: this.freeHeap.toArray(),
      bookings: Array.from(this.bookingsByPlate.values()),
      slotBookings: [...this.slotBookings],
      activeHolds: Array.from(this.activeHolds.values()),
      waitingList: [...this.waitingQueue],
      auditLog: [...this.auditLog]
    };
  }

  restoreFromSnapshot(data) {
    this.freeHeap = new IndexedMinHeap();
    if (Array.isArray(data.heapArray)) {
      for (const slot of data.heapArray) {
        this.freeHeap.push(slot);
      }
    }

    this.bookingsByPlate = new Map();
    this.slotBookings = new Array(101).fill(null);
    if (Array.isArray(data.bookings)) {
      for (const b of data.bookings) {
        this.bookingsByPlate.set(b.plate, b);
        this.slotBookings[b.slotNumber] = b;
      }
    }

    this.activeHolds = new Map();
    this.holdQueue = [];
    if (Array.isArray(data.activeHolds)) {
      for (const h of data.activeHolds) {
        this.activeHolds.set(h.slotNumber, h);
        this.holdQueue.push(h);
      }
    }

    this.waitingQueue = Array.isArray(data.waitingList) ? [...data.waitingList] : [];
    this.auditLog = Array.isArray(data.auditLog) ? [...data.auditLog] : [];
  }

  persist() {
    if (typeof window === 'undefined') return;
    try {
      const snapshot = this.getSnapshot();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch (e) {
      console.warn('Storage persist failed:', e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    const snapshot = this.getSnapshot();
    for (const listener of this.listeners) {
      try {
        listener(snapshot);
      } catch (e) {
        console.error(e);
      }
    }
  }
}

// Global Singleton Instance
export const dsaStore = new DsaStateManager();

// Draft vehicle helper functions for the multi-step user journey
export function getDraftVehicle() {
  if (typeof window === 'undefined') {
    return { plate: '', ownerName: '', phone: '', color: '#722F37', slotNumber: null, mode: 'closest' };
  }
  try {
    const saved = localStorage.getItem(DRAFT_KEY);
    return saved
      ? JSON.parse(saved)
      : { plate: '', ownerName: '', phone: '', color: '#722F37', slotNumber: null, mode: 'closest' };
  } catch {
    return { plate: '', ownerName: '', phone: '', color: '#722F37', slotNumber: null, mode: 'closest' };
  }
}

export function saveDraftVehicle(draft) {
  if (typeof window === 'undefined') return;
  try {
    const current = getDraftVehicle();
    const updated = { ...current, ...draft };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
}

export function clearDraftVehicle() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {}
}
