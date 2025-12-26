/**
 * Physical Key to Keycode Mapping
 * Maps physical Tartarus keys to the keycodes they emit
 */

export const PHYSICAL_KEY_TO_KEYCODE: Record<string, string> = {
  '01': '1',
  '02': '2',
  '03': '3',
  '04': '4',
  '05': '5',
  '06': '6',
  '07': '7',
  '08': '8',
  '09': '9',
  '10': '0',
  '11': 'caps_lock',
  '12': 'a',
  '13': 's',
  '14': 'd',
  '15': 'f',
  '16': 'left_shift',
  '17': 'z',
  '18': 'x',
  '19': 'c',
  '20': 'v', // Common default, may vary
  'D-pad Up': 'up_arrow',
  'D-pad Down': 'down_arrow',
  'D-pad Left': 'left_arrow',
  'D-pad Right': 'right_arrow',
  'Option': 'left_option',
};

export function getKeycodeForPhysicalKey(physicalKey: string): string | null {
  return PHYSICAL_KEY_TO_KEYCODE[physicalKey] || null;
}

