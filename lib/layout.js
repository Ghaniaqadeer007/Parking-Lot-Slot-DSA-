/**
 * layout.js - Single source of truth for 100-slot parking garage layout (DESIGN.md Section 6.1)
 * 10 columns x 10 rows (100 slots). Slot 1 is closest (top-left), Slot 100 is farthest (bottom-right).
 * Rows grouped in bands of 2 with central drive aisles. Road lane on the left with IN at top, OUT at bottom.
 */

export const TOTAL_SLOTS = 100;
export const COLUMNS = 10;
export const ROWS = 10;

export function getSlotInfo(slotNum) {
  const n = Math.max(1, Math.min(TOTAL_SLOTS, slotNum));
  const zeroIndexed = n - 1;
  const row = Math.floor(zeroIndexed / COLUMNS);
  const column = zeroIndexed % COLUMNS;
  const band = Math.floor(row / 2);
  const position = row % 2; // 0 = above aisle, 1 = below aisle
  const distanceFromEntrance = Math.round(8.0 + (row * 9.0) + (column * 4.5));

  return {
    slotNumber: n,
    row,
    column,
    band,
    position,
    distanceFromEntrance
  };
}

/**
 * Calculates waypoints for vehicle path from Entrance (IN) to any slot 1..100
 */
export function getPathToSlot(slotNum, width = 800, height = 500) {
  const info = getSlotInfo(slotNum);
  const roadX = width * 0.08;
  const roadStartY = 20;

  // Aisle Y coordinate for the slot's band
  const bandHeight = (height - 60) / 5;
  const aisleY = 40 + info.band * bandHeight + bandHeight * 0.5;

  // Slot target coordinate
  const slotStartX = width * 0.18;
  const slotWidth = (width * 0.8) / COLUMNS;
  const slotX = slotStartX + info.column * slotWidth + slotWidth * 0.5;
  const slotY = info.position === 0 ? aisleY - bandHeight * 0.38 : aisleY + bandHeight * 0.38;

  return [
    { x: roadX, y: roadStartY, label: 'IN (Gate)' },
    { x: roadX, y: aisleY, label: 'Road Lane' },
    { x: slotX, y: aisleY, label: 'Aisle Drive' },
    { x: slotX, y: slotY, label: `Slot ${slotNum}` }
  ];
}
