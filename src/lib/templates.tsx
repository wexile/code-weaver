
import { nanoid } from 'nanoid';
import { type FolderNode, type FileSystemNode } from './file-system';
import React from 'react';

// Simplified structure for individual languages
export interface Language {
    id: string;
    name: string;
    description: string;
    file: {
        name: string;
        content: string;
    }
}

// A recursive function to build the file system tree, assigning unique IDs and paths.
const buildTree = (
    items: (Omit<FileSystemNode, 'id' | 'path' | 'children' | 'language' | 'content'> & { content?: string })[],
    pathPrefix = 'root',
    contentMap: Map<string, string>
): FileSystemNode[] => {
    const getLanguageFromExtension = (filename: string): string => {
        const extension = filename.split('.').pop()?.toLowerCase() || '';
        const map: { [key: string]: string } = {
          'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',
          'py': 'python', 'rs': 'rust', 'cpp': 'cpp', 'c': 'c', 'h': 'c', 'cs': 'csharp',
          'html': 'html', 'css': 'css', 'json': 'json', 'md': 'markdown',
        };
        return map[extension] || 'plaintext';
      };

    return items.map(item => {
        const id = nanoid();
        const path = `${pathPrefix}/${item.name}`;
        if (item.type === 'file') {
            const content = item.content || '';
            contentMap.set(id, content);
            return {
                ...item,
                id,
                path,
                language: getLanguageFromExtension(item.name),
                content,
            } as FileSystemNode;
        }
        // This is for folders, which have children to recurse through
        return {
            ...item,
            id,
            path,
            children: 'children' in item && Array.isArray(item.children) ? buildTree(item.children, path, contentMap) : [],
        } as FileSystemNode;
    });
};

export const languages: Language[] = [
    {
        id: 'html',
        name: 'HTML5',
        description: 'Web pages',
        file: { name: 'index.html', content: `<!DOCTYPE html>\n<html>\n<body>\n  <h1>Hello, World!</h1>\n</body>\n</html>` }
    },
    {
        id: 'css',
        name: 'CSS3',
        description: 'Styling',
        file: { name: 'style.css', content: `body {\n  font-family: sans-serif;\n}` }
    },
    {
        id: 'js',
        name: 'JavaScript',
        description: 'Web logic',
        file: { name: 'script.js', content: `console.log('Hello, World!');` }
    },
    {
        id: 'ts',
        name: 'TypeScript',
        description: 'Typed JS',
        file: { name: 'main.ts', content: `const message: string = 'Hello, World!';\nconsole.log(message);` }
    },
    {
        id: 'python',
        name: 'Python',
        description: 'Scripting',
        file: { name: 'main.py', content: `def hello():\n    print("Hello, Python!")\n\nhello()` }
    },
    {
        id: 'cpp',
        name: 'C++',
        description: 'Systems',
        file: { name: 'main.cpp', content: `#include <iostream>\n\nint main() {\n    std::cout << "Hello, World!" << std::endl;\n    return 0;\n}` }
    },
    {
        id: 'csharp',
        name: 'C#',
        description: 'Web & apps',
        file: { name: 'Program.cs', content: `System.Console.WriteLine("Hello, World!");` }
    },
    {
        id: 'c',
        name: 'C',
        description: 'Low-level',
        file: { name: 'main.c', content: `#include <stdio.h>\n\nint main() {\n   printf("Hello, World!");\n   return 0;\n}` }
    },
    {
        id: 'rust',
        name: 'Rust',
        description: 'Performance',
        file: { name: 'main.rs', content: `fn main() {\n    println!("Hello, World!");\n}` }
    },
];

export const generateProjectFromLanguages = (languageIds: string[], projectName: string): { fileTree: FolderNode, initialContent: Map<string, string> } => {
    const selectedLanguages = languages.filter(lang => languageIds.includes(lang.id));

    if (selectedLanguages.length === 0) {
        // Fallback to an empty project if none are selected
        return { 
            fileTree: { id: 'root', name: projectName, type: 'folder', path: 'root', children: [] },
            initialContent: new Map()
        };
    }

    const filesToCreate = selectedLanguages.map(lang => ({
        name: lang.file.name,
        type: 'file',
        content: lang.file.content
    }));

    const contentMap = new Map<string, string>();
    const children = buildTree(filesToCreate as any, 'root', contentMap);

    const fileTree: FolderNode = {
        id: 'root',
        name: projectName,
        type: 'folder',
        path: 'root',
        children: children,
    };
    
    return { fileTree, initialContent: contentMap };
};
