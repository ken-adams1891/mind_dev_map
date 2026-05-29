import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ZoomIn, ZoomOut, Maximize2, Link2, X } from 'lucide-react';
import { useStore } from '../../store';
import { NodeCard } from './NodeCard';
import type { Node, Connection } from '../../types';

interface CanvasProps {
  workspaceId: string;
}

export const Canvas: React.FC<CanvasProps> = ({ workspaceId }) => {
  const { 
    workspaces, 
    createNode, 
    deleteNode, 
    createConnection, 
    deleteConnection 
  } = useStore();
  
  const workspace = workspaces.find(w => w.id === workspaceId);
  const nodes = workspace?.nodes || [];
  const connections = workspace?.connections || [];

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [showConnectModal, setShowConnectModal] = useState(false);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  // Pan handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains('canvas-bg')) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      setSelectedNodeId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Zoom handling
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(scale * delta, 0.25), 2);
    setScale(newScale);
  };

  // Add node
  const handleAddNode = () => {
    const centerX = (window.innerWidth / 2 - offset.x) / scale;
    const centerY = (window.innerHeight / 2 - offset.y) / scale;
    createNode(workspaceId, 'New Node', { x: centerX - 128, y: centerY - 75 });
  };

  // Delete node
  const handleDeleteNode = (nodeId: string) => {
    deleteNode(workspaceId, nodeId);
    setSelectedNodeId(null);
  };

  // Start connection
  const handleStartConnect = (nodeId: string) => {
    setConnectingFrom(nodeId);
    setShowConnectModal(true);
  };

  // End connection
  const handleEndConnect = (nodeId: string) => {
    if (connectingFrom && connectingFrom !== nodeId) {
      createConnection(workspaceId, connectingFrom, nodeId);
    }
    setConnectingFrom(null);
    setShowConnectModal(false);
  };

  // Fit to view
  const handleFitView = () => {
    if (nodes.length === 0) {
      setScale(1);
      setOffset({ x: 0, y: 0 });
      return;
    }

    const minX = Math.min(...nodes.map(n => n.position.x));
    const maxX = Math.max(...nodes.map(n => n.position.x + 256));
    const minY = Math.min(...nodes.map(n => n.position.y));
    const maxY = Math.max(...nodes.map(n => n.position.y + 150));

    const contentWidth = maxX - minX + 100;
    const contentHeight = maxY - minY + 100;
    
    const scaleX = window.innerWidth / contentWidth;
    const scaleY = window.innerHeight / contentHeight;
    const newScale = Math.min(scaleX, scaleY, 1);

    setScale(newScale);
    setOffset({
      x: (window.innerWidth - contentWidth * newScale) / 2 - minX * newScale + 50,
      y: (window.innerHeight - contentHeight * newScale) / 2 - minY * newScale + 50,
    });
  };

  // Get node center position
  const getNodeCenter = (node: Node) => ({
    x: node.position.x + 128, // Half of node width
    y: node.position.y + 75,   // Half of node height (approximate)
  });

  // Render connection lines
  const renderConnections = () => {
    return connections.map((conn) => {
      const fromNode = nodes.find(n => n.id === conn.fromNodeId);
      const toNode = nodes.find(n => n.id === conn.toNodeId);
      
      if (!fromNode || !toNode) return null;

      const from = getNodeCenter(fromNode);
      const to = getNodeCenter(toNode);

      // Create a curved path
      const midX = (from.x + to.x) / 2;
      const midY = (from.y + to.y) / 2;
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const offsetAmount = Math.min(Math.abs(dx), Math.abs(dy)) * 0.3;
      
      const path = `M ${from.x} ${from.y} Q ${midX + offsetAmount} ${midY - offsetAmount} ${to.x} ${to.y}`;

      return (
        <g key={conn.id} className="cursor-pointer" onClick={() => deleteConnection(workspaceId, conn.id)}>
          <path
            d={path}
            fill="none"
            stroke="rgba(139, 92, 246, 0.5)"
            strokeWidth="2"
            className="hover:stroke-rose-400 transition-colors"
          />
          <circle
            cx={midX + offsetAmount * 0.5}
            cy={midY - offsetAmount * 0.5}
            r="4"
            fill="rgba(139, 92, 246, 0.8)"
            className="hover:fill-rose-400 transition-colors"
          />
        </g>
      );
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setConnectingFrom(null);
        setSelectedNodeId(null);
      }
      if (e.key === 'Delete' && selectedNodeId) {
        handleDeleteNode(selectedNodeId);
      }
      if (e.key === '+' || e.key === '=') {
        setScale(s => Math.min(s * 1.2, 2));
      }
      if (e.key === '-') {
        setScale(s => Math.max(s * 0.8, 0.25));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, workspaceId]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-background">
      {/* Background pattern */}
      <div 
        className="canvas-bg absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)
          `,
          backgroundSize: `${32 * scale}px ${32 * scale}px`,
          backgroundPosition: `${offset.x}px ${offset.y}px`,
        }}
      />

      {/* Canvas content */}
      <div
        ref={canvasRef}
        data-canvas
        className={`absolute inset-0 ${isPanning ? 'cursor-grabbing' : 'cursor-grab'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <motion.div
          className="absolute"
          style={{
            x: offset.x,
            y: offset.y,
            scale,
          }}
        >
          {/* SVG for connections */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{
              width: '10000px',
              height: '10000px',
              left: '-5000px',
              top: '-5000px',
              overflow: 'visible',
            }}
          >
            {renderConnections()}
          </svg>

          {/* Nodes */}
          <AnimatePresence>
            {nodes.map((node) => (
              <NodeCard
                key={node.id}
                node={node}
                workspaceId={workspaceId}
                isSelected={selectedNodeId === node.id}
                isConnecting={connectingFrom === node.id}
                onSelect={() => setSelectedNodeId(node.id)}
                onStartConnect={() => handleStartConnect(node.id)}
                onEndConnect={() => handleEndConnect(node.id)}
                onDelete={() => handleDeleteNode(node.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 right-6 flex items-center gap-2">
        <div className="glass rounded-xl p-1 flex items-center gap-1">
          <button
            onClick={() => setScale(s => Math.max(s * 0.8, 0.25))}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4 text-white/70" />
          </button>
          <span className="px-2 text-xs text-white/50 min-w-[3rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale(s => Math.min(s * 1.2, 2))}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4 text-white/70" />
          </button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button
            onClick={handleFitView}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Fit to view"
          >
            <Maximize2 className="w-4 h-4 text-white/70" />
          </button>
        </div>
      </div>

      {/* Add node button */}
      <div className="absolute bottom-6 left-6">
        <button
          onClick={handleAddNode}
          className="glass px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-colors group"
        >
          <Plus className="w-4 h-4 text-violet-400 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-medium">Add Node</span>
        </button>
      </div>

      {/* Help hint */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-white/30">
            <p className="text-lg mb-2">Start building your knowledge graph</p>
            <p className="text-sm">Click "Add Node" to create your first node</p>
          </div>
        </div>
      )}

      {/* Connecting mode indicator */}
      <AnimatePresence>
        {connectingFrom && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 glass px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <Link2 className="w-4 h-4 text-cyan-400" />
            <span className="text-sm">Click another node to connect, or press ESC to cancel</span>
            <button
              onClick={() => setConnectingFrom(null)}
              className="p-1 hover:bg-white/10 rounded"
            >
              <X className="w-4 h-4 text-white/50" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
