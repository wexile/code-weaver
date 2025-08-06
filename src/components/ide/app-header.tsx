import { Code2, Download, Save, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '../ui/separator';
import { useRouter } from 'next/navigation';

type AppHeaderProps = {
  onDownload: () => void;
  onSave: () => void;
  onLogout: () => void;
};

export default function AppHeader({ onDownload, onSave, onLogout }: AppHeaderProps) {
  const router = useRouter();
  
  return (
    <header className="flex items-center justify-between h-12 px-4 border-b border-border bg-card shadow-sm shrink-0">
      <div className="flex items-center gap-2">
        <Code2 className="w-6 h-6 text-accent" />
        <h1 className="text-lg font-semibold text-foreground">
          Code Weaver
        </h1>
        <Separator orientation="vertical" className="h-6 mx-2" />
        <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>Dashboard</Button>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onSave}>
          <Save className="mr-2" />
          Save Project
        </Button>
        <Button variant="outline" size="sm" onClick={onDownload}>
          <Download className="mr-2" />
          Download Project
        </Button>
        <Button variant="destructive" size="sm" onClick={onLogout}>
          <LogOut className="mr-2" />
          Logout
        </Button>
      </div>
    </header>
  );
}
