import React from 'react';
import { Globe, Server, Activity, Smartphone } from 'lucide-react';

const GithubIcon = ({ size = 14, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function Header({ isMobile, toggleSidebar, connectedIntegrations }) {
  return (
    <header style={{
      height: '64px',
      borderBottom: '1px solid var(--border-glass)',
      background: 'rgba(7, 9, 14, 0.8)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justify: 'space-between',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      {/* Left side title / status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Autonomous Command Center
        </h2>
        <div className="glass-pill" style={{ fontSize: '0.75rem', color: 'var(--primary-cyan)' }}>
          <Activity size={13} color="var(--primary-cyan)" />
          <span>Cloud Runner v2.4</span>
        </div>
      </div>

      {/* Right side connection pills */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* GitHub pill */}
        <div className="glass-pill" style={{
          borderColor: connectedIntegrations.github ? 'rgba(16, 185, 129, 0.3)' : 'var(--border-glass)',
          color: connectedIntegrations.github ? 'var(--text-main)' : 'var(--text-dim)'
        }}>
          <GithubIcon size={14} color={connectedIntegrations.github ? '#fff' : 'var(--text-dim)'} />
          <span style={{ fontSize: '0.75rem' }}>GitHub</span>
          <div className={`status-dot ${connectedIntegrations.github ? 'online' : ''}`} style={{ width: '6px', height: '6px' }} />
        </div>

        {/* Vercel pill */}
        <div className="glass-pill" style={{
          borderColor: connectedIntegrations.vercel ? 'rgba(6, 182, 212, 0.3)' : 'var(--border-glass)',
          color: connectedIntegrations.vercel ? 'var(--text-main)' : 'var(--text-dim)'
        }}>
          <Globe size={14} color={connectedIntegrations.vercel ? 'var(--primary-cyan)' : 'var(--text-dim)'} />
          <span style={{ fontSize: '0.75rem' }}>Vercel</span>
          <div className={`status-dot ${connectedIntegrations.vercel ? 'online' : ''}`} style={{ width: '6px', height: '6px' }} />
        </div>

        {/* Server Status pill */}
        <div className="glass-pill" style={{ borderColor: 'rgba(139, 92, 246, 0.4)', background: 'rgba(139, 92, 246, 0.08)' }}>
          <Server size={14} color="var(--primary-purple)" />
          <span style={{ fontSize: '0.75rem', color: 'var(--primary-purple)', fontWeight: 600 }}>24/7 Cloud Ready</span>
        </div>

        {/* PWA Mobile Badge */}
        <div className="glass-pill" style={{ display: 'none', mdDisplay: 'flex' }}>
          <Smartphone size={14} color="var(--text-muted)" />
          <span style={{ fontSize: '0.75rem' }}>PWA Ready</span>
        </div>
      </div>
    </header>
  );
}
