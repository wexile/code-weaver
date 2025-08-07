
'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { createProject, getProjects, deleteProject } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, LogOut, Trash2, ArrowLeft, ArrowUpDown, Search, Globe, X } from 'lucide-react';
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
import { languages } from '@/lib/templates';
import FileIcon from '@/components/ide/file-icon';
import { cn } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ide/loading-spinner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LogoIcon } from '@/components/icons/logo';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { PoweredBy } from '@/components/powered-by';


interface Project {
    id: string;
    name: string;
    updatedAt: string;
}

type CreationStep = 'name' | 'languages';
type SortKey = 'name-asc' | 'name-desc' | 'date-asc' | 'date-desc';

export default function DashboardPage() {
    const { user, token, logout, loading: authLoading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('date-desc');
    
    // State for the creation dialog
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [creationStep, setCreationStep] = useState<CreationStep>('name');
    const [newProjectName, setNewProjectName] = useState('');
    const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);


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

    // Reset dialog state when it's closed
    useEffect(() => {
        if (!isCreateDialogOpen) {
            setCreationStep('name');
            setNewProjectName('');
            setSelectedLanguages([]);
        }
    }, [isCreateDialogOpen]);

    const handleLanguageSelect = (langId: string) => {
        setSelectedLanguages(prev =>
            prev.includes(langId)
                ? prev.filter(id => id !== langId)
                : [...prev, langId]
        );
    };

    const handleCreateProject = async (skipLanguageSelection = false) => {
        if (!newProjectName.trim() || !token) {
            toast({ title: 'Error', description: 'Project name cannot be empty.', variant: 'destructive' });
            return;
        }

        try {
            const files = skipLanguageSelection ? [] : languages
                .filter(lang => selectedLanguages.includes(lang.id))
                .map(lang => ({
                    name: lang.file.name,
                    content: lang.file.content
                }));
            
            // Add a default file if no name is given but the creation is triggered.
            if (files.length === 0 && selectedLanguages.length === 0) {
                files.push({ name: 'index.js', content: 'console.log("Hello, World!");' });
            }

            const newProjectData = {
                name: newProjectName,
                files: files
            };

            const newProject = await createProject(newProjectData, token);
            setProjects(prev => [...prev, newProject]);
            toast({ title: 'Success', description: `Project "${newProjectName}" created.` });
            setIsCreateDialogOpen(false); // Close dialog on success
            router.push(`/?projectId=${newProject.id}`);
        } catch (error) {
            console.error('Failed to create project', error);
            toast({ title: 'Error', description: 'Could not create the project.', variant: 'destructive' });
        }
    };
    
    const handleDeleteProject = async (projectId: string) => {
        if (!token) return;
        try {
            await deleteProject(projectId, token);
            setProjects(prev => prev.filter(p => p.id !== projectId));
            toast({ title: 'Success', description: 'Project deleted successfully.' });
        } catch (error: any) {
            console.error('Failed to delete project', error);
            toast({ title: 'Error', description: `Could not delete the project: ${error.message}`, variant: 'destructive' });
        }
    };

    const handleLogout = () => {
        logout();
        router.push('/login');
        toast({ title: "Logged Out", description: "You have been successfully logged out." });
    };

    if (authLoading || isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <LoadingSpinner text="Loading dashboard..." />
            </div>
        );
    }
    
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-border shrink-0">
                <div className="flex items-center gap-3">
                    <LogoIcon className="w-8 h-8 text-primary" />
                    <h1 className="text-xl font-bold">Dashboard</h1>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <span className="text-sm text-muted-foreground hidden sm:inline">Welcome, {user?.username}</span>
                     <Button variant="outline" size="sm" onClick={() => window.open('https://cweaver.vercel.app', '_blank')}>
                        <Globe className="mr-2 h-4 w-4"/> Website
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleLogout}><LogOut className="mr-2 h-4 w-4"/> Logout</Button>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 flex flex-col">
                 <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-semibold self-start">Your Projects</h2>
                    <div className="flex w-full sm:w-auto items-center gap-2">
                        <div className="relative w-full sm:w-auto">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                           <Input 
                                placeholder="Search projects..."
                                className="pl-10 w-full sm:w-64"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                           />
                           {searchQuery && <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6" onClick={() => setSearchQuery('')}><X className="h-4 w-4"/></Button>}
                        </div>

                         <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    <ArrowUpDown className="mr-2 h-4 w-4" /> Sort
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSortKey('date-desc')}>Newest First</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSortKey('date-asc')}>Oldest First</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSortKey('name-asc')}>Name (A-Z)</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSortKey('name-desc')}>Name (Z-A)</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="shrink-0">
                                    <PlusCircle className="mr-2 h-4 w-4" /> New
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                {creationStep === 'name' && (
                                    <>
                                        <DialogHeader>
                                            <DialogTitle>Create New Project</DialogTitle>
                                            <DialogDescription>
                                                First, give your new project a name.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="name" className="text-right">
                                                    Name
                                                </Label>
                                                <Input
                                                    id="name"
                                                    value={newProjectName}
                                                    onChange={(e) => setNewProjectName(e.target.value)}
                                                    className="col-span-3"
                                                    placeholder="My Awesome Project"
                                                    autoFocus
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                             <Button variant="outline" onClick={() => handleCreateProject(true)} disabled={!newProjectName.trim()}>Skip and Create</Button>
                                            <Button onClick={() => setCreationStep('languages')} disabled={!newProjectName.trim()}>Next</Button>
                                        </DialogFooter>
                                    </>
                                )}
                                 {creationStep === 'languages' && (
                                    <>
                                        <DialogHeader>
                                            <div className="flex items-center gap-2">
                                               <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setCreationStep('name')}>
                                                    <ArrowLeft className="h-4 w-4" />
                                                </Button>
                                                <div>
                                                    <DialogTitle>Choose Templates (Optional)</DialogTitle>
                                                    <DialogDescription>
                                                        Select templates to start with.
                                                    </DialogDescription>
                                                </div>
                                            </div>
                                        </DialogHeader>
                                        <ScrollArea className="max-h-48 my-4 pr-4">
                                            <div className="grid grid-cols-4 gap-2 pt-2">
                                                {languages.map(lang => (
                                                    <button 
                                                        key={lang.id}
                                                        onClick={() => handleLanguageSelect(lang.id)}
                                                        className={cn(
                                                            "flex flex-col items-center justify-center gap-2 p-2 rounded-lg border-2 transition-colors h-20",
                                                            selectedLanguages.includes(lang.id) 
                                                                ? 'border-primary bg-primary/10' 
                                                                : 'border-border hover:border-accent hover:bg-accent/50'
                                                        )}
                                                    >
                                                        <FileIcon filename={lang.file.name} className="w-6 h-6"/>
                                                        <span className="text-xs font-medium text-center">{lang.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                        <DialogFooter>
                                            <Button type="submit" onClick={() => handleCreateProject(false)}>Create Project</Button>
                                        </DialogFooter>
                                    </>
                                )}
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
                                            Last updated: {new Date(project.updatedAt).toLocaleDateString()}
                                        </CardDescription>
                                    </div>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive-foreground hover:bg-destructive shrink-0">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete your
                                                project and remove your data from our servers.
                                            </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDeleteProject(project.id)}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardHeader>
                                <CardFooter>
                                    <Button className="w-full" onClick={() => router.push(`/?projectId=${project.id}`)}>Open Project</Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
                        <p className="text-muted-foreground">{searchQuery ? 'No projects match your search.' : "You don't have any projects yet."}</p>
                        {!searchQuery && <p className="text-muted-foreground">Click &quot;New&quot; to get started.</p>}
                    </div>
                )}
                 <div className="mt-auto pt-8">
                    <PoweredBy />
                </div>
            </main>
        </div>
    );
}
