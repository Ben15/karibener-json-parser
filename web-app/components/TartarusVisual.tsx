'use client';

import { TARTARUS_KEYS, type KeyBinding } from '@/lib/tartarus-layout';
import { useMemo } from 'react';

interface TartarusVisualProps {
  bindings: Map<string, KeyBinding>;
  onKeyClick?: (physicalKey: string) => void;
  selectedKey?: string;
}

export default function TartarusVisual({ bindings, onKeyClick, selectedKey }: TartarusVisualProps) {
  const bindingMap = useMemo(() => {
    const map = new Map<string, KeyBinding>();
    bindings.forEach((binding, key) => {
      map.set(key, binding);
    });
    return map;
  }, [bindings]);

  const getKeyClasses = (key: typeof TARTARUS_KEYS[0]) => {
    const isSelected = selectedKey === key.physicalKey;
    const hasBinding = bindingMap.has(key.physicalKey);
    const binding = bindingMap.get(key.physicalKey);
    
    return `
      relative
      border-2 rounded-md
      p-2 min-h-[65px] min-w-[65px]
      flex flex-col items-center justify-center
      transition-all duration-200
      cursor-pointer
      bg-gradient-to-br
      shadow-sm
      ${isSelected 
        ? 'border-blue-500 bg-blue-100 shadow-xl scale-105 z-10 ring-2 ring-blue-300' 
        : 'border-gray-500 hover:border-gray-600'
      }
      ${hasBinding 
        ? 'from-green-100 to-green-200 hover:from-green-200 hover:to-green-300' 
        : 'from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300'
      }
      ${onKeyClick ? 'hover:shadow-lg' : ''}
    `;
  };

  const getArrowSymbol = (direction?: 'up' | 'down' | 'left' | 'right') => {
    switch (direction) {
      case 'up': return '↑';
      case 'down': return '↓';
      case 'left': return '←';
      case 'right': return '→';
      default: return null;
    }
  };

  const renderKey = (key: typeof TARTARUS_KEYS[0], skipGridStyle = false) => {
    const binding = bindingMap.get(key.physicalKey);
    const arrow = getArrowSymbol(key.arrowDirection);
    
    return (
      <div
        key={key.id}
        className={getKeyClasses(key)}
        onClick={() => onKeyClick?.(key.physicalKey)}
        style={skipGridStyle ? {} : {
          gridColumn: `${key.col + 1} / span ${key.width || 1}`,
          gridRow: `${key.row + 1} / span ${key.height || 1}`,
        }}
      >
        <div className="text-[9px] font-semibold text-gray-500 absolute top-1 left-1.5">
          {key.physicalKey === 'Option' ? 'Hyperesponse' : key.physicalKey}
        </div>
        <div className="text-base font-bold mt-3 flex items-center gap-1 text-gray-800">
          {key.label}
          {arrow && (
            <span className="text-sm text-blue-600 font-bold">{arrow}</span>
          )}
        </div>
        {binding && (
          <div className="text-xs text-center mt-2 text-gray-900 px-1.5 line-clamp-2 min-h-[28px] flex items-center justify-center">
            <div className="font-semibold leading-tight">{binding.toAction}</div>
          </div>
        )}
        {!binding && (
          <div className="text-[10px] text-gray-400 mt-2 font-medium">unmapped</div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-2xl">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Razer Tartarus V2</h2>
        <p className="text-sm text-gray-600">Interactive Keymap Visualization</p>
      </div>
      
      <div className="flex gap-6 items-start">
        {/* Main Keypad Area */}
        <div className="flex-1 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-2xl relative">
          {/* Row 1: Keys 01-05 (5 keys) */}
          <div className="grid grid-cols-5 gap-1.5 mb-2">
            {TARTARUS_KEYS.filter(k => k.row === 0 && k.physicalKey !== '20').map(k => renderKey(k))}
          </div>

          {/* Row 2: Keys 06-10 (5 keys) */}
          <div className="grid grid-cols-5 gap-1.5 mb-2">
            {TARTARUS_KEYS.filter(k => k.row === 1 && k.physicalKey !== '20').map(k => renderKey(k))}
          </div>

          {/* Row 3: Keys 11-15 (5 keys) */}
          <div className="grid grid-cols-5 gap-1.5 mb-2">
            {TARTARUS_KEYS.filter(k => k.row === 2 && k.physicalKey !== '20').map(k => renderKey(k))}
          </div>

          {/* Row 4: Keys 16-19 (4 keys) - Key 20 is in thumb module */}
          <div className="grid grid-cols-5 gap-1.5 mb-4">
            {TARTARUS_KEYS.filter(k => k.row === 3 && k.physicalKey !== '20' && parseInt(k.physicalKey) >= 16 && parseInt(k.physicalKey) <= 19).map(k => renderKey(k))}
            <div className="col-span-1"></div> {/* Empty cell for alignment */}
          </div>

          {/* Scroll Wheel Area (visual indicator on right) */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-8 h-20 border-2 border-gray-600 rounded-full bg-gradient-to-b from-gray-700 to-gray-800 flex flex-col items-center justify-center shadow-inner">
              <div className="w-5 h-0.5 bg-gray-500 rounded-full mb-1"></div>
              <div className="w-5 h-0.5 bg-gray-500 rounded-full mb-1"></div>
              <div className="w-5 h-0.5 bg-gray-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Thumb Module Area */}
        <div className="w-72 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-5 shadow-2xl">
          <div className="text-xs font-semibold text-gray-300 mb-4 text-center">Thumb Module</div>
          
          {/* Option key / Hyperesponse thumb key - above D-pad */}
          <div className="mb-3 flex justify-center">
            {TARTARUS_KEYS.filter(k => k.physicalKey === 'Option').map(k => renderKey(k, true))}
          </div>
          
          {/* D-pad - arranged in cross pattern */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div></div>
            {TARTARUS_KEYS.filter(k => k.physicalKey === 'D-pad Up').map(k => renderKey(k, true))}
            <div></div>
            
            {TARTARUS_KEYS.filter(k => k.physicalKey === 'D-pad Left').map(k => renderKey(k, true))}
            <div className="bg-gray-600 rounded-full flex items-center justify-center text-xs text-gray-200 font-bold shadow-inner border-2 border-gray-500 min-h-[55px] min-w-[55px]">
              D
            </div>
            {TARTARUS_KEYS.filter(k => k.physicalKey === 'D-pad Right').map(k => renderKey(k, true))}
            
            <div></div>
            {TARTARUS_KEYS.filter(k => k.physicalKey === 'D-pad Down').map(k => renderKey(k, true))}
            <div></div>
          </div>
          
          {/* Key 20 - below D-pad */}
          <div className="mb-4 flex justify-center">
            {TARTARUS_KEYS.filter(k => k.physicalKey === '20').map(k => renderKey(k, true))}
          </div>
          
          {/* Spacebar actuator visual */}
          <div className="h-12 bg-gray-900 rounded-lg flex items-center justify-center shadow-inner border-2 border-gray-700">
            <span className="text-xs text-gray-300 font-medium">Spacebar Actuator</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex justify-center gap-6 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-gray-400 bg-green-50 rounded"></div>
          <span>Mapped</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-gray-400 bg-gray-50 rounded"></div>
          <span>Unmapped</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-blue-500 bg-blue-100 rounded"></div>
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
}
