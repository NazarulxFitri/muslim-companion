import React from 'react';
import { MessageSquare, Cpu, Terminal, GitBranch, Settings, Zap, ShieldCheck } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, taskCount }) {
  const navItems = [
    { id: 'chat', label: 'Julee Chat', icon: MessageSquare, badge: null },
    { id: 'tasks', label: 'Active Tasks', icon: Cpu, badge: taskCount > 0 ? taskCount : null },
    { id: 'terminal', label: 'Terminal Logs', icon: Terminal, badge: 'Live' },
    { id: 'integrations', label: 'GitHub & Vercel', icon: GitBranch, badge: '2 Active' },
    { id: 'settings', label: 'Agent Settings', icon: Settings, badge: null }
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'rgba(9, 13, 22, 0.9)',
      backdropFilter: 'blur(20px)',
      borderRight: '1px solid var(--border-glass)',
      display: 'flex',
      flexDirection: 'column',
      justify: 'space-between',
      padding: '20px 16px',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 20
    }}>
      <div>
        {/* Brand Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '0 8px 24px 8px',
          borderBottom: '1px solid var(--border-glass)',
          marginBottom: '20px'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary-purple) 0%, var(--primary-cyan) 100%)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            boxShadow: 'var(--shadow-glow-purple)',
            position: 'relative'
          }}>
            <Zap size={22} color="#ffffff" />
            <div style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-emerald)',
              border: '2px solid #07090e'
            }} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em', color: '#fff' }}>
              Julee AI
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--primary-cyan)', fontWeight: 500 }}>
              Partner & Assistant v2.0
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: isActive ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid transparent',
                  background: isActive ? 'linear-gradient(90deg, rgba(139, 92, 246, 0.15) 0%, rgba(139, 92, 246, 0.03) 100%)' : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={18} color={isActive ? 'var(--primary-cyan)' : 'var(--text-muted)'} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    background: item.badge === 'Live' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(139, 92, 246, 0.2)',
                    color: item.badge === 'Live' ? 'var(--primary-emerald)' : 'var(--primary-purple)',
                    border: item.badge === 'Live' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(139, 92, 246, 0.3)',
                    fontWeight: 600
                  }}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Cloud Runner Card */}
      <div className="glass-panel" style={{ padding: '14px', borderRadius: 'var(--radius-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <ShieldCheck size={16} color="var(--primary-emerald)" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff' }}>24/7 Cloud Engine</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          Active on Cloud Server. Operates even when your laptop is powered off.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
          <div className="status-dot online" />
          <span style={{ fontSize: '0.7rem', color: 'var(--primary-emerald)', fontWeight: 500 }}>
            Connected & Syncing
          </span>
        </div>
      </div>
    </aside>
  );
}
