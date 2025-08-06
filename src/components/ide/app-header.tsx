import { Download, Save, LogOut, PanelLeft, LayoutDashboard, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '../ui/separator';
import { useRouter } from 'next/navigation';
import { LogoIcon } from '../icons/logo';
import { useSidebar } from '../ui/sidebar';

type AppHeaderProps = {
  projectName?: string;
  onDownload: () => void;
  onSave: () => void;
  onLogout: () => void;
  onToggleSettings: () => void;
};

export default function AppHeader({ projectName, onDownload, onSave, onLogout, onToggleSettings }: AppHeaderProps) {
  const router = useRouter();
  const { toggleSidebar } = useSidebar();
  
  return (
    <header className="flex items-center justify-between h-12 px-2 border-b border-border bg-card shadow-sm shrink-0">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8 md:hidden">
          <PanelLeft />
        </Button>
        <LogoIcon className="w-6 h-6 text-accent hidden sm:block" />
        <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />
        <h1 className="text-md font-semibold text-foreground truncate">
          {projectName || 'Code Weaver'}
        </h1>
      </div>
      <div className="flex items-center gap-2">
         <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="hidden sm:inline-flex">
            <LayoutDashboard className="mr-2" />
            Dashboard
        </Button>
        <Button variant="ghost" size="icon" onClick={onToggleSettings} className="h-8 w-8">
            <Settings />
        </Button>
        <Separator orientation="vertical" className="h-6 mx-1" />
        <Button variant="outline" size="sm" onClick={onSave} className="hidden sm:inline-flex">
          <Save className="mr-2" />
          Save
        </Button>
         <Button variant="outline" size="icon" onClick={onSave} className="h-8 w-8 sm:hidden">
            <Save />
        </Button>
        <Button variant="outline" size="sm" onClick={onDownload} className="hidden sm:inline-flex">
          <Download className="mr-2" />
          Download
        </Button>
        <Button variant="outline" size="icon" onClick={onDownload} className="h-8 w-8 sm:hidden">
            <Download />
        </Button>
        <Button variant="destructive" size="sm" onClick={onLogout}>
          <LogOut className="mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}
