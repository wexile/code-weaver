
'use client';

import React from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { X } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { useTheme } from '@/hooks/use-theme';

type SettingsPanelProps = {
    onClose: () => void;
};

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
    const { theme, setTheme } = useTheme();

    return (
        <div className="w-80 border-l border-border bg-card text-card-foreground shadow-lg flex flex-col h-full absolute right-0 z-10">
            <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-semibold">Settings</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="w-4 h-4" />
                </Button>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-4 space-y-6">
                    <div className="space-y-2">
                        <h3 className="font-medium">Appearance</h3>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="theme-selector">Theme</Label>
                            <Select value={theme} onValueChange={setTheme}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select theme" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="ocean">Ocean</SelectItem>
                                    <SelectItem value="rose">Rose</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="icon-pack">Icon Pack</Label>
                             <Select defaultValue="default" disabled>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select icons" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default">Default Icons</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <h3 className="font-medium">Editor</h3>
                         <div className="flex items-center justify-between">
                            <Label htmlFor="word-wrap" className="flex flex-col space-y-1">
                                <span>Word Wrap</span>
                                <span className="font-normal leading-snug text-muted-foreground text-xs">
                                    Automatically wrap lines.
                                </span>
                            </Label>
                            <Switch id="word-wrap" defaultChecked disabled />
                        </div>
                        <div className="flex items-center justify-between">
                           <Label htmlFor="minimap" className="flex flex-col space-y-1">
                                <span>Minimap</span>
                                <span className="font-normal leading-snug text-muted-foreground text-xs">
                                   Show the code minimap.
                                </span>
                            </Label>
                            <Switch id="minimap" disabled />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <h3 className="font-medium">AI Assistant</h3>
                        <div className="flex items-center justify-between">
                             <Label htmlFor="ai-autocomplete" className="flex flex-col space-y-1">
                                <span>Autocomplete</span>
                                 <span className="font-normal leading-snug text-muted-foreground text-xs">
                                    Enable AI code completions.
                                </span>
                            </Label>
                            <Switch id="ai-autocomplete" disabled />
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
