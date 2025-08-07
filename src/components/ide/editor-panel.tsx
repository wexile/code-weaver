
"use client";

import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, X } from 'lucide-react';
import type { OpenFile } from '@/components/code-weaver';
import Editor, { useMonaco } from '@monaco-editor/react';
import { useTheme } from '@/hooks/theme-provider';
import { useEditorSettings } from '@/hooks/editor-settings-provider';

type EditorPanelProps = {
  openFiles: OpenFile[];
  activeFile: OpenFile | undefined;
  onTabChange: (fileId: string) => void;
  onCloseTab: (fileId: string) => void;
  fileContents: Map<string, string>;
  onContentChange: (fileId: string, content: string) => void;
};

const defineTheme = (monaco: any, themeName: string, themeData: any) => {
    monaco.editor.defineTheme(themeName, themeData);
};

export default function EditorPanel({
  openFiles,
  activeFile,
  onTabChange,
  onCloseTab,
  fileContents,
  onContentChange,
}: EditorPanelProps) {
  const { theme } = useTheme();
  const { wordWrap, minimapEnabled } = useEditorSettings();
  const monaco = useMonaco();

  useEffect(() => {
    if (monaco) {
        // Define custom themes that match globals.css
        defineTheme(monaco, 'ocean', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#101720',
            },
        });
        defineTheme(monaco, 'rose', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#1C040C',
            },
        });
        defineTheme(monaco, 'solarized-dark', {
          base: 'vs-dark',
          inherit: true,
          rules: [
            { token: 'comment', foreground: '586e75', fontStyle: 'italic' },
            { token: 'keyword', foreground: '859900' },
            { token: 'string', foreground: '2aa198' },
            { token: 'number', foreground: '268bd2' },
            { token: 'delimiter', foreground: '839496' },
            { token: 'tag', foreground: '268bd2' },
            { token: 'attribute.name', foreground: '93a1a1' },
            { token: 'attribute.value', foreground: '2aa198' },
            { token: 'variable', foreground: 'b58900' },
          ],
          colors: {
              'editor.background': '#002b36',
              'editor.foreground': '#839496',
              'editorCursor.foreground': '#839496',
              'editor.lineHighlightBackground': '#073642',
              'editor.selectionBackground': '#073642',
          },
        });
        defineTheme(monaco, 'monokai', {
          base: 'vs-dark',
          inherit: true,
          rules: [
            { token: 'comment', foreground: '75715e', fontStyle: 'italic' },
            { token: 'keyword', foreground: 'f92672' },
            { token: 'string', foreground: 'e6db74' },
            { token: 'number', foreground: 'ae81ff' },
            { token: 'delimiter', foreground: 'f8f8f2' },
            { token: 'tag', foreground: 'f92672' },
            { token: 'attribute.name', foreground: 'a6e22e' },
            { token: 'attribute.value', foreground: 'e6db74' },
            { token: 'variable', foreground: '66d9ef', fontStyle: 'italic' },
            { token: 'type', foreground: '66d9ef' },
          ],
          colors: {
              'editor.background': '#272822',
              'editor.foreground': '#f8f8f2',
              'editorCursor.foreground': '#f8f8f0',
              'editor.lineHighlightBackground': '#3e3d32',
              'editor.selectionBackground': '#49483e',
          },
        });
        defineTheme(monaco, 'cobalt', {
          base: 'vs-dark',
          inherit: true,
          rules: [
            { token: 'comment', foreground: '0088ff', fontStyle: 'italic' },
            { token: 'keyword', foreground: 'ff9d00' },
            { token: 'string', foreground: '3ad900' },
            { token: 'number', foreground: 'ff628c' },
            { token: 'delimiter', foreground: 'ffffff' },
            { token: 'tag', foreground: '9effff' },
            { token: 'attribute.name', foreground: 'f08f33' },
            { token: 'attribute.value', foreground: '3ad900' },
            { token: 'variable', foreground: 'e1efff' },
          ],
          colors: {
              'editor.background': '#002240',
              'editor.foreground': '#ffffff',
              'editorCursor.foreground': '#ffc600',
              'editor.lineHighlightBackground': '#003366',
              'editor.selectionBackground': '#0055a6',
          },
        });
    }
  }, [monaco]);

  const editorTheme = theme === 'light' ? 'light' : theme === 'dark' ? 'vs-dark' : theme;

  if (openFiles.length === 0 || !activeFile) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-background">
        <Sparkles className="w-16 h-16 mb-4 text-accent" />
        <p className="text-lg">No file open</p>
        <p className="text-sm">Select a file from the explorer to begin editing.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card">
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
          <TabsContent key={file.id} value={file.id} className="flex-1 mt-0 bg-background animate-fade-in">
            <Editor
              height="100%"
              path={file.path}
              language={file.language}
              value={fileContents.get(file.id) ?? ''}
              onChange={(value) => onContentChange(file.id, value || '')}
              theme={editorTheme}
              options={{
                minimap: { enabled: minimapEnabled },
                fontSize: 14,
                fontFamily: "Fira Code, monospace",
                scrollBeyondLastLine: false,
                wordWrap: wordWrap ? 'on' : 'off',
              }}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
