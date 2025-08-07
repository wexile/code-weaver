
"use client";

import { File, FileCode2, FileJson, FileText, Settings, Database, FileCode, FileImage, FileVideo, Music, Archive, Puzzle, TestTube, GitMerge, Lock, Key, Shield, Component, FileTerminal, Binary, Layout, Route, Info, FileArchive, FileAudio, FileBadge, FileBox, FileCheck, FileCog, FileDiff, FileDown, FileHeart, FileKey, FileLock, FileQuestion, FileSearch, FileSignature, FileSymlink, FileUp, FileVideo2, FileVolume, FileWarning, FileX, Files } from 'lucide-react';
import { useIcon, useTheme } from '@/hooks/theme-provider';
import Image from 'next/image';

const skillIconMap: Record<string, string> = {
    html: 'html',
    css: 'css',
    js: 'js',
    jsx: 'react',
    ts: 'ts',
    tsx: 'react',
    py: 'py',
    json: 'json',
    md: 'md',
    toml: 'toml',
    csproj: 'cs',
    cs: 'cs',
    'c++': 'cpp',
    cpp: 'cpp',
    h: 'cpp',
    c: 'c',
    rs: 'rust',
    db: 'sqlite',
    sqlite: 'sqlite',
    config: 'settings',
    settings: 'settings',
    yml: 'yaml',
    yaml: 'yaml',
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

type FileIconProps = {
  filename: string;
  className?: string;
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
            return null; // For default, we will use skillicons.dev
    }
}

export default function FileIcon({ filename, className }: FileIconProps) {
  const { iconPack } = useIcon();
  const { theme } = useTheme();
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  
  if (iconPack === 'default') {
      const iconName = skillIconMap[extension];
      if (iconName) {
          const isDark = theme !== 'light';
          const iconUrl = `https://skillicons.dev/icons?i=${iconName}&theme=${isDark ? 'dark' : 'light'}`;
          return <Image src={iconUrl} alt={`${extension} icon`} width={24} height={24} className={className} unoptimized />;
      }
  }

  const iconSet = getIconSet(iconPack);
  if (!iconSet) { // Fallback for default if skill icon not found
      return <File className={className} />;
  }

  let IconComponent;
  if (iconPack === 'lucide' && filename.includes('test')) {
    IconComponent = iconSet['test.js'];
  } else if (iconPack === 'lucide' && filename.includes('LICENSE')) {
    IconComponent = iconSet['LICENSE'];
  } else {
    IconComponent = iconSet[extension] || iconSet['default'];
  }
  
  return <IconComponent className={className} />;
}
