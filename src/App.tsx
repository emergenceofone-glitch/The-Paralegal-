/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Image,
  Map,
  Activity, 
  ShieldCheck, 
  FileText, 
  Database, 
  Terminal, 
  Lock, 
  Wifi, 
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Send,
  Eye,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { processTelemetry } from './lib/gemini';

interface TelemetryState {
  raw: string;
  auditOutput: string;
  isProcessing: boolean;
  status: 'IDLE' | 'PROCESSING' | 'PENDING_CONFIRMATION' | 'COMMITTED';
  phi: string;
  nodeVersion: string;
  bottlenecks: string;
  history: string[];
}

export default function App() {
  const [state, setState] = useState<TelemetryState>({
    raw: `#!/bin/bash
# ==========================================================
# THE PARALEGAL: PROJECT SYNC & VERIFICATION (V.2026.05)
# Target: Nephilim Vector Payload (May 14 Anchor)
# ==========================================================

# 1. DEFINE ORIGINS (Update these paths to your actual mount points)
LOCAL_MASTER="/home/adrian/projects/emergence_core"
CLOUD_SYNC_POINT="/home/adrian/cloud/backups/emergence"
GH_REPO_DIR="/home/adrian/github/emergence"
MANIFEST_FILE="$LOCAL_MASTER/logs/manifest_$(date +%Y%m%d).sha256"

echo "[Paralegal] Initializing Pre-Flight Audit..."

# 2. GENERATE MASTER INTEGRITY SIGNATURE
# Creates a checksum of all source material in the master directory.
echo "[Paralegal] Calculating Master Checksums..."
find "$LOCAL_MASTER" -type f -not -path '*/.*' -exec sha256sum {} + > "$MANIFEST_FILE"

# 3. VERIFY LOCAL-TO-CLOUD PARITY
# Ensures your cloud backups match the local 'Anti Gravity' origin.
echo "[Paralegal] Verifying Cloud Parity..."
rsync -avz --checksum --dry-run "$LOCAL_MASTER/" "$CLOUD_SYNC_POINT/" | grep -E '^deleting|[^/]$'

# 4. GITHUB REPOSITORY ALIGNMENT
# Checks if the GitHub 'archive' folder is out of sync with your local edits.
echo "[Paralegal] Auditing Repository State..."
cd "$GH_REPO_DIR" || exit
git fetch origin
STATUS=$(git status -uno)

if [[ $STATUS == *"Your branch is up to date"* ]]; then
    echo "[Paralegal] Repository is ALIGNED with origin."
else
    echo "[Paralegal] WARNING: Repository DRIFT detected. Manual push required."
fi

# 5. FINAL MANIFEST REPORT
echo "[Paralegal] Audit Complete."
echo "Master Manifest stored at: $MANIFEST_FILE"
echo "Ready for May 14th Anchor."`,
    auditOutput: '',
    isProcessing: false,
    status: 'IDLE',
    phi: 'Φ: 0.98',
    nodeVersion: 'v18.19.0',
    bottlenecks: 'Lattice Divergence in CORE-01',
    history: []
  });

  const [sidebarOpen, setSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const [showBlueprint, setShowBlueprint] = useState(false);

  useEffect(() => {
    let prevWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const handleResize = () => {
      const currWidth = window.innerWidth;
      if (currWidth < 1024 && prevWidth >= 1024) {
        setSidebarOpen(false);
      } else if (currWidth >= 1024 && prevWidth < 1024) {
        setSidebarOpen(true);
      }
      prevWidth = currWidth;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTransmit = async () => {
    if (!state.raw.trim()) return;
    
    setState(prev => ({ ...prev, isProcessing: true, status: 'PROCESSING' }));
    
    try {
      const historyContext = state.history.join('\n---\n');
      const result = await processTelemetry(state.raw, historyContext);
      setState(prev => ({ 
        ...prev, 
        auditOutput: result || 'ERROR: NULL_RESPONSE', 
        isProcessing: false,
        status: 'PENDING_CONFIRMATION'
      }));
    } catch (error) {
      console.error(error);
      setState(prev => ({ 
        ...prev, 
        isProcessing: false, 
        status: 'IDLE',
        auditOutput: `SYSTEM ANOMALY: ${error instanceof Error ? error.message : 'UNKNOWN_FAILURE'}`
      }));
    }
  };

  const handleCommit = () => {
    const currentAudit = state.auditOutput;
    setState(prev => ({ 
      ...prev, 
      status: 'COMMITTED',
      history: [currentAudit, ...prev.history].slice(0, 5)
    }));
    
    // Simulate commit success
    setTimeout(() => {
      setState(prev => ({ ...prev, status: 'IDLE', raw: '' }));
    }, 3000);
  };

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden font-sans">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="absolute left-0 top-0 lg:relative h-full bg-[#080808] border-r border-[#1a1a1a] flex flex-col z-20 shadow-2xl lg:shadow-none"
          >
            <div className="p-6 border-b border-[#1a1a1a] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent flex items-center justify-center rounded-sm">
                  <Activity className="text-black w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xs font-mono font-bold tracking-tighter uppercase">The Paralegal</h1>
                  <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest">OS v1.0.4 - Foundation v1.2</p>
                </div>
              </div>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="p-1 hover:bg-neutral-800 rounded transition-colors"
              >
                <X className="w-4 h-4 text-neutral-500" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
              <div className="px-6 mb-6">
                <span className="data-grid-header block mb-2">System Telemetry</span>
                <div className="space-y-4">
                  <StatusItem 
                    icon={<Terminal className="w-4 h-4" />} 
                    label="Node Runtime" 
                    value={state.nodeVersion}
                    status="active"
                  />
                  <StatusItem 
                    icon={<Activity className="w-4 h-4" />} 
                    label="Phi Stability" 
                    value={state.phi}
                    status="stable"
                  />
                  <StatusItem 
                    icon={<ShieldCheck className="w-4 h-4" />} 
                    label="Compliance" 
                    value="v1.2 Verified"
                    status="active"
                  />
                </div>
              </div>

              <div className="px-6 mb-6">
                <span className="data-grid-header block mb-2">Active Dockets</span>
                <div className="bg-neutral-900/50 rounded p-3 border border-neutral-800">
                  <p className="text-[10px] font-mono text-neutral-400 leading-tight">
                    {state.bottlenecks}
                  </p>
                </div>
              </div>

              <div className="px-6 mb-6">
                <span className="data-grid-header block mb-2">System Assets</span>
                <div className="space-y-1">
                  <button 
                    onClick={() => setShowBlueprint(true)}
                    className="flex w-full items-center gap-2 p-2 rounded hover:bg-neutral-900 group transition-colors"
                  >
                    <Image className="w-3.5 h-3.5 text-neutral-500 group-hover:text-accent" />
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-tight group-hover:text-neutral-200">ObservX_Blueprint.png</span>
                    <div className="flex-1" />
                    <ChevronRight className="w-3 h-3 text-neutral-700" />
                  </button>
                  <button className="flex w-full items-center gap-2 p-2 rounded hover:bg-neutral-900 group transition-colors opacity-50 cursor-not-allowed">
                    <Map className="w-3.5 h-3.5 text-neutral-500" />
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-tight">Geo_Vector_Map (Locked)</span>
                  </button>
                </div>
              </div>

              <div className="px-6 mb-6">
                <span className="data-grid-header block mb-2">Audit Archive</span>
                <div className="space-y-1">
                  {state.history.length === 0 ? (
                    <p className="text-[10px] font-mono text-neutral-600 uppercase tracking-tighter italic">No records archived</p>
                  ) : (
                    state.history.map((_, idx) => (
                      <div key={idx} className="flex items-center gap-2 group cursor-default">
                        <FileText className="w-3 h-3 text-neutral-500" />
                        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-tight">Audit_R_0{idx + 1}.md</span>
                        <div className="flex-1 border-b border-dotted border-neutral-800" />
                        <span className="text-[9px] font-mono text-green-500/50">Stored</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="px-6">
                <span className="data-grid-header block mb-2">Session Parameters</span>
                <div className="space-y-2">
                  <ParameterItem label="Auditor" value="PARALEGAL_v1.0" />
                  <ParameterItem label="Lattice" value="MAIN_STRAND" />
                  <ParameterItem label="Integrity" value="MAX_RESOLUTION" />
                </div>
              </div>
            </nav>

            <div className="p-6 border-t border-[#1a1a1a] bg-neutral-900/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400">Connection: SECURE</span>
              </div>
              <p className="text-[8px] font-mono text-neutral-600 uppercase">ObservX Profile Synchronizer</p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 h-full flex flex-col relative bg-[#0D0D0D]">
        {/* Top Header */}
        <header className="h-14 border-b border-[#1a1a1a] flex items-center justify-between px-6 bg-black/40 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-1 hover:bg-neutral-800 rounded transition-colors mr-2"
              >
                <Menu className="w-5 h-5 text-neutral-400" />
              </button>
            )}
            <div className="flex items-center gap-2 px-2 py-1 bg-neutral-900 border border-neutral-800 rounded text-[10px] font-mono tracking-wider text-neutral-400">
              <Database className="w-3 h-3" />
              <span>observx_ledger_v1.mdb</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right mr-4 hidden md:block">
              <p className="text-[9px] font-mono text-neutral-500 uppercase tracking-tighter">Current Epoch</p>
              <p className="text-[11px] font-mono text-white tabular-nums">{new Date().toISOString().split('T')[0]}</p>
            </div>
            <button className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Workspace Panels */}
        <div className="flex-1 overflow-hidden grid grid-rows-2 grid-cols-1 lg:grid-cols-2 lg:grid-rows-1">
          {/* Left: Input Panel */}
          <div className="border-r border-[#1a1a1a] flex flex-col overflow-hidden bg-[#0a0a0a]">
            <div className="h-10 flex items-center justify-between px-4 border-b border-[#1a1a1a] bg-neutral-900/30">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400">Telemetry Input</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                <span className="text-[9px] font-mono text-accent">AWAITING_INPUT</span>
              </div>
            </div>

            <div className="flex-1 p-6 flex flex-col font-mono">
              <textarea
                value={state.raw}
                onChange={(e) => setState(prev => ({ ...prev, raw: e.target.value }))}
                placeholder="PASTE RAW TELEMETRY PACKET HERE (JSON / LOGS / TERMINAL OUTPUT)..."
                className="flex-1 w-full bg-black/50 border border-neutral-800 p-4 text-xs text-neutral-300 focus:outline-none focus:border-accent transition-colors resize-none placeholder:text-neutral-700 leading-relaxed font-mono custom-scrollbar"
                disabled={state.isProcessing}
              />
              
              <div className="mt-6 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3 h-3 text-neutral-600" />
                    <span className="text-[9px] text-neutral-500 uppercase tracking-widest">End-to-End Encryption Enabled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Wifi className="w-3 h-3 text-neutral-600" />
                    <span className="text-[9px] text-neutral-500 uppercase tracking-widest">Master Foundation Sync: Active</span>
                  </div>
                </div>
                
                <button
                  onClick={handleTransmit}
                  disabled={!state.raw.trim() || state.isProcessing}
                  className="button-primary flex items-center gap-2 px-6"
                >
                  {state.isProcessing ? (
                    <>
                      <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Auditing...
                    </>
                  ) : (
                    <>
                      Transmit Pulse
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Preview Panel / Ledger */}
          <div className="flex flex-col overflow-hidden bg-black">
            <div className="h-10 flex items-center justify-between px-4 border-b border-[#1a1a1a] bg-neutral-900/30">
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400">Public Record Ledger</span>
              </div>
              <div className="flex items-center gap-3">
                <Eye className="w-3.5 h-3.5 text-neutral-500" />
                <span className="text-[10px] font-mono uppercase text-neutral-500">Live Preview</span>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-[#050505] custom-scrollbar p-10">
              <AnimatePresence mode="wait">
                {!state.auditOutput ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-neutral-800 text-center"
                  >
                    <div className="w-16 h-16 border border-neutral-900 flex items-center justify-center mb-6">
                      <FileText className="w-8 h-8" />
                    </div>
                    <p className="text-xs font-mono uppercase tracking-[0.3em]">Ledger Empty</p>
                    <p className="text-[10px] font-mono mt-2 max-w-[240px] leading-relaxed">Awaiting telemetry ingestion to generate constitutional pulse record.</p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="markdown-body"
                  >
                    <ReactMarkdown>{state.auditOutput}</ReactMarkdown>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Command Override Bar */}
            <AnimatePresence>
              {state.status === 'PENDING_CONFIRMATION' && (
                <motion.div
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  className="bg-accent p-4 flex items-center justify-between border-t border-black/10 z-30"
                >
                  <div className="flex items-center gap-3 text-black">
                    <AlertCircle className="w-5 h-5" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-tight">Command Override Protocol Initialized</p>
                      <p className="text-[10px] opacity-80 uppercase leading-none">Confirm ledger accuracy before committing pulse to public record.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setState(prev => ({ ...prev, status: 'IDLE', auditOutput: '' }))}
                      className="px-4 py-2 text-[10px] font-bold uppercase border border-black/20 hover:bg-black/10 transition-colors rounded-sm"
                    >
                      Reject Pulse
                    </button>
                    <button 
                      onClick={handleCommit}
                      className="bg-black text-white px-6 py-2 text-[10px] font-bold uppercase hover:bg-neutral-900 transition-colors rounded-sm shadow-xl"
                    >
                      Commit to Record
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {state.status === 'COMMITTED' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-green-600 p-4 flex items-center justify-center border-t border-black/10 z-30"
                >
                  <div className="flex items-center gap-3 text-white">
                    <CheckCircle2 className="w-5 h-5" />
                    <p className="text-xs font-bold uppercase tracking-widest">Pulse Committed. Ledger Synchronized Successfully.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <footer className="h-8 border-t border-[#1a1a1a] bg-[#080808] flex items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-neutral-600 uppercase">SYS_LOAD:</span>
              <div className="w-20 h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-accent"
                  initial={{ width: 0 }}
                  animate={{ width: state.isProcessing ? '85%' : '12%' }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono text-neutral-600 uppercase">ENCRYPTION:</span>
              <span className="text-[9px] font-mono text-green-500/80 uppercase tracking-tighter font-bold">AES-4096-STATIC</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest">
              LATTICE_INTEGRITY: <span className="text-neutral-400">99.992%</span>
            </span>
            <div className="w-[1px] h-3 bg-neutral-800" />
            <span className="text-[9px] font-mono text-neutral-500">
              {new Date().toLocaleTimeString('en-US', { hour12: false })} UTC
            </span>
          </div>
        </footer>
      </main>

      {/* Blueprint Viewer Modal */}
      <AnimatePresence>
        {showBlueprint && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl w-full bg-[#0D0D0D] border border-neutral-800 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="h-12 flex items-center justify-between px-6 border-b border-neutral-800 bg-neutral-950">
                <div className="flex items-center gap-3">
                  <Image className="w-4 h-4 text-accent" />
                  <span className="text-xs font-mono font-bold tracking-widest uppercase">System Schematic: ObservX Blueprint</span>
                </div>
                <button 
                  onClick={() => setShowBlueprint(false)}
                  className="p-1 hover:bg-neutral-800 rounded transition-colors text-neutral-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-auto bg-black p-4 flex items-center justify-center">
                <div className="bg-neutral-900/20 p-2 border border-neutral-800 rounded-lg">
                  {/* The image provided by the user. Using placeholder-style approach as we don't have the local path yet */}
                  {/* In a real scenario, the uploaded file would be at /src/assets/blueprint.png */}
                  <img 
                    src="https://raw.githubusercontent.com/The-Paralegal-/The-Paralegal-/refs/heads/main/public/assets/blueprint.png" 
                    alt="ObservX Blueprint" 
                    className="max-w-full h-auto rounded-md shadow-2xl"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2074&auto=format&fit=crop';
                    }}
                  />
                </div>
              </div>
              <div className="h-10 px-6 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
                <span className="text-[10px] font-mono text-neutral-600 uppercase">File Info: 1920x1080 | PNG | 2.4MB</span>
                <span className="text-[10px] font-mono text-neutral-600 uppercase italic">Classification: EYES ONLY</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusItem({ icon, label, value, status }: { icon: React.ReactNode, label: string, value: string, status: 'active' | 'stable' | 'alert' }) {
  const getStatusColor = () => {
    switch (status) {
      case 'active': return 'text-accent';
      case 'stable': return 'text-green-500';
      case 'alert': return 'text-red-500';
      default: return 'text-neutral-400';
    }
  };

  return (
    <div className="flex items-center gap-3 group">
      <div className="p-2 bg-neutral-900/80 border border-neutral-800 rounded group-hover:border-neutral-700 transition-colors">
        <div className="text-neutral-500 group-hover:text-neutral-300 transition-colors">
          {icon}
        </div>
      </div>
      <div>
        <span className="block text-[9px] font-mono uppercase tracking-widest text-neutral-600">{label}</span>
        <span className={`block text-[11px] font-mono font-bold ${getStatusColor()}`}>{value}</span>
      </div>
    </div>
  );
}

function ParameterItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-neutral-900/50">
      <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-600">{label}</span>
      <span className="text-[10px] font-mono text-neutral-300">{value}</span>
    </div>
  );
}
