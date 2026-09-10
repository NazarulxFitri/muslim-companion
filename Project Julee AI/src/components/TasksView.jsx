import React from 'react';
import { Cpu, CheckCircle, Clock, GitCommit, Globe, Play } from 'lucide-react';

export default function TasksView({ tasks, onTriggerTask }) {
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
        marginBottom: '24px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={24} color="var(--primary-purple)" style={{ display: 'block' }} />
            </div>
            Autonomous Task Execution Queue
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            All tasks executed by Julee on the 24/7 Cloud Runner.
          </p>
        </div>

        <button
          onClick={() => onTriggerTask('Full System Sync & Vercel Build')}
          className="btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Play size={16} style={{ display: 'block' }} />
          </div>
          <span>New Manual Run</span>
        </button>
      </div>

      {/* Task List Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {tasks.map((task) => {
          const isDone = task.status === 'Completed';
          const isRunning = task.status === 'Running';
          return (
            <div
              key={task.id}
              className="glass-panel"
              style={{
                padding: '20px',
                borderColor: isRunning ? 'var(--border-glow)' : 'var(--border-glass)',
                boxShadow: isRunning ? 'var(--shadow-glow-purple)' : 'none'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justify: 'space-between',
                marginBottom: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: isDone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(139, 92, 246, 0.15)',
                    border: isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(139, 92, 246, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    flexShrink: 0
                  }}>
                    {isDone ? (
                      <CheckCircle size={20} color="var(--primary-emerald)" style={{ display: 'block' }} />
                    ) : (
                      <Clock size={20} color="var(--primary-purple)" style={{ display: 'block' }} />
                    )}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>
                      {task.name}
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', gap: '12px', marginTop: '2px' }}>
                      <span>ID: {task.id}</span>
                      <span>• Initiated: {task.startedAt}</span>
                    </div>
                  </div>
                </div>

                <span style={{
                  fontSize: '0.75rem',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 600,
                  background: isDone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: isDone ? 'var(--primary-emerald)' : 'var(--accent-amber)',
                  border: isDone ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)'
                }}>
                  {task.status}
                </span>
              </div>

              {/* Task steps timeline */}
              <div style={{
                background: 'rgba(7, 9, 14, 0.6)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                border: '1px solid var(--border-glass)',
                marginBottom: '12px'
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '10px' }}>
                  Execution Timeline
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {task.steps.map((step, sIdx) => (
                    <div key={sIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.825rem' }}>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        background: step.completed ? 'var(--primary-emerald)' : 'rgba(255,255,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'center',
                        fontSize: '0.65rem',
                        color: '#000',
                        fontWeight: 700,
                        flexShrink: 0
                      }}>
                        {step.completed ? '✓' : sIdx + 1}
                      </div>
                      <span style={{ color: step.completed ? '#fff' : 'var(--text-dim)' }}>
                        {step.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Related Metadata pills */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {task.gitBranch && (
                  <div className="glass-pill" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <GitCommit size={13} color="var(--primary-cyan)" style={{ display: 'block' }} />
                    </div>
                    <span>branch: {task.gitBranch}</span>
                  </div>
                )}
                {task.vercelDeployment && (
                  <div className="glass-pill" style={{ fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Globe size={13} color="var(--primary-purple)" style={{ display: 'block' }} />
                    </div>
                    <span>{task.vercelDeployment}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
