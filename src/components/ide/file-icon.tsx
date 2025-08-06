
import { File, FileCode2, FileJson, FileText, Settings, Database, FileCode, FileImage, FileVideo, Music, Archive, Puzzle, TestTube, GitMerge, Lock, Key, Shield, Component, FileTerminal, Binary, Layout, Route, Info, FileArchive, FileAudio, FileBadge, FileBox, FileCheck, FileCog, FileDiff, FileDown, FileHeart, FileKey, FileLock, FileQuestion, FileSearch, FileSignature, FileSymlink, FileUp, FileVideo2, FileVolume, FileWarning, FileX, Files } from 'lucide-react';
import { useIcon } from '@/hooks/theme-provider';

// Using inline SVGs for language-specific icons for better visuals
const CSharpIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 9H8" />
        <path d="M16 15h-2" />
        <path d="M14 9h2" />
        <path d="M8 15h2" />
        <path d="M12 7v10" />
        <path d="M7 12h10" />
    </svg>
);
const CppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 10h-4a2 2 0 00-2 2v4a2 2 0 002 2h4" />
        <path d="M12 9v6" />
        <path d="M16 12h-4" />
        <path d="M10 15h4" />
        <path d="M10 9h4" />
    </svg>
);
const CIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 10h-4a2 2 0 00-2 2v4a2 2 0 002 2h4" />
    </svg>
);
const RustIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 12l-7-7" />
        <path d="M12 12l7 7" />
        <path d="M12 12l-7 7" />
        <path d="M12 12l7-7" />
        <path d="M10 9h4" />
    </svg>
);
const HtmlIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 10.5l-3 3-3-3"/><path d="M2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6"/><path d="M2 12l10-8 10 8"/></svg>
);
const CssIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12l-7-7"/><path d="M12 12l7 7"/><path d="M12 12l-7 7"/><path d="M12 12l7-7"/></svg>
);
const JsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 9h4"/><path d="M12 9v6"/><path d="M16 9a4 4 0 00-4-4H8a4 4 0 00-4 4v8a4 4 0 004 4h8a4 4 0 004-4v-3"/></svg>
);
const TsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V9"/><path d="M10 9h4"/><path d="M14 12h-4"/><rect x="2" y="2" width="20" height="20" rx="4"/></svg>
);
const PythonIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13.86 10.22c-.34-.76-.6-1.53-.74-2.33a3.5 3.5 0 10-4.24 4.24c.8.14 1.57.4 2.33.74"/><path d="M10.14 13.78c.34.76.6 1.53.74 2.33a3.5 3.5 0 104.24-4.24c-.8-.14-1.57-.4-2.33-.74"/><circle cx="12" cy="12" r="10"/></svg>
);


type FileIconProps = {
  filename: string;
  className?: string;
};

const defaultIcons: Record<string, (props: any) => JSX.Element> = {
    html: HtmlIcon,
    css: CssIcon,
    js: JsIcon,
    jsx: FileCode2,
    ts: TsIcon,
    tsx: TsIcon,
    py: PythonIcon,
    json: FileJson,
    md: FileText,
    toml: FileText,
    csproj: FileText,
    cs: CSharpIcon,
    'c++': CppIcon,
    cpp: CppIcon,
    h: CppIcon,
    c: CIcon,
    rs: RustIcon,
    db: Database,
    sqlite: Database,
    config: Settings,
    settings: Settings,
    yml: Settings,
    yaml: Settings,
    default: File,
};

const lucideIcons: Record<string, (props: any) => JSX.Element> = {
    html: FileCode,
    css: FileCode,
    js: FileCode,
    jsx: FileCode,
    ts: FileCode,
    tsx: FileCode,
    py: FileCode,
    json: FileJson,
    md: FileText,
    cs: FileCode,
    cpp: FileCode,
    c: FileCode,
    rs: FileCode,
    db: Database,
    sqlite: Database,
    jpg: FileImage,
    jpeg: FileImage,
    png: FileImage,
    gif: FileImage,
    svg: FileImage,
    mp4: FileVideo,
    mov: FileVideo,
    mp3: Music,
    wav: Music,
    zip: Archive,
    rar: Archive,
    '7z': Archive,
    'test.js': TestTube,
    'spec.js': TestTube,
    'test.ts': TestTube,
    'spec.ts': TestTube,
    lock: Lock,
    key: Key,
    LICENSE: Shield,
    component: Component,
    sh: FileTerminal,
    bash: FileTerminal,
    zsh: FileTerminal,
    bin: Binary,
    exe: Binary,
    dll: Binary,
    layout: Layout,
    route: Route,
    info: Info,
    log: FileText,
    gitignore: GitMerge,
    default: File,
};

// Placeholder for Material Icons using Lucide icons
const materialIcons: Record<string, (props: any) => JSX.Element> = {
    ...lucideIcons,
    html: FileBox,
    css: FileBox,
    js: FileBox,
    ts: FileBox,
    py: FileBox,
    zip: FileArchive,
    mp3: FileAudio,
    mp4: FileVideo2,
    default: FileBox,
};

// Placeholder for Font Awesome Icons using Lucide icons
const fontawesomeIcons: Record<string, (props: any) => JSX.Element> = {
    ...lucideIcons,
    html: FileCode,
    css: FileCode,
    js: FileCode,
    ts: FileCode,
    json: FileBadge,
    lock: FileLock,
    key: FileKey,
    default: FileQuestion,
};


const getIconSet = (pack: string) => {
    switch (pack) {
        case 'lucide':
            return lucideIcons;
        case 'material':
            return materialIcons;
        case 'fontawesome':
            return fontawesomeIcons;
        default:
            return defaultIcons;
    }
}

export default function FileIcon({ filename, className }: FileIconProps) {
  const { iconPack } = useIcon();
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  const iconSet = getIconSet(iconPack);

  let IconComponent;

  if (iconPack === 'lucide' && filename.includes('test')) {
    IconComponent = iconSet['test.js'];
  } else if (iconPack === 'lucide' && filename.includes('LICENSE')) {
    IconComponent = iconSet['LICENSE'];
  } else {
    IconComponent = iconSet[extension] || iconSet['default'];
  }
  
  const style = iconPack === 'default' && defaultIcons[extension] ? { color: getColorForExtension(extension) } : {};

  return <IconComponent className={className} style={style} />;
}

const getColorForExtension = (extension: string) => {
    switch (extension) {
        case 'html': return '#E34F26';
        case 'css': return '#1572B6';
        case 'js': return '#F7DF1E';
        case 'jsx': return '#61DAFB';
        case 'ts':
        case 'tsx': return '#3178C6';
        case 'py': return '#3776AB';
        case 'json': return '#F7DF1E';
        case 'cs': return '#A179D4';
        case 'cpp':
        case 'c++':
        case 'h': return '#00599C';
        case 'c': return '#A8B9CC';
        case 'rs': return '#DEA584';
        case 'db':
        case 'sqlite': return '#003B57';
        default: return undefined;
    }
}
