import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  PolymathState, 
  Workspace, 
  Node, 
  Block, 
  Connection,
  BlockType,
  Position 
} from '../types';
import { generateId, createDefaultBlock } from '../types';

const STORAGE_KEY = 'polymath-notes';

export const useStore = create<PolymathState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      activeWorkspaceId: null,

      // Workspace actions
      createWorkspace: (name: string, emoji: string): string => {
        const id = generateId();
        const now = new Date().toISOString();
        const workspace: Workspace = {
          id,
          name,
          emoji,
          nodes: [],
          connections: [],
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          workspaces: [...state.workspaces, workspace],
          activeWorkspaceId: id,
        }));
        return id;
      },

      updateWorkspace: (id: string, updates: Partial<Workspace>) => {
        set((state) => ({
          workspaces: state.workspaces.map((ws) =>
            ws.id === id
              ? { ...ws, ...updates, updatedAt: new Date().toISOString() }
              : ws
          ),
        }));
      },

      deleteWorkspace: (id: string) => {
        set((state) => ({
          workspaces: state.workspaces.filter((ws) => ws.id !== id),
          activeWorkspaceId: state.activeWorkspaceId === id ? null : state.activeWorkspaceId,
        }));
      },

      setActiveWorkspace: (id: string | null) => {
        set({ activeWorkspaceId: id });
      },

      // Node actions
      createNode: (workspaceId: string, title: string, position: Position): string => {
        const nodeId = generateId();
        const now = new Date().toISOString();
        const defaultBlock = createDefaultBlock('paragraph');
        
        const node: Node = {
          id: nodeId,
          title,
          emoji: '📝',
          color: 'violet',
          blocks: [defaultBlock],
          tags: [],
          position,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          workspaces: state.workspaces.map((ws) =>
            ws.id === workspaceId
              ? {
                  ...ws,
                  nodes: [...ws.nodes, node],
                  updatedAt: now,
                }
              : ws
          ),
        }));

        return nodeId;
      },

      updateNode: (workspaceId: string, nodeId: string, updates: Partial<Node>) => {
        const now = new Date().toISOString();
        set((state) => ({
          workspaces: state.workspaces.map((ws) =>
            ws.id === workspaceId
              ? {
                  ...ws,
                  nodes: ws.nodes.map((node) =>
                    node.id === nodeId
                      ? { ...node, ...updates, updatedAt: now }
                      : node
                  ),
                  updatedAt: now,
                }
              : ws
          ),
        }));
      },

      deleteNode: (workspaceId: string, nodeId: string) => {
        const now = new Date().toISOString();
        set((state) => ({
          workspaces: state.workspaces.map((ws) =>
            ws.id === workspaceId
              ? {
                  ...ws,
                  nodes: ws.nodes.filter((node) => node.id !== nodeId),
                  connections: ws.connections.filter(
                    (conn) => conn.fromNodeId !== nodeId && conn.toNodeId !== nodeId
                  ),
                  updatedAt: now,
                }
              : ws
          ),
        }));
      },

      moveNode: (workspaceId: string, nodeId: string, position: Position) => {
        const now = new Date().toISOString();
        set((state) => ({
          workspaces: state.workspaces.map((ws) =>
            ws.id === workspaceId
              ? {
                  ...ws,
                  nodes: ws.nodes.map((node) =>
                    node.id === nodeId ? { ...node, position, updatedAt: now } : node
                  ),
                  updatedAt: now,
                }
              : ws
          ),
        }));
      },

      // Block actions
      addBlock: (workspaceId: string, nodeId: string, type: BlockType, afterBlockId?: string): string => {
        const block = createDefaultBlock(type);
        const now = new Date().toISOString();

        set((state) => ({
          workspaces: state.workspaces.map((ws) =>
            ws.id === workspaceId
              ? {
                  ...ws,
                  nodes: ws.nodes.map((node) => {
                    if (node.id !== nodeId) return node;
                    
                    const blocks = [...node.blocks];
                    if (afterBlockId) {
                      const index = blocks.findIndex((b) => b.id === afterBlockId);
                      blocks.splice(index + 1, 0, block);
                    } else {
                      blocks.push(block);
                    }
                    
                    return { ...node, blocks, updatedAt: now };
                  }),
                  updatedAt: now,
                }
              : ws
          ),
        }));

        return block.id;
      },

      updateBlock: (workspaceId: string, nodeId: string, blockId: string, updates: Partial<Block>) => {
        const now = new Date().toISOString();
        set((state) => ({
          workspaces: state.workspaces.map((ws) =>
            ws.id === workspaceId
              ? {
                  ...ws,
                  nodes: ws.nodes.map((node) =>
                    node.id === nodeId
                      ? {
                          ...node,
                          blocks: node.blocks.map((block) =>
                            block.id === blockId ? { ...block, ...updates } : block
                          ),
                          updatedAt: now,
                        }
                      : node
                  ),
                  updatedAt: now,
                }
              : ws
          ),
        }));
      },

      deleteBlock: (workspaceId: string, nodeId: string, blockId: string) => {
        const now = new Date().toISOString();
        set((state) => ({
          workspaces: state.workspaces.map((ws) =>
            ws.id === workspaceId
              ? {
                  ...ws,
                  nodes: ws.nodes.map((node) =>
                    node.id === nodeId
                      ? {
                          ...node,
                          blocks: node.blocks.filter((block) => block.id !== blockId),
                          updatedAt: now,
                        }
                      : node
                  ),
                  updatedAt: now,
                }
              : ws
          ),
        }));
      },

      reorderBlocks: (workspaceId: string, nodeId: string, fromIndex: number, toIndex: number) => {
        const now = new Date().toISOString();
        set((state) => ({
          workspaces: state.workspaces.map((ws) =>
            ws.id === workspaceId
              ? {
                  ...ws,
                  nodes: ws.nodes.map((node) => {
                    if (node.id !== nodeId) return node;
                    const blocks = [...node.blocks];
                    const [removed] = blocks.splice(fromIndex, 1);
                    blocks.splice(toIndex, 0, removed);
                    return { ...node, blocks, updatedAt: now };
                  }),
                  updatedAt: now,
                }
              : ws
          ),
        }));
      },

      // Connection actions
      createConnection: (workspaceId: string, fromNodeId: string, toNodeId: string): string | null => {
        // Check if connection already exists (in either direction)
        const workspace = get().workspaces.find((ws) => ws.id === workspaceId);
        if (!workspace) return null;

        const existingConnection = workspace.connections.find(
          (conn) =>
            (conn.fromNodeId === fromNodeId && conn.toNodeId === toNodeId) ||
            (conn.fromNodeId === toNodeId && conn.toNodeId === fromNodeId)
        );

        if (existingConnection || fromNodeId === toNodeId) {
          return null; // Connection already exists or self-connection
        }

        const connectionId = generateId();
        const now = new Date().toISOString();
        const connection: Connection = {
          id: connectionId,
          fromNodeId,
          toNodeId,
          createdAt: now,
        };

        set((state) => ({
          workspaces: state.workspaces.map((ws) =>
            ws.id === workspaceId
              ? {
                  ...ws,
                  connections: [...ws.connections, connection],
                  updatedAt: now,
                }
              : ws
          ),
        }));

        return connectionId;
      },

      deleteConnection: (workspaceId: string, connectionId: string) => {
        const now = new Date().toISOString();
        set((state) => ({
          workspaces: state.workspaces.map((ws) =>
            ws.id === workspaceId
              ? {
                  ...ws,
                  connections: ws.connections.filter((conn) => conn.id !== connectionId),
                  updatedAt: now,
                }
              : ws
          ),
        }));
      },

      // Tag actions
      addTag: (workspaceId: string, nodeId: string, tag: string) => {
        const now = new Date().toISOString();
        set((state) => ({
          workspaces: state.workspaces.map((ws) =>
            ws.id === workspaceId
              ? {
                  ...ws,
                  nodes: ws.nodes.map((node) =>
                    node.id === nodeId && !node.tags.includes(tag)
                      ? { ...node, tags: [...node.tags, tag], updatedAt: now }
                      : node
                  ),
                  updatedAt: now,
                }
              : ws
          ),
        }));
      },

      removeTag: (workspaceId: string, nodeId: string, tag: string) => {
        const now = new Date().toISOString();
        set((state) => ({
          workspaces: state.workspaces.map((ws) =>
            ws.id === workspaceId
              ? {
                  ...ws,
                  nodes: ws.nodes.map((node) =>
                    node.id === nodeId
                      ? { ...node, tags: node.tags.filter((t) => t !== tag), updatedAt: now }
                      : node
                  ),
                  updatedAt: now,
                }
              : ws
          ),
        }));
      },

      // Export/Import
      exportData: (): string => {
        const state = get();
        return JSON.stringify({
          version: '1.0',
          exportedAt: new Date().toISOString(),
          workspaces: state.workspaces,
        }, null, 2);
      },

      importData: (data: string): boolean => {
        try {
          const parsed = JSON.parse(data);
          if (!parsed.workspaces || !Array.isArray(parsed.workspaces)) {
            return false;
          }
          
          set({
            workspaces: parsed.workspaces,
            activeWorkspaceId: parsed.workspaces[0]?.id || null,
          });
          return true;
        } catch {
          return false;
        }
      },

      // Helpers
      getActiveWorkspace: (): Workspace | null => {
        const state = get();
        return state.workspaces.find((ws) => ws.id === state.activeWorkspaceId) || null;
      },

      getNode: (workspaceId: string, nodeId: string): Node | null => {
        const workspace = get().workspaces.find((ws) => ws.id === workspaceId);
        return workspace?.nodes.find((node) => node.id === nodeId) || null;
      },
    }),
    {
      name: STORAGE_KEY,
    }
  )
);
