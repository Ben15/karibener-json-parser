import { NextRequest, NextResponse } from 'next/server';
import {
  parseKarabinerJSON,
  extractManipulatorData,
  extractScope,
  formatScope,
  formatFromEvent,
  formatToEvent,
  formatNotes,
  getPhysicalKey,
} from '@/lib/parser/api-helpers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jsonData } = body;

    if (!jsonData) {
      return NextResponse.json(
        { error: 'No JSON data provided' },
        { status: 400 }
      );
    }

    // Parse JSON
    let jsonObj;
    try {
      jsonObj = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
    } catch (err: any) {
      return NextResponse.json(
        { error: `Invalid JSON: ${err.message}` },
        { status: 400 }
      );
    }

    // Parse rules
    const rules = parseKarabinerJSON(jsonObj);

    // Process manipulators
    const processedRules = rules.map((rule: any) => {
      const processedManipulators = rule.manipulators
        .map((manipulator: any, index: number) => {
          const manipulatorData = extractManipulatorData(manipulator, index);
          if (!manipulatorData) return null;

          const scopeData = extractScope(manipulatorData.conditions);
          manipulatorData.scope = {
            ...scopeData,
            formatted: formatScope(scopeData),
          };

          return manipulatorData;
        })
        .filter((m: any) => m !== null);

      return {
        ...rule,
        manipulators: processedManipulators,
      };
    });

    // Build bindings map
    const bindings = new Map();
    
    for (const rule of processedRules) {
      for (const manipulator of rule.manipulators) {
        const keyCode = manipulator.from.key_code;
        const physicalKey = getPhysicalKey(keyCode);
        
        if (physicalKey) {
          const from = formatFromEvent(manipulator.from);
          const toEvents = manipulator.to.map((e: any) => formatToEvent(e)).join(', ') || '(no output)';
          const scopeText = manipulator.scope.formatted;
          const notes = formatNotes(manipulator);

          bindings.set(physicalKey, {
            physicalKey,
            fromKeyCode: keyCode,
            fromFormatted: from,
            toAction: toEvents,
            scope: scopeText,
            notes,
            rule: rule.description,
            manipulatorIndex: manipulator.manipulatorIndex,
            original: manipulator.original,
            rawTo: manipulator.to, // Store raw TO data for editing
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      rules: processedRules,
      bindings: Object.fromEntries(bindings),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to parse JSON' },
      { status: 500 }
    );
  }
}

