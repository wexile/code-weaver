import { Download, Save, LogOut, LayoutDashboard, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '../ui/separator';
import { useRouter } from 'next/navigation';
import { LogoIcon } from '../icons/logo';
import { cn } from '@/lib/utils';

type AppHeaderProps = {
  projectName?: string;
  onDownload: () => void;
  onSave: () => void;
  onLogout: () => void;
  onToggleTerminal: () => void;
  isTerminalOpen: boolean;
};

export default function AppHeader({ projectName, onDownload, onSave, onLogout, onToggleTerminal, isTerminalOpen }: AppHeaderProps) {
  const router = useRouter();

  return (
    <header className="flex items-center justify-between h-12 px-4 border-b border-border bg-card shadow-sm shrink-0">
      <div className="flex items-center gap-2">
        <LogoIcon className="w-6 h-6 text-accent" />
        <Separator orientation="vertical" className="h-6" />
        <h1 className="text-lg font-semibold text-foreground truncate">
          {projectName || 'Code Weaver'}
        </h1>
      </div>
      <div className="flex items-center gap-2">
         <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
            <LayoutDashboard className="mr-2 h-4 w-4"/>
            Dashboard
        </Button>
        <Separator orientation="vertical" className="h-6" />
        <Button 
            variant="ghost" 
            size="sm"
            onClick={onToggleTerminal}
            className={cn(isTerminalOpen && 'bg-accent text-accent-foreground')}
            >
            <Terminal className="mr-2 h-4 w-4" />
            Terminal
        </Button>
        <Button variant="outline" size="sm" onClick={onSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Project
        </Button>
        <Button variant="outline" size="sm" onClick={onDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
        <Button variant="destructive" size="sm" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
}
