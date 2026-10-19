# 🅿️ PARKING LOT SLOT ALLOCATOR (DSA Project)

A modern, high-performance **Parking Lot Slot Allocation System** built in **C# .NET 8 Windows Forms** for **Visual Studio 2022**, crafted with the sleek light aesthetics of modern **React & Next.js** web applications.

---

## 🌟 Key Features

### 1. Modern Animated Cover Page (`CoverForm.cs`)
- **Prominent Hero**: Bold headline **`PARKING LOT SLOT ALLOCATER`** styled with the exact luxury light aesthetic:
  - **Cosmic Latte** (`#B7A89A` / `RGB(183, 168, 154)`): Subtitles, borders, dividers, and road markings.
  - **Mocha Cream** (`#E8DCC6` / `RGB(232, 220, 198)`): Pill badges, card borders, and warm accent surfaces.
  - **Deep Burgundy** (`#722F37` / `RGB(114, 47, 55)`): Hero title, primary CTA buttons, brand badges, and accent highlights.
  - **Warm Ivory Canvas** (`#FBF8F3`): Clean, airy, elegant background with soft ambient glow.
- **Smooth 60 FPS Visual Simulation (`ParkingSimulationCanvas.cs`)**:
  - Live 2D parking lot mini visualizer.
  - Entrance barrier boom-gate with alternating warning stripes and status LED.
  - Dynamic vehicles approaching, pausing for ticket dispatch, navigating the central driveway, and turning into allocated slots.
  - Radiating beacon rings around newly allocated bays.
  - Real-time status ticker highlighting algorithm actions.
- **Ambient Canvas Animation**: Soft drifting background particles and pulsing glow rings.
- **Interactive Buttons**:
  - `🚀 Launch Slot Allocator →`: Smoothly transitions to the main allocation management workspace.
  - `🧠 Explore DSA Specs`: Opens a modern modal breaking down all 4 data structures and their time/space complexities.
  - `⚡ Quick Park Simulation`: Triggers simulated vehicle arrivals with instant allocation popups.

### 2. Live Management Workspace (`MainAllocatorForm.cs`)
- **Multi-Floor Interactive Bay Layout**:
  - Visual grid representing Floor 1 (Sections A & B) and Floor 2 (Sections C & D).
  - Slot types: **Standard**, **EV Charging**, **VIP Priority**, **Accessible/Handicap**, and **Compact**.
  - Color-coded live status: Available (Emerald Green), Occupied (Slate Blue with License Plate and Owner), EV (Cyan).
- **Vehicle Allocation Panel**:
  - Inputs for License Plate, Owner Name, and Vehicle Type.
  - Assigns the nearest available slot in $O(\log N)$ using a Min-Heap.
- **Vehicle Checkout & Departure**:
  - Search by License Plate or Ticket ID in $O(1)$ via Hash Table.
  - Automated parking duration calculation and billing.
  - Slot is returned to the Min-Heap priority queue automatically.
- **Real-Time KPIs**:
  - Total Capacity, Available Bays, Occupancy Percentage, and Total Revenue.

---

## 🧠 Data Structures & Algorithms (DSA) Architecture

| Data Structure | Implementation | Purpose & Time Complexity |
| :--- | :--- | :--- |
| **Min-Heap Priority Queue** | `MinHeapPriorityQueue<T>` | **$O(\log N)$ Insert & ExtractMin, $O(1)$ Peek**: Orders available slots by shortest Euclidean distance to entrance gate. |
| **Hash Table** | `VehicleHashTable` | **$O(1)$ Search & Delete**: Instant vehicle license plate and ticket ID lookup without full linear scanning. |
| **FIFO Queue** | `WaitingQueue<T>` | **$O(1)$ Enqueue & Dequeue**: Buffers arriving vehicles at the entrance gate when bays are full; dispatches next vehicle upon slot release. |
| **LIFO Stack** | `TransactionStack<T>` | **$O(1)$ Push & Pop**: Maintains an audit log of recent allocations and powers the **1-Click Undo** feature. |

---

## 🚀 How to Run in Visual Studio

1. Open **Visual Studio 2022**.
2. Click **Open a project or solution**.
3. Select `ParkingLotSlotAllocator.sln` (or `ParkingLotSlotAllocator.slnx`) inside this folder:
   `c:\Users\HP\Desktop\PARKING LOT SLOT PROJECT DSA\ParkingLotSlotAllocator.sln`
4. Press **F5** (or click the green **Start** button).
5. The animated **Cover Page** will launch immediately!

### Or Run via Terminal:
```powershell
dotnet run
```
