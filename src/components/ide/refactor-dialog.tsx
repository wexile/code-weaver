
"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useEditorSettings } from '@/hooks/editor-settings-provider';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import GeminiLoadingAnimation from './gemini-loading-animation';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../ui/resizable';

type RefactorDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  originalCode: string;
  language: string;
  onApply: (newCode: string) => void;
};

export default function RefactorDialog({
  isOpen,
  onOpenChange,
  originalCode,
  language,
  onApply,
}: RefactorDialogProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [explanation, setExplanation] = useState('');
  const [refactoredCode, setRefactoredCode] = useState('');
  const { geminiApiKey } = useEditorSettings();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      // Reset state on open
      setIsLoading(true);
      setError(null);
      setExplanation('');
      setRefactoredCode('');

      const fetchRefactoring = async () => {
        try {
          const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              apiKey: geminiApiKey,
              mode: 'refactor',
              codeToRefactor: originalCode,
              codeLanguage: language,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to get refactoring suggestions.');
          }

          const result = await response.json();
          const { explanation, refactoredCode } = JSON.parse(result.text);

          setExplanation(explanation);
          setRefactoredCode(refactoredCode);
        } catch (e: any) {
          setError(e.message);
          toast({
            title: 'Refactoring Error',
            description: e.message,
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchRefactoring();
    }
  }, [isOpen, originalCode, language, geminiApiKey, toast]);

  const handleApply = () => {
    onApply(refactoredCode);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>AI Code Refactoring</DialogTitle>
          <DialogDescription>
            Gemini has analyzed your code. Review the explanation and the suggested changes below.
          </DialogDescription>
        </DialogHeader>

        <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
          <ResizablePanel defaultSize={35} minSize={20}>
            <div className="p-4 h-full flex flex-col">
              <h3 className="text-lg font-semibold mb-2">Explanation</h3>
              <ScrollArea className="flex-1 rounded-md bg-muted p-4">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <GeminiLoadingAnimation />
                  </div>
                ) : error ? (
                  <div className="text-destructive">{error}</div>
                ) : (
                  <ReactMarkdown className="prose prose-sm dark:prose-invert">
                    {explanation}
                  </ReactMarkdown>
                )}
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          <ResizablePanel defaultSize={65} minSize={30}>
            <ResizablePanelGroup direction="vertical">
                <ResizablePanel>
                    <div className="p-4 h-full flex flex-col">
                        <h3 className="text-lg font-semibold mb-2">Original Code</h3>
                        <div className="flex-1 border rounded-md overflow-hidden">
                        <Editor
                            height="100%"
                            language={language}
                            value={originalCode}
                            theme="vs-dark"
                            options={{ readOnly: true, minimap: { enabled: false } }}
                        />
                        </div>
                    </div>
                </ResizablePanel>
                <ResizableHandle/>
                 <ResizablePanel>
                    <div className="p-4 h-full flex flex-col">
                         <h3 className="text-lg font-semibold mb-2">Refactored Code</h3>
                         <div className="flex-1 border rounded-md overflow-hidden">
                         <Editor
                            height="100%"
                            language={language}
                            value={refactoredCode}
                            theme="vs-dark"
                            options={{ readOnly: false, minimap: { enabled: false } }}
                            onChange={(value) => setRefactoredCode(value || '')}
                        />
                        </div>
                    </div>
                </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply} disabled={isLoading || !!error}>
            Apply Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
