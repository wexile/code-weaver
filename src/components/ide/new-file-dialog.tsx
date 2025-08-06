
"use client"

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { languages } from "@/lib/templates";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type NewFileDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCreate: (name: string) => void;
};

// Simplified map for extensions
const languageExtensions: { [key: string]: string } = languages.reduce((acc, lang) => {
    const ext = lang.file.name.split('.').pop();
    if (ext) {
        acc[lang.id] = `.${ext}`;
    }
    return acc;
}, {} as { [key: string]: string });


export function NewFileDialog({ isOpen, onOpenChange, onCreate }: NewFileDialogProps) {
  const [fileName, setFileName] = useState("");
  const [selectedLang, setSelectedLang] = useState("js");
  const [customExtension, setCustomExtension] = useState("");

  useEffect(() => {
    // Reset state when dialog opens
    if (isOpen) {
      setFileName("");
      setSelectedLang("js");
      setCustomExtension("");
    }
  }, [isOpen]);

  const handleCreate = () => {
    if (!fileName.trim()) return;

    let finalFileName = fileName.trim();
    const extension = selectedLang === 'custom'
        ? (customExtension.startsWith('.') ? customExtension : `.${customExtension}`)
        : languageExtensions[selectedLang] || '';
    
    // Avoid double extension
    if (!finalFileName.endsWith(extension)) {
        finalFileName += extension;
    }

    onCreate(finalFileName);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New File</DialogTitle>
          <DialogDescription>
            Enter a name and choose a type for your new file.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file-name" className="text-right">
              Name
            </Label>
            <Input
              id="file-name"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., my-component"
              autoComplete="off"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="language" className="text-right">
              Type
            </Label>
            <Select value={selectedLang} onValueChange={setSelectedLang}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                    {languages.map(lang => (
                        <SelectItem key={lang.id} value={lang.id}>{lang.name} ({languageExtensions[lang.id]})</SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Extension</SelectItem>
                </SelectContent>
            </Select>
          </div>
          {selectedLang === 'custom' && (
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="custom-extension" className="text-right">
                    Extension
                </Label>
                <Input
                id="custom-extension"
                value={customExtension}
                onChange={(e) => setCustomExtension(e.target.value)}
                className="col-span-3"
                placeholder="e.g., .txt"
                autoComplete="off"
                />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreate} disabled={!fileName.trim() || (selectedLang === 'custom' && !customExtension.trim())}>Create File</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
