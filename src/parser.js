/**
 * JSON Parser Module
 * Handles parsing of Karabiner JSON files (rules[] arrays and single rule objects)
 */

function parseKarabinerJSON(jsonObj) {
  if (!jsonObj || typeof jsonObj !== 'object') {
    throw new Error('Invalid JSON: expected an object');
  }

  // Case A: full complex modifications file: { rules: [ ... ] }
  if (Array.isArray(jsonObj.rules)) {
    return jsonObj.rules.map((rule, index) => ({
      index,
      description: rule.description || `Rule ${index + 1}`,
      manipulators: Array.isArray(rule.manipulators) ? rule.manipulators : [],
    }));
  }

  // Case B: single rule object: { description, manipulators }
  if (Array.isArray(jsonObj.manipulators)) {
    return [{
      index: 0,
      description: jsonObj.description || 'Rule 1',
      manipulators: jsonObj.manipulators,
    }];
  }

  throw new Error('Unrecognized format: expected {rules:[...]} or {description, manipulators:[...]}');
}

module.exports = { parseKarabinerJSON };

