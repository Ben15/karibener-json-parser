/**
 * Formatter Module
 * Formats keycodes, modifiers, and generates human-readable output
 */

const { getPhysicalKey } = require('./tartarus-map');

const MOD_SYMBOL = {
  left_command: '⌘',
  right_command: '⌘',
  left_shift: '⇧',
  right_shift: '⇧',
  left_option: '⌥',
  right_option: '⌥',
  left_control: '⌃',
  right_control: '⌃',
  fn: 'fn',
};

const KEY_PRETTY = {
  return_or_enter: 'Enter',
  delete_or_backspace: 'Delete',
  grave_accent_and_tilde: '`',
  left_arrow: '←',
  right_arrow: '→',
  up_arrow: '↑',
  down_arrow: '↓',
  caps_lock: 'Caps Lock',
  tab: 'Tab',
  spacebar: 'Space',
  escape: 'Esc',
  forward_delete: 'Forward Delete',
  page_up: 'Page Up',
  page_down: 'Page Down',
  home: 'Home',
  end: 'End',
};

function prettyKey(keyCode) {
  if (!keyCode) return '';
  if (KEY_PRETTY[keyCode]) return KEY_PRETTY[keyCode];
  // Single letters/numbers read fine
  if (/^[a-z0-9]$/.test(keyCode)) return keyCode.toUpperCase();
  // Convert snake_case to Title Case
  return keyCode
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function prettyModifiers(modifiers) {
  if (!modifiers || !Array.isArray(modifiers) || modifiers.length === 0) {
    return '';
  }
  return modifiers.map(m => MOD_SYMBOL[m] || m).join(' ');
}

function formatFromEvent(fromEvent) {
  const key = prettyKey(fromEvent.key_code);
  const mandatoryMods = prettyModifiers(fromEvent.modifiers.mandatory);
  const optionalMods = fromEvent.modifiers.optional.length > 0
    ? ` (optional: ${prettyModifiers(fromEvent.modifiers.optional)})`
    : '';

  if (!key) return '(no key)';

  const parts = [mandatoryMods, key].filter(Boolean);
  return parts.join(' ') + optionalMods;
}

function formatToEvent(toEvent) {
  if (toEvent.lazy && toEvent.key_code) {
    const modSymbol = MOD_SYMBOL[toEvent.key_code];
    if (modSymbol) {
      return `Hold ${modSymbol} (lazy modifier)`;
    }
    return `Hold ${prettyKey(toEvent.key_code)} (lazy modifier)`;
  }

  if (toEvent.shell_command) {
    return `Shell: ${toEvent.shell_command}`;
  }

  if (toEvent.set_variable) {
    return `Set variable: ${JSON.stringify(toEvent.set_variable)}`;
  }

  if (toEvent.select_input_source) {
    return `Select input source: ${JSON.stringify(toEvent.select_input_source)}`;
  }

  const key = prettyKey(toEvent.key_code);
  const mods = prettyModifiers(toEvent.modifiers);

  if (!key) return '(no output)';

  const parts = [mods, key].filter(Boolean);
  return parts.join(' ') || key;
}

function formatNotes(manipulatorData) {
  const notes = [];

  // Check for lazy modifiers
  const hasLazy = manipulatorData.to.some(e => e.lazy);
  if (hasLazy) {
    notes.push('lazy modifier');
  }

  // Check for optional modifiers in from
  if (manipulatorData.from.modifiers.optional.length > 0) {
    notes.push('optional modifiers');
  }

  // Check for multiple to events
  if (manipulatorData.to.length > 1) {
    notes.push('multiple outputs');
  }

  return notes.length > 0 ? notes.join(', ') : 'none';
}

function formatMarkdown(rules, sourceFiles) {
  const timestamp = new Date().toISOString();
  let output = '';

  // Header
  output += '# Tartarus Keymap Reporter\n\n';
  output += `**Generated:** ${timestamp}\n\n`;
  output += `**Source files:** ${sourceFiles.join(', ')}\n\n`;

  // Interpretation note
  output += '## Interpretation Note\n\n';
  output += 'The Razer Tartarus V2 presents itself as a standard HID keyboard and emits ';
  output += 'standard keyboard events (tab, caps_lock, q, 1, etc.). Physical key numbers ';
  output += 'like 01–19 are labels only and do not exist at the OS level. ';
  output += 'This report shows what Karabiner-Elements sees and how it modifies those events.\n\n';

  // Scope summary
  const allDevices = new Set();
  const allApps = new Set();
  let totalRules = 0;
  let totalManipulators = 0;

  for (const rule of rules) {
    totalRules++;
    for (const manipulator of rule.manipulators) {
      totalManipulators++;
      manipulator.scope.devices.forEach(dev => {
        if (dev.vendor_id && dev.product_id) {
          allDevices.add(`vendor ${dev.vendor_id} / product ${dev.product_id}`);
        }
      });
      manipulator.scope.applications.forEach(app => allApps.add(app));
    }
  }

  output += '## Scope Summary\n\n';
  output += `- **Rules processed:** ${totalRules}\n`;
  output += `- **Manipulators processed:** ${totalManipulators}\n`;
  if (allDevices.size > 0) {
    output += `- **Devices:** ${Array.from(allDevices).join(', ')}\n`;
  }
  if (allApps.size > 0) {
    output += `- **Applications:** ${Array.from(allApps).join(', ')}\n`;
  }
  if (allDevices.size === 0 && allApps.size === 0) {
    output += '- **Scope:** Global (no device or application restrictions)\n';
  }
  output += '\n';

  // Physical Layout Section
  output += '## Physical Key Layout\n\n';
  output += 'This section shows the Tartarus V2 physical key positions (01-20) mapped to their Karabiner keycodes and actions.\n\n';

  // Create a map of physical keys to manipulators
  const physicalKeyMap = new Map();
  const unmappedManipulators = [];

  for (const rule of rules) {
    for (const manipulator of rule.manipulators) {
      const keyCode = manipulator.from.key_code;
      const physicalKey = getPhysicalKey(keyCode);
      
      if (physicalKey) {
        if (!physicalKeyMap.has(physicalKey)) {
          physicalKeyMap.set(physicalKey, []);
        }
        physicalKeyMap.get(physicalKey).push({
          rule: rule.description,
          manipulator,
        });
      } else {
        unmappedManipulators.push({
          rule: rule.description,
          manipulator,
        });
      }
    }
  }

  // Generate layout tables by section
  const sections = [
    { title: 'Top Row — Keys 01–10', keys: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'] },
    { title: 'Main Grid — Keys 11–15', keys: ['11', '12', '13', '14', '15'] },
    { title: 'Bottom Grid — Keys 16–20', keys: ['16', '17', '18', '19', '20'] },
    { title: 'D-pad', keys: ['D-pad Up', 'D-pad Down', 'D-pad Left', 'D-pad Right'] },
    { title: 'Option Key', keys: ['Option'] },
  ];

  for (const section of sections) {
    output += `### ${section.title}\n\n`;
    output += '| Tartarus Key | Karabiner Keycode | Action | Scope | Notes |\n';
    output += '|--------------|-------------------|--------|-------|-------|\n';

    for (const keyNum of section.keys) {
      const mappings = physicalKeyMap.get(keyNum) || [];
      
      if (mappings.length === 0) {
        output += `| ${keyNum} | *(unmapped)* | *(unchanged)* | - | - |\n`;
      } else {
        for (const mapping of mappings) {
          const from = formatFromEvent(mapping.manipulator.from);
          const toEvents = mapping.manipulator.to.map(formatToEvent).join(', ') || '(no output)';
          const scope = mapping.manipulator.scope.formatted;
          const notes = formatNotes(mapping.manipulator);
          
          output += `| ${keyNum} | ${from} | ${toEvents} | ${scope} | ${notes} |\n`;
        }
      }
    }
    output += '\n';
  }

  // Show unmapped manipulators if any
  if (unmappedManipulators.length > 0) {
    output += '### Other Mappings\n\n';
    output += 'The following bindings do not map to standard Tartarus physical keys:\n\n';
    output += '| Karabiner Keycode | Action | Scope | Notes |\n';
    output += '|-------------------|--------|-------|-------|\n';

    for (const item of unmappedManipulators) {
      const from = formatFromEvent(item.manipulator.from);
      const toEvents = item.manipulator.to.map(formatToEvent).join(', ') || '(no output)';
      const scope = item.manipulator.scope.formatted;
      const notes = formatNotes(item.manipulator);

      output += `| ${from} | ${toEvents} | ${scope} | ${notes} |\n`;
    }
    output += '\n';
  }

  // Detailed Bindings list (original format)
  output += '## Detailed Bindings\n\n';

  for (const rule of rules) {
    output += `### ${rule.description}\n\n`;

    if (rule.manipulators.length === 0) {
      output += '*No manipulators in this rule.*\n\n';
      continue;
    }

    output += '| Tartarus Key | From | To | Scope | Notes |\n';
    output += '|--------------|------|----|----|-------|\n';

    for (const manipulator of rule.manipulators) {
      const keyCode = manipulator.from.key_code;
      const physicalKey = getPhysicalKey(keyCode);
      const tartarusKey = physicalKey || '?';
      const from = formatFromEvent(manipulator.from);
      const toEvents = manipulator.to.map(formatToEvent).join(', ') || '(no output)';
      const scope = manipulator.scope.formatted;
      const notes = formatNotes(manipulator);

      output += `| ${tartarusKey} | ${from} | ${toEvents} | ${scope} | ${notes} |\n`;
    }

    output += '\n';
  }

  return output;
}

function formatText(rules, sourceFiles) {
  const timestamp = new Date().toISOString();
  let output = '';

  output += 'TARTARUS KEYMAP REPORTER\n';
  output += '='.repeat(50) + '\n\n';
  output += `Generated: ${timestamp}\n`;
  output += `Source files: ${sourceFiles.join(', ')}\n\n`;

  output += 'INTERPRETATION NOTE\n';
  output += '-'.repeat(50) + '\n';
  output += 'The Razer Tartarus V2 presents itself as a standard HID keyboard and emits ';
  output += 'standard keyboard events. Physical key numbers like 01–19 are labels only. ';
  output += 'This report shows what Karabiner-Elements sees and how it modifies those events.\n\n';

  for (const rule of rules) {
    output += `\nRule: ${rule.description}\n`;
    output += '-'.repeat(50) + '\n';

    for (const manipulator of rule.manipulators) {
      const from = formatFromEvent(manipulator.from);
      const toEvents = manipulator.to.map(formatToEvent).join(', ') || '(no output)';
      const scope = manipulator.scope.formatted;
      const notes = formatNotes(manipulator);

      output += `\nFrom: ${from}\n`;
      output += `To: ${toEvents}\n`;
      output += `Scope: ${scope}\n`;
      output += `Notes: ${notes}\n`;
    }
  }

  return output;
}

function formatJSON(rules, sourceFiles) {
  const timestamp = new Date().toISOString();

  const output = {
    metadata: {
      tool: 'tartarus-keymap',
      timestamp,
      sourceFiles,
    },
    rules: rules.map(rule => ({
      index: rule.index,
      description: rule.description,
      manipulators: rule.manipulators.map(manipulator => ({
        manipulatorIndex: manipulator.manipulatorIndex,
        type: manipulator.type,
        from: {
          key_code: manipulator.from.key_code,
          modifiers: manipulator.from.modifiers,
          formatted: formatFromEvent(manipulator.from),
        },
        to: manipulator.to.map(event => ({
          index: event.index,
          key_code: event.key_code,
          modifiers: event.modifiers,
          lazy: event.lazy,
          formatted: formatToEvent(event),
          original: event.original,
        })),
        scope: {
          devices: manipulator.scope.devices,
          applications: manipulator.scope.applications,
          isGlobal: manipulator.scope.isGlobal,
          formatted: manipulator.scope.formatted,
        },
        notes: formatNotes(manipulator),
        original: manipulator.original,
      })),
    })),
  };

  return JSON.stringify(output, null, 2);
}

module.exports = {
  formatMarkdown,
  formatText,
  formatJSON,
  formatFromEvent,
  formatToEvent,
  formatNotes,
};

