'use client';

import { useState } from 'react';
import TartarusVisual from '@/components/TartarusVisual';
import KeybindingEditor from '@/components/KeybindingEditor';
import type { KeyBinding } from '@/lib/tartarus-layout';
import { updateBinding, deleteBinding } from '@/lib/json-manipulator';

export default function Home() {
  const [jsonData, setJsonData] = useState('');
  const [jsonObj, setJsonObj] = useState<any>(null);
  const [bindings, setBindings] = useState<Map<string, KeyBinding>>(new Map());
  const [selectedKey, setSelectedKey] = useState<string | undefined>();
  const [editingKey, setEditingKey] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setJsonData(content);
      parseJSON(content);
    };
    reader.readAsText(file);
  };

  const parseJSON = async (data: string) => {
    setLoading(true);
    setError(null);

    try {
      // Parse and store the JSON object
      const parsed = typeof data === 'string' ? JSON.parse(data) : data;
      setJsonObj(parsed);

      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jsonData: data }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to parse JSON');
      }

      // Convert bindings object to Map
      const bindingsMap = new Map<string, KeyBinding>();
      Object.entries(result.bindings).forEach(([key, value]: [string, any]) => {
        bindingsMap.set(key, {
          physicalKey: value.physicalKey,
          fromKeyCode: value.fromKeyCode,
          fromFormatted: value.fromFormatted,
          toAction: value.toAction,
          scope: value.scope,
          notes: value.notes,
          rawTo: value.rawTo,
        });
      });

      setBindings(bindingsMap);
    } catch (err: any) {
      setError(err.message || 'Failed to parse JSON');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBinding = (
    physicalKey: string,
    fromKeyCode: string,
    toKeyCode: string,
    modifiers?: string[],
    lazy?: boolean
  ) => {
    if (!jsonObj) {
      setError('No JSON loaded');
      return;
    }

    try {
      // Update the JSON object
      const updated = updateBinding(jsonObj, physicalKey, fromKeyCode, toKeyCode, modifiers, lazy);
      const updatedJsonString = JSON.stringify(updated, null, 2);
      
      // Update state
      setJsonObj(updated);
      setJsonData(updatedJsonString);
      
      // Re-parse to update bindings display
      parseJSON(updatedJsonString);
      
      setEditingKey(undefined);
    } catch (err: any) {
      setError(err.message || 'Failed to save binding');
    }
  };

  const handleDeleteBinding = (physicalKey: string) => {
    if (!jsonObj) {
      setError('No JSON loaded');
      return;
    }

    const binding = bindings.get(physicalKey);
    if (!binding) return;

    try {
      // Delete the binding from JSON
      const updated = deleteBinding(jsonObj, binding.fromKeyCode);
      const updatedJsonString = JSON.stringify(updated, null, 2);
      
      // Update state
      setJsonObj(updated);
      setJsonData(updatedJsonString);
      
      // Re-parse to update bindings display
      parseJSON(updatedJsonString);
      
      setEditingKey(undefined);
    } catch (err: any) {
      setError(err.message || 'Failed to delete binding');
    }
  };

  const handleDownload = () => {
    if (!jsonData) {
      setError('No JSON to download');
      return;
    }

    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'karabiner-keybinds.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleKeyClick = (physicalKey: string) => {
    setSelectedKey(physicalKey);
    setEditingKey(physicalKey);
  };

  const handlePaste = () => {
    navigator.clipboard.readText().then((text) => {
      setJsonData(text);
      parseJSON(text);
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-100 to-slate-200 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-bold text-center mb-4 text-gray-900">
          Tartarus Keymap Editor
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Visualize and edit your Razer Tartarus V2 Karabiner-Elements keybindings
        </p>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload Karabiner JSON</h2>
          
          <div className="flex gap-4 mb-4">
            <label className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
              Upload File
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            
            <button
              onClick={handlePaste}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Paste from Clipboard
            </button>

            {jsonData && (
              <>
                <button
                  onClick={() => parseJSON(jsonData)}
                  className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Re-parse JSON
                </button>
                <button
                  onClick={handleDownload}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Download JSON
                </button>
              </>
            )}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {loading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {jsonData && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                JSON Data:
              </label>
              <textarea
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
                className="w-full h-40 p-3 border border-gray-300 rounded-lg font-mono text-sm"
                placeholder="Paste your Karabiner JSON here..."
              />
            </div>
          )}
        </div>

        {bindings.size > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <TartarusVisual
              bindings={bindings}
              onKeyClick={handleKeyClick}
              selectedKey={selectedKey}
            />

            {selectedKey && bindings.has(selectedKey) && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-lg mb-2">
                  Key {selectedKey} Details
                </h3>
                {(() => {
                  const binding = bindings.get(selectedKey)!;
                  return (
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">From:</span> {(binding as any).fromFormatted || binding.fromKeyCode}
                      </div>
                      <div>
                        <span className="font-medium">To:</span> {binding.toAction}
                      </div>
                      <div>
                        <span className="font-medium">Scope:</span> {binding.scope}
                      </div>
                      {binding.notes && binding.notes !== 'none' && (
                        <div>
                          <span className="font-medium">Notes:</span> {binding.notes}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Keybinding Editor Modal */}
        {editingKey && (
          <KeybindingEditor
            isOpen={!!editingKey}
            onClose={() => setEditingKey(undefined)}
            physicalKey={editingKey}
            binding={bindings.get(editingKey) || null}
            onSave={handleSaveBinding}
            onDelete={handleDeleteBinding}
          />
        )}
      </div>
    </main>
  );
}
