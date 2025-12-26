/**
 * Tartarus V2 Physical Layout Definition
 * Defines the visual layout and positions of all keys
 * Based on actual Razer Tartarus V2 physical design
 */

export interface TartarusKey {
  id: string;
  physicalKey: string; // 01-20, D-pad Up, etc.
  label: string;
  row: number;
  col: number;
  width?: number; // Multi-column width
  height?: number; // Multi-row height
  hasArrow?: boolean; // If key has directional arrow indicator
  arrowDirection?: 'up' | 'down' | 'left' | 'right';
}

// Main key cluster (19 keys) - arranged in 3x5 grid + 1x4 row
// Row 1: 01-05 (5 keys)
// Row 2: 06-10 (5 keys)
// Row 3: 11-15 (5 keys)
// Row 4: 16-19 (4 keys)
export const TARTARUS_KEYS: TartarusKey[] = [
  // Row 1: 01-05 (5 keys)
  { id: '01', physicalKey: '01', label: '1', row: 0, col: 0 },
  { id: '02', physicalKey: '02', label: '2', row: 0, col: 1 },
  { id: '03', physicalKey: '03', label: '3', row: 0, col: 2 },
  { id: '04', physicalKey: '04', label: '4', row: 0, col: 3 },
  { id: '05', physicalKey: '05', label: '5', row: 0, col: 4 },
  
  // Row 2: 06-10 (5 keys)
  { id: '06', physicalKey: '06', label: '6', row: 1, col: 0 },
  { id: '07', physicalKey: '07', label: '7', row: 1, col: 1 },
  { id: '08', physicalKey: '08', label: '8', row: 1, col: 2, hasArrow: true, arrowDirection: 'up' },
  { id: '09', physicalKey: '09', label: '9', row: 1, col: 3 },
  { id: '10', physicalKey: '10', label: '0', row: 1, col: 4 },
  
  // Row 3: 11-15 (5 keys)
  { id: '11', physicalKey: '11', label: '11', row: 2, col: 0 },
  { id: '12', physicalKey: '12', label: '12', row: 2, col: 1, hasArrow: true, arrowDirection: 'left' },
  { id: '13', physicalKey: '13', label: '13', row: 2, col: 2, hasArrow: true, arrowDirection: 'down' },
  { id: '14', physicalKey: '14', label: '14', row: 2, col: 3, hasArrow: true, arrowDirection: 'right' },
  { id: '15', physicalKey: '15', label: '15', row: 2, col: 4 },
  
  // Row 4: 16-19 (4 keys)
  { id: '16', physicalKey: '16', label: '16', row: 3, col: 0 },
  { id: '17', physicalKey: '17', label: '17', row: 3, col: 1 },
  { id: '18', physicalKey: '18', label: '18', row: 3, col: 2 },
  { id: '19', physicalKey: '19', label: '19', row: 3, col: 3 },
  
  // Thumb module - Key 20
  { id: '20', physicalKey: '20', label: '20', row: 2, col: 5 },
  
  // D-pad (on thumb module) - using separate row/col for visual layout
  // These are rendered separately in the component, so row/col don't conflict
  { id: 'dpad-up', physicalKey: 'D-pad Up', label: '↑', row: 4, col: 1 },
  { id: 'dpad-down', physicalKey: 'D-pad Down', label: '↓', row: 4, col: 1 },
  { id: 'dpad-left', physicalKey: 'D-pad Left', label: '←', row: 4, col: 0 },
  { id: 'dpad-right', physicalKey: 'D-pad Right', label: '→', row: 4, col: 2 },
  
  // Option key / Hyperesponse thumb key (thumb module) - same physical key
  { id: 'option', physicalKey: 'Option', label: '⌥', row: 4, col: 3 },
];

export interface KeyBinding {
  physicalKey: string;
  fromKeyCode: string;
  fromFormatted?: string;
  toAction: string;
  scope: string;
  notes: string;
  rawTo?: any; // Raw TO data for editing
}
