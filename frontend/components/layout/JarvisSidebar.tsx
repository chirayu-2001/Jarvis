'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Send, Bot, Sparkles, X, ChevronRight } from 'lucide-react';
import { ChatMessage } from '@/lib/types';
import { apiClient } from '@/lib/api-client';

const parseAgentMarkup = (content: string) => {
  let parsed = content;
  parsed = parsed.replace(/<thought>([\s\S]*?)<\/thought>/g, '\n<details><summary class="text-xs text-[#b89b6a] cursor-pointer">Agent Thought</summary><div class="text-[#b89b6a] text-xs pl-2 border-l border-[#3d2e1e] mt-1 mb-2">$1</div></details>\n');
  parsed = parsed.replace(/<tool_call>([\s\S]*?)<\/tool_call>/g, '\n<div class="text-xs text-[#f0a500] font-mono my-1">⚙️ $1</div>\n');
  parsed = parsed.replace(/<tool_result>([\s\S]*?)<\/tool_result>/g, '\n<div class="text-xs text-[#4fc3f7] font-mono my-1">✓ $1</div>\n');
  return parsed;
};

interface JarvisSidebarProps {
  contextPage?: string;
  trajectoryId?: string;
}

export const JarvisSidebar: React.FC<JarvisSidebarProps> = (props) => {
  const pathname = usePathname();
  const match = pathname?.match(/\/trajectory\/([^\/]+)/);
  const derivedTrajectoryId = match ? match[1] : undefined;
  const trajectoryId = props.trajectoryId || derivedTrajectoryId;
  const contextPage = props.contextPage || (trajectoryId ? 'Trajectory Context' : 'Homepage');

  const [trajectoryTitle, setTrajectoryTitle] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'I am Jarvis — your personal intelligence layer. I observe patterns, suggest next moves, and refactor plans across your world, but only with your explicit permission.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeStreamMessage, setActiveStreamMessage] = useState<string>('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Fetch thread history when context changes
  useEffect(() => {
    let isMounted = true;
    const loadThread = async () => {
      try {
        if (trajectoryId) {
          apiClient.getTrajectoryDetail(trajectoryId)
            .then((traj) => {
              if (isMounted) setTrajectoryTitle(traj.title);
            })
            .catch(console.error);
        } else {
          if (isMounted) setTrajectoryTitle(null);
        }

        const thread = await apiClient.getChatThread(trajectoryId);
        if (isMounted) {
          if (thread.messages && thread.messages.length > 0) {
            setMessages(
              thread.messages.map((m) => ({ role: m.role, content: m.content }))
            );
          } else {
            setMessages([
              {
                role: 'assistant',
                content:
                  'I am Jarvis — your personal intelligence layer. I observe patterns, suggest next moves, and refactor plans across your world, but only with your explicit permission.',
              },
            ]);
          }
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    };
    loadThread();
    return () => {
      isMounted = false;
    };
  }, [trajectoryId]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOpen = (e: any) => {
      setIsOpen(true);
      if (e.detail && e.detail.message) {
        setInput(e.detail.message);
      }
    };
    window.addEventListener('jarvis:open', handleOpen);
    return () => window.removeEventListener('jarvis:open', handleOpen);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      setActiveStreamMessage('');
      
      apiClient.streamChatMessage(
        {
          messages: [...messages, userMsg],
          context_page: contextPage,
          trajectory_id: trajectoryId,
        },
        (data) => {
          let chunkText = "";
          if (data.type === 'thought') {
             chunkText = `\n<details><summary class="text-xs text-[#b89b6a] cursor-pointer">Agent Thought</summary><div class="text-[#b89b6a] text-xs pl-2 border-l border-[#3d2e1e] mt-1 mb-2">${data.content}</div></details>\n`;
          } else if (data.type === 'tool_call') {
             chunkText = `\n<div class="text-xs text-[#f0a500] font-mono my-1">⚙️ ${data.content}</div>\n`;
          } else if (data.type === 'tool_result') {
             chunkText = `\n<div class="text-xs text-[#4fc3f7] font-mono my-1">✓ ${data.content}</div>\n`;
          } else if (data.type === 'message') {
             chunkText = data.content;
          } else if (data.type === 'status') {
             chunkText = `\n<div class="text-xs text-[#4fc3f7] font-mono my-1 italic">[Status] ${data.content}</div>\n`;
          } else if (data.type === 'action' && data.action === 'refresh_plan') {
             window.dispatchEvent(new CustomEvent('plan:refreshed'));
             return;
          }
          
          setActiveStreamMessage((prev) => prev + chunkText);
        },
        () => {
          setMessages((prev) => {
            // Need to grab the latest activeStreamMessage state to push
            return prev; // We will use a functional update hack or useEffect, actually it's easier to just push activeStreamMessage in the next line
          });
          setLoading(false);
        },
        (err) => {
          console.error(err);
          setLoading(false);
        }
      );
    } catch (err: any) {
      setLoading(false);
    }
  };

  // When loading transitions from true to false, append the active stream message to messages.
  useEffect(() => {
    if (!loading && activeStreamMessage) {
      setMessages((prev) => [...prev, { role: 'assistant', content: activeStreamMessage }]);
      setActiveStreamMessage('');
    }
  }, [loading]);

  return (
    <>
      {/* ─── Floating Sidebar Trigger Button (Bottom-Right Viewport) ─── */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9990,
          background: 'rgba(26, 20, 16, 0.96)',
          border: '1px solid rgba(240, 165, 0, 0.4)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(79, 195, 247, 0.15), 0 0 40px rgba(240, 165, 0, 0.08)',
          backdropFilter: 'blur(12px)',
          padding: '0.65rem 1.15rem',
          borderRadius: '9999px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          cursor: 'pointer',
          transition: 'transform 180ms ease, box-shadow 180ms ease'
        }}
        aria-label="Open Jarvis AI Sidebar"
      >
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: '2rem',
            height: '2rem',
            borderRadius: '50%',
            background: 'radial-gradient(circle, #4fc3f7 0%, #0288d1 60%, #01579b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f0e6d3',
            boxShadow: '0 0 12px rgba(79, 195, 247, 0.5), 0 0 25px rgba(79, 195, 247, 0.2)',
            border: '1.5px solid rgba(79, 195, 247, 0.5)',
            animation: 'reactorPulse 3s ease-in-out infinite'
          }}>
            <Bot style={{ width: '1rem', height: '1rem', color: '#0d0d0d' }} />
          </div>
          <span style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '0.55rem',
            height: '0.55rem',
            borderRadius: '50%',
            background: '#4fc3f7',
            border: '2px solid #0d0d0d'
          }} />
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f0e6d3', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <span>Ask Jarvis AI</span>
            <ChevronRight style={{ width: '0.85rem', height: '0.85rem', color: '#f0a500' }} />
          </div>
          <div style={{ fontSize: '0.68rem', fontFamily: "'Orbitron', monospace", color: '#b89b6a', letterSpacing: '0.06em' }}>
            Context: {contextPage}
          </div>
        </div>
      </button>

      {/* ─── Backdrop Overlay ─── */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(13, 13, 13, 0.8)',
            backdropFilter: 'blur(6px)',
            zIndex: 9998
          }}
        />
      )}

      {/* ─── Slide-Over Drawer Panel (Fixed Viewport Right Column) ─── */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          height: '100vh',
          width: '420px',
          maxWidth: '92vw',
          background: 'linear-gradient(180deg, #1e1812 0%, #0d0d0d 100%)',
          borderLeft: '1px solid #3d2e1e',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.7), -2px 0 20px rgba(230, 57, 70, 0.05)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '1.25rem',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        aria-label="Jarvis AI Drawer"
      >
        {/* Drawer Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #3d2e1e', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '4px',
              background: 'linear-gradient(135deg, #f0a500, #4fc3f7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot style={{ width: '1.2rem', height: '1.2rem', color: '#0d0d0d' }} />
            </div>
            <div>
              <span className="kicker" style={{ margin: 0 }}>GLOBAL AI LAYER</span>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#f0e6d3' }}>Jarvis Assistant</h2>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              padding: '0.4rem',
              border: '1px solid #3d2e1e',
              background: '#2a2118',
              color: '#b89b6a',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
            aria-label="Close Jarvis AI Sidebar"
          >
            <X style={{ width: '1rem', height: '1rem' }} />
          </button>
        </div>

        {/* Current Context Box */}
        <div className="context-box" style={{ margin: '0.85rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
            <Sparkles style={{ width: '0.85rem', height: '0.85rem', color: '#f0a500' }} />
            <span>ACTIVE VIEW CONTEXT</span>
          </div>
          <p>
            {trajectoryId
              ? `Currently inspecting trajectory "${trajectoryTitle || 'Loading...'}". Jarvis is ready to build or refactor plans.`
              : `Homepage context active. Observing signal across AI, Software, Finance, Job Change, and Investment plans.`}
          </p>
        </div>

        {/* Chat Stream */}
        <div ref={scrollRef} className="chat-stream" style={{ flex: 1, margin: '0.5rem 0' }}>
          {messages.map((msg, idx) => (
            <article key={idx} className={msg.role === 'user' ? 'you' : 'ai'}>
              <span>{msg.role === 'user' ? 'YOU' : 'JARVIS AI'}</span>
              <div dangerouslySetInnerHTML={{ __html: parseAgentMarkup(msg.content).replace(/\n/g, '<br/>') }} />
            </article>
          ))}
          {loading && (
            <article className="ai">
              <span>JARVIS AI</span>
              <div dangerouslySetInnerHTML={{ __html: (activeStreamMessage ? activeStreamMessage.replace(/\n/g, '<br/>') + '<br/><br/>' : '') + '<span style="opacity:0.7; font-size: 0.85rem;" class="loading-dots">Jarvis is working</span>' }} />
              <style>{`
                .loading-dots::after {
                  content: '.';
                  animation: dots 1.5s steps(5, end) infinite;
                }
                @keyframes dots {
                  0%, 20% { color: rgba(0,0,0,0); text-shadow: .25em 0 0 rgba(0,0,0,0), .5em 0 0 rgba(0,0,0,0); }
                  40% { color: inherit; text-shadow: .25em 0 0 rgba(0,0,0,0), .5em 0 0 rgba(0,0,0,0); }
                  60% { text-shadow: .25em 0 0 inherit, .5em 0 0 rgba(0,0,0,0); }
                  80%, 100% { text-shadow: .25em 0 0 inherit, .5em 0 0 inherit; }
                }
              `}</style>
            </article>
          )}
        </div>

        {/* Query Input Box */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="chat-input"
          style={{ paddingTop: '0.75rem', borderTop: '1px solid #3d2e1e' }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              // auto-resize
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask Jarvis to suggest, plan, or refactor..."
            aria-label="Chat with Jarvis AI"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#f0e6d3',
              outline: 'none',
              resize: 'none',
              padding: '0.5rem 0',
              minHeight: '2.5rem',
              maxHeight: '150px',
              fontFamily: 'inherit',
              fontSize: '0.9rem'
            }}
            rows={1}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            <Send style={{ width: '0.9rem', height: '0.9rem' }} />
          </button>
        </form>
      </aside>
    </>
  );
};
