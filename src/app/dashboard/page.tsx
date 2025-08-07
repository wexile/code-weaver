
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { createProject, getProjects, deleteProject, getGithubRepoContents } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, LogOut, Trash2, ArrowUpDown, Search, Globe, X, Folder, File, Layers, Users, Settings, Github, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { languages, projectTemplates } from '@/lib/templates';
import FileIcon from '@/components/ide/file-icon';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ide/loading-spinner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LogoIcon } from '@/components/icons/logo';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PoweredBy } from '@/components/powered-by';
import Image from 'next/image';
import { useTheme } from '@/hooks/theme-provider';
import type { ProjectSettings } from '@/lib/api';
import ProjectSettingsDialog from '@/components/dashboard/project-settings-dialog';
import GeminiApiKeyDialog from '@/components/dashboard/gemini-api-dialog';
import { GeminiLogo } from '@/components/icons/gemini-logo';
import { useLocalization } from '@/hooks/use-localization';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { appLanguages } from '@/lib/locales';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import isUrl from 'is-url';

interface Project {
    id: string;
    name: string;
    updatedAt: string;
    isPublic: boolean;
    contributors: string[]; 
}

type SortKey = 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc';

const allTemplates = [
    ...projectTemplates.map(t => ({ ...t, type: 'project' as const })),
    ...languages.map(l => ({ ...l, type: 'language' as const, files: [l.file] }))
];

export default function DashboardPage() {
    const { user, token, logout, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isImporting, setIsImporting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('date-desc');
    const { theme } = useTheme();
    const { t, setLanguage, language } = useLocalization();
    
    // Dialog states
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
    const [isGeminiDialogOpen, setIsGeminiDialogOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    // Create dialog state
    const [newProjectName, setNewProjectName] = useState('');
    const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
    const [githubUrl, setGithubUrl] = useState('');


    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user && token) {
            const fetchProjects = async () => {
                setIsLoading(true);
                try {
                    const userProjects = await getProjects(token);
                    setProjects(userProjects);
                } catch (error: any) {
                    console.error('Failed to fetch projects', error);
                    toast({ title: 'Error', description: `Could not fetch your projects: ${error.message}`, variant: 'destructive' });
                    if (error.message.includes('401')) {
                        logout();
                        router.push('/login');
                    }
                } finally {
                    setIsLoading(false);
                }
            };
            fetchProjects();
        }
    }, [user, token, toast, logout, router]);
    
    const filteredAndSortedProjects = useMemo(() => {
        return projects
            .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => {
                switch(sortKey) {
                    case 'name-asc':
                        return a.name.localeCompare(b.name);
                    case 'name-desc':
                        return b.name.localeCompare(a.name);
                    case 'date-asc':
                        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
                    case 'date-desc':
                    default:
                        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                }
            });
    }, [projects, searchQuery, sortKey]);

    useEffect(() => {
        if (!isCreateDialogOpen) {
            setNewProjectName('');
            setSelectedTemplateIds([]);
            setGithubUrl('');
        }
    }, [isCreateDialogOpen]);

    const handleTemplateSelect = (templateId: string, templateType: 'project' | 'language') => {
        setSelectedTemplateIds(prev => {
            const isSelected = prev.includes(templateId);
            const selectedProjectTemplate = allTemplates.find(t => t.id === templateId && t.type === 'project');
            
            if (selectedProjectTemplate) {
                return isSelected ? [] : [templateId];
            } else {
                const hasProjectTemplate = prev.some(id => allTemplates.find(t => t.id === id && t.type === 'project'));
                if (hasProjectTemplate) {
                    return [templateId];
                } else {
                    return isSelected
                        ? prev.filter(id => id !== templateId)
                        : [...prev, templateId];
                }
            }
        });
    };

    const handleCreateProject = async () => {
        if (!newProjectName.trim() || !token) {
            toast({ title: t.toast_error_title, description: t.dashboard_create_project_error_name, variant: 'destructive' });
            return;
        }

        try {
            let files: { name: string; content: string }[] = [];
            if (selectedTemplateIds.length > 0) {
                 const selectedTemplates = allTemplates.filter(t => selectedTemplateIds.includes(t.id));
                 files = selectedTemplates.flatMap(t => t.files.map(f => ({ name: f.name, content: f.content })));
            } else {
                 files.push({ name: 'index.js', content: 'console.log("Hello, World!");' });
            }

            const newProjectData = { name: newProjectName, files };
            const newProject = await createProject(newProjectData, token);

            setProjects(prev => [...prev, newProject]);
            toast({ title: t.toast_success_title, description: `${t.dashboard_create_project_success} "${newProjectName}".` });
            setIsCreateDialogOpen(false);
            router.push(`/?projectId=${newProject.id}`);
        } catch (error) {
            console.error('Failed to create project', error);
            toast({ title: t.toast_error_title, description: t.dashboard_create_project_error, variant: 'destructive' });
        }
    };

    const handleImportProject = async () => {
        if (!token) return;
        if (!isUrl(githubUrl)) {
            toast({ title: "Invalid URL", description: "Please enter a valid GitHub repository URL.", variant: "destructive" });
            return;
        }

        const urlParts = githubUrl.replace('https://github.com/', '').split('/');
        if (urlParts.length < 2) {
            toast({ title: "Invalid URL", description: "The URL must be in the format https://github.com/owner/repo.", variant: "destructive" });
            return;
        }
        
        const owner = urlParts[0];
        const repo = urlParts[1].replace('.git', '');
        
        setIsImporting(true);
        toast({ title: "Importing Repository", description: `Fetching '${repo}' from GitHub. This may take a moment...`});

        try {
            const files: { name: string; content: string }[] = [];
            
            const fetchContents = async (path: string) => {
                const contents = await getGithubRepoContents(owner, repo, path);
                for (const item of contents) {
                    if (item.type === 'file') {
                        // The content is Base64 encoded, so we need to fetch it and decode.
                        const fileResponse = await fetch(item.download_url);
                        const content = await fileResponse.text();
                        files.push({ name: item.path, content });
                    } else if (item.type === 'dir') {
                        await fetchContents(item.path);
                    }
                }
            };

            await fetchContents('');

            if (files.length === 0) {
                toast({ title: "Empty Repository", description: "Could not find any files in this repository.", variant: 'destructive' });
                setIsImporting(false);
                return;
            }

            const newProjectData = { name: repo, files };
            const newProject = await createProject(newProjectData, token);

            setProjects(prev => [...prev, newProject]);
            toast({ title: "Import Successful", description: `Project "${repo}" has been created.` });
            setIsCreateDialogOpen(false);
            router.push(`/?projectId=${newProject.id}`);

        } catch (error: any) {
             toast({ title: "Import Failed", description: `Could not import repository: ${error.message}`, variant: "destructive" });
        } finally {
            setIsImporting(false);
        }
    }
    
    const handleDeleteProject = async (projectId: string) => {
        if (!token) return;
        try {
            await deleteProject(projectId, token);
            setProjects(prev => prev.filter(p => p.id !== projectId));
            toast({ title: t.toast_success_title, description: t.dashboard_delete_project_success });
        } catch (error: any) {
            console.error('Failed to delete project', error);
            toast({ title: t.toast_error_title, description: `${t.dashboard_delete_project_error}: ${error.message}`, variant: 'destructive' });
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
        toast({ title: t.toast_logged_out_title, description: t.toast_logged_out_desc });
    };

    const handleOpenSettings = (project: Project) => {
        setSelectedProject(project);
        setIsSettingsDialogOpen(true);
    };

    const onProjectUpdate = (updatedProject: Project) => {
        setProjects(prevProjects => prevProjects.map(p => p.id === updatedProject.id ? updatedProject : p));
    };

    if (authLoading || isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <LoadingSpinner text={t.dashboard_loading} />
            </div>
        );
    }
    
    return (
        <>
            {selectedProject && (
                 <ProjectSettingsDialog
                    isOpen={isSettingsDialogOpen}
                    onOpenChange={setIsSettingsDialogOpen}
                    project={selectedProject}
                    onProjectUpdate={onProjectUpdate}
                />
            )}
            <GeminiApiKeyDialog
                isOpen={isGeminiDialogOpen}
                onOpenChange={setIsGeminiDialogOpen}
            />
            <div className="flex min-h-screen flex-col bg-background">
                <header className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-border shrink-0">
                    <div className="flex items-center gap-3">
                        <LogoIcon className="w-8 h-8 text-primary" />
                        <h1 className="text-xl font-bold">{t.dashboard_title}</h1>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <span className="text-sm text-muted-foreground hidden sm:inline">{t.dashboard_welcome}, {user?.username}</span>
                        <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger className="w-[120px] h-9 text-xs">
                                <SelectValue placeholder="Language" />
                            </SelectTrigger>
                            <SelectContent>
                                {appLanguages.map(lang => (
                                    <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={() => setIsGeminiDialogOpen(true)}>
                            <GeminiLogo className="mr-2 h-4 w-4"/> {t.dashboard_get_gemini_key}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => window.open('https://cweaver.vercel.app', '_blank')}>
                            <Globe className="mr-2 h-4 w-4"/> {t.dashboard_website}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4"/> {t.dashboard_logout}</Button>
                    </div>
                </header>
                <main className="flex-1 p-4 sm:p-6 flex flex-col">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                        <h2 className="text-2xl font-semibold self-start">{t.dashboard_projects_title}</h2>
                        <div className="flex w-full sm:w-auto items-center gap-2">
                            <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                    placeholder={t.dashboard_search_placeholder}
                                    className="pl-10 w-full sm:w-64"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6" onClick={() => setSearchQuery('')}><X className="h-4 w-4"/></Button>}
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <ArrowUpDown className="mr-2 h-4 w-4" /> {t.dashboard_sort}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setSortKey('date-desc')}>{t.dashboard_sort_newest}</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortKey('date-asc')}>{t.dashboard_sort_oldest}</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortKey('name-asc')}>{t.dashboard_sort_name_asc}</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortKey('name-desc')}>{t.dashboard_sort_name_desc}</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button variant="secondary" onClick={() => router.push('/public')}>
                            <Users className="mr-2 h-4 w-4" /> {t.dashboard_public_projects}
                            </Button>

                            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="shrink-0">
                                        <PlusCircle className="mr-2 h-4 w-4" /> {t.dashboard_new_project}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-xl">
                                    <DialogHeader>
                                        <DialogTitle>{t.dashboard_create_modal_title}</DialogTitle>
                                        <DialogDescription>Create a project from scratch, use a template, or import from GitHub.</DialogDescription>
                                    </DialogHeader>
                                    <Tabs defaultValue="scratch" className="w-full">
                                        <TabsList className="grid w-full grid-cols-3">
                                            <TabsTrigger value="scratch">From Scratch</TabsTrigger>
                                            <TabsTrigger value="template">From Template</TabsTrigger>
                                            <TabsTrigger value="github">From GitHub</TabsTrigger>
                                        </TabsList>
                                        <TabsContent value="scratch" className="py-4">
                                            <div className="space-y-4">
                                                <p className="text-sm text-muted-foreground">Start with a single empty file.</p>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="name-scratch" className="text-right">Name</Label>
                                                    <Input id="name-scratch" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} className="col-span-3" placeholder={t.dashboard_create_modal_name_placeholder} />
                                                </div>
                                            </div>
                                             <DialogFooter className='pt-6'>
                                                <Button onClick={handleCreateProject} disabled={!newProjectName.trim()}>Create Blank Project</Button>
                                            </DialogFooter>
                                        </TabsContent>
                                        <TabsContent value="template" className="py-4">
                                             <div className="space-y-2">
                                                <Label htmlFor="name-template">Project Name</Label>
                                                <Input id="name-template" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder={t.dashboard_create_modal_name_placeholder} />
                                            </div>
                                            <ScrollArea className="max-h-80 my-4 pr-4">
                                                <div className="space-y-4">
                                                    <div>
                                                        <h3 className="font-semibold mb-2 text-foreground flex items-center gap-2"><Layers className="w-4 h-4"/> {t.dashboard_template_modal_projects}</h3>
                                                        <div className="grid grid-cols-4 gap-2 pt-2">
                                                            {projectTemplates.map(template => (
                                                                <button key={template.id} onClick={() => handleTemplateSelect(template.id, 'project')} className={cn("flex flex-col items-center justify-center gap-2 p-2 rounded-lg border-2 transition-colors h-24 text-center", selectedTemplateIds.includes(template.id) ? 'border-primary bg-primary/10' : 'border-border hover:border-accent hover:bg-accent/50')}>
                                                                    <Image src={`https://skillicons.dev/icons?i=${template.icon}&theme=${theme === 'light' ? 'light' : 'dark'}`} alt={`${template.name} icons`} width={48} height={48} className="h-12 w-12" unoptimized />
                                                                    <span className="text-xs font-medium">{template.name}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold mb-2 text-foreground flex items-center gap-2"><File className="w-4 h-4"/> {t.dashboard_template_modal_files}</h3>
                                                        <div className="grid grid-cols-5 gap-2 pt-2">
                                                            {languages.map(lang => (
                                                                <button key={lang.id} onClick={() => handleTemplateSelect(lang.id, 'language')} className={cn("flex flex-col items-center justify-center gap-2 p-2 rounded-lg border-2 transition-colors h-24", selectedTemplateIds.includes(lang.id) ? 'border-primary bg-primary/10' : 'border-border hover:border-accent hover:bg-accent/50')}>
                                                                    <FileIcon filename={lang.file.name} className="w-6 h-6"/>
                                                                    <span className="text-xs font-medium text-center">{lang.name}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </ScrollArea>
                                            <DialogFooter>
                                                <Button type="submit" onClick={handleCreateProject} disabled={!newProjectName.trim() || selectedTemplateIds.length === 0}>{t.dashboard_create_modal_create_button}</Button>
                                            </DialogFooter>
                                        </TabsContent>
                                        <TabsContent value="github" className="py-4">
                                             <div className="space-y-4">
                                                <p className="text-sm text-muted-foreground">Import a public repository from GitHub.</p>
                                                <div className="space-y-2">
                                                    <Label htmlFor="github-url">GitHub Repository URL</Label>
                                                    <div className='flex items-center gap-2'>
                                                        <Github className='w-4 h-4 text-muted-foreground'/>
                                                        <Input id="github-url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} placeholder="https://github.com/user/repo" />
                                                    </div>
                                                </div>
                                            </div>
                                            <DialogFooter className='pt-6'>
                                                <Button onClick={handleImportProject} disabled={isImporting || !githubUrl.trim()}>
                                                    {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                                    {isImporting ? 'Importing...' : 'Import Project'}
                                                </Button>
                                            </DialogFooter>
                                        </TabsContent>
                                    </Tabs>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {filteredAndSortedProjects.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredAndSortedProjects.map(project => (
                                <Card key={project.id}>
                                    <CardHeader className="flex flex-row items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="truncate" title={project.name}>{project.name}</CardTitle>
                                            <CardDescription>
                                                {t.dashboard_project_last_updated}: {new Date(project.updatedAt).toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="shrink-0" onClick={() => handleOpenSettings(project)}>
                                                <Settings className="h-4 w-4" />
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive-foreground hover:bg-destructive shrink-0">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                    <AlertDialogTitle>{t.dashboard_delete_modal_title}</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {t.dashboard_delete_modal_desc}
                                                    </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                    <AlertDialogCancel>{t.dashboard_delete_modal_cancel}</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleDeleteProject(project.id)}
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        {t.dashboard_delete_modal_confirm}
                                                    </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </CardHeader>
                                    <CardFooter>
                                        <Button className="w-full" onClick={() => router.push(`/?projectId=${project.id}`)}>{t.dashboard_project_open}</Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
                            <p className="text-muted-foreground">{searchQuery ? t.dashboard_no_projects_search : t.dashboard_no_projects_yet}</p>
                            {!searchQuery && <p className="text-muted-foreground">{t.dashboard_no_projects_yet_tip}</p>}
                        </div>
                    )}
                    <div className="mt-auto pt-8">
                        <PoweredBy />
                    </div>
                </main>
            </div>
        </>
    );
}
