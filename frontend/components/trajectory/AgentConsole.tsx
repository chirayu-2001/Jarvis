import React, { useEffect, useRef } from 'react';
import { Terminal } from 'lucide-react';

interface AgentConsoleProps {
  events: any[];
}

export const AgentConsole: React.FC<AgentConsoleProps> = ({ events }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events]);

  return (
    <div className="bg-[#0d0d0d] border border-[#3d2e1e] rounded overflow-hidden shadow-2xl animate-fade-in my-6">
      <div className="bg-[#1e1812] px-4 py-2 border-b border-[#3d2e1e] flex items-center gap-2">
        <Terminal className="w-4 h-4 text-[#f0a500]" />
        <span className="text-xs font-mono font-bold text-[#f0e6d3] tracking-widest">JARVIS HARNESS</span>
        <div className="flex-1" />
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4fc3f7] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4fc3f7]"></span>
        </span>
      </div>
      <div 
        ref={scrollRef}
        className="p-4 h-64 overflow-y-auto font-mono text-[0.8rem] space-y-2 text-[#b89b6a]"
      >
        {events.length === 0 && <div>Waiting for agent connection...</div>}
        {events.map((evt, idx) => {
          if (evt.type === 'status') {
            return <div key={idx} className="text-[#4fc3f7] font-bold">[{new Date().toLocaleTimeString()}] {evt.content}</div>;
          }
          if (evt.type === 'thought') {
            return <div key={idx} className="text-[#dbb97a]">... {evt.content.replace(/<[^>]+>/g, '').substring(0, 150)} ...</div>;
          }
          if (evt.type === 'tool_call') {
            return <div key={idx} className="text-[#f0a500] pl-4 border-l-2 border-[#f0a500]">⚙️ {evt.content}</div>;
          }
          if (evt.type === 'tool_result') {
            return <div key={idx} className="text-[#4fc3f7] pl-4">✓ {evt.content}</div>;
          }
          return <div key={idx}>{evt.content}</div>;
        })}
      </div>
    </div>
  );
};
