import React from 'react';
import { motion } from 'framer-motion';
import { Search, FileText, Settings, Plus, Download, Upload, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';

interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { workspaces, exportData, importData } = useStore();

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `polymath-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
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
    onClose();
  };

  const commands: CommandItem[] = React.useMemo(() => {
    const items: CommandItem[] = [
      {
        id: 'home',
        title: 'Go to Home',
        subtitle: 'View all workspaces',
        icon: <Home className="w-4 h-4" />,
        action: () => {
          navigate('/');
          onClose();
        },
      },
      ...workspaces.flatMap((ws) => [
        {
          id: `ws-${ws.id}`,
          title: ws.name,
          subtitle: `${ws.nodes.length} nodes`,
          icon: <span className="text-lg">{ws.emoji}</span>,
          action: () => {
            navigate(`/workspace/${ws.id}`);
            onClose();
          },
        },
        ...ws.nodes.map((node) => ({
          id: `node-${node.id}`,
          title: node.title,
          subtitle: `in ${ws.name}`,
          icon: <span className="text-lg">{node.emoji}</span>,
          action: () => {
            navigate(`/workspace/${ws.id}/node/${node.id}`);
            onClose();
          },
        })),
      ]),
      {
        id: 'new-workspace',
        title: 'Create New Workspace',
        subtitle: 'Start a new knowledge base',
        icon: <Plus className="w-4 h-4" />,
        action: () => {
          navigate('/?new=true');
          onClose();
        },
      },
      {
        id: 'export',
        title: 'Export Data',
        subtitle: 'Download all your data as JSON',
        icon: <Download className="w-4 h-4" />,
        action: handleExport,
      },
      {
        id: 'import',
        title: 'Import Data',
        subtitle: 'Restore from a backup file',
        icon: <Upload className="w-4 h-4" />,
        action: handleImport,
      },
    ];

    if (!query) return items;

    const lowerQuery = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.subtitle?.toLowerCase().includes(lowerQuery)
    );
  }, [query, workspaces, navigate, onClose, exportData, importData]);

  React.useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % commands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + commands.length) % commands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      commands[selectedIndex]?.action();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="w-full max-w-xl glass rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10">
          <Search className="w-5 h-5 text-white/40" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search workspaces, nodes, or commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-white placeholder-white/40 focus:outline-none"
          />
          <kbd className="px-2 py-1 text-xs text-white/40 bg-white/5 rounded">ESC</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {commands.length === 0 ? (
            <div className="px-4 py-8 text-center text-white/40">
              No results found
            </div>
          ) : (
            commands.map((item, index) => (
              <button
                key={item.id}
                onClick={item.action}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  index === selectedIndex
                    ? 'bg-violet-500/20 text-white'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="flex-shrink-0">{item.icon}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium">{item.title}</div>
                  {item.subtitle && (
                    <div className="text-xs text-white/40">{item.subtitle}</div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2 border-t border-white/10 text-xs text-white/40 flex items-center gap-4">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white/5 rounded">↑↓</kbd> Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white/5 rounded">↵</kbd> Select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white/5 rounded">esc</kbd> Close
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};
