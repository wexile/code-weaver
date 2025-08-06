"use client";

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, X } from 'lucide-react';
import type { OpenFile } from '@/components/code-weaver';
import Editor from '@monaco-editor/react';

type EditorPanelProps = {
  openFiles: OpenFile[];
  activeFile: OpenFile | undefined;
  onTabChange: (fileId: string) => void;
  onCloseTab: (fileId: string) => void;
  fileContents: Map<string, string>;
  onContentChange: (fileId: string, content: string) => void;
};

export default function EditorPanel({
  openFiles,
  activeFile,
  onTabChange,
  onCloseTab,
  fileContents,
  onContentChange,
}: EditorPanelProps) {

  if (!activeFile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-background">
        <Sparkles className="w-16 h-16 mb-4 text-accent" />
        <p className="text-lg">No file open</p>
        <p className="text-sm">Select a file from the explorer to begin editing.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <Tabs value={activeFile.id} onValueChange={onTabChange} className="flex flex-col h-full">
        <div className="flex justify-between items-center pr-2 border-b border-border">
          <TabsList className="bg-transparent border-0 p-0 m-0">
            {openFiles.map((file) => (
              <TabsTrigger
                key={file.id}
                value={file.id}
                className="relative group data-[state=active]:bg-card data-[state=active]:shadow-none data-[state=inactive]:hover:bg-card/80 rounded-none border-r border-transparent data-[state=active]:border-border -mb-px border-t-2 border-t-transparent data-[state=active]:border-t-accent"
              >
                {file.name}
                <div
                  role="button"
                  aria-label={`Close ${file.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(file.id);
                  }}
                  className="ml-2 p-0.5 rounded hover:bg-destructive/80 text-muted-foreground hover:text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        
        {openFiles.map((file) => (
          <TabsContent key={file.id} value={file.id} className="flex-1 mt-0">
            <Editor
              height="100%"
              path={file.path}
              language={file.language}
              value={fileContents.get(file.id) ?? ''}
              onChange={(value) => onContentChange(file.id, value || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "Fira Code, monospace",
                scrollBeyondLastLine: false,
                wordWrap: 'on',
              }}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
