import React, { useState } from 'react';
import { GitBranch, Globe, CheckCircle2, RefreshCw, Key, ShieldCheck, ExternalLink, Zap } from 'lucide-react';

const GithubIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export default function IntegrationsView({ connectedIntegrations, onToggleIntegration }) {
  const [githubRepo, setGithubRepo] = useState('NazarulxFitri/muslim-companion');
  const [vercelDomain, setVercelDomain] = useState('julee-ai-companion.vercel.app');
  const [autoDeploy, setAutoDeploy] = useState(true);

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '24px 20px',
      width: '100%'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <GitBranch size={24} color="var(--primary-purple)" />
          GitHub & Vercel Integration Hub
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Configure repository credentials, auto-push options, and Vercel deployment targets for Julee.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '20px' }}>
        {/* GitHub Integration Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid var(--border-glass)',
                display: 'flex',
                alignItems: 'center',
                justify: 'center'
              }}>
                <GithubIcon size={24} color="#fff" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>GitHub Integration</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Automated Git Commit & Push</span>
              </div>
            </div>

            <button
              onClick={() => onToggleIntegration('github')}
              className="btn-secondary"
              style={{
                borderColor: connectedIntegrations.github ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-glass)',
                color: connectedIntegrations.github ? 'var(--primary-emerald)' : 'var(--text-muted)',
                padding: '6px 14px'
              }}
            >
              {connectedIntegrations.github ? '● Connected' : 'Connect'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Target Repository Path
              </label>
              <input
                type="text"
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(7, 9, 14, 0.8)',
                  border: '1px solid var(--border-glass)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-main)' }}>
                Target Branch
              </div>
              <span className="glass-pill" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>main</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-main)' }}>
                Personal Access Token Status
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--primary-emerald)' }}>
                <ShieldCheck size={14} />
                <span>Verified</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vercel Integration Card */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justify: 'center'
              }}>
                <Globe size={24} color="var(--primary-cyan)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff' }}>Vercel Deployment</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Automated Preview & Production Builds</span>
              </div>
            </div>

            <button
              onClick={() => onToggleIntegration('vercel')}
              className="btn-secondary"
              style={{
                borderColor: connectedIntegrations.vercel ? 'rgba(6, 182, 212, 0.4)' : 'var(--border-glass)',
                color: connectedIntegrations.vercel ? 'var(--primary-cyan)' : 'var(--text-muted)',
                padding: '6px 14px'
              }}
            >
              {connectedIntegrations.vercel ? '● Connected' : 'Connect'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Production Domain URL
              </label>
              <input
                type="text"
                value={vercelDomain}
                onChange={(e) => setVercelDomain(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(7, 9, 14, 0.8)',
                  border: '1px solid var(--border-glass)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  fontSize: '0.875rem',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
              <div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-main)' }}>Auto-Deploy on Git Push</div>
                <div style={{ fontSize: '0.725rem', color: 'var(--text-dim)' }}>Deploy automatically when Julee pushes code</div>
              </div>
              <input
                type="checkbox"
                checked={autoDeploy}
                onChange={(e) => setAutoDeploy(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary-cyan)', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '0.825rem', color: 'var(--text-main)' }}>
                Vercel API Token Status
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--primary-cyan)' }}>
                <ShieldCheck size={14} />
                <span>Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
