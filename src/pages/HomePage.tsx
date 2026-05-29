import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, MoreHorizontal, Download, Upload, Command } from 'lucide-react';
import { useStore } from '../store';
import { Modal } from '../components/ui/Modal';
import { EmojiPicker } from '../components/ui/EmojiPicker';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { workspaces, createWorkspace, deleteWorkspace, exportData, importData } = useStore();
  
  const [showNewWorkspace, setShowNewWorkspace] = useState(searchParams.get('new') === 'true');
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🧠');
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setShowNewWorkspace(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleCreateWorkspace = () => {
    if (newName.trim()) {
      const id = createWorkspace(newName.trim(), newEmoji);
      setShowNewWorkspace(false);
      setNewName('');
      setNewEmoji('🧠');
      navigate(`/workspace/${id}`);
    }
  };

  const handleDeleteWorkspace = (id: string) => {
    deleteWorkspace(id);
    setMenuOpen(null);
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `polymath-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        const success = importData(text);
        if (success) {
          window.location.reload();
        }
      }
    };
    input.click();
  };

  const getStats = (workspace: typeof workspaces[0]) => {
    const nodes = workspace.nodes.length;
    const connections = workspace.connections.length;
    const tags = new Set(workspace.nodes.flatMap(n => n.tags)).size;
    return { nodes, connections, tags };
  };

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-white mb-2"
            >
              Polymath
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-white/50"
            >
              Your personal knowledge management system
            </motion.p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="glass px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-colors"
            >
              <Download className="w-4 h-4 text-white/70" />
              <span className="text-sm">Export</span>
            </button>
            <button
              onClick={handleImport}
              className="glass px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-colors"
            >
              <Upload className="w-4 h-4 text-white/70" />
              <span className="text-sm">Import</span>
            </button>
          </div>
        </div>

        {/* Workspaces Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {workspaces.map((workspace, index) => {
              const stats = getStats(workspace);
              return (
                <motion.div
                  key={workspace.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative glass rounded-2xl p-6 hover:bg-white/10 transition-all cursor-pointer hover:scale-[1.02]"
                  onClick={() => navigate(`/workspace/${workspace.id}`)}
                >
                  {/* Workspace card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{workspace.emoji}</span>
                      <div>
                        <h3 className="text-xl font-semibold text-white group-hover:text-violet-300 transition-colors">
                          {workspace.name}
                        </h3>
                        <p className="text-sm text-white/40">
                          Updated {new Date(workspace.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(menuOpen === workspace.id ? null : workspace.id);
                        }}
                        className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-all"
                      >
                        <MoreHorizontal className="w-4 h-4 text-white/50" />
                      </button>

                      {menuOpen === workspace.id && (
                        <div className="absolute right-0 top-full mt-1 z-10 w-40 glass rounded-lg shadow-xl overflow-hidden">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteWorkspace(workspace.id);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-white/50">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-violet-500" />
                      {stats.nodes} nodes
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-cyan-500" />
                      {stats.connections} links
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      {stats.tags} tags
                    </span>
                  </div>

                  {/* Decorative gradient */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* New Workspace Card */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: workspaces.length * 0.1 }}
            onClick={() => setShowNewWorkspace(true)}
            className="glass rounded-2xl p-6 hover:bg-white/10 transition-all group border-dashed border-2 border-white/10 hover:border-violet-500/50"
          >
            <div className="flex flex-col items-center justify-center h-full min-h-[160px]">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-violet-400" />
              </div>
              <span className="text-white/70 font-medium">New Workspace</span>
            </div>
          </motion.button>
        </div>

        {/* Empty state */}
        {workspaces.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🧠</div>
            <h2 className="text-2xl font-semibold text-white mb-2">Welcome to Polymath</h2>
            <p className="text-white/50 mb-6">Create your first workspace to start building your knowledge graph</p>
            <button
              onClick={() => setShowNewWorkspace(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Workspace
            </button>
          </motion.div>
        )}

        {/* Keyboard shortcut hint */}
        <div className="fixed bottom-6 right-6 glass px-3 py-2 rounded-lg flex items-center gap-2 text-sm text-white/40">
          <Command className="w-4 h-4" />
          <span>K</span>
        </div>
      </div>

      {/* New Workspace Modal */}
      <Modal
        isOpen={showNewWorkspace}
        onClose={() => setShowNewWorkspace(false)}
        title="Create Workspace"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-white/70 mb-2">Workspace Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateWorkspace()}
              placeholder="My Knowledge Base"
              className="input-glass w-full"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm text-white/70 mb-2">Choose an Icon</label>
            <div className="flex items-center gap-3">
              <EmojiPicker
                value={newEmoji}
                onChange={setNewEmoji}
              />
              <span className="text-white/50 text-sm">Click to change</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setShowNewWorkspace(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateWorkspace}
              disabled={!newName.trim()}
              className="btn btn-primary disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
