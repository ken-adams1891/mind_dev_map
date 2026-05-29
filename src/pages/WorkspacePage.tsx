import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Command, Share2 } from 'lucide-react';
import { useStore } from '../store';
import { Canvas } from '../components/canvas';

export const WorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { workspaces, setActiveWorkspace } = useStore();
  const workspace = workspaces.find(w => w.id === id);

  useEffect(() => {
    if (id) {
      setActiveWorkspace(id);
    }
  }, [id, setActiveWorkspace]);

  if (!workspace) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Workspace not found</h1>
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

  return (
    <div className="h-screen w-screen overflow-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 z-20 px-6 py-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="glass p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white/70" />
            </button>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{workspace.emoji}</span>
              <div>
                <h1 className="text-lg font-semibold text-white">{workspace.name}</h1>
                <p className="text-xs text-white/40">
                  {workspace.nodes.length} nodes • {workspace.connections.length} connections
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="glass px-3 py-1.5 rounded-lg flex items-center gap-2 text-sm text-white/50">
              <Command className="w-4 h-4" />
              <span>K</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Canvas */}
      <Canvas workspaceId={id!} />
    </div>
  );
};
