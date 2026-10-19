# DESIGN.md
## Smart Parking Lot Slot Allocator (UI/UX and technical design)

Written from the **driver's point of view**. Use it together with `PRD.md`.
Visual reference: the working prototype `parking_ui.html` (2D map, colours, car animation).

---

## 1. Design principles

1. **One job per page.** Every step is its own page with one main button.
2. **See before you choose.** The driver should see free and taken slots at a glance, in 2D or 3D, before choosing.
3. **Closest is the easy choice.** The recommended slot is always highlighted. Choosing another slot is possible but never required.
4. **Show, don't explain.** The car animation shows exactly where the car goes, so no map reading is needed.
5. **Light and calm.** Soft light colours, lots of white space, rounded shapes, no harsh contrast.
6. **Never trap the user.** Every page has Back. Typed data is kept. Errors say what to do next.

## 2. Tech architecture

```
 Browser (Next.js + React, TypeScript)
   pages: / , /car-details , /slots , /confirm , /parking , /ticket , /find , /exit , /full
   2D map (SVG/CSS)   3D map (react-three-fiber)   Car animation (shared path helper)
        |  HTTPS + JSON (poll every 3 s)
        v
 ASP.NET Core Web API (C#)
   Controllers  ->  ParkingService (one lock)  ->  Data structures
                                                   IndexedMinHeap  (free slots)
                                                   Dictionary      (plate -> booking)
                                                   Booking?[100]   (slot -> booking)
                                                   Dictionary + Queue (holds, expiry)
                                                   Queue (waiting list, optional)
```

## 3. Design tokens (light theme)

- **Cosmic Latte**: `#B7A89A`, `RGB(183, 168, 154)`
- **Mocha Cream**: `#E8DCC6`, `RGB(232, 220, 198)`
- **Deep Burgundy**: `#722F37`, `RGB(114, 47, 55)`
- **Page Background**: `#FBF8F3` (Warm Ivory) / `#F3F6FB`
- **Panel Surfaces**: `#FFFFFF`
- **Text Primary**: `#261517` / `#1F2A44`
- **Free Slot Fill / Border**: `#EAFAF3` / `#BFEEDB`
- **Recommended Slot**: `#FFF5DD` / `#F9D98B`
- **Taken Slot**: `#F3EDE4` / `#E8DCC6`
- **Road Lane**: `#E9EEF7` / `#F2ECE2`

## 4. Layout: 100 Slots (10 Columns x 10 Rows)
- Slot number $n \in [1, 100]$:
  - $\text{row} = \lfloor(n - 1) / 10\rfloor$
  - $\text{column} = (n - 1) \pmod{10}$
  - $\text{band} = \lfloor\text{row} / 2\rfloor$
  - $\text{position} = \text{row} \pmod 2$ (0 = above aisle, 1 = below)
- Distance from gate: $d(n) = \text{row} \times 9 + \text{column} \times 4.5$.
