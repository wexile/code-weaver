"use client";

import { useState, useRef, useEffect } from 'react';
import { Terminal } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function TerminalPanel() {
  const [history, setHistory] = useState<string[]>(['Welcome to Code Weaver Terminal!']);
  const [input, setInput] = useState('');
  const endOfHistoryRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        const newHistory = [...history, `> ${input}`];
        // Mock command execution
        if (input.trim() === 'clear') {
            setHistory([]);
        } else if (input.trim() === 'help') {
            newHistory.push('Available commands: clear, help, date');
        } else if (input.trim() === 'date') {
            newHistory.push(new Date().toLocaleString());
        } else {
            newHistory.push(`command not found: ${input.trim()}`);
        }
        setHistory(newHistory);
        setInput('');
      } else {
         setHistory(prev => [...prev, '>']);
      }
    }
  };

  useEffect(() => {
    endOfHistoryRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  return (
    <div className="flex flex-col h-full bg-card font-mono text-sm">
      <div className="flex items-center h-8 px-4 border-b border-border shrink-0">
        <Terminal className="w-4 h-4 mr-2" />
        <h3 className="font-semibold">Terminal</h3>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {history.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
        <div className="flex">
          <span className="mr-2">&gt;</span>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 p-0 bg-transparent border-0 rounded-none resize-none focus-visible:ring-0 shadow-none h-6"
            placeholder="Type a command..."
            rows={1}
          />
        </div>
        <div ref={endOfHistoryRef} />
      </div>
    </div>
  );
}
