import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';

export default function ChatView({ messages, onSendMessage, isThinking }) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || isThinking) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const quickPills = [
    { label: '🚀 Deploy current project to Vercel', prompt: 'Deploy the latest updates to Vercel production server' },
    { label: '🐙 Push new changes to GitHub', prompt: 'Push all uncommitted changes to main branch on GitHub' },
    { label: '📊 Check server status & 24/7 uptime', prompt: 'Perform a cloud health check and report system status' },
    { label: '⚡ Run background worker task', prompt: 'Trigger background worker task to process queued jobs' }
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 64px)',
      maxWidth: '1000px',
      margin: '0 auto',
      width: '100%',
      padding: '20px 20px 10px 20px'
    }}>
      {/* Messages area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        paddingRight: '6px'
      }}>
        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={index}
              className="animate-fade-in"
              style={{
                display: 'flex',
                gap: '14px',
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: isUser ? '80%' : '90%',
                flexDirection: isUser ? 'row-reverse' : 'row'
              }}
            >
              {/* Avatar Icon Box */}
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: isUser ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, var(--primary-purple) 0%, var(--primary-cyan) 100%)',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                flexShrink: 0,
                boxShadow: isUser ? 'none' : '0 0 15px rgba(139, 92, 246, 0.3)',
                lineHeight: 0
              }}>
                {isUser ? (
                  <User size={19} color="#fff" style={{ display: 'block', margin: '0 auto' }} />
                ) : (
                  <Bot size={20} color="#fff" style={{ display: 'block', margin: '0 auto' }} />
                )}
              </div>

              {/* Message Content Bubble */}
              <div style={{
                background: isUser ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(109, 40, 217, 0.25) 100%)' : 'rgba(15, 23, 42, 0.85)',
                border: isUser ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid var(--border-glass)',
                padding: '14px 18px',
                borderRadius: isUser ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
                boxShadow: isUser ? 'none' : '0 8px 24px rgba(0,0,0,0.3)',
                color: '#fff',
                lineHeight: '1.6',
                fontSize: '0.95rem'
              }}>
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: isUser ? 'var(--primary-cyan)' : 'var(--primary-purple)',
                  marginBottom: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {isUser ? 'You' : 'Julee AI'}
                  <span style={{ color: 'var(--text-dim)', fontWeight: 400 }}>• {msg.time}</span>
                </div>

                <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>

                {/* Code snippet block */}
                {msg.codeSnippet && (
                  <div style={{
                    marginTop: '12px',
                    background: '#04060a',
                    border: '1px solid var(--border-glass)',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      padding: '6px 12px',
                      background: 'rgba(255,255,255,0.03)',
                      borderBottom: '1px solid var(--border-glass)',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      justify: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>{msg.codeLanguage || 'terminal'}</span>
                      <span style={{ color: 'var(--primary-emerald)' }}>Executed</span>
                    </div>
                    <pre style={{
                      padding: '12px',
                      fontSize: '0.825rem',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--primary-cyan)',
                      overflowX: 'auto'
                    }}>
                      <code>{msg.codeSnippet}</code>
                    </pre>
                  </div>
                )}

                {/* Execution Card Action */}
                {msg.actionCard && (
                  <div className="glass-panel" style={{
                    marginTop: '12px',
                    padding: '12px',
                    background: 'rgba(6, 182, 212, 0.08)',
                    borderColor: 'rgba(6, 182, 212, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 0 }}>
                        <CheckCircle2 size={18} color="var(--primary-emerald)" style={{ display: 'block' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                          {msg.actionCard.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {msg.actionCard.detail}
                        </div>
                      </div>
                    </div>
                    {msg.actionCard.url && (
                      <a
                        href={msg.actionCard.url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.75rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <span>View</span>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 0 }}>
                          <ExternalLink size={12} style={{ display: 'block' }} />
                        </div>
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Live Thinking Indicator */}
        {isThinking && (
          <div className="animate-fade-in" style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary-purple) 0%, var(--primary-cyan) 100%)',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              flexShrink: 0,
              lineHeight: 0
            }}>
              <Loader2 size={19} color="#fff" className="animate-spin-slow" style={{ display: 'block', margin: '0 auto' }} />
            </div>
            <div style={{
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid var(--border-glow)',
              padding: '12px 18px',
              borderRadius: '4px 18px 18px 18px',
              color: 'var(--primary-cyan)',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: 'var(--shadow-glow-purple)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 0 }}>
                <Sparkles size={16} color="var(--primary-purple)" style={{ display: 'block' }} />
              </div>
              <span>Julee is processing instructions and executing cloud steps...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Suggestion Pills */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '12px 0 8px 0'
      }}>
        {quickPills.map((pill, idx) => (
          <button
            key={idx}
            onClick={() => onSendMessage(pill.prompt)}
            className="glass-pill"
            style={{
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              borderColor: 'rgba(139, 92, 246, 0.2)'
            }}
          >
            <span>{pill.label}</span>
          </button>
        ))}
      </div>

      {/* Input box form */}
      <form onSubmit={handleSubmit} style={{
        position: 'relative',
        marginBottom: '10px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-input)',
          border: '1px solid var(--border-glow)',
          borderRadius: 'var(--radius-md)',
          padding: '4px 8px 4px 16px',
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)'
        }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type instructions for Julee (e.g. Push git commit, deploy to Vercel)..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#fff',
              fontSize: '0.95rem',
              padding: '10px 0'
            }}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isThinking}
            className="btn-primary"
            style={{
              borderRadius: 'var(--radius-sm)',
              padding: '10px 16px',
              opacity: (!inputText.trim() || isThinking) ? 0.5 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>Send</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 0 }}>
              <Send size={16} style={{ display: 'block' }} />
            </div>
          </button>
        </div>
      </form>
    </div>
  );
}
