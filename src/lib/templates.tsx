
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

export interface ProjectTemplate {
    id: string;
    name: string;
    description: string;
    icon: string;
    files: Array<{
        name: string;
        content: string;
    }>;
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

export const projectTemplates: ProjectTemplate[] = [
    {
        id: 'react-vite',
        name: 'React App (Vite)',
        description: 'A basic React project setup with Vite.',
        icon: 'react,vite',
        files: [
            {
                name: 'index.html',
                content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`
            },
            {
                name: 'package.json',
                content: `{
  "name": "react-vite-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.3",
    "vite": "^4.4.5"
  }
}`
            },
            {
                name: 'src/main.jsx',
                content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`
            },
            {
                name: 'src/App.jsx',
                content: `function App() {
  return (
    <>
      <h1>Hello, React!</h1>
    </>
  )
}

export default App`
            }
        ]
    },
    {
        id: 'node-express',
        name: 'Node.js Express Server',
        description: 'A basic Express.js server.',
        icon: 'nodejs,express',
        files: [
            {
                name: 'package.json',
                content: `{
  "name": "express-server",
  "version": "1.0.0",
  "description": "",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}`
            },
            {
                name: 'server.js',
                content: `const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World from Express!');
});

app.listen(port, () => {
  console.log(\`Server listening at http://localhost:\${port}\`);
});`
            },
            {
                name: 'README.md',
                content: `# Express Server\n\nTo run this server, open the terminal and type:\n\n1. \`npm install\`\n2. \`npm start\`\n`
            }
        ]
    },
    {
        id: 'static-website',
        name: 'Static Website',
        description: 'A basic HTML, CSS, and JavaScript setup.',
        icon: 'html,css,js',
        files: [
            {
                name: 'index.html',
                content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Static Website</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <h1>Welcome to My Website</h1>
    <script src="js/script.js"></script>
</body>
</html>`
            },
            {
                name: 'css/style.css',
                content: `body {
    font-family: sans-serif;
    display: grid;
    place-items: center;
    height: 100vh;
    margin: 0;
}`
            },
            {
                name: 'js/script.js',
                content: `console.log("Website loaded!");`
            }
        ]
    }
];
