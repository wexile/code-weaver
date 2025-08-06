export type FileNode = {
  id: string;
  name: string;
  type: "file";
  path: string;
  language: string;
  content: string;
};

export type FolderNode = {
  id: string;
  name: string;
  type: "folder";
  path: string;
  children: FileSystemNode[];
};

export type FileSystemNode = FileNode | FolderNode;
