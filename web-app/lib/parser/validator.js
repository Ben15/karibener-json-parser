/**
 * Validation Module
 * Validates that physical key mappings match expected keycodes
 * Prevents common mistakes like mapping wrong FROM keycodes
 */

// Physical key to expected keycode mapping
// This defines what keycode each physical Tartarus key SHOULD emit
const EXPECTED_PHYSICAL_KEYCODES = {
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
  '20': null, // Not defined
  'D-pad Up': 'up_arrow',
  'D-pad Down': 'down_arrow',
  'D-pad Left': 'left_arrow',
  'D-pad Right': 'right_arrow',
  'Option': 'left_option',
};

/**
 * Validates that manipulators use correct FROM keycodes for physical keys
 * @param {Array} rules - Processed rules with manipulators
 * @param {Function} getPhysicalKey - Function to get physical key from keycode
 * @returns {Array} Array of validation errors/warnings
 */
function validatePhysicalKeyMappings(rules, getPhysicalKey) {
  const errors = [];
  const warnings = [];
  
  // Build a map of physical keys to their FROM keycodes
  const physicalKeyFromMap = new Map();
  
  for (const rule of rules) {
    for (const manipulator of rule.manipulators) {
      const fromKeyCode = manipulator.from.key_code;
      if (!fromKeyCode) continue;
      
      const physicalKey = getPhysicalKey(fromKeyCode);
      if (!physicalKey) continue;
      
      if (!physicalKeyFromMap.has(physicalKey)) {
        physicalKeyFromMap.set(physicalKey, []);
      }
      physicalKeyFromMap.get(physicalKey).push({
        rule: rule.description,
        fromKeyCode,
        manipulatorIndex: manipulator.manipulatorIndex,
      });
    }
  }
  
  // Check each physical key
  for (const [physicalKey, mappings] of physicalKeyFromMap.entries()) {
    const expectedKeyCode = EXPECTED_PHYSICAL_KEYCODES[physicalKey];
    
    if (expectedKeyCode === undefined) {
      // Unknown physical key - skip
      continue;
    }
    
    if (expectedKeyCode === null) {
      // Key 20 is intentionally undefined
      continue;
    }
    
    // Check if any mapping uses the expected keycode
    const hasExpectedKeyCode = mappings.some(m => m.fromKeyCode === expectedKeyCode);
    
    if (!hasExpectedKeyCode) {
      // Check if there are any mappings at all
      if (mappings.length > 0) {
        const actualKeyCodes = [...new Set(mappings.map(m => m.fromKeyCode))];
        errors.push({
          type: 'wrong_from_keycode',
          physicalKey,
          expectedKeyCode,
          actualKeyCodes,
          mappings: mappings.map(m => ({
            rule: m.rule,
            manipulatorIndex: m.manipulatorIndex,
            fromKeyCode: m.fromKeyCode,
          })),
          message: `Physical key ${physicalKey} should emit '${expectedKeyCode}' but manipulators use: ${actualKeyCodes.join(', ')}`,
        });
      } else {
        warnings.push({
          type: 'unmapped_physical_key',
          physicalKey,
          expectedKeyCode,
          message: `Physical key ${physicalKey} (emits '${expectedKeyCode}') has no manipulator`,
        });
      }
    }
  }
  
  // Check for missing expected keycodes
  for (const [physicalKey, expectedKeyCode] of Object.entries(EXPECTED_PHYSICAL_KEYCODES)) {
    if (expectedKeyCode === null) continue;
    
    if (!physicalKeyFromMap.has(physicalKey)) {
      warnings.push({
        type: 'missing_physical_key',
        physicalKey,
        expectedKeyCode,
        message: `Physical key ${physicalKey} (emits '${expectedKeyCode}') has no manipulator`,
      });
    }
  }
  
  return { errors, warnings };
}

/**
 * Validates that D-pad keys are properly mapped
 * @param {Array} rules - Processed rules with manipulators
 * @returns {Array} Array of validation errors
 */
function validateDpadMappings(rules) {
  const errors = [];
  const dpadKeys = ['up_arrow', 'down_arrow', 'left_arrow', 'right_arrow'];
  
  for (const dpadKey of dpadKeys) {
    const hasManipulator = rules.some(rule =>
      rule.manipulators.some(m => m.from.key_code === dpadKey)
    );
    
    if (!hasManipulator) {
      errors.push({
        type: 'missing_dpad_mapping',
        keyCode: dpadKey,
        message: `D-pad key '${dpadKey}' has no manipulator. Physical D-pad keys emit these keycodes and need manipulators.`,
      });
    }
  }
  
  return errors;
}

module.exports = {
  validatePhysicalKeyMappings,
  validateDpadMappings,
  EXPECTED_PHYSICAL_KEYCODES,
};


