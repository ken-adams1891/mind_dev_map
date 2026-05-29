import React, { useState, useRef, useEffect } from 'react';
import { Check, Trash2, GripVertical, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../../store';
import type { Block, ChecklistItem, NodeColor } from '../../types';
import { generateId } from '../../types';

interface BlockWrapperProps {
  block: Block;
  nodeId: string;
  workspaceId: string;
  children: React.ReactNode;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export const BlockWrapper: React.FC<BlockWrapperProps> = ({
  block,
  nodeId,
  workspaceId,
  children,
  onDragStart,
  onDragEnd,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addBlock, deleteBlock } = useStore();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const blockTypes = [
    { type: 'paragraph' as const, label: 'Paragraph', icon: '¶' },
    { type: 'heading1' as const, label: 'Heading 1', icon: 'H1' },
    { type: 'heading2' as const, label: 'Heading 2', icon: 'H2' },
    { type: 'heading3' as const, label: 'Heading 3', icon: 'H3' },
    { type: 'checklist' as const, label: 'Checklist', icon: '☑' },
    { type: 'code' as const, label: 'Code', icon: '</>' },
    { type: 'table' as const, label: 'Table', icon: '▦' },
    { type: 'quote' as const, label: 'Quote', icon: '"' },
    { type: 'callout' as const, label: 'Callout', icon: '💡' },
    { type: 'divider' as const, label: 'Divider', icon: '—' },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddBlock = (type: typeof blockTypes[number]['type']) => {
    addBlock(workspaceId, nodeId, type, block.id);
    setShowMenu(false);
  };

  const handleDelete = () => {
    deleteBlock(workspaceId, nodeId, block.id);
  };

  return (
    <motion.div
      layout
      className="group relative flex items-start gap-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Block handle */}
      <div
        className={`flex-shrink-0 w-6 pt-1 opacity-0 group-hover:opacity-50 transition-opacity cursor-grab ${
          onDragStart ? 'cursor-grabbing' : ''
        }`}
        onMouseDown={onDragStart}
        onMouseUp={onDragEnd}
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Block content */}
      <div className="flex-1 min-w-0">{children}</div>

      {/* Block actions */}
      <div
        className={`flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${
          showMenu ? 'opacity-100' : ''
        }`}
      >
        {/* Add block menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded hover:bg-white/10 transition-colors"
          >
            <Plus className="w-4 h-4 text-white/60" />
          </button>
          
          {showMenu && (
            <div className="absolute left-0 top-full mt-1 z-20 w-40 glass rounded-lg shadow-xl overflow-hidden">
              <div className="p-1">
                {blockTypes.map((bt) => (
                  <button
                    key={bt.type}
                    onClick={() => handleAddBlock(bt.type)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/80 hover:bg-white/10 rounded-md transition-colors"
                  >
                    <span className="w-6 text-center text-white/50">{bt.icon}</span>
                    {bt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Delete block */}
        <button
          onClick={handleDelete}
          className="p-1 rounded hover:bg-white/10 transition-colors"
        >
          <Trash2 className="w-4 h-4 text-white/40 hover:text-rose-400" />
        </button>
      </div>
    </motion.div>
  );
};

// Paragraph Block
interface ParagraphBlockProps {
  block: Block;
  nodeId: string;
  workspaceId: string;
  onChange?: (content: string) => void;
}

export const ParagraphBlock: React.FC<ParagraphBlockProps> = ({
  block,
  nodeId,
  workspaceId,
}) => {
  const { updateBlock } = useStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [block.content]);

  return (
    <BlockWrapper block={block} nodeId={nodeId} workspaceId={workspaceId}>
      <textarea
        ref={textareaRef}
        value={block.content}
        onChange={(e) => updateBlock(workspaceId, nodeId, block.id, { content: e.target.value })}
        placeholder="Start typing..."
        className="w-full bg-transparent text-white/90 placeholder-white/30 resize-none focus:outline-none text-base leading-relaxed"
        rows={1}
      />
    </BlockWrapper>
  );
};

// Heading Block
interface HeadingBlockProps {
  block: Block;
  nodeId: string;
  workspaceId: string;
  level: 1 | 2 | 3;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({
  block,
  nodeId,
  workspaceId,
  level,
}) => {
  const { updateBlock } = useStore();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [block.content]);

  const sizes = {
    1: 'text-2xl font-bold',
    2: 'text-xl font-semibold',
    3: 'text-lg font-medium',
  };

  return (
    <BlockWrapper block={block} nodeId={nodeId} workspaceId={workspaceId}>
      <textarea
        ref={textareaRef}
        value={block.content}
        onChange={(e) => updateBlock(workspaceId, nodeId, block.id, { content: e.target.value })}
        placeholder={`Heading ${level}`}
        className={`w-full bg-transparent text-white placeholder-white/30 resize-none focus:outline-none ${sizes[level]}`}
        rows={1}
      />
    </BlockWrapper>
  );
};

// Checklist Block
interface ChecklistBlockProps {
  block: Block;
  nodeId: string;
  workspaceId: string;
}

export const ChecklistBlock: React.FC<ChecklistBlockProps> = ({
  block,
  nodeId,
  workspaceId,
}) => {
  const { updateBlock } = useStore();
  const items = block.items || [];

  const toggleItem = (itemId: string) => {
    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    updateBlock(workspaceId, nodeId, block.id, { items: updatedItems });
  };

  const updateItemText = (itemId: string, text: string) => {
    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, text } : item
    );
    updateBlock(workspaceId, nodeId, block.id, { items: updatedItems });
  };

  const addItem = () => {
    const newItem: ChecklistItem = {
      id: generateId(),
      text: '',
      completed: false,
    };
    updateBlock(workspaceId, nodeId, block.id, { items: [...items, newItem] });
  };

  const deleteItem = (itemId: string) => {
    const updatedItems = items.filter((item) => item.id !== itemId);
    updateBlock(workspaceId, nodeId, block.id, { items: updatedItems });
  };

  const completedCount = items.filter((i) => i.completed).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  return (
    <BlockWrapper block={block} nodeId={nodeId} workspaceId={workspaceId}>
      <div className="space-y-2">
        {/* Progress bar */}
        {items.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-white/50 mb-1">
              <span>Progress</span>
              <span>{completedCount}/{items.length}</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
              />
            </div>
          </div>
        )}

        {/* Checklist items */}
        <div className="space-y-1">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 group/item">
              <button
                onClick={() => toggleItem(item.id)}
                className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  item.completed
                    ? 'bg-violet-500 border-violet-500'
                    : 'border-white/30 hover:border-white/50'
                }`}
              >
                {item.completed && <Check className="w-3 h-3 text-white" />}
              </button>
              <input
                type="text"
                value={item.text}
                onChange={(e) => updateItemText(item.id, e.target.value)}
                placeholder="Add task..."
                className={`flex-1 bg-transparent text-sm focus:outline-none ${
                  item.completed ? 'text-white/40 line-through' : 'text-white/90'
                }`}
              />
              <button
                onClick={() => deleteItem(item.id)}
                className="opacity-0 group-hover/item:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
              >
                <Trash2 className="w-3 h-3 text-white/40 hover:text-rose-400" />
              </button>
            </div>
          ))}
        </div>

        {/* Add item button */}
        <button
          onClick={addItem}
          className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add task
        </button>
      </div>
    </BlockWrapper>
  );
};

// Code Block
interface CodeBlockProps {
  block: Block;
  nodeId: string;
  workspaceId: string;
}

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'go', 'rust', 'html', 'css',
  'sql', 'bash', 'json', 'yaml', 'markdown', 'c', 'cpp', 'csharp', 'ruby', 'php'
];

export const CodeBlock: React.FC<CodeBlockProps> = ({
  block,
  nodeId,
  workspaceId,
}) => {
  const { updateBlock } = useStore();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <BlockWrapper block={block} nodeId={nodeId} workspaceId={workspaceId}>
      <div className="rounded-lg overflow-hidden border border-white/10">
        {/* Header with language selector */}
        <div className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/10">
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 text-xs text-white/60 hover:text-white/80 transition-colors"
            >
              {block.language || 'javascript'}
              <ChevronDown className="w-3 h-3" />
            </button>
            
            {showLangMenu && (
              <div className="absolute left-0 top-full mt-1 z-10 w-32 max-h-40 overflow-y-auto glass rounded-lg shadow-xl">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      updateBlock(workspaceId, nodeId, block.id, { language: lang });
                      setShowLangMenu(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs hover:bg-white/10 transition-colors ${
                      block.language === lang ? 'text-violet-400' : 'text-white/70'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Code editor */}
        <textarea
          ref={textareaRef}
          value={block.content}
          onChange={(e) => updateBlock(workspaceId, nodeId, block.id, { content: e.target.value })}
          placeholder="// Start coding..."
          className="w-full px-4 py-3 bg-black/30 font-mono text-sm text-cyan-300 placeholder-white/20 resize-none focus:outline-none"
          rows={6}
          spellCheck={false}
        />
      </div>
    </BlockWrapper>
  );
};

// Table Block
interface TableBlockProps {
  block: Block;
  nodeId: string;
  workspaceId: string;
}

export const TableBlock: React.FC<TableBlockProps> = ({
  block,
  nodeId,
  workspaceId,
}) => {
  const { updateBlock } = useStore();
  const columns = block.columns || [];
  const rows = block.rows || [];

  const updateCell = (rowId: string, colIndex: number, value: string) => {
    const updatedRows = rows.map((row) =>
      row.id === rowId
        ? { ...row, cells: row.cells.map((cell, i) => (i === colIndex ? value : cell)) }
        : row
    );
    updateBlock(workspaceId, nodeId, block.id, { rows: updatedRows });
  };

  const addRow = () => {
    const newRow = {
      id: generateId(),
      cells: new Array(columns.length).fill(''),
    };
    updateBlock(workspaceId, nodeId, block.id, { rows: [...rows, newRow] });
  };

  const addColumn = () => {
    const newColumn = { id: generateId(), width: 150 };
    const updatedColumns = [...columns, newColumn];
    const updatedRows = rows.map((row) => ({
      ...row,
      cells: [...row.cells, ''],
    }));
    updateBlock(workspaceId, nodeId, block.id, {
      columns: updatedColumns,
      rows: updatedRows,
    });
  };

  const deleteColumn = (colIndex: number) => {
    if (columns.length <= 1) return;
    const updatedColumns = columns.filter((_, i) => i !== colIndex);
    const updatedRows = rows.map((row) => ({
      ...row,
      cells: row.cells.filter((_, i) => i !== colIndex),
    }));
    updateBlock(workspaceId, nodeId, block.id, {
      columns: updatedColumns,
      rows: updatedRows,
    });
  };

  return (
    <BlockWrapper block={block} nodeId={nodeId} workspaceId={workspaceId}>
      <div className="rounded-lg overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                {columns.map((col, colIndex) => (
                  <th
                    key={col.id}
                    className="relative px-3 py-2 bg-white/5 border-b border-white/10"
                  >
                    <input
                      type="text"
                      placeholder={`Column ${colIndex + 1}`}
                      className="w-full bg-transparent text-sm font-medium text-white/80 focus:outline-none"
                    />
                    <button
                      onClick={() => deleteColumn(colIndex)}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all"
                    >
                      <Trash2 className="w-3 h-3 text-white/40" />
                    </button>
                  </th>
                ))}
                <th className="px-2 py-2 bg-white/5 border-b border-white/10">
                  <button
                    onClick={addColumn}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <Plus className="w-4 h-4 text-white/50" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {row.cells.map((cell, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-3 py-2 border-b border-white/5"
                    >
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => updateCell(row.id, colIndex, e.target.value)}
                        className="w-full bg-transparent text-sm text-white/90 focus:outline-none"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-3 py-2 bg-white/5">
          <button
            onClick={addRow}
            className="flex items-center gap-2 text-sm text-white/50 hover:text-white/80 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add row
          </button>
        </div>
      </div>
    </BlockWrapper>
  );
};

// Quote Block
interface QuoteBlockProps {
  block: Block;
  nodeId: string;
  workspaceId: string;
}

export const QuoteBlock: React.FC<QuoteBlockProps> = ({
  block,
  nodeId,
  workspaceId,
}) => {
  const { updateBlock } = useStore();

  return (
    <BlockWrapper block={block} nodeId={nodeId} workspaceId={workspaceId}>
      <div className="pl-4 border-l-2 border-violet-500/50">
        <textarea
          value={block.content}
          onChange={(e) => updateBlock(workspaceId, nodeId, block.id, { content: e.target.value })}
          placeholder="Enter quote..."
          className="w-full bg-transparent text-white/80 placeholder-white/30 resize-none focus:outline-none italic"
          rows={2}
        />
      </div>
    </BlockWrapper>
  );
};

// Callout Block
interface CalloutBlockProps {
  block: Block;
  nodeId: string;
  workspaceId: string;
}

export const CalloutBlock: React.FC<CalloutBlockProps> = ({
  block,
  nodeId,
  workspaceId,
}) => {
  const { updateBlock } = useStore();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojis = ['💡', '⚠️', '❌', '✅', '📌', '🔔', '💎', '🎯', '🚀', '💭'];

  return (
    <BlockWrapper block={block} nodeId={nodeId} workspaceId={workspaceId}>
      <div className="flex items-start gap-3 p-4 rounded-lg bg-white/5 border border-white/10">
        {/* Emoji selector */}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-2xl hover:scale-110 transition-transform"
          >
            {block.emoji || '💡'}
          </button>
          
          {showEmojiPicker && (
            <div className="absolute left-0 top-full mt-1 z-10 flex gap-1 p-2 glass rounded-lg shadow-xl">
              {emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    updateBlock(workspaceId, nodeId, block.id, { emoji });
                    setShowEmojiPicker(false);
                  }}
                  className="p-1 hover:bg-white/10 rounded transition-colors text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <textarea
          value={block.content}
          onChange={(e) => updateBlock(workspaceId, nodeId, block.id, { content: e.target.value })}
          placeholder="Add a callout..."
          className="flex-1 bg-transparent text-white/90 placeholder-white/30 resize-none focus:outline-none"
          rows={2}
        />
      </div>
    </BlockWrapper>
  );
};

// Divider Block
interface DividerBlockProps {
  block: Block;
  nodeId: string;
  workspaceId: string;
}

export const DividerBlock: React.FC<DividerBlockProps> = ({
  block,
  nodeId,
  workspaceId,
}) => {
  return (
    <BlockWrapper block={block} nodeId={nodeId} workspaceId={workspaceId}>
      <hr className="border-white/10 my-4" />
    </BlockWrapper>
  );
};

// Block renderer
interface BlockRendererProps {
  block: Block;
  nodeId: string;
  workspaceId: string;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  nodeId,
  workspaceId,
}) => {
  switch (block.type) {
    case 'paragraph':
      return <ParagraphBlock block={block} nodeId={nodeId} workspaceId={workspaceId} />;
    case 'heading1':
      return <HeadingBlock block={block} nodeId={nodeId} workspaceId={workspaceId} level={1} />;
    case 'heading2':
      return <HeadingBlock block={block} nodeId={nodeId} workspaceId={workspaceId} level={2} />;
    case 'heading3':
      return <HeadingBlock block={block} nodeId={nodeId} workspaceId={workspaceId} level={3} />;
    case 'checklist':
      return <ChecklistBlock block={block} nodeId={nodeId} workspaceId={workspaceId} />;
    case 'code':
      return <CodeBlock block={block} nodeId={nodeId} workspaceId={workspaceId} />;
    case 'table':
      return <TableBlock block={block} nodeId={nodeId} workspaceId={workspaceId} />;
    case 'quote':
      return <QuoteBlock block={block} nodeId={nodeId} workspaceId={workspaceId} />;
    case 'callout':
      return <CalloutBlock block={block} nodeId={nodeId} workspaceId={workspaceId} />;
    case 'divider':
      return <DividerBlock block={block} nodeId={nodeId} workspaceId={workspaceId} />;
    default:
      return null;
  }
};
