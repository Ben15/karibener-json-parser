/**
 * JSON Manipulator
 * Functions to update Karabiner-Elements JSON configuration
 */

export interface BindingUpdate {
  physicalKey: string;
  fromKeyCode: string;
  toKeyCode: string;
  modifiers?: string[];
  lazy?: boolean;
}

/**
 * Update a manipulator in the JSON based on physical key
 */
export function updateBinding(
  jsonObj: any,
  physicalKey: string,
  fromKeyCode: string,
  toKeyCode: string,
  modifiers?: string[],
  lazy?: boolean
): any {
  // Find the manipulator that matches this physical key
  const manipulators = jsonObj.manipulators || (jsonObj.rules?.[0]?.manipulators || []);
  
  // Find existing manipulator with matching FROM keycode
  const existingIndex = manipulators.findIndex((m: any) => 
    m.from?.key_code === fromKeyCode
  );

  const newManipulator: any = {
    conditions: manipulators[existingIndex]?.conditions || [
      {
        bundle_identifiers: [
          "^com\\.adobe\\.Photoshop$",
          "^com\\.adobe\\.PhotoshopBeta$"
        ],
        type: "frontmost_application_if"
      },
      {
        identifiers: [
          {
            product_id: 555,
            vendor_id: 5426
          }
        ],
        type: "device_if"
      }
    ],
    from: {
      key_code: fromKeyCode,
      modifiers: { optional: ["any"] }
    },
    to: [],
    type: "basic"
  };

  // Build the TO action
  const toAction: any = {
    key_code: toKeyCode,
  };

  if (lazy) {
    toAction.lazy = true;
  }

  if (modifiers && modifiers.length > 0) {
    toAction.modifiers = modifiers;
  }

  newManipulator.to = [toAction];

  // Update or add manipulator
  if (existingIndex >= 0) {
    manipulators[existingIndex] = newManipulator;
  } else {
    manipulators.push(newManipulator);
  }

  // Update the JSON structure
  if (jsonObj.rules) {
    if (!jsonObj.rules[0]) {
      jsonObj.rules[0] = { 
        description: jsonObj.description || 'Custom Keybinds', 
        manipulators: [] 
      };
    }
    jsonObj.rules[0].manipulators = manipulators;
  } else {
    jsonObj.manipulators = manipulators;
  }

  return JSON.parse(JSON.stringify(jsonObj)); // Return a deep copy
}

/**
 * Delete a binding by FROM keycode
 */
export function deleteBinding(jsonObj: any, fromKeyCode: string): any {
  // Get manipulators array
  let manipulators: any[];
  if (jsonObj.manipulators) {
    manipulators = jsonObj.manipulators;
  } else if (jsonObj.rules && jsonObj.rules.length > 0 && jsonObj.rules[0].manipulators) {
    manipulators = jsonObj.rules[0].manipulators;
  } else {
    manipulators = [];
  }
  
  const filtered = manipulators.filter((m: any) => 
    m.from?.key_code !== fromKeyCode
  );

  if (jsonObj.rules) {
    if (!jsonObj.rules[0]) {
      jsonObj.rules[0] = { 
        description: jsonObj.description || 'Custom Keybinds', 
        manipulators: [] 
      };
    }
    jsonObj.rules[0].manipulators = filtered;
  } else {
    jsonObj.manipulators = filtered;
  }

  return JSON.parse(JSON.stringify(jsonObj)); // Return a deep copy
}

