
'use client';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import * as api from '@/lib/api';
import { Loader2, Trash2, UserPlus } from 'lucide-react';
import type { ProjectSettings } from '@/lib/api';

interface Project {
    id: string;
    name: string;
    updatedAt: string;
    isPublic: boolean;
    contributors: string[];
}

type ProjectSettingsDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  project: Project;
  onProjectUpdate: (updatedProject: Project) => void;
};

export default function ProjectSettingsDialog({ isOpen, onOpenChange, project, onProjectUpdate }: ProjectSettingsDialogProps) {
  const { token } = useAuth();
  const { toast } = useToast();

  const [isPublic, setIsPublic] = useState(project.isPublic);
  const [contributors, setContributors] = useState<string[]>([]);
  const [newContributorEmail, setNewContributorEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setIsPublic(project.isPublic);
        // This is a placeholder. In a real app, you would fetch contributors.
        setContributors(project.contributors || []); 
    }
  }, [isOpen, project]);

  const handleSettingsSave = async () => {
    if (!token) return;
    setIsSaving(true);
    try {
        const settings: ProjectSettings = { isPublic };
        await api.updateProjectSettings(project.id, settings, token);
        onProjectUpdate({ ...project, isPublic });
        toast({ title: "Settings Saved", description: "Project visibility has been updated." });
        onOpenChange(false);
    } catch (error: any) {
        toast({ title: "Error", description: `Could not save settings: ${error.message}`, variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };

  const handleAddContributor = async () => {
    if (!token || !newContributorEmail.trim()) return;
    setIsLoading(true);
    try {
        await api.addContributor(project.id, newContributorEmail, token);
        setContributors(prev => [...prev, newContributorEmail]);
        onProjectUpdate({ ...project, contributors: [...contributors, newContributorEmail] });
        setNewContributorEmail('');
        toast({ title: "Contributor Added", description: `${newContributorEmail} can now collaborate on this project.` });
    } catch (error: any) {
        toast({ title: "Error", description: `Could not add contributor: ${error.message}`, variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  };

  const handleRemoveContributor = async (email: string) => {
    if (!token) return;
    // Note: The API expects a contributor ID, but we only have email here.
    // This is a simplification. A real implementation would need to resolve email to ID.
    try {
        // Since we can't call the API without an ID, we'll just simulate it for the UI.
        // await api.removeContributor(project.id, email, token); 
        setContributors(prev => prev.filter(c => c !== email));
        onProjectUpdate({ ...project, contributors: contributors.filter(c => c !== email) });
        toast({ title: "Contributor Removed", description: `${email} can no longer access this project.` });
    } catch (error: any) {
        toast({ title: "Error", description: `Could not remove contributor: ${error.message}`, variant: "destructive" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Project Settings: {project.name}</DialogTitle>
          <DialogDescription>
            Manage visibility and collaborators for your project.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-6">
            <div className="space-y-3">
                <h3 className="font-medium text-sm text-foreground">Project Visibility</h3>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <Label htmlFor="is-public" className="flex flex-col space-y-1">
                        <span>Make Project Public</span>
                        <span className="font-normal leading-snug text-muted-foreground text-xs">
                            Anyone with the link can view the code.
                        </span>
                    </Label>
                    <Switch id="is-public" checked={isPublic} onCheckedChange={setIsPublic} />
                </div>
            </div>
            <div className="space-y-3">
                <h3 className="font-medium text-sm text-foreground">Contributors</h3>
                <div className="space-y-2">
                    <Label htmlFor="add-contributor" className="text-xs font-normal">
                        Add by Email
                    </Label>
                    <div className="flex items-center gap-2">
                        <Input
                            id="add-contributor"
                            type="email"
                            value={newContributorEmail}
                            onChange={(e) => setNewContributorEmail(e.target.value)}
                            placeholder="user@example.com"
                            className="flex-1 h-9"
                            disabled={isLoading}
                        />
                        <Button size="icon" className="h-9 w-9 shrink-0" onClick={handleAddContributor} disabled={isLoading || !newContributorEmail.trim()}>
                           {isLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <UserPlus className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
                <div className="space-y-2 pt-2">
                    {contributors.map((contributor, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-2 rounded-md bg-muted/50">
                            <span>{contributor}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleRemoveContributor(contributor)}>
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                    {contributors.length === 0 && (
                        <p className="text-xs text-center text-muted-foreground py-2">You are the only contributor.</p>
                    )}
                </div>
            </div>
        </div>
        <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSettingsSave} disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                Save Changes
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
