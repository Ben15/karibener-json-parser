/**
 * Tartarus Physical Key Mapping
 * Maps Karabiner keycodes to physical Tartarus V2 key positions (01-20)
 * 
 * IMPORTANT: This mapping defines what keycode each physical key EMITS.
 * When creating manipulators, the FROM keycode MUST match what the physical key sends.
 * 
 * Example: Physical key 14 emits 'd', so a manipulator for key 14 must have:
 *   "from": { "key_code": "d" }  ✅ Correct
 *   "from": { "key_code": "b" }  ❌ Wrong - this won't match key 14
 * 
 * To verify what keycode a physical key emits, use Karabiner-Elements EventViewer.
 */

// Standard Tartarus V2 layout mapping
// This maps common keycodes to their typical physical positions
const TARTARUS_KEY_MAP = {
  // Top row (01-10) - typically number keys
  '1': '01',
  '2': '02',
  '3': '03',
  '4': '04',
  '5': '05',
  '6': '06',  // Key 06 -> Hold ⌘ (lazy modifier)
  '7': '07',  // Key 07 -> Hold ⌥ (lazy modifier)
  '8': '08',  // Key 08 -> Hold ⇧ (lazy modifier)
  '9': '09',
  '0': '10',
  
  // Main grid (11-15) - correct Tartarus layout
  'caps_lock': '11',  // Key 11 -> ⌘ F
  'a': '12',          // Key 12 -> Hold ⌥ (lazy)
  's': '13',          // Key 13 -> ⌘ D
  'd': '14',          // Key 14 -> B (physical key 14 emits 'd')
  'f': '15',          // Key 15 -> R
  
  // Bottom grid (16-20) - correct Tartarus layout
  'left_shift': '16', // Key 16 -> (unchanged)
  'z': '17',          // Key 17 -> (unchanged, but may be remapped)
  'x': '18',          // Key 18 -> (unchanged)
  'c': '19',          // Key 19 -> (removed / no binding)
  // Key 20 -> (not defined / untouched)
  
  // Common alternative layouts
  'q': '11',
  'tab': '11',
  'v': '20',
  'g': '20',
  
  // D-pad (not numbered, but mapped)
  'up_arrow': 'D-pad Up',
  'down_arrow': 'D-pad Down',
  'left_arrow': 'D-pad Left',
  'right_arrow': 'D-pad Right',
  
  // Option key
  'left_option': 'Option',
  'right_option': 'Option',
};

// Extended mapping for less common keys
const EXTENDED_MAP = {
  'grave_accent_and_tilde': '01', // `/~ key
  'minus': '02',
  'equal_sign': '03',
  'open_bracket': '04',
  'close_bracket': '05',
  'backslash': '06',
  'semicolon': '07',
  'quote': '08',
  'return_or_enter': '09',
  'delete_or_backspace': '10',
};

/**
 * Get physical key number for a given keycode
 * @param {string} keyCode - The Karabiner keycode
 * @returns {string|null} - Physical key number (01-20) or position name, or null if unknown
 */
function getPhysicalKey(keyCode) {
  if (!keyCode) return null;
  
  const lowerKey = keyCode.toLowerCase();
  
  // Check primary map
  if (TARTARUS_KEY_MAP[lowerKey]) {
    return TARTARUS_KEY_MAP[lowerKey];
  }
  
  // Check extended map
  if (EXTENDED_MAP[lowerKey]) {
    return EXTENDED_MAP[lowerKey];
  }
  
  return null;
}

/**
 * Get all physical key positions in order (01-20, then D-pad, then Option)
 * @returns {Array} - Array of position objects with number and description
 */
function getAllPositions() {
  return [
    { number: '01', description: 'Top row, position 1' },
    { number: '02', description: 'Top row, position 2' },
    { number: '03', description: 'Top row, position 3' },
    { number: '04', description: 'Top row, position 4' },
    { number: '05', description: 'Top row, position 5' },
    { number: '06', description: 'Top row, position 6' },
    { number: '07', description: 'Top row, position 7' },
    { number: '08', description: 'Top row, position 8' },
    { number: '09', description: 'Top row, position 9' },
    { number: '10', description: 'Top row, position 10' },
    { number: '11', description: 'Main grid, position 1' },
    { number: '12', description: 'Main grid, position 2' },
    { number: '13', description: 'Main grid, position 3' },
    { number: '14', description: 'Main grid, position 4' },
    { number: '15', description: 'Main grid, position 5' },
    { number: '16', description: 'Bottom grid, position 1' },
    { number: '17', description: 'Bottom grid, position 2' },
    { number: '18', description: 'Bottom grid, position 3' },
    { number: '19', description: 'Bottom grid, position 4' },
    { number: '20', description: 'Bottom grid, position 5' },
    { number: 'D-pad Up', description: 'D-pad Up arrow' },
    { number: 'D-pad Down', description: 'D-pad Down arrow' },
    { number: 'D-pad Left', description: 'D-pad Left arrow' },
    { number: 'D-pad Right', description: 'D-pad Right arrow' },
    { number: 'Option', description: 'Left Option key' },
  ];
}

module.exports = {
  getPhysicalKey,
  getAllPositions,
  TARTARUS_KEY_MAP,
};

