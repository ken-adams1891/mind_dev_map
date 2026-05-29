import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MoreHorizontal, 
  Link2, 
  Trash2, 
  Palette, 
  Tag,
  ExternalLink,
  X,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import type { Node, NodeColor } from '../../types';
import { EmojiPicker } from '../ui/EmojiPicker';

interface NodeCardProps {
  node: Node;
  workspaceId: string;
  isSelected?: boolean;
  isConnecting?: boolean;
  onSelect?: () => void;
  onStartConnect?: () => void;
  onEndConnect?: () => void;
  onDelete?: () => void;
}

const COLORS: NodeColor[] = ['violet', 'cyan', 'emerald', 'amber', 'rose', 'sky', 'fuchsia', 'slate'];

const COLOR_EMOJI: Record<NodeColor, string> = {
  violet: '🟣',
  cyan: '🩵',
  emerald: '💚',
  amber: '🟠',
  rose: '🩷',
  sky: '💙',
  fuchsia: '🩶',
  slate: '⚫',
};

export const NodeCard: React.FC<NodeCardProps> = ({
  node,
  workspaceId,
  isSelected,
  isConnecting,
  onSelect,
  onStartConnect,
  onEndConnect,
  onDelete,
}) => {
  const navigate = useNavigate();
  const { updateNode, moveNode, addTag, removeTag, getNode } = useStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Calculate progress from checklist blocks
  const checklistItems = node.blocks
    .filter(b => b.type === 'checklist')
    .flatMap(b => b.items || []);
  const completedItems = checklistItems.filter(i => i.completed).length;
  const progress = checklistItems.length > 0 ? (completedItems / checklistItems.length) * 100 : 0;

  // Get preview text from first paragraph
  const previewText = node.blocks
    .find(b => b.type === 'paragraph' || b.type?.startsWith('heading'))
    ?.content?.slice(0, 100) || 'No content';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
        setShowColorPicker(false);
        setShowTagInput(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('textarea')) {
      return;
    }
    
    setIsDragging(true);
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = document.querySelector('[data-canvas]');
      if (!canvas) return;
      
      const canvasRect = canvas.getBoundingClientRect();
      const scale = 1; // Could be connected to canvas zoom
      
      const newX = (e.clientX - canvasRect.left - dragOffset.x) / scale;
      const newY = (e.clientY - canvasRect.top - dragOffset.y) / scale;
      
      moveNode(workspaceId, node.id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, workspaceId, node.id, moveNode]);

  const handleDoubleClick = () => {
    navigate(`/workspace/${workspaceId}/node/${node.id}`);
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      addTag(workspaceId, node.id, newTag.trim().toLowerCase());
      setNewTag('');
      setShowTagInput(false);
    }
  };

  const colorClass = `node-${node.color}`;

  return (
    <motion.div
      ref={cardRef}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        x: node.position.x,
        y: node.position.y,
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`absolute w-64 ${colorClass} rounded-xl border backdrop-blur-xl overflow-hidden select-none
        ${isSelected ? 'ring-2 ring-white/30' : ''}
        ${isConnecting ? 'ring-2 ring-cyan-400 animate-pulse' : ''}
        ${isDragging ? 'cursor-grabbing shadow-2xl z-50' : 'cursor-grab'}
      `}
      style={{ 
        left: 0, 
        top: 0,
        transform: `translate(${node.position.x}px, ${node.position.y}px)`,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onClick={(e) => {
        if (isConnecting) {
          onEndConnect?.();
        } else {
          onSelect?.();
        }
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <EmojiPicker
            value={node.emoji}
            onChange={(emoji) => updateNode(workspaceId, node.id, { emoji })}
          />
          <input
            type="text"
            value={node.title}
            onChange={(e) => updateNode(workspaceId, node.id, { title: e.target.value })}
            className="font-semibold text-white bg-transparent focus:outline-none text-sm w-32"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded hover:bg-white/10 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-white/60" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-1 z-30 w-48 glass rounded-lg shadow-xl overflow-hidden animate-scale-in">
              <div className="p-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/workspace/${workspaceId}/node/${node.id}`);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-md transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in Editor
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowColorPicker(!showColorPicker);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-md transition-colors"
                >
                  <Palette className="w-4 h-4" />
                  Change Color
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartConnect?.();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-md transition-colors"
                >
                  <Link2 className="w-4 h-4" />
                  Connect to...
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTagInput(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-md transition-colors"
                >
                  <Tag className="w-4 h-4" />
                  Add Tag
                </button>
                <div className="my-1 border-t border-white/10" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Node
                </button>
              </div>

              {/* Color picker */}
              {showColorPicker && (
                <div className="p-2 border-t border-white/10 bg-black/20">
                  <div className="grid grid-cols-4 gap-1">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateNode(workspaceId, node.id, { color });
                          setShowColorPicker(false);
                        }}
                        className={`p-2 rounded-lg transition-all ${
                          node.color === color ? 'bg-white/20 ring-2 ring-white/30' : 'hover:bg-white/10'
                        }`}
                      >
                        <span className="text-lg">{COLOR_EMOJI[color]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tag input */}
              {showTagInput && (
                <div className="p-2 border-t border-white/10 bg-black/20">
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                      placeholder="Add tag..."
                      className="flex-1 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded focus:outline-none focus:border-violet-500/50"
                      autoFocus
                    />
                    <button
                      onClick={handleAddTag}
                      className="p-1 bg-violet-500 rounded hover:bg-violet-400 transition-colors"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="text-sm text-white/60 line-clamp-2 mb-3">
          {previewText || 'Double-click to edit...'}
        </p>

        {/* Tags */}
        {node.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {node.tags.map((tag) => (
              <span
                key={tag}
                className={`badge badge-${node.color} flex items-center gap-1`}
              >
                #{tag}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTag(workspaceId, node.id, tag);
                  }}
                  className="hover:text-white/80"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Progress bar */}
        {progress > 0 && (
          <div className="mt-2">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-violet-500 to-cyan-500"
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
