import React, { useState } from 'react';
import { Settings as SettingsIcon, Server, Shield, Key, Save, Check, Smartphone, Bell, Cpu } from 'lucide-react';

export default function SettingsView({ cloudEndpoint, setCloudEndpoint }) {
  const [githubToken, setGithubToken] = useState('ghp_************************************');
  const [vercelToken, setVercelToken] = useState('vcel_***********************************');
  const [llmModel, setLlmModel] = useState('Gemini 3.6 Flash (Medium)');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '24px 20px',
      width: '100%'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SettingsIcon size={24} color="var(--primary-cyan)" />
          Julee Agent & Cloud Runner Settings
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
          Configure background server API credentials, cloud execution node, and LLM model providers.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Cloud Server Node Section */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Server size={18} color="var(--primary-purple)" />
            24/7 Cloud Worker Endpoint
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Cloud Runner API Base URL (Runs when laptop is OFF)
              </label>
              <input
                type="text"
                value={cloudEndpoint}
                onChange={(e) => setCloudEndpoint(e.target.value)}
                placeholder="https://julee-runner.up.railway.app"
                style={{
                  width: '100%',
                  background: 'rgba(7, 9, 14, 0.8)',
                  border: '1px solid var(--border-glass)',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: '1.4' }}>
              This is the 24/7 background server hosted on Railway / Hetzner / DigitalOcean where Julee listens for commands and performs task automation.
            </p>
          </div>
        </div>

        {/* API Credentials Section */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Key size={18} color="var(--primary-cyan)" />
            API Access Credentials
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                GitHub Personal Access Token (PAT)
              </label>
              <input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(7, 9, 14, 0.8)',
                  border: '1px solid var(--border-glass)',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Vercel API Access Token
              </label>
              <input
                type="password"
                value={vercelToken}
                onChange={(e) => setVercelToken(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(7, 9, 14, 0.8)',
                  border: '1px solid var(--border-glass)',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* LLM Engine Choice */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <Cpu size={18} color="var(--primary-emerald)" />
            Agent Brain & Model Configuration
          </h3>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
              Primary Intelligence Engine
            </label>
            <select
              value={llmModel}
              onChange={(e) => setLlmModel(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(7, 9, 14, 0.9)',
                border: '1px solid var(--border-glass)',
                padding: '12px 14px',
                borderRadius: 'var(--radius-sm)',
                color: '#fff',
                fontSize: '0.9rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="Gemini 3.6 Flash (Medium)">Gemini 3.6 Flash (Medium) — Recommended</option>
              <option value="Gemini 2.5 Pro (Google DeepMind)">Gemini 2.5 Pro (Deep Reasoning)</option>
              <option value="Claude 3.5 Sonnet (Anthropic)">Claude 3.5 Sonnet</option>
              <option value="GPT-4o (OpenAI)">GPT-4o</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn-primary" style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
            {saved ? <Check size={18} /> : <Save size={18} />}
            <span>{saved ? 'Settings Saved!' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
