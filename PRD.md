# Product Requirements Document (PRD)
## Smart Parking Lot Slot Allocator

| | |
|---|---|
| **Course** | Data Structures & Algorithms (DSA), UET Lahore |
| **Submitted to** | Sir Sultan |
| **Team** | Ayan Mazhar (2025-APC-47), Ghania Qadeer (2025-APC-04), Iman Ali (2025-APC-36), Sameer Mahmood (2025-APC-24) |
| **Tech stack** | C# (ASP.NET Core) backend · React with Next.js frontend · in-memory data (no database) |
| **Core DSA** | Min-Heap (indexed), Hash Map (`Dictionary`), Queue, array |
| **Document status** | Draft 1.0, written from the driver's point of view |

---

## 1. Overview

Smart Parking is a parking garage with **100 slots**. Slot 1 is closest to the entrance and slot 100 is farthest.
A driver goes through a short guided flow, one page per step: **cover page → car details → choose a slot (2D or 3D view) → confirm → watch the car drive to the slot → ticket**.
Later the driver can **find the car** by plate and **leave**, which frees the slot.

The first proposal gave every car the closest free slot automatically. This version keeps that as the recommended choice, and also lets the driver **pick any free slot** they want. Both choices run on a Min-Heap and a Hash Map, so the DSA idea stays the centre of the project.

> **Assumption about "WinForm".** The brief mentions a "winform" with separate forms. We build the screens as separate **Next.js pages** (one route per screen). Each screen is designed as a stand-alone form, so the same list of screens also maps one-to-one onto Windows Forms `Form` classes if the course needs a desktop version (see section 7).

## 2. Problem statement

In a busy garage, drivers waste time looking for a free spot. When staff pick slots by hand, far slots get used while closer ones stay empty, and finding a parked car takes a long time. Drivers also cannot see which slots are free before they arrive at them.

## 3. Goals and non-goals

### Goals
1. A driver can park in **under 30 seconds** and about **4 screens** (cover, details, slot, confirm).
2. Show **which slots are free at a glance**, in a 2D map and a 3D view.
3. Let the driver choose **"Closest slot"** (automatic) or **"My own slot"** (manual).
4. After confirming, show a **car animation** from the entrance to the chosen slot.
5. Find any parked car by plate quickly, and free a slot as soon as a car leaves.
6. Apply the **Min-Heap, Hash Map and Queue** on a real problem, with correct complexity.

### Non-goals (this version)
- No payments, fees or invoices.
- No login or user accounts.
- No database. Data lives in server memory and is lost when the server restarts.
- No real cameras, sensors or barrier hardware.
- No native mobile app (the web pages are responsive instead).

## 4. Users

| Persona | Needs |
|---|---|
| **Driver (primary)** | Park quickly, see free slots clearly, know exactly where to go, find the car later, leave easily. |
| **Garage staff (secondary, future)** | See the overall lot status. Not part of the main flow in this version. |
| **Course examiner** | See the DSA clearly: heap behaviour, dictionary lookup, correct complexity, and a smooth demo. |

## 5. User journey (driver)

1. **Cover page.** The driver reads the project title, then taps **Start**.
2. **Car details page.** The driver enters plate number, owner name, optional phone, and car colour (a preset or any colour from the gradient picker). The colour is used for the car in the animation.
3. **Choose slot page.** The driver sees the lot in **2D or 3D**. Free slots are easy to spot. The driver either takes the **recommended closest slot** or taps any free slot. The chosen slot is **held for 2 minutes**.
4. **Review and confirm page.** A summary shows car, slot and distance. The driver taps **Confirm and park**.
5. **Parking animation page.** The car appears at the entrance, the barrier lifts, and the car drives along the road and aisle into the chosen slot. A **Skip** button is available.
6. **Ticket page.** Shows the slot number, plate, entry time and a short "how to find your car" note.
7. **Find my car page.** The driver enters the plate and sees the slot highlighted on the map.
8. **Exit page.** The driver enters the plate, confirms, and the car drives out to the exit. The slot becomes free.

Special case: if no slot is free, the driver sees the **Garage Full page** instead of the slot page.

## 6. Screens (each is a separate page or form)

| # | Screen | Route (Next.js) | Purpose |
|---|---|---|---|
| S1 | Cover page | `/` | Title, tagline, **Start** button. |
| S2 | Car details | `/car-details` | Collect plate, owner name, phone (optional), car colour. |
| S3 | Choose slot | `/slots` | 2D / 3D map, recommended slot, free count, hold timer. |
| S4 | Review and confirm | `/confirm` | Summary, **Confirm and park**, **Back**. |
| S5 | Parking animation | `/parking` | Car drives from the entrance to the slot. |
| S6 | Ticket | `/ticket` | Final slot, plate, entry time. |
| S7 | Find my car | `/find` | Search by plate and highlight the slot. |
| S8 | Exit | `/exit` | Confirm leaving and watch the car drive out. |
| S9 | Garage full | `/full` | Message and a **Try again** button (optional **Join waiting list**). |

## 7. Functional requirements

### 7.1 Cover and car details
- F-01: Cover page shows project name, short tagline, and Start button.
- F-02: Car details form: plate (required), owner name (required), phone (optional), car colour.
- F-06: Car colour: 6 quick presets + gradient colour picker (shade area, hue bar, hex field) with live preview.
- F-07: Stored as hex `#RRGGBB`.
- F-03: Plate is trimmed and validated (3-10 alphanumeric characters).
- F-04: If plate is already parked, offer "Find my car".
- F-05: Next disabled until valid.

### 7.2 Slot selection
- F-10: Show all 100 slots with Free, Taken, or Held status.
- F-11: Counters: free slots, taken slots, closest free slot.
- F-12: Two modes: Closest slot (Min-Heap root) and My own slot.
- F-13: Tap free slot to select.
- F-14: Slot held for 120 seconds with live countdown timer.
- F-15: 2D view: top-down map with road, aisles, IN and OUT.
- F-16: 3D view toggle.
- F-19: Real-time refresh every 3 seconds.

### 7.3 Confirm, animation and ticket
- F-30: Review page with summary.
- F-31: Confirm and park creates booking.
- F-33: Animation shows car driving from entrance to slot.
- F-34: 2.5s to 6s duration with Skip button.
- F-37: Ticket page with slot, plate, entry time, Find my car, Done.

### 7.4 Find and exit
- F-40: Find page searches by plate and highlights slot.
- F-41: Exit page asks for plate and frees slot back to heap.

## 8. DSA Design
- **Indexed Min-Heap**: Free slot numbers 1..100 (`PopMin` O(log n), `Push` O(log n), `Peek` O(1), `Remove(slot)` O(log n)).
- **Dictionary<string, Booking>**: Plate -> Booking (O(1)).
- **Booking?[]**: Array of 100 (O(1)).
- **Dictionary<int, Hold> + Queue<Hold>**: 120-second holds.
- **Queue<WaitingTicket>**: FIFO waiting queue when garage full.
