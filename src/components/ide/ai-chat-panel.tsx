
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bot, User, Send, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { continueChat, type ChatInput } from '@/ai/flows/chat';
import { type OpenFile } from '../code-weaver';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';


type AiChatPanelProps = {
    activeFile?: OpenFile;
    activeFileContent?: string;
};

type Message = {
    role: 'user' | 'model';
    content: string;
};

const InitialMessage: Message = {
    role: 'model',
    content: "Hello! I'm your Gemini assistant. How can I help you with your project today?",
};


export default function AiChatPanel({ activeFile, activeFileContent }: AiChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([InitialMessage]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchKeyAndSetup = () => {
        const storedKey = localStorage.getItem('gemini-api-key');
        setApiKey(storedKey);
    };
    fetchKeyAndSetup();
    // Listen for API key updates from the settings panel
    window.addEventListener('apiKeyUpdated', fetchKeyAndSetup);
    return () => window.removeEventListener('apiKeyUpdated', fetchKeyAndSetup);
  }, []);
  
  useEffect(() => {
    // Scroll to the bottom when messages change
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    if (!apiKey) {
        toast({
            title: "API Key Required",
            description: "Please set your Gemini API key in the settings panel to use the AI chat.",
            variant: "destructive"
        });
        return;
    }

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatInput: ChatInput = {
        prompt: input,
        history: messages.map(m => ({ role: m.role, content: m.content })),
        context: activeFile ? { fileName: activeFile.name, fileContent: activeFileContent } : undefined,
      };

      // We need to pass the key for server-side use. This is a simplification.
      // In a real app, you might have a backend proxy to handle this.
      const response = await continueChat(chatInput);
      
      const modelMessage: Message = { role: 'model', content: response.response };
      setMessages(prev => [...prev, modelMessage]);

    } catch (error: any) {
        console.error("AI chat error:", error);
        toast({
            title: "AI Error",
            description: error.message || "An error occurred while talking to the AI.",
            variant: "destructive"
        });
        // Restore user input on error
        setInput(input);
        setMessages(prev => prev.slice(0, -1)); // Remove the user's message that failed
    } finally {
        setIsLoading(false);
    }
  };

  const MarkdownComponents: object = {
    p: ({ node, ...props }: any) => <p className="mb-2 last:mb-0" {...props} />,
    ol: ({ node, ...props }: any) => <ol className="list-decimal list-inside my-2" {...props} />,
    ul: ({ node, ...props }: any) => <ul className="list-disc list-inside my-2" {...props} />,
    li: ({ node, ...props }: any) => <li className="mb-1" {...props} />,
    code: ({ node, className, children, ...props }: any) => {
        const match = /language-(\w+)/.exec(className || '');
        return match ? (
            <code className="bg-muted p-1 rounded-md font-mono text-sm">{children}</code>
        ) : (
            <div className="my-2 rounded-md bg-muted text-muted-foreground overflow-hidden">
                <pre className="p-4 text-sm overflow-x-auto">{children}</pre>
            </div>
        );
    },
  };

  return (
    <div className="flex flex-col h-full bg-card text-card-foreground">
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <Sparkles className="w-5 h-5 text-accent" />
        <h2 className="text-lg font-semibold">Gemini Help</h2>
      </div>
      <ScrollArea className="flex-1" viewportRef={scrollAreaRef}>
        <div className="p-4 space-y-6">
            {messages.map((message, index) => (
                <div key={index} className={cn("flex items-start gap-3", message.role === 'user' && 'justify-end')}>
                   {message.role === 'model' && (
                       <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                           <Bot className="w-5 h-5"/>
                       </div>
                   )}
                   <div className={cn(
                       "p-3 rounded-lg max-w-sm sm:max-w-md md:max-w-lg text-sm",
                       message.role === 'model' ? 'bg-muted' : 'bg-primary text-primary-foreground'
                   )}>
                        <ReactMarkdown components={MarkdownComponents}>
                            {message.content}
                        </ReactMarkdown>
                   </div>
                    {message.role === 'user' && (
                       <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                           <User className="w-5 h-5"/>
                       </div>
                   )}
                </div>
            ))}
            {isLoading && (
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                        <Bot className="w-5 h-5"/>
                    </div>
                    <div className="p-3 rounded-lg bg-muted flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                </div>
            )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-border">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e as any);
                }
            }}
            placeholder="Ask AI anything about your code..."
            className="flex-1 resize-none bg-muted focus-visible:ring-1 focus-visible:ring-ring"
            rows={1}
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}
