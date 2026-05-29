import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Tag, X, Save } from 'lucide-react';
import { useStore } from '../store';
import { BlockRenderer } from '../components/blocks';
import { EmojiPicker } from '../components/ui/EmojiPicker';
import type { NodeColor, BlockType } from '../types';

const COLORS: NodeColor[] = ['violet', 'cyan', 'emerald', 'amber', 'rose', 'sky', 'fuchsia', 'slate'];

export const NodeEditorPage: React.FC = () => {
  const { workspaceId, nodeId } = useParams<{ workspaceId: string; nodeId: string }>();
  const navigate = useNavigate();
  const { workspaces, updateNode, addBlock, addTag, removeTag } = useStore();
  
  const workspace = workspaces.find(w => w.id === workspaceId);
  const node = workspace?.nodes.find(n => n.id === nodeId);
  
  const [newTag, setNewTag] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);

  if (!workspace || !node) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Node not found</h1>
          <button
            onClick={() => navigate('/')}
            className="text-violet-400 hover:text-violet-300"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  const handleAddBlock = (type: BlockType) => {
    addBlock(workspaceId!, nodeId!, type);
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      addTag(workspaceId!, nodeId!, newTag.trim().toLowerCase());
      setNewTag('');
      setShowTagInput(false);
    }
  };

  // Calculate progress
  const checklistItems = node.blocks
    .filter(b => b.type === 'checklist')
    .flatMap(b => b.items || []);
  const completedItems = checklistItems.filter(i => i.completed).length;
  const progress = checklistItems.length > 0 ? (completedItems / checklistItems.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-white/10"
      >
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/workspace/${workspaceId}`)}
                className="glass p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-white/70" />
              </button>
              
              <div className="flex items-center gap-3">
                <EmojiPicker
                  value={node.emoji}
                  onChange={(emoji) => updateNode(workspaceId!, nodeId!, { emoji })}
                />
                <input
                  type="text"
                  value={node.title}
                  onChange={(e) => updateNode(workspaceId!, nodeId!, { title: e.target.value })}
                  className="text-xl font-semibold text-white bg-transparent focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Color picker */}
              <div className="flex items-center gap-1">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateNode(workspaceId!, nodeId!, { color })}
                    className={`w-6 h-6 rounded-full transition-all ${
                      node.color === color 
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-background scale-110' 
                        : 'opacity-50 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: getColorHex(color),
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Progress bar */}
        {progress > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between text-sm text-white/50 mb-2">
              <span>Progress</span>
              <span>{completedItems}/{checklistItems.length} tasks completed</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
              />
            </div>
          </motion.div>
        )}

        {/* Tags */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            {node.tags.map((tag) => (
              <span
                key={tag}
                className={`badge badge-${node.color} flex items-center gap-1`}
              >
                #{tag}
                <button
                  onClick={() => removeTag(workspaceId!, nodeId!, tag)}
                  className="hover:text-white/80"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            
            {showTagInput ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                  placeholder="tag name"
                  className="w-24 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded focus:outline-none focus:border-violet-500/50"
                  autoFocus
                />
                <button
                  onClick={handleAddTag}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  <Save className="w-3 h-3 text-white/50" />
                </button>
                <button
                  onClick={() => setShowTagInput(false)}
                  className="p-1 hover:bg-white/10 rounded"
                >
                  <X className="w-3 h-3 text-white/50" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowTagInput(true)}
                className="flex items-center gap-1 text-xs text-white/40 hover:text-white/60 transition-colors"
              >
                <Tag className="w-3 h-3" />
                Add tag
              </button>
            )}
          </div>
        </div>

        {/* Blocks */}
        <div className="space-y-2">
          {node.blocks.map((block) => (
            <BlockRenderer
              key={block.id}
              block={block}
              nodeId={nodeId!}
              workspaceId={workspaceId!}
            />
          ))}
        </div>

        {/* Add block buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 pt-8 border-t border-white/10"
        >
          <p className="text-sm text-white/40 mb-4">Add a block</p>
          <div className="flex flex-wrap gap-2">
            {[
              { type: 'paragraph' as const, label: 'Text' },
              { type: 'heading1' as const, label: 'Heading 1' },
              { type: 'heading2' as const, label: 'Heading 2' },
              { type: 'heading3' as const, label: 'Heading 3' },
              { type: 'checklist' as const, label: 'Checklist' },
              { type: 'code' as const, label: 'Code' },
              { type: 'table' as const, label: 'Table' },
              { type: 'quote' as const, label: 'Quote' },
              { type: 'callout' as const, label: 'Callout' },
              { type: 'divider' as const, label: 'Divider' },
            ].map((blockType) => (
              <button
                key={blockType.type}
                onClick={() => handleAddBlock(blockType.type)}
                className="glass px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all"
              >
                {blockType.label}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

function getColorHex(color: NodeColor): string {
  const colors: Record<NodeColor, string> = {
    violet: '#8b5cf6',
    cyan: '#06b6d4',
    emerald: '#10b981',
    amber: '#f59e0b',
    rose: '#f43f5e',
    sky: '#0ea5e9',
    fuchsia: '#d946ef',
    slate: '#64748b',
  };
  return colors[color];
}
