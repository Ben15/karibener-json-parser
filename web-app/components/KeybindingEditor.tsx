'use client';

import { useState, useEffect } from 'react';
import type { KeyBinding } from '@/lib/tartarus-layout';
import { getKeycodeForPhysicalKey } from '@/lib/physical-key-map';

interface KeybindingEditorProps {
  isOpen: boolean;
  onClose: () => void;
  physicalKey: string;
  binding: KeyBinding | null;
  onSave: (physicalKey: string, fromKeyCode: string, toKeyCode: string, modifiers?: string[], lazy?: boolean) => void;
  onDelete: (physicalKey: string) => void;
}

const COMMON_KEYCODES = [
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
  'return_or_enter', 'delete_or_backspace', 'tab', 'space', 'escape',
  'left_command', 'right_command', 'left_control', 'right_control',
  'left_option', 'right_option', 'left_shift', 'right_shift',
  'up_arrow', 'down_arrow', 'left_arrow', 'right_arrow',
  'caps_lock', 'grave_accent_and_tilde',
];

const MODIFIERS = [
  { value: 'left_command', label: '⌘ (Command)' },
  { value: 'right_command', label: '⌘ (Right Command)' },
  { value: 'left_control', label: '⌃ (Control)' },
  { value: 'right_control', label: '⌃ (Right Control)' },
  { value: 'left_option', label: '⌥ (Option)' },
  { value: 'right_option', label: '⌥ (Right Option)' },
  { value: 'left_shift', label: '⇧ (Shift)' },
  { value: 'right_shift', label: '⇧ (Right Shift)' },
];

export default function KeybindingEditor({
  isOpen,
  onClose,
  physicalKey,
  binding,
  onSave,
  onDelete,
}: KeybindingEditorProps) {
  const [fromKeyCode, setFromKeyCode] = useState('');
  const [toKeyCode, setToKeyCode] = useState('');
  const [modifiers, setModifiers] = useState<string[]>([]);
  const [lazy, setLazy] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Always set FROM keycode based on physical key mapping
      const mappedKeycode = getKeycodeForPhysicalKey(physicalKey);
      setFromKeyCode(mappedKeycode || binding?.fromKeyCode || '');
      
      if (binding) {
        // Parse from raw TO data if available, otherwise parse from formatted string
        if (binding.rawTo && binding.rawTo.length > 0) {
          const toEvent = binding.rawTo[0];
          setToKeyCode(toEvent.key_code || '');
          setModifiers(toEvent.modifiers || []);
          setLazy(toEvent.lazy === true);
        } else {
          // Fallback: parse from formatted string
          const toAction = binding.toAction || '';
          const cleanToKeyCode = toAction
            .replace(/⌘|⌥|⌃|⇧/g, '')
            .replace(/Hold|\(lazy modifier\)/gi, '')
            .trim()
            .split(/\s+/)[0] || '';
          
          setToKeyCode(cleanToKeyCode || '');
          
          const detectedModifiers: string[] = [];
          if (toAction.includes('⌘')) detectedModifiers.push('left_command');
          if (toAction.includes('⌥')) detectedModifiers.push('left_option');
          if (toAction.includes('⌃')) detectedModifiers.push('left_control');
          if (toAction.includes('⇧')) detectedModifiers.push('left_shift');
          setModifiers(detectedModifiers);
          setLazy(toAction.toLowerCase().includes('lazy') || toAction.toLowerCase().includes('hold'));
        }
      } else {
        // New binding - reset TO fields
        setToKeyCode('');
        setModifiers([]);
        setLazy(false);
      }
    } else {
      // Reset when closing
      setFromKeyCode('');
      setToKeyCode('');
      setModifiers([]);
      setLazy(false);
    }
  }, [binding, isOpen, physicalKey]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!toKeyCode) {
      alert('Please fill in the TO keycode');
      return;
    }
    onSave(physicalKey, fromKeyCode, toKeyCode, modifiers.length > 0 ? modifiers : undefined, lazy);
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`Delete binding for key ${physicalKey}?`)) {
      onDelete(physicalKey);
      onClose();
    }
  };

  const toggleModifier = (modifier: string) => {
    setModifiers(prev =>
      prev.includes(modifier)
        ? prev.filter(m => m !== modifier)
        : [...prev, modifier]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Edit Key {physicalKey}</h2>

        <div className="space-y-4">
          {/* FROM Keycode - Auto-filled based on physical key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              FROM Keycode (what the physical key emits)
            </label>
            <input
              type="text"
              value={fromKeyCode}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
              placeholder="Auto-detected from physical key"
            />
            <p className="text-xs text-gray-500 mt-1">
              This is automatically determined based on the physical key position
            </p>
          </div>

          {/* TO Keycode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              TO Keycode (what gets sent)
            </label>
            <input
              type="text"
              value={toKeyCode}
              onChange={(e) => setToKeyCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., z, b, left_command"
              list="keycodes"
            />
          </div>

          {/* Modifiers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Modifiers (hold with TO keycode)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MODIFIERS.map(mod => (
                <label key={mod.value} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={modifiers.includes(mod.value)}
                    onChange={() => toggleModifier(mod.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{mod.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Lazy modifier */}
          <div>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={lazy}
                onChange={(e) => setLazy(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Lazy modifier (only activates when used with another key)
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          {binding && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

