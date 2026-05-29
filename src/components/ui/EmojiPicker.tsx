import React, { useState, useEffect, useRef } from 'react';
import { Smile, Search } from 'lucide-react';

const POPULAR_EMOJIS = [
  '📝', '💡', '🎯', '🚀', '⭐', '🔥', '💎', '🎨', '📚', '🔬',
  '💻', '⚡', '🌟', '✨', '🎭', '🎪', '🎬', '🎮', '🎵', '📱',
  '🏠', '🌍', '🌈', '☀️', '🌙', '⚽', '🎸', '🍕', '☕', '🍺',
  '💼', '🏆', '🎯', '📊', '🔧', '🛠️', '📦', '🎁', '❤️', '💔',
];

interface EmojiPickerProps {
  value: string;
  onChange: (emoji: string) => void;
  trigger?: React.ReactNode;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ value, onChange, trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const pickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(useState);

  const filteredEmojis = search
    ? POPULAR_EMOJIS
    : POPULAR_EMOJIS;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredEmojis.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredEmojis.length) % filteredEmojis.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      onChange(filteredEmojis[selectedIndex]);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={pickerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        {trigger || (
          <span className="text-2xl">{value}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-72 glass rounded-xl shadow-xl overflow-hidden animate-scale-in">
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search emoji..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-violet-500/50"
                autoFocus
              />
            </div>
          </div>
          
          <div className="p-2 max-h-48 overflow-y-auto">
            <div className="grid grid-cols-8 gap-1">
              {filteredEmojis.map((emoji, index) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onChange(emoji);
                    setIsOpen(false);
                  }}
                  className={`p-2 text-xl rounded-lg transition-colors ${
                    index === selectedIndex
                      ? 'bg-violet-500/30'
                      : 'hover:bg-white/10'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
