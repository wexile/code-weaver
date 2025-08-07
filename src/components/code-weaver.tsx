
"use client";

import React, { useState, useCallback, useEffect } from "react";
import AppHeader from "@/components/ide/app-header";
import FileExplorer from "@/components/ide/file-explorer";
import EditorPanel from "@/components/ide/editor-panel";
import { type FileSystemNode, type FileNode, type FolderNode } from "@/lib/file-system";
import { nanoid } from 'nanoid';
import { useToast } from "@/hooks/use-toast";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { NewFolderDialog } from "./ide/new-folder-dialog";
import { NewFileDialog } from "./ide/new-file-dialog";
import { useAuth } from "@/context/auth-context";
import { useRouter, useSearchParams } from "next/navigation";
import { getProjectById, updateProject } from "@/lib/api";
import { DeleteConfirmationDialog } from "./ide/delete-confirmation-dialog";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import { LoadingSpinner } from "@/components/ide/loading-spinner";
import TerminalPanel from "./ide/terminal-panel";
import AiChatPanel from "./ide/ai-chat-panel";
import RefactorDialog from "./ide/refactor-dialog";
import { useEditorSettings } from "@/hooks/editor-settings-provider";


export type OpenFile = {
  id: string;
  name: string;
  language: string;
  path: string;
};

// Helper function to find a node and its parent in the file system tree.
const findNodeAndParent = (root: FolderNode, id: string): { node: FileSystemNode | null, parent: FolderNode | null } => {
  const queue: { node: FileSystemNode, parent: FolderNode | null }[] = [{ node: root, parent: null }];
  while (queue.length > 0) {
    const { node, parent } = queue.shift()!;
    if (node.id === id) {
      return { node, parent };
    }
    if (node.type === 'folder') {
      for (const child of node.children) {
        queue.push({ node: child, parent: node as FolderNode });
      }
    }
  }
  return { node: null, parent: null };
};

const findNodeByPath = (root: FolderNode, path: string): FileSystemNode | null => {
    const queue: FileSystemNode[] = [root];
    while(queue.length > 0) {
        const node = queue.shift()!;
        if (node.path === path) {
            return node;
        }
        if (node.type === 'folder') {
            queue.push(...node.children);
        }
    }
    return null;
}

// Helper function to update paths recursively
const updatePaths = (node: FileSystemNode, newParentPath: string) => {
    node.path = `${newParentPath}/${node.name}`;
    if (node.type === 'folder') {
        node.children.forEach(child => updatePaths(child, node.path));
    }
};

// Helper function to derive a programming language from a file extension.
export const getLanguageFromExtension = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase() || '';
  const map: { [key: string]: string } = {
    'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',
    'py': 'python', 'rs': 'rust', 'cpp': 'cpp', 'c': 'c', 'h': 'c', 'cs': 'csharp',
    'html': 'html', 'css': 'css', 'json': 'json', 'md': 'markdown',
  };
  return map[extension] || 'plaintext';
};

function CodeWeaverContent() {
  const { toast } = useToast();
  const { token, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { geminiApiKey } = useEditorSettings();

  const [projectState, setProjectState] = useState<{ id: string; name: string } | null>(null);
  const [fileSystemState, setFileSystemState] = useState<FolderNode | null>(null);
  const [openFiles, setOpenFiles] = useState<OpenFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [fileContents, setFileContents] = useState<Map<string, string>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // State for controlling dialogs
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRefactorDialogOpen, setIsRefactorDialogOpen] = useState(false);
  const [nodeToDelete, setNodeToDelete] = useState<{id: string, name: string} | null>(null);
  const [currentNodeParentId, setCurrentNodeParentId] = useState<string | null>(null);
  const [refactorState, setRefactorState] = useState<{ code: string, onApply: (newCode: string) => void } | null>(null);

  // State for panel visibility
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);


  const findFirstFile = (node: FileSystemNode): FileNode | null => {
      if (node.type === 'file') {
        return node;
      }
      if (node.type === 'folder') {
          for (const child of node.children) {
              const result = findFirstFile(child);
              if (result) return result;
          }
      }
      return null;
  };
  
  const convertApiFilesToFs = (files: any[], projectName: string): { fileTree: FolderNode, contents: Map<string, string> } => {
    const fileContents = new Map<string, string>();
    const root: FolderNode = {
        id: 'root',
        name: projectName,
        type: 'folder',
        path: projectName,
        children: []
    };

    if (!files || files.length === 0) {
        return { fileTree: root, contents: fileContents };
    }
    
    files.forEach(file => {
        const parts = file.name.split('/');
        let currentNode: FolderNode = root;

        parts.slice(0, -1).forEach(part => {
            let folder = currentNode.children.find(c => c.name === part && c.type === 'folder') as FolderNode;
            if (!folder) {
                folder = { id: nanoid(), name: part, type: 'folder', path: `${currentNode.path}/${part}`, children: [] };
                currentNode.children.push(folder);
            }
            currentNode = folder;
        });

        const fileName = parts[parts.length - 1];
        if (!fileName) return;

        const fileId = nanoid();
        const fileNode: FileNode = {
            id: fileId,
            name: fileName,
            type: 'file',
            path: `${currentNode.path}/${fileName}`,
            language: getLanguageFromExtension(fileName),
            content: file.content
        };
        currentNode.children.push(fileNode);
        fileContents.set(fileId, file.content);
    });

    return { fileTree: root, contents: fileContents };
  };

  useEffect(() => {
    if (authLoading) {
      return; 
    }

    const projectId = searchParams.get('projectId');
    if (!projectId || !token) {
        router.push('/dashboard');
        return;
    }

    const loadProject = async () => {
        setIsLoading(true);
        try {
            const projectData = await getProjectById(projectId, token);
            setProjectState({ id: projectData.id, name: projectData.name });
            const { fileTree, contents } = convertApiFilesToFs(projectData.files, projectData.name);
            setFileSystemState(fileTree);
            setFileContents(contents);
            
            setOpenFiles([]);
            setActiveFileId(null);

            const firstFile = findFirstFile(fileTree);
            if (firstFile) {
                handleFileSelect(firstFile);
            }
        } catch (error: any) {
            console.error("Failed to load project", error);
            toast({ title: "Error", description: `Failed to load project: ${error.message}`, variant: "destructive" });
            router.push('/dashboard');
        } finally {
            setIsLoading(false);
        }
    };
    loadProject();
  }, [searchParams, token, router, authLoading, toast]);

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

  const handleFileSelect = useCallback((file: FileNode) => {
    const isAlreadyOpen = openFiles.some(f => f.id === file.id);
    if (!isAlreadyOpen) {
      setOpenFiles(prev => [...prev, { id: file.id, name: file.name, language: file.language, path: file.path }]);
    }
    setActiveFileId(file.id);
  }, [openFiles]);

  const handleCloseTab = useCallback((fileId: string) => {
    setOpenFiles(prev => {
      const newOpenFiles = prev.filter(f => f.id !== fileId);
      if (activeFileId === fileId) {
        setActiveFileId(newOpenFiles.length > 0 ? newOpenFiles[newOpenFiles.length - 1].id : null);
      }
      return newOpenFiles;
    });
  }, [activeFileId]);

  const handleContentChange = useCallback((fileId: string, newContent: string) => {
    setFileContents(prevContents => new Map(prevContents).set(fileId, newContent));
  }, []);

  const handleApplyAiChange = useCallback((filePath: string, newContent: string) => {
    if (!fileSystemState) return;

    // We need to find the file's ID from its path
    const fileNode = findNodeByPath(fileSystemState, filePath);

    if (fileNode && fileNode.type === 'file') {
        handleContentChange(fileNode.id, newContent);
        handleFileSelect(fileNode as FileNode); // Open the file to show the changes
        toast({ title: "Changes Applied", description: `File "${fileNode.name}" has been updated.` });
    } else {
        toast({ title: "Error Applying Changes", description: `Could not find file at path: ${filePath}`, variant: 'destructive' });
    }
}, [fileSystemState, handleContentChange, handleFileSelect, toast]);

  const handleRefactorRequest = useCallback((code: string, onApply: (newCode: string) => void) => {
    if (!geminiApiKey) {
        toast({ title: "API Key Required", description: "Please go to Settings to enter your Gemini API key.", variant: "destructive" });
        return;
    }
    setRefactorState({ code, onApply });
    setIsRefactorDialogOpen(true);
  }, [geminiApiKey, toast]);

  const requestCreateNode = useCallback((type: 'file' | 'folder', parentId: string) => {
    setCurrentNodeParentId(parentId);
    if (type === 'folder') {
      setIsNewFolderDialogOpen(true);
    } else {
      setIsNewFileDialogOpen(true);
    }
  }, []);

  const handleCreateFolder = useCallback((name: string) => {
    if (!fileSystemState || !currentNodeParentId) return;

    const newFileSystemState = JSON.parse(JSON.stringify(fileSystemState));
    const { node: parent } = findNodeAndParent(newFileSystemState, currentNodeParentId);

    if (parent && parent.type === 'folder') {
      if (parent.children.some((child) => child.name === name)) {
        toast({ title: "Error", description: `A folder with that name already exists.`, variant: "destructive" });
        return;
      }
      
      const newId = nanoid();
      const newNode: FolderNode = { id: newId, name, type: 'folder', path: `${parent.path}/${name}`, children: [] };

      parent.children.push(newNode);
      parent.children.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      
      setFileSystemState(newFileSystemState);
      toast({ title: "Folder Created", description: `"${name}" was added.` });
    } else {
        toast({ title: "Error", description: "Could not find parent folder.", variant: "destructive" });
    }
    setIsNewFolderDialogOpen(false);
    setCurrentNodeParentId(null);
  }, [fileSystemState, currentNodeParentId, toast]);

  const handleCreateFile = useCallback((name: string) => {
    if (!fileSystemState || !currentNodeParentId) return;
    
    const newFileSystemState = JSON.parse(JSON.stringify(fileSystemState));
    const { node: parent } = findNodeAndParent(newFileSystemState, currentNodeParentId);

    if (parent && parent.type === 'folder') {
        if (parent.children.some((child) => child.name === name)) {
            toast({ title: "Error", description: `A file with that name already exists.`, variant: "destructive" });
            return;
        }
        
        const newId = nanoid();
        const newNode: FileNode = {
            id: newId,
            name,
            type: 'file',
            path: `${parent.path}/${name}`,
            language: getLanguageFromExtension(name),
            content: ''
        };

        parent.children.push(newNode);
        parent.children.sort((a, b) => {
            if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
            return a.name.localeCompare(b.name);
        });
        
        setFileSystemState(newFileSystemState);
        setFileContents(prev => new Map(prev).set(newId, ''));
        handleFileSelect(newNode);
        toast({ title: "File Created", description: `"${name}" was added.` });
    } else {
        toast({ title: "Error", description: "Could not find parent folder.", variant: "destructive" });
    }
    setIsNewFileDialogOpen(false);
    setCurrentNodeParentId(null);
  }, [fileSystemState, currentNodeParentId, toast, handleFileSelect]);

  const requestDeleteNode = useCallback((nodeId: string) => {
    if (!fileSystemState) return;
    const { node } = findNodeAndParent(fileSystemState, nodeId);
    if (node) {
        setNodeToDelete({ id: node.id, name: node.name });
        setIsDeleteDialogOpen(true);
    }
  }, [fileSystemState]);

  const handleConfirmDelete = useCallback(() => {
    if (!fileSystemState || !nodeToDelete) return;
  
    const deepClone = JSON.parse(JSON.stringify(fileSystemState));
    const { node: nodeToDeleteData, parent } = findNodeAndParent(deepClone, nodeToDelete.id);
  
    if (parent && nodeToDeleteData) {
      parent.children = parent.children.filter(child => child.id !== nodeToDelete.id);
  
      const filesToClose: string[] = [];
      const newContents = new Map(fileContents);
  
      const collectIds = (node: FileSystemNode) => {
        if (node.type === 'file') {
          filesToClose.push(node.id);
          newContents.delete(node.id);
        } else if (node.type === 'folder') {
          node.children.forEach(collectIds);
        }
      };
  
      collectIds(nodeToDeleteData);
  
      setOpenFiles(prevOpenFiles => {
        const currentlyOpenFiles = prevOpenFiles.filter(f => !filesToClose.includes(f.id));
        if (filesToClose.includes(activeFileId ?? '')) {
          setActiveFileId(currentlyOpenFiles.length > 0 ? currentlyOpenFiles[currentlyOpenFiles.length - 1].id : null);
        }
        return currentlyOpenFiles;
      });
  
      setFileSystemState(deepClone);
      setFileContents(newContents);
      toast({ title: "Deleted", description: `"${nodeToDeleteData.name}" was removed.` });
    }
    // Reset deletion state
    setIsDeleteDialogOpen(false);
    setNodeToDelete(null);
  }, [fileSystemState, nodeToDelete, fileContents, activeFileId, toast]);

  const handleMoveNode = useCallback((draggedId: string, targetFolderId: string) => {
    if (!fileSystemState || draggedId === targetFolderId || draggedId === 'root') return;

    const newFileSystemState = JSON.parse(JSON.stringify(fileSystemState));
    
    const { node: draggedNode, parent: originalParent } = findNodeAndParent(newFileSystemState, draggedId);
    const { node: targetFolder } = findNodeAndParent(newFileSystemState, targetFolderId);

    if (!draggedNode || !targetFolder || targetFolder.type !== 'folder' || !originalParent) {
        toast({ title: "Error", description: "Invalid move operation.", variant: "destructive" });
        return;
    }
    
    if (targetFolder.children.some(child => child.name === draggedNode.name)) {
        toast({ title: "Error", description: `An item named "${draggedNode.name}" already exists in this folder.`, variant: "destructive" });
        return;
    }

    // Check for moving a folder into itself or one of its children
    let current = targetFolder;
    while(current) {
        const {parent} = findNodeAndParent(newFileSystemState, current.id);
        if(current.id === draggedId) {
            toast({ title: "Error", description: "Cannot move a folder into one of its own descendants.", variant: "destructive" });
            return;
        }
        current = parent!;
    }

    // Remove from original parent
    originalParent.children = originalParent.children.filter(child => child.id !== draggedId);

    // Add to new parent and update path
    targetFolder.children.push(draggedNode);
    updatePaths(draggedNode, targetFolder.path);

    // Re-sort the target folder's children
    targetFolder.children.sort((a, b) => {
        if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
        return a.name.localeCompare(b.name);
    });

    setFileSystemState(newFileSystemState);

    // Update paths for any open files that were moved
    setOpenFiles(prevOpenFiles => {
        const newOpenFiles: OpenFile[] = [];
        prevOpenFiles.forEach(file => {
            const findMovedNode = (node: FileSystemNode): FileSystemNode | null => {
                if (node.id === file.id) return node;
                if (node.type === 'folder') {
                    for(const child of node.children) {
                        const found = findMovedNode(child);
                        if (found) return found;
                    }
                }
                return null;
            };
            const movedFileNode = findMovedNode(newFileSystemState);
            if (movedFileNode) {
                newOpenFiles.push({ ...file, path: movedFileNode.path });
            }
        });
        return newOpenFiles;
    });

    toast({ title: "Moved", description: `"${draggedNode.name}" moved to "${targetFolder.name}".`});

}, [fileSystemState, toast]);

    const convertFsToApiFiles = (node: FolderNode) => {
        const apiFiles: { name: string, content: string }[] = [];
        const traverse = (currentNode: FileSystemNode, currentPath: string) => {
            if (currentNode.type === 'file') {
                const relativePath = `${currentPath}/${currentNode.name}`.substring(1); // remove leading '/'
                apiFiles.push({
                    name: relativePath,
                    content: fileContents.get(currentNode.id) ?? ''
                });
            } else if (currentNode.type === 'folder') {
                const newPath = `${currentPath}/${currentNode.name}`;
                currentNode.children.forEach(child => traverse(child, newPath));
            }
        };
        // Start traversal from the children of the root, not the root itself
        node.children.forEach(child => traverse(child, ''));
        return apiFiles;
    };

    const handleSave = async () => {
        if (!projectState || !fileSystemState || !token) {
            toast({ title: "Error", description: "Not logged in or no project loaded.", variant: "destructive" });
            return;
        }

        toast({ title: "Saving project...", description: "Please wait." });
        try {
            const apiFiles = convertFsToApiFiles(fileSystemState);
            await updateProject(projectState.id, { name: projectState.name, files: apiFiles }, token);
            toast({ title: "Project Saved", description: "Your changes have been saved to the server." });
        } catch (error) {
            console.error("Failed to save project", error);
            toast({ title: "Error", description: "Could not save your project.", variant: "destructive" });
        }
    };


  const handleDownload = useCallback(async () => {
    if (!fileSystemState) return;

    toast({ title: "Zipping project...", description: "Please wait." });
    
    const zip = new JSZip();
    const projectFolder = zip.folder(fileSystemState.name);
    if(!projectFolder) {
        toast({ title: "Error", description: "Could not create project folder.", variant: "destructive" });
        return;
    }
    
    const addFolderToZip = (node: FolderNode, zipFolder: JSZip) => {
      node.children.forEach(child => {
        if (child.type === 'folder') {
          const newZipFolder = zipFolder.folder(child.name)!;
          addFolderToZip(child, newZipFolder);
        } else {
          const content = fileContents.get(child.id) ?? '';
          zipFolder.file(child.name, content);
        }
      });
    };

    addFolderToZip(fileSystemState, projectFolder);

    try {
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `${fileSystemState.name}.zip`);
    } catch (error) {
        console.error("Error zipping project:", error);
        toast({ title: "Error", description: "Could not download project.", variant: "destructive" });
    }
  }, [fileSystemState, fileContents, toast]);
  
  const handleLogout = () => {
    logout();
    router.push('/login');
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
  };
  
  const activeFile = openFiles.find(f => f.id === activeFileId);

  const toggleBottomPanel = (panel: 'terminal' | 'ai-chat') => {
    if (panel === 'terminal') {
        setIsTerminalOpen(!isTerminalOpen);
        if (isAiChatOpen && !isTerminalOpen) setIsAiChatOpen(false);
    } else if (panel === 'ai-chat') {
        setIsAiChatOpen(!isAiChatOpen);
        if(isTerminalOpen && !isAiChatOpen) setIsTerminalOpen(false);
    }
  };


  if (isLoading || authLoading || !fileSystemState) {
    return <div className="flex h-screen w-full items-center justify-center bg-background"><LoadingSpinner text="Loading project..." /></div>;
  }

  const isBottomPanelOpen = isTerminalOpen;

  return (
    <>
      <NewFolderDialog 
        isOpen={isNewFolderDialogOpen}
        onOpenChange={setIsNewFolderDialogOpen}
        onCreate={handleCreateFolder}
      />
      <NewFileDialog 
        isOpen={isNewFileDialogOpen}
        onOpenChange={setIsNewFileDialogOpen}
        onCreate={handleCreateFile}
      />
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        itemName={nodeToDelete?.name || ''}
      />
      {refactorState && (
        <RefactorDialog
            isOpen={isRefactorDialogOpen}
            onOpenChange={setIsRefactorDialogOpen}
            originalCode={refactorState.code}
            onApply={refactorState.onApply}
            language={activeFile?.language || 'plaintext'}
        />
      )}
      <div className="flex flex-col h-screen bg-background text-foreground font-sans antialiased">
        <AppHeader 
            projectName={projectState?.name}
            onDownload={handleDownload} 
            onSave={handleSave}
            onLogout={handleLogout}
            onToggleTerminal={() => toggleBottomPanel('terminal')}
            onToggleAiChat={() => toggleBottomPanel('ai-chat')}
            isTerminalOpen={isTerminalOpen}
            isAiChatOpen={isAiChatOpen}
        />
        <main className="flex flex-1 overflow-hidden">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={20} minSize={15}>
               {fileSystemState && 
                <FileExplorer 
                    fileTree={fileSystemState} 
                    onFileSelect={handleFileSelect}
                    onCreateNode={requestCreateNode}
                    onDeleteNode={requestDeleteNode} 
                    onMoveNode={handleMoveNode}
                />}
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={isAiChatOpen ? 50: 80}>
                <ResizablePanelGroup direction="vertical">
                    <ResizablePanel defaultSize={isBottomPanelOpen ? 75 : 100}>
                        <EditorPanel
                        openFiles={openFiles}
                        activeFile={activeFile}
                        onTabChange={setActiveFileId}
                        onCloseTab={handleCloseTab}
                        fileContents={fileContents}
                        onContentChange={handleContentChange}
                        onRefactorRequest={handleRefactorRequest}
                        />
                    </ResizablePanel>
                    {isBottomPanelOpen && <>
                        <ResizableHandle withHandle />
                        <ResizablePanel defaultSize={25} minSize={10}>
                           {isTerminalOpen && <TerminalPanel
                             fileSystem={fileSystemState}
                             fileContents={fileContents}
                           />}
                        </ResizablePanel>
                    </>}
                </ResizablePanelGroup>
            </ResizablePanel>
            {isAiChatOpen && (
                <>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={30} minSize={20}>
                    <AiChatPanel 
                        fileSystem={fileSystemState}
                        fileContents={fileContents}
                        openFiles={openFiles}
                        onApplyChange={handleApplyAiChange}
                    />
                </ResizablePanel>
                </>
            )}
          </ResizablePanelGroup>
        </main>
      </div>
    </>
  );
}

export default function CodeWeaver() {
  return <CodeWeaverContent />;
}
