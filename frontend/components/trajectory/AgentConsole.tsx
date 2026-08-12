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
    <div className="bg-[#090a0f] border border-[#202534] rounded overflow-hidden shadow-2xl animate-fade-in my-6">
      <div className="bg-[#11141d] px-4 py-2 border-b border-[#202534] flex items-center gap-2">
        <Terminal className="w-4 h-4 text-[#818cf8]" />
        <span className="text-xs font-mono font-bold text-[#f3f4f8] tracking-widest">JARVIS HARNESS</span>
        <div className="flex-1" />
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34d399] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#34d399]"></span>
        </span>
      </div>
      <div 
        ref={scrollRef}
        className="p-4 h-64 overflow-y-auto font-mono text-[0.8rem] space-y-2 text-[#8b94a8]"
      >
        {events.length === 0 && <div>Waiting for agent connection...</div>}
        {events.map((evt, idx) => {
          if (evt.type === 'status') {
            return <div key={idx} className="text-[#38bdf8] font-bold">[{new Date().toLocaleTimeString()}] {evt.content}</div>;
          }
          if (evt.type === 'thought') {
            return <div key={idx} className="text-[#cbd2e1]">... {evt.content.replace(/<[^>]+>/g, '').substring(0, 150)} ...</div>;
          }
          if (evt.type === 'tool_call') {
            return <div key={idx} className="text-[#818cf8] pl-4 border-l-2 border-[#818cf8]">⚙️ {evt.content}</div>;
          }
          if (evt.type === 'tool_result') {
            return <div key={idx} className="text-[#34d399] pl-4">✓ {evt.content}</div>;
          }
          return <div key={idx}>{evt.content}</div>;
        })}
      </div>
    </div>
  );
};
