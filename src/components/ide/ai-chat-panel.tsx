
"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { type FileSystemNode, type FolderNode } from '@/lib/file-system';
import { type OpenFile } from '@/components/code-weaver';
import ReactMarkdown from 'react-markdown';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useEditorSettings } from '@/hooks/editor-settings-provider';
import { GeminiStar } from '../icons/gemini-star';
import GeminiLoadingAnimation from './gemini-loading-animation';

type Message = {
    id: string;
    role: 'user' | 'model';
    content: string;
};

type AiChatPanelProps = {
    fileSystem: FolderNode;
    fileContents: Map<string, string>;
    openFiles: OpenFile[];
};

const welcomeMessage: Message = {
    id: 'welcome',
    role: 'model',
    content: "Hello! I'm Gemini, your AI coding assistant. To get started, please go to settings and provide your Gemini API key. I can see your open files and file structure to help you with your project."
};

export default function AiChatPanel({ fileSystem, fileContents, openFiles }: AiChatPanelProps) {
    const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const { geminiApiKey } = useEditorSettings();
    const [userLanguage, setUserLanguage] = useState('en');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setUserLanguage(window.navigator.language);
        }
    }, []);


    // Function to stringify file system for the prompt
    const stringifyFileSystem = (node: FileSystemNode, indent = 0): string => {
        const prefix = '  '.repeat(indent);
        if (node.type === 'folder') {
            return `${prefix}- ${node.name}/\n` + node.children.map(child => stringifyFileSystem(child, indent + 1)).join('');
        }
        return `${prefix}- ${node.name}\n`;
    };

    const buildPromptContext = useCallback(() => {
        const fileSystemString = stringifyFileSystem(fileSystem);
        const openFilesContent = openFiles
            .map(file => `
---
File Path: ${file.path}
Content:
\`\`\`
${fileContents.get(file.id) || ''}
\`\`\`
---
`
            )
            .join('\n');

        return `
            You are an expert AI pair programmer and coding assistant named Gemini.
            You are friendly, helpful, and an expert in software development.
            Your user is working in a web-based IDE. You have access to their file system structure and the content of their currently open files.
            Your goal is to help them with their coding tasks. You can answer questions, explain code, suggest improvements, write new code, and identify bugs.

            Here is the context of the user's project:

            File System Structure:
            \`\`\`
            ${fileSystemString}
            \`\`\`

            Currently Open Files:
            ${openFilesContent || "No files are currently open."}

            Based on all this information, please provide a helpful and concise response.
            Use Markdown for formatting, especially for code blocks.
            If you are suggesting code changes, be explicit about which file you are modifying.
            Always be polite.
        `;
    }, [fileSystem, openFiles, fileContents]);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading) return;
        if (!geminiApiKey) {
            toast({
                title: 'API Key Required',
                description: 'Please go to Settings to enter your Gemini API key.',
                variant: 'destructive',
            });
            return;
        }

        const userMessage: Message = { id: `msg-${Date.now()}`, role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const context = buildPromptContext();
            
            const response = await fetch('/api/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    apiKey: geminiApiKey,
                    prompt: currentInput,
                    context: context,
                    userLanguage: userLanguage,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'An unknown error occurred');
            }

            const result = await response.json();
            const text = result.text;
            
            const assistantMessage: Message = { id: `msg-${Date.now()}-ai`, role: 'model', content: text };
            setMessages(prev => [...prev, assistantMessage]);

        } catch (error: any) {
            console.error("AI agent failed:", error);
            toast({
                title: 'Gemini API Error',
                description: error.message,
                variant: 'destructive',
            });
            // Put the user's message back in the input box on error
            setInput(currentInput);
            setMessages(prev => prev.slice(0, -1)); // Remove the user message from chat history
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    
    useEffect(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
            }
        }
    }, [messages, isLoading]);

    return (
        <div className="flex flex-col h-full bg-card font-sans text-sm border-l border-border">
            <div className="flex items-center h-12 px-4 border-b border-border shrink-0">
                <Sparkles className="w-5 h-5 mr-2" />
                <h3 className="text-lg font-semibold">Gemini</h3>
            </div>
            <ScrollArea className="flex-1" ref={scrollAreaRef}>
                <div className="p-4 space-y-4">
                    {messages.map((message) => (
                        <div key={message.id} className={cn("flex items-start gap-3", message.role === 'user' ? 'justify-end' : 'justify-start')}>
                             {message.role === 'model' && (
                                <Avatar className="w-8 h-8 border">
                                    <AvatarFallback><GeminiStar className="w-5 h-5"/></AvatarFallback>
                                </Avatar>
                            )}
                            <div className={cn(
                                "max-w-[85%] rounded-lg p-3 text-sm", 
                                message.role === 'user' 
                                    ? 'bg-primary text-primary-foreground' 
                                    : 'bg-muted'
                            )}>
                               <ReactMarkdown className="prose prose-sm dark:prose-invert prose-p:my-0 prose-headings:my-2 prose-blockquote:my-2 prose-ol:my-2 prose-ul:my-2 prose-pre:bg-background prose-pre:p-2 prose-pre:rounded-md">
                                    {message.content}
                                </ReactMarkdown>
                            </div>
                            {message.role === 'user' && (
                                <Avatar className="w-8 h-8 border">
                                    <AvatarFallback>You</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex items-start gap-3 justify-start">
                            <Avatar className="w-8 h-8 border">
                                 <AvatarFallback><GeminiStar className="w-5 h-5"/></AvatarFallback>
                            </Avatar>
                             <div className="bg-muted rounded-lg p-3 text-sm flex items-center w-full max-w-[85%]">
                                <GeminiLoadingAnimation />
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
            <div className="p-2 border-t border-border">
                <div className="relative">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={!geminiApiKey ? "Please provide an API key in settings" : "Ask Gemini a question..."}
                        className="pr-16 resize-none"
                        rows={2}
                        disabled={isLoading || !geminiApiKey}
                    />
                    <Button 
                        size="icon" 
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-10"
                        onClick={handleSendMessage}
                        disabled={isLoading || !input.trim() || !geminiApiKey}
                    >
                        {isLoading ? <Sparkles className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>}
                    </Button>
                </div>
            </div>
        </div>
    );
}
