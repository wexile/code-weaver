
"use client";

import React, { useState } from 'react';
import { Folder, FolderOpen, ChevronRight, MoreVertical, FilePlus2, FolderPlus, Trash2 } from 'lucide-react';
import { type FileSystemNode, type FileNode as FileNodeType, FolderNode as FolderNodeType } from '@/lib/file-system';
import FileIcon from './file-icon';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type FileExplorerProps = {
    fileTree: FolderNodeType | null;
    onFileSelect: (file: FileNodeType) => void;
    onCreateNode: (type: 'file' | 'folder', parentId: string) => void;
    onDeleteNode: (nodeId: string) => void;
    onMoveNode: (draggedId: string, targetFolderId: string) => void;
};

const NodeMenu = ({ onNewFile, onNewFolder, onDelete, isFolder, nodeId, fileTree }: { onNewFile?: () => void, onNewFolder?: () => void, onDelete: () => void, isFolder: boolean, nodeId: string, fileTree: FolderNodeType }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <button className="p-0.5 rounded-md hover:bg-accent absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 focus:outline-none" onClick={e => e.stopPropagation()}>
                <MoreVertical className="w-4 h-4" />
            </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent onClick={e => e.stopPropagation()} align="start">
            {isFolder && (
                <>
                    <DropdownMenuItem onClick={onNewFile}>
                        <FilePlus2 className="w-4 h-4 mr-2" /> New File
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onNewFolder}>
                        <FolderPlus className="w-4 h-4 mr-2" /> New Folder
                    </DropdownMenuItem>
                </>
            )}
            {nodeId !== fileTree.id && (
              <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
              </DropdownMenuItem>
            )}
        </DropdownMenuContent>
    </DropdownMenu>
);

const FolderNode = ({ fileTree, node, level, children, onCreateNode, onDeleteNode, onFileSelect, onMoveNode }: { fileTree: FolderNodeType, node: FolderNodeType, level: number, children: React.ReactNode, onCreateNode: FileExplorerProps['onCreateNode'], onDeleteNode: FileExplorerProps['onDeleteNode'], onFileSelect: FileExplorerProps['onFileSelect'], onMoveNode: FileExplorerProps['onMoveNode'] }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData('application/node-id', node.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const draggedId = e.dataTransfer.getData('application/node-id');
    if (draggedId !== node.id) {
        setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const draggedId = e.dataTransfer.getData('application/node-id');
    if (draggedId) {
      onMoveNode(draggedId, node.id);
    }
  };

  return (
    <div
      draggable={node.id !== fileTree.id}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={cn("flex items-center gap-1 py-1.5 px-2 rounded-md cursor-pointer hover:bg-accent/50 relative group", { "bg-accent": isDragOver })}
        style={{ paddingLeft: `${level * 1.25}rem` }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <ChevronRight className={cn("w-4 h-4 transition-transform shrink-0", isOpen && "rotate-90")} />
        {isOpen ? <FolderOpen className="w-4 h-4 text-accent shrink-0" /> : <Folder className="w-4 h-4 text-accent shrink-0" />}
        <span className="text-sm font-medium truncate">{node.name}</span>
        <NodeMenu 
            onNewFile={() => onCreateNode('file', node.id)}
            onNewFolder={() => onCreateNode('folder', node.id)}
            onDelete={() => onDeleteNode(node.id)}
            isFolder={true}
            nodeId={node.id}
            fileTree={fileTree}
        />
      </div>
      {isOpen && (
        <div>
          {children}
        </div>
      )}
    </div>
  );
};

const FileNode = ({ fileTree, node, onFileSelect, level, onDeleteNode }: { fileTree: FolderNodeType, node: FileNodeType, onFileSelect: (file: FileNodeType) => void, level: number, onDeleteNode: (nodeId: string) => void }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.stopPropagation();
    e.dataTransfer.setData('application/node-id', node.id);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  return (
    <div
      className="flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer hover:bg-accent/50 group relative"
      style={{ paddingLeft: `${level * 1.25 + 1}rem` }} // Indent files further
      onClick={() => onFileSelect(node)}
      draggable
      onDragStart={handleDragStart}
    >
      <FileIcon filename={node.name} className="w-4 h-4 shrink-0" />
      <span className="text-sm text-muted-foreground group-hover:text-foreground truncate">{node.name}</span>
      <NodeMenu 
        onDelete={() => onDeleteNode(node.id)}
        isFolder={false}
        nodeId={node.id}
        fileTree={fileTree}
      />
    </div>
  );
};

const FileOrFolderNode = ({ fileTree, node, onFileSelect, level, onCreateNode, onDeleteNode, onMoveNode }: { fileTree: FolderNodeType, node: FileSystemNode, onFileSelect: (file: FileNodeType) => void, level: number, onCreateNode: FileExplorerProps['onCreateNode'], onDeleteNode: FileExplorerProps['onDeleteNode'], onMoveNode: FileExplorerProps['onMoveNode'] }) => {
  if (node.type === 'folder') {
    return (
      <FolderNode fileTree={fileTree} node={node} level={level} onCreateNode={onCreateNode} onDeleteNode={onDeleteNode} onFileSelect={onFileSelect} onMoveNode={onMoveNode}>
        {node.children.length > 0 ? (
          node.children
            .sort((a, b) => {
              if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
              return a.name.localeCompare(b.name);
            })
            .map(child => (
              <FileOrFolderNode key={child.id} fileTree={fileTree} node={child} onFileSelect={onFileSelect} level={level + 1} onCreateNode={onCreateNode} onDeleteNode={onDeleteNode} onMoveNode={onMoveNode} />
            ))
        ) : (
            <div style={{ paddingLeft: `${(level + 1) * 1.25 + 1}rem` }} className="text-xs text-muted-foreground italic py-1 px-2">
                Empty
            </div>
        )}
      </FolderNode>
    );
  } else {
    return <FileNode fileTree={fileTree} node={node as FileNodeType} onFileSelect={onFileSelect} level={level} onDeleteNode={onDeleteNode} />;
  }
};


export default function FileExplorer({ fileTree, onFileSelect, onCreateNode, onDeleteNode, onMoveNode }: FileExplorerProps) {
  return (
    <div className="p-2">
      <div className="flex justify-between items-center px-2 mb-2">
        <h2 className="text-sm font-bold uppercase text-foreground tracking-wider">{fileTree?.name || 'Explorer'}</h2>
      </div>
      <div>
        {fileTree && (
            <FileOrFolderNode fileTree={fileTree} node={fileTree} onFileSelect={onFileSelect} level={0} onCreateNode={onCreateNode} onDeleteNode={onDeleteNode} onMoveNode={onMoveNode}/>
        )}
      </div>
    </div>
  );
}
