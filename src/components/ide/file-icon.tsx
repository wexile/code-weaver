import { File, FileCode2, FileJson, FileText, Settings, Database } from 'lucide-react';

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

export default function FileIcon({ filename, className }: FileIconProps) {
  const extension = filename.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'html':
      return <HtmlIcon className={className} style={{ color: '#E34F26' }} />;
    case 'css':
      return <CssIcon className={className} style={{ color: '#1572B6' }} />;
    case 'js':
      return <JsIcon className={className} style={{ color: '#F7DF1E' }} />;
    case 'jsx':
      return <FileCode2 className={className} style={{ color: '#61DAFB' }} />; // React icon
    case 'ts':
    case 'tsx':
      return <TsIcon className={className} style={{ color: '#3178C6' }} />;
    case 'py':
      return <PythonIcon className={className} style={{ color: '#3776AB' }} />;
    case 'json':
      return <FileJson className={className} style={{ color: '#F7DF1E' }} />;
    case 'md':
    case 'toml':
    case 'csproj':
      return <FileText className={className} />;
    case 'cs':
      return <CSharpIcon className={className} style={{ color: '#A179D4' }} />;
    case 'cpp':
    case 'c++':
    case 'h':
        return <CppIcon className={className} style={{ color: '#00599C' }} />;
    case 'c':
        return <CIcon className={className} style={{ color: '#A8B9CC' }} />;
    case 'rs':
        return <RustIcon className={className} style={{ color: '#DEA584' }} />;
    case 'db':
    case 'sqlite':
        return <Database className={className} style={{ color: '#003B57' }} />;
    case 'config':
    case 'settings':
    case 'yml':
    case 'yaml':
        return <Settings className={className} />;
    default:
      return <File className={className} />;
  }
}
