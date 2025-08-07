
"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { Terminal, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import type { FolderNode, FileSystemNode } from '@/lib/file-system';
import type { PyodideInterface } from 'pyodide';

type TerminalPanelProps = {
    fileSystem: FolderNode;
    fileContents: Map<string, string>;
};

const findFileInTree = (tree: FolderNode, filename: string): FileSystemNode | null => {
    const queue: FileSystemNode[] = [...tree.children];
    while(queue.length > 0) {
        const node = queue.shift();
        if(!node) continue;
        if(node.type === 'file' && node.name === filename) {
            return node;
        }
        if(node.type === 'folder') {
            queue.push(...node.children);
        }
    }
    return null;
}

const welcomeMessage = `Welcome to the Code Weaver Terminal!
- This is a Python environment powered by Pyodide (WebAssembly).
- Run your scripts with 'python <filename.py>'.
- Install packages from PyPI with 'install <package_name>'.
- GUI libraries like tkinter, PyQt, etc. are not supported.
`;

export default function TerminalPanel({ fileSystem, fileContents }: TerminalPanelProps) {
  const [history, setHistory] = useState<string[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const endOfHistoryRef = useRef<HTMLDivElement>(null);
  const pyodideRef = useRef<PyodideInterface | null>(null);

  const appendToHistory = useCallback((...lines: string[]) => {
    setHistory(prev => [...prev, ...lines]);
  }, []);
  
  useEffect(() => {
    const loadPyodide = async () => {
      try {
        // @ts-ignore
        const pyodide = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/"
        });
        pyodideRef.current = pyodide;
        
        pyodide.setStdout({
          batched: (output) => {
            const trimmedOutput = output.trim();
            if(trimmedOutput) {
               appendToHistory(trimmedOutput);
            }
          }
        });
        pyodide.setStderr({
          batched: (output) => {
            const trimmedOutput = output.trim();
            if(trimmedOutput) {
               appendToHistory(`Error: ${trimmedOutput}`);
            }
          }
        });
        
        await pyodide.loadPackage("micropip");
        setIsReady(true);
        appendToHistory("Python runtime and micropip loaded successfully.");
      } catch (error) {
        console.error("Failed to load Pyodide:", error);
        appendToHistory("Error: Failed to load Python runtime.");
      } finally {
        setIsLoading(false);
      }
    };

    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js";
    script.async = true;
    script.onload = () => {
        // @ts-ignore
        if (window.loadPyodide) {
            loadPyodide();
        } else {
            appendToHistory("Error: Pyodide script loaded but loadPyodide function not found.");
            setIsLoading(false);
        }
    };
    script.onerror = () => {
        appendToHistory("Error: Failed to load Python runtime script.");
        setIsLoading(false);
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    }
   }, [appendToHistory]);

  const executeCommand = async (command: string) => {
    appendToHistory(`> ${command}`);
    const parts = command.trim().split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);
    const pyodide = pyodideRef.current;

    if (!pyodide || !isReady) {
        appendToHistory("Python runtime is not ready. Please wait.");
        return;
    }

    if (cmd === 'python') {
        if (args.length === 0) {
            appendToHistory("Usage: python <filename.py>");
            return;
        }
        const filename = args[0];
        const fileNode = findFileInTree(fileSystem, filename);

        if (!fileNode || fileNode.type !== 'file') {
            appendToHistory(`Error: File '${filename}' not found.`);
            return;
        }

        const code = fileContents.get(fileNode.id);
        if (typeof code !== 'string') {
            appendToHistory(`Error: Could not read content of '${filename}'.`);
            return;
        }
        
        try {
            await pyodide.runPythonAsync(code);
        } catch (error: any) {
            appendToHistory(`Error: ${error.message}`);
        }
    } else if (cmd === 'install') {
        if (args.length === 0) {
            appendToHistory("Usage: install <package_name>");
            return;
        }
        const packageName = args[0];
        appendToHistory(`Installing ${packageName}...`);
        try {
            // @ts-ignore
            const micropip = pyodide.pyimport("micropip");
            await micropip.install(packageName);
            appendToHistory(`Successfully installed ${packageName}`);
        } catch (error: any) {
             appendToHistory(`Error installing ${packageName}: ${error.message}`);
        }

    } else if (cmd === 'clear') {
        setHistory([]);
    } else if (cmd === 'help') {
        appendToHistory('Available commands: python <filename.py>, install <package>, clear, help, date');
    } else if (cmd === 'date') {
        appendToHistory(new Date().toLocaleString());
    } else if (cmd) {
        appendToHistory(`command not found: ${cmd}`);
    }
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim()) {
        executeCommand(input.trim());
        setInput('');
      } else {
        appendToHistory('>');
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
        {isLoading && (
            <div className="flex items-center gap-2 ml-auto text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin"/>
                <span>Loading Python runtime...</span>
            </div>
        )}
      </div>
      <div className="flex-1 p-4 overflow-y-auto" onClick={() => document.getElementById('terminal-input')?.focus()}>
        {history.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap break-words">{line}</div>
        ))}
        <div className="flex">
          <span className="mr-2 text-muted-foreground">&gt;</span>
          <Textarea
            id="terminal-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 p-0 bg-transparent border-0 rounded-none resize-none focus-visible:ring-0 shadow-none h-6"
            placeholder="Type a command..."
            rows={1}
            disabled={isLoading || !isReady}
          />
        </div>
        <div ref={endOfHistoryRef} />
      </div>
    </div>
  );
}
