/**
 * API Helpers - Wrapper functions for the parser modules
 * These bridge CommonJS modules to TypeScript/ESM
 */

// Use require for CommonJS modules in Node.js environment
const parser = require('./parser');
const manipulator = require('./manipulator');
const scope = require('./scope');
const formatter = require('./formatter');
const tartarusMap = require('./tartarus-map');

export function parseKarabinerJSON(jsonObj: any) {
  return parser.parseKarabinerJSON(jsonObj);
}

export function extractManipulatorData(manipulatorData: any, index: number) {
  return manipulator.extractManipulatorData(manipulatorData, index);
}

export function extractScope(conditions: any[]) {
  return scope.extractScope(conditions);
}

export function formatScope(scopeData: any) {
  return scope.formatScope(scopeData);
}

export function formatFromEvent(fromEvent: any) {
  return formatter.formatFromEvent(fromEvent);
}

export function formatToEvent(toEvent: any) {
  return formatter.formatToEvent(toEvent);
}

export function formatNotes(manipulatorData: any) {
  return formatter.formatNotes(manipulatorData);
}

export function getPhysicalKey(keyCode: string) {
  return tartarusMap.getPhysicalKey(keyCode);
}

