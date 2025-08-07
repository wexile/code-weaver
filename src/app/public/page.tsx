
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as api from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ide/loading-spinner';
import { Input } from '@/components/ui/input';
import { Search, Globe, ArrowLeft, X } from 'lucide-react';
import { PoweredBy } from '@/components/powered-by';
import { useLocalization } from '@/hooks/use-localization';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { appLanguages } from '@/lib/locales';

interface PublicProject {
  id: string;
  name: string;
  updatedAt: string;
  owner: { // Assuming the server will provide owner info
      username: string;
  };
}

export default function PublicProjectsPage() {
    const { token } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [projects, setProjects] = useState<PublicProject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { t, language, setLanguage } = useLocalization();

    useEffect(() => {
        const fetchPublicProjects = async () => {
            setIsLoading(true);
            try {
                const publicProjects = await api.getPublicProjects();
                setProjects(publicProjects);
            } catch (error: any) {
                console.error('Failed to fetch public projects', error);
                toast({ title: t.toast_error_title, description: error.message, variant: 'destructive' });
            } finally {
                setIsLoading(false);
            }
        };
        fetchPublicProjects();
    }, [toast, t]);
    
    const filteredProjects = projects.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.owner.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleOpenProject = (projectId: string) => {
        if (!token) {
            toast({ title: t.toast_error_title, description: "You must be logged in to open a project.", variant: 'destructive' });
            router.push('/login');
            return;
        }
        router.push(`/?projectId=${projectId}`);
    };

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <LoadingSpinner text={t.public_projects_loading} />
            </div>
        );
    }
    
    return (
        <div className="flex min-h-screen flex-col bg-background">
             <header className="flex items-center justify-between h-16 px-4 sm:px-6 border-b border-border shrink-0">
                <div className="flex items-center gap-3">
                    <Globe className="w-8 h-8 text-primary" />
                    <h1 className="text-xl font-bold">{t.public_projects_title}</h1>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
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
                    <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
                       <ArrowLeft className="mr-2 h-4 w-4"/> {t.public_projects_go_back}
                    </Button>
                </div>
            </header>
            <main className="flex-1 p-4 sm:p-6 flex flex-col">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <p className="text-muted-foreground self-start">{t.public_projects_desc}</p>
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input 
                                placeholder={t.public_projects_search_placeholder}
                                className="pl-10 w-full sm:w-64"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                        />
                         {searchQuery && <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6" onClick={() => setSearchQuery('')}><X className="h-4 w-4"/></Button>}
                    </div>
                </div>

                 {filteredProjects.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredProjects.map(project => (
                            <Card key={project.id}>
                                <CardHeader>
                                    <CardTitle className="truncate" title={project.name}>{project.name}</CardTitle>
                                    <CardDescription>
                                        {t.public_projects_by_author} <span className="font-medium text-foreground">{project.owner.username}</span>
                                    </CardDescription>
                                </CardHeader>
                                <CardFooter>
                                    <Button className="w-full" onClick={() => handleOpenProject(project.id)}>{t.public_projects_open}</Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 border-2 border-dashed border-border rounded-lg">
                        <p className="text-muted-foreground">{t.public_projects_no_projects}</p>
                    </div>
                )}
                 <div className="mt-auto pt-8">
                    <PoweredBy />
                </div>
            </main>
        </div>
    );
}

