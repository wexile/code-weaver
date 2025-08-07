
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ExternalLink } from 'lucide-react';

type GeminiApiKeyDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};

export default function GeminiApiKeyDialog({ isOpen, onOpenChange }: GeminiApiKeyDialogProps) {
  
  const handleOpenLink = () => {
    window.open('https://ai.google.dev/gemini-api/docs/api-key', '_blank');
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Get your Gemini API Key</DialogTitle>
          <DialogDescription>
            To use the AI assistant features, you need a Gemini API key. Click the button below to open the official Google AI Studio page.
          </DialogDescription>
        </DialogHeader>
        <div className='py-4'>
            <p className='text-sm text-muted-foreground'>
                Please note: If you are in a region where Google AI services are restricted (e.g., Russia), you may need to use a VPN to access the site and obtain your key.
            </p>
             <p className='text-sm text-muted-foreground mt-2'>
                Once you have your key, go to the IDE, click the settings cog in the file explorer, and paste your key into the "Gemini AI" section.
            </p>
        </div>
        <DialogFooter className="sm:justify-center">
          <Button onClick={handleOpenLink}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Google AI Studio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
