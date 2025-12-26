/**
 * Manipulator Extraction Module
 * Extracts from/to events, modifiers, conditions, and lazy flags from manipulators
 */

function extractManipulatorData(manipulator, manipulatorIndex) {
  if (!manipulator || typeof manipulator !== 'object') {
    return null;
  }

  const from = manipulator.from || {};
  const to = manipulator.to;
  const conditions = Array.isArray(manipulator.conditions) ? manipulator.conditions : [];

  // Extract from event
  const fromEvent = {
    key_code: from.key_code || null,
    modifiers: {
      mandatory: Array.isArray(from.modifiers?.mandatory) ? from.modifiers.mandatory : [],
      optional: Array.isArray(from.modifiers?.optional) ? from.modifiers.optional : [],
    },
  };

  // Extract to events (can be single object or array)
  let toEvents = [];
  if (Array.isArray(to)) {
    toEvents = to;
  } else if (to) {
    toEvents = [to];
  }

  const normalizedToEvents = toEvents.map((event, idx) => ({
    index: idx,
    key_code: event.key_code || null,
    modifiers: Array.isArray(event.modifiers) ? event.modifiers : [],
    lazy: event.lazy === true,
    shell_command: event.shell_command || null,
    set_variable: event.set_variable || null,
    select_input_source: event.select_input_source || null,
    // Preserve original for traceability
    original: event,
  }));

  return {
    manipulatorIndex,
    type: manipulator.type || 'basic',
    from: fromEvent,
    to: normalizedToEvents,
    conditions,
    // Preserve original manipulator for traceability
    original: manipulator,
  };
}

module.exports = { extractManipulatorData };


