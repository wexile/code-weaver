
'use client';

import React from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { X } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { useTheme, useIcon } from '@/hooks/theme-provider';
import { useEditorSettings } from '@/hooks/editor-settings-provider';

type SettingsPanelProps = {
    onClose: () => void;
};

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
    const { theme, setTheme } = useTheme();
    const { iconPack, setIconPack } = useIcon();
    const { wordWrap, setWordWrap, minimapEnabled, setMinimapEnabled } = useEditorSettings();
    
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
                                    <div className="grid grid-cols-2 gap-1">
                                        <SelectItem value="dark">Dark</SelectItem>
                                        <SelectItem value="light">Light</SelectItem>
                                        <SelectItem value="ocean">Ocean</SelectItem>
                                        <SelectItem value="rose">Rose</SelectItem>
                                        <SelectItem value="solarized-dark">Solarized Dark</SelectItem>
                                        <SelectItem value="monokai">Monokai</SelectItem>
                                        <SelectItem value="cobalt">Cobalt</SelectItem>
                                    </div>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="icon-pack">Icon Pack</Label>
                             <Select value={iconPack} onValueChange={setIconPack}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select icons" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="default">Default</SelectItem>
                                    <SelectItem value="lucide">Lucide Icons</SelectItem>
                                    <SelectItem value="material">Material Icons</SelectItem>
                                    <SelectItem value="fontawesome">Font Awesome</SelectItem>
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
                            <Switch id="word-wrap" checked={wordWrap} onCheckedChange={setWordWrap} />
                        </div>
                        <div className="flex items-center justify-between">
                           <Label htmlFor="minimap" className="flex flex-col space-y-1">
                                <span>Minimap</span>
                                <span className="font-normal leading-snug text-muted-foreground text-xs">
                                   Show the code minimap.
                                </span>
                            </Label>
                            <Switch id="minimap" checked={minimapEnabled} onCheckedChange={setMinimapEnabled} />
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
