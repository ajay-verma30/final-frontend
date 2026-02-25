import React, { useEffect, useState } from "react";
import api from "../api/axiosInstance";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import {
  Package, Download, CheckCircle2, XCircle,
  Loader2, Clock, AlertCircle, RefreshCw,
  ChevronDown, ChevronUp, Search
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// ── Types ─────────────────────────────────────────────

interface SyncLog {
  id: number;
  sync_type: "FULL" | "INCREMENTAL" | "INVENTORY";
  status: "RUNNING" | "SUCCESS" | "FAILED";
  styles_synced: number;
  errors: { style: string; error: string }[] | null;
  started_at: string;
  finished_at: string | null;
}

interface ImportResult {
  style: string;
  status: "success" | "error" | "loading";
  message?: string;
}

// ── Helper: Time format ───────────────────────────────
function formatTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function timeTaken(start: string, end: string | null) {
  if (!end) return "—";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const secs = Math.round(ms / 1000);
  return secs < 60 ? `${secs}s` : `${Math.round(secs / 60)}m ${secs % 60}s`;
}

// ── Main Component ────────────────────────────────────
const SanmarImport: React.FC = () => {
  const { user: currentUser } = useAuth();

  const [styleInput, setStyleInput]         = useState("");
  const [importing, setImporting]           = useState(false);
  const [importResults, setImportResults]   = useState<ImportResult[]>([]);
  const [syncLogs, setSyncLogs]             = useState<SyncLog[]>([]);
  const [logsLoading, setLogsLoading]       = useState(true);
  const [inventorySyncing, setInventorySyncing] = useState(false);
  const [expandedErrors, setExpandedErrors] = useState<Set<number>>(new Set());

  // Sirf SUPER access kar sakta hai
  if (currentUser?.role !== "SUPER") {
    return (
      <div className="flex h-screen w-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Sidebar />
        <div className="flex-grow flex flex-col overflow-hidden">
          <Navbar />
          <main className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <XCircle size={48} className="mx-auto text-red-400 mb-3" />
              <h2 className="text-xl font-bold text-slate-700">Access Denied</h2>
              <p className="text-slate-500 mt-1">Only SUPER admins can access this page</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ── Fetch sync logs ──────────────────────────────
  const fetchLogs = async () => {
    try {
      setLogsLoading(true);
      const res = await api.get("/api/sanmar/status");
      setSyncLogs(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  // ── Import single style ───────────────────────────
  const handleImport = async () => {
    const styles = styleInput
      .split(/[\n,]+/)
      .map(s => s.trim().toUpperCase())
      .filter(Boolean);

    if (!styles.length) return;

    // Saare styles loading state mein daalo
    setImportResults(styles.map(s => ({ style: s, status: "loading" })));
    setImporting(true);

    for (const style of styles) {
      // Is style ko loading dikhao
      setImportResults(prev =>
        prev.map(r => r.style === style ? { ...r, status: "loading" } : r)
      );

      try {
        await api.post("/api/sanmar/sync/style", { style });

        setImportResults(prev =>
          prev.map(r =>
            r.style === style
              ? { ...r, status: "success", message: "Imported successfully" }
              : r
          )
        );
      } catch (err: any) {
        const msg = err.response?.data?.message || "Import failed";
        setImportResults(prev =>
          prev.map(r =>
            r.style === style
              ? { ...r, status: "error", message: msg }
              : r
          )
        );
      }
    }

    setImporting(false);
    setStyleInput("");
    fetchLogs(); // Logs refresh karo
  };

  // ── Manual inventory sync ─────────────────────────
  const handleInventorySync = async () => {
    setInventorySyncing(true);
    try {
      await api.post("/api/sanmar/sync/inventory");
      alert("Inventory sync started! It will run in background.");
      fetchLogs();
    } catch (err: any) {
      alert(err.response?.data?.message || "Sync failed");
    } finally {
      setInventorySyncing(false);
    }
  };

  // ── Toggle error expand ───────────────────────────
  const toggleErrors = (id: number) => {
    setExpandedErrors(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Status badge ─────────────────────────────────
  const StatusBadge = ({ status }: { status: SyncLog["status"] }) => {
    const map = {
      SUCCESS: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      FAILED:  "bg-red-50 text-red-700 border border-red-200",
      RUNNING: "bg-blue-50 text-blue-700 border border-blue-200",
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${map[status]}`}>
        {status === "RUNNING" && <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5 animate-pulse" />}
        {status}
      </span>
    );
  };

  // ── Render ────────────────────────────────────────
  return (
    <div className="flex h-screen w-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
      <Sidebar />
      <div className="flex-grow flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-grow overflow-y-auto px-6 md:px-8 py-8 font-sans">
          <div className="max-w-5xl mx-auto space-y-8">

            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl shadow-lg text-white">
                  <Package size={28} />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
                    SanMar Import
                  </h1>
                  <p className="text-slate-500 font-medium text-sm md:text-base">
                    Import products directly from SanMar catalog
                  </p>
                </div>
              </div>

              {/* Inventory Sync Button */}
              <button
                onClick={handleInventorySync}
                disabled={inventorySyncing}
                className="inline-flex items-center gap-2 bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                {inventorySyncing
                  ? <Loader2 size={18} className="animate-spin" />
                  : <RefreshCw size={18} />
                }
                {inventorySyncing ? "Syncing..." : "Sync Inventory"}
              </button>
            </div>

            {/* ── Import Form ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-5 text-white">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Download size={20} /> Import by Style Number
                </h2>
                <p className="text-indigo-100 text-sm mt-0.5">
                  Enter one or more SanMar style numbers (e.g. PC61, ST350)
                </p>
              </div>

              <div className="p-6 space-y-4">
                {/* Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">
                    Style Number(s)
                    <span className="ml-2 text-slate-400 font-normal">
                      — separate multiple with comma or new line
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    value={styleInput}
                    onChange={e => setStyleInput(e.target.value)}
                    disabled={importing}
                    placeholder={"PC61\nST350, PC54"}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all font-mono text-sm resize-none disabled:opacity-60"
                  />
                  <p className="text-xs text-slate-400">
                    Style numbers are case-insensitive — PC61, pc61, Pc61 sab work karenge
                  </p>
                </div>

                {/* Import Button */}
                <button
                  onClick={handleImport}
                  disabled={importing || !styleInput.trim()}
                  className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-3.5 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
                >
                  {importing ? (
                    <><Loader2 size={18} className="animate-spin" /> Importing...</>
                  ) : (
                    <><Download size={18} /> Import from SanMar</>
                  )}
                </button>

                {/* ── Import Results ── */}
                {importResults.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Results
                    </p>
                    {importResults.map(result => (
                      <div
                        key={result.style}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition-all
                          ${result.status === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : result.status === "error"   ? "bg-red-50 border-red-200 text-red-800"
                          :                               "bg-blue-50 border-blue-200 text-blue-800"}`}
                      >
                        {result.status === "loading"  && <Loader2 size={16} className="animate-spin flex-shrink-0" />}
                        {result.status === "success"  && <CheckCircle2 size={16} className="flex-shrink-0 text-emerald-600" />}
                        {result.status === "error"    && <XCircle size={16} className="flex-shrink-0 text-red-500" />}
                        <span className="font-mono font-bold">{result.style}</span>
                        <span className="text-xs opacity-75 ml-auto">
                          {result.status === "loading" ? "Fetching from SanMar..." : result.message}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Sync Logs ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  <Clock size={18} className="text-slate-400" />
                  Recent Sync History
                </h2>
                <button
                  onClick={fetchLogs}
                  className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Refresh logs"
                >
                  <RefreshCw size={15} className="text-slate-400" />
                </button>
              </div>

              {logsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-indigo-500" />
                </div>
              ) : syncLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Search size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No sync history yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {syncLogs.map(log => (
                    <div key={log.id} className="px-6 py-4">
                      <div className="flex items-center gap-4 flex-wrap">
                        {/* Type badge */}
                        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                          {log.sync_type}
                        </span>

                        <StatusBadge status={log.status} />

                        {/* Stats */}
                        <span className="text-sm text-slate-600">
                          <span className="font-semibold text-slate-800">{log.styles_synced}</span>
                          {" "}{log.sync_type === "INVENTORY" ? "sizes updated" : "styles synced"}
                        </span>

                        {/* Time */}
                        <span className="text-xs text-slate-400 ml-auto">
                          {formatTime(log.started_at)}
                          {" · "}
                          {timeTaken(log.started_at, log.finished_at)}
                        </span>
                      </div>

                      {/* Errors expandable */}
                      {log.errors && log.errors.length > 0 && (
                        <div className="mt-2">
                          <button
                            onClick={() => toggleErrors(log.id)}
                            className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium"
                          >
                            <AlertCircle size={13} />
                            {log.errors.length} error{log.errors.length > 1 ? "s" : ""}
                            {expandedErrors.has(log.id)
                              ? <ChevronUp size={13} />
                              : <ChevronDown size={13} />
                            }
                          </button>

                          {expandedErrors.has(log.id) && (
                            <div className="mt-2 space-y-1">
                              {log.errors.map((e, i) => (
                                <div
                                  key={i}
                                  className="flex items-start gap-2 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2"
                                >
                                  <span className="font-mono font-bold text-red-700 flex-shrink-0">
                                    {e.style}
                                  </span>
                                  <span className="text-red-600">{e.error}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {syncLogs.length > 0 && (
                <div className="bg-slate-50 px-6 py-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Showing last <span className="font-semibold">{syncLogs.length}</span> sync operations
                  </p>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SanmarImport;