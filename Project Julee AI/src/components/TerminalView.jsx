import React, { useState } from 'react';
import { Terminal as TerminalIcon, Trash2, Copy, Check, RefreshCw } from 'lucide-react';

export default function TerminalView({ logs, onClearLogs, onRunDiagnostic }) {
  const [filter, setFilter] = useState('ALL');
  const [copied, setCopied] = useState(false);

  const filteredLogs = logs.filter(log => {
    if (filter === 'ALL') return true;
    return log.category === filter;
  });

  const handleCopy = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.category}] ${l.message}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '24px 20px',
      width: '100%'
    }}>
      <div style={{
        display: 'flex',
        justify: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TerminalIcon size={24} color="var(--primary-cyan)" style={{ display: 'block' }} />
            </div>
            Real-Time Terminal Output Stream
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Live console output from Julee's Git commits, Vercel deploys, and Cloud agent executions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onRunDiagnostic} className="btn-secondary" style={{ padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RefreshCw size={14} style={{ display: 'block' }} />
            </div>
            <span>Run Diagnostic</span>
          </button>
          <button onClick={handleCopy} className="btn-secondary" style={{ padding: '8px 14px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {copied ? <Check size={14} color="var(--primary-emerald)" style={{ display: 'block' }} /> : <Copy size={14} style={{ display: 'block' }} />}
            </div>
            <span>{copied ? 'Copied' : 'Copy Logs'}</span>
          </button>
          <button onClick={onClearLogs} className="btn-secondary" style={{ padding: '8px 14px', color: 'var(--accent-pink)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Trash2 size={14} style={{ display: 'block' }} />
            </div>
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        {['ALL', 'GIT', 'VERCEL', 'AGENT', 'SYSTEM'].map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className="glass-pill"
            style={{
              cursor: 'pointer',
              background: filter === cat ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.05)',
              borderColor: filter === cat ? 'rgba(6, 182, 212, 0.4)' : 'var(--border-glass)',
              color: filter === cat ? '#fff' : 'var(--text-muted)',
              fontWeight: filter === cat ? 600 : 400
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Console Window */}
      <div style={{
        background: '#04060a',
        border: '1px solid var(--border-glow)',
        borderRadius: 'var(--radius-md)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
        overflow: 'hidden',
        minHeight: '480px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Terminal Window Bar */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          borderBottom: '1px solid var(--border-glass)',
          padding: '10px 16px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }} />
            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginLeft: '10px' }}>
              julee-cloud-runner@vps-us-east:~
            </span>
          </div>

          <div style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--primary-cyan)' }}>
            ● LIVE STREAMING
          </div>
        </div>

        {/* Console Log Content */}
        <div style={{
          padding: '16px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          color: '#e2e8f0',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {filteredLogs.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', fontStyle: 'italic', padding: '20px' }}>
              No terminal logs found for filter: {filter}
            </div>
          ) : (
            filteredLogs.map((log, index) => {
              let categoryColor = 'var(--primary-cyan)';
              if (log.category === 'GIT') categoryColor = 'var(--primary-purple)';
              if (log.category === 'VERCEL') categoryColor = 'var(--primary-emerald)';
              if (log.category === 'SYSTEM') categoryColor = 'var(--accent-amber)';

              return (
                <div key={index} style={{ display: 'flex', gap: '12px', lineHeight: '1.5' }}>
                  <span style={{ color: 'var(--text-dim)' }}>[{log.timestamp}]</span>
                  <span style={{ color: categoryColor, fontWeight: 600, minWidth: '70px' }}>
                    [{log.category}]
                  </span>
                  <span style={{ color: log.isError ? '#f87171' : '#f8fafc' }}>
                    {log.message}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
