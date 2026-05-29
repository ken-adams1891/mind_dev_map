// Block Types
export type BlockType = 
  | 'paragraph' 
  | 'heading1' 
  | 'heading2' 
  | 'heading3' 
  | 'checklist' 
  | 'code' 
  | 'table' 
  | 'quote' 
  | 'callout' 
  | 'divider';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TableRow {
  id: string;
  cells: string[];
}

export interface TableColumn {
  id: string;
  width: number;
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  language?: string; // for code blocks
  items?: ChecklistItem[]; // for checklist
  columns?: TableColumn[]; // for table
  rows?: TableRow[]; // for table
  emoji?: string; // for callout
}

// Node Colors
export type NodeColor = 
  | 'violet' 
  | 'cyan' 
  | 'emerald' 
  | 'amber' 
  | 'rose' 
  | 'sky' 
  | 'fuchsia' 
  | 'slate';

export interface Position {
  x: number;
  y: number;
}

export interface Node {
  id: string;
  title: string;
  emoji: string;
  color: NodeColor;
  blocks: Block[];
  tags: string[];
  position: Position;
  createdAt: string;
  updatedAt: string;
}

// Connection - only one connection between any two nodes
export interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  createdAt: string;
}

// Workspace
export interface Workspace {
  id: string;
  name: string;
  emoji: string;
  nodes: Node[];
  connections: Connection[];
  createdAt: string;
  updatedAt: string;
}

// App State
export interface PolymathState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  
  // Workspace actions
  createWorkspace: (name: string, emoji: string) => string;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => void;
  deleteWorkspace: (id: string) => void;
  setActiveWorkspace: (id: string | null) => void;
  
  // Node actions
  createNode: (workspaceId: string, title: string, position: Position) => string;
  updateNode: (workspaceId: string, nodeId: string, updates: Partial<Node>) => void;
  deleteNode: (workspaceId: string, nodeId: string) => void;
  moveNode: (workspaceId: string, nodeId: string, position: Position) => void;
  
  // Block actions
  addBlock: (workspaceId: string, nodeId: string, type: BlockType, afterBlockId?: string) => string;
  updateBlock: (workspaceId: string, nodeId: string, blockId: string, updates: Partial<Block>) => void;
  deleteBlock: (workspaceId: string, nodeId: string, blockId: string) => void;
  reorderBlocks: (workspaceId: string, nodeId: string, fromIndex: number, toIndex: number) => void;
  
  // Connection actions
  createConnection: (workspaceId: string, fromNodeId: string, toNodeId: string) => string | null;
  deleteConnection: (workspaceId: string, connectionId: string) => void;
  
  // Tag actions
  addTag: (workspaceId: string, nodeId: string, tag: string) => void;
  removeTag: (workspaceId: string, nodeId: string, tag: string) => void;
  
  // Export/Import
  exportData: () => string;
  importData: (data: string) => boolean;
  
  // Helpers
  getActiveWorkspace: () => Workspace | null;
  getNode: (workspaceId: string, nodeId: string) => Node | null;
}

// Color theme configuration
export const COLOR_THEMES: Record<NodeColor, {
  gradient: string;
  border: string;
  glow: string;
  badge: string;
  badgeText: string;
}> = {
  violet: {
    gradient: 'from-violet-500/20 to-purple-600/20',
    border: 'border-violet-500/40',
    glow: 'shadow-[0_0_30px_rgba(139,92,246,0.3)]',
    badge: 'bg-violet-500/20',
    badgeText: 'text-violet-300',
  },
  cyan: {
    gradient: 'from-cyan-500/20 to-blue-600/20',
    border: 'border-cyan-500/40',
    glow: 'shadow-[0_0_30px_rgba(6,182,212,0.3)]',
    badge: 'bg-cyan-500/20',
    badgeText: 'text-cyan-300',
  },
  emerald: {
    gradient: 'from-emerald-500/20 to-teal-600/20',
    border: 'border-emerald-500/40',
    glow: 'shadow-[0_0_30px_rgba(16,185,129,0.3)]',
    badge: 'bg-emerald-500/20',
    badgeText: 'text-emerald-300',
  },
  amber: {
    gradient: 'from-amber-500/20 to-orange-600/20',
    border: 'border-amber-500/40',
    glow: 'shadow-[0_0_30px_rgba(245,158,11,0.3)]',
    badge: 'bg-amber-500/20',
    badgeText: 'text-amber-300',
  },
  rose: {
    gradient: 'from-rose-500/20 to-pink-600/20',
    border: 'border-rose-500/40',
    glow: 'shadow-[0_0_30px_rgba(244,63,94,0.3)]',
    badge: 'bg-rose-500/20',
    badgeText: 'text-rose-300',
  },
  sky: {
    gradient: 'from-sky-500/20 to-blue-600/20',
    border: 'border-sky-500/40',
    glow: 'shadow-[0_0_30px_rgba(14,165,233,0.3)]',
    badge: 'bg-sky-500/20',
    badgeText: 'text-sky-300',
  },
  fuchsia: {
    gradient: 'from-fuchsia-500/20 to-pink-600/20',
    border: 'border-fuchsia-500/40',
    glow: 'shadow-[0_0_30px_rgba(217,70,239,0.3)]',
    badge: 'bg-fuchsia-500/20',
    badgeText: 'text-fuchsia-300',
  },
  slate: {
    gradient: 'from-slate-500/20 to-zinc-600/20',
    border: 'border-slate-500/40',
    glow: 'shadow-[0_0_30px_rgba(100,116,139,0.3)]',
    badge: 'bg-slate-500/20',
    badgeText: 'text-slate-300',
  },
};

// Utility functions
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const createDefaultBlock = (type: BlockType): Block => {
  const base: Block = {
    id: generateId(),
    type,
    content: '',
  };
  
  switch (type) {
    case 'checklist':
      base.items = [{ id: generateId(), text: '', completed: false }];
      break;
    case 'table':
      base.columns = [
        { id: generateId(), width: 150 },
        { id: generateId(), width: 150 },
      ];
      base.rows = [
        { id: generateId(), cells: ['', ''] },
        { id: generateId(), cells: ['', ''] },
      ];
      break;
    case 'code':
      base.language = 'javascript';
      break;
    case 'callout':
      base.emoji = '💡';
      break;
  }
  
  return base;
};
