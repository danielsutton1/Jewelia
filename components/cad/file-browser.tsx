"use client"

import { useState, useRef } from "react"
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FileText,
  Lock,
  MoreVertical,
  Upload,
  FolderPlus,
  RefreshCw,
} from "lucide-react"
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { CadFile } from "./cad-file-manager"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

interface FileBrowserProps {
  files: CadFile[]
  onFileSelect: (file: CadFile) => void
}

export function FileBrowser({ files, onFileSelect }: FileBrowserProps) {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "/": true,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [fileList, setFileList] = useState(files)
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [renameDialog, setRenameDialog] = useState<{ open: boolean; id: string | null; name: string }>({ open: false, id: null, name: "" });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null; isFolder: boolean }>({ open: false, id: null, isFolder: false });
  const [parentForNewFolder, setParentForNewFolder] = useState<string | null>(null);
  const [parentForUpload, setParentForUpload] = useState<string | null>(null);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }))
  }

  const filteredFiles = searchQuery
    ? files.filter(
        (file) =>
          file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          file.path.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : files

  const handleNewFolder = () => {
    setShowNewFolder(true)
  }
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const parent = parentForNewFolder || "/";
    setFileList([
      ...fileList,
      {
        id: `folder-${Date.now()}`,
        name: newFolderName,
        path: parent === "/" ? `/${newFolderName}` : `${parent}/${newFolderName}`,
        type: "folder",
        dateModified: new Date().toISOString(),
        modifiedBy: "You",
      },
    ])
    setShowNewFolder(false)
    setNewFolderName("")
    setParentForNewFolder(null)
    toast({ title: "Folder Created", description: `Folder '${newFolderName}' created.` })
  }
  const handleUpload = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  }
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const parent = parentForUpload || "/";
      setFileList([
        ...fileList,
        {
          id: `file-${Date.now()}`,
          name: file.name,
          path: parent === "/" ? `/${file.name}` : `${parent}/${file.name}`,
          type: "file",
          fileType: file.type,
          dateModified: new Date().toISOString(),
          modifiedBy: "You",
        },
      ])
      setParentForUpload(null)
      toast({ title: "File Uploaded", description: `File '${file.name}' uploaded.` })
    }
  }

  const updateNameAndPaths = (items: CadFile[], id: string, newName: string) => {
    return items.map(item => {
      if (item.id === id) {
        const newPath = item.path.split("/").slice(0, -1).concat(newName).join("/") || "/" + newName;
        return { ...item, name: newName, path: newPath };
      }
      if (item.path.startsWith(files.find(f => f.id === id)?.path + "/")) {
        const oldPath = files.find(f => f.id === id)?.path;
        const newPath = item.path.replace(oldPath!, oldPath!.split("/").slice(0, -1).concat(newName).join("/"));
        return { ...item, path: newPath };
      }
      return item;
    });
  };

  const handleFolderRename = (folder: CadFile) => setRenameDialog({ open: true, id: folder.id, name: folder.name });
  const handleFolderDelete = (folder: CadFile) => setDeleteDialog({ open: true, id: folder.id, isFolder: true });
  const handleFolderNewFolder = (folder: CadFile) => { setParentForNewFolder(folder.path); setShowNewFolder(true); };
  const handleFolderUpload = (folder: CadFile) => { setParentForUpload(folder.path); if (fileInputRef.current) fileInputRef.current.click(); };

  const handleFileRename = (file: CadFile) => setRenameDialog({ open: true, id: file.id, name: file.name });
  const handleFileDelete = (file: CadFile) => setDeleteDialog({ open: true, id: file.id, isFolder: false });
  const handleFileDownload = (file: CadFile) => toast({ title: "Download", description: `Downloading '${file.name}' (mock)` });
  const handleFileCheck = (file: CadFile) => {
    setFileList(fileList.map(f => f.id === file.id ? { ...f, checkedOut: !f.checkedOut, checkedOutBy: !f.checkedOut ? "You" : undefined } : f));
    toast({ title: file.checkedOut ? "Checked In" : "Checked Out", description: `'${file.name}' ${file.checkedOut ? "checked in" : "checked out"}.` });
  };

  const handleRename = () => {
    if (!renameDialog.id || !renameDialog.name.trim()) return;
    setFileList(updateNameAndPaths(fileList, renameDialog.id, renameDialog.name));
    setRenameDialog({ open: false, id: null, name: "" });
    toast({ title: "Renamed", description: `Renamed to '${renameDialog.name}'.` });
  };
  const handleDelete = () => {
    if (!deleteDialog.id) return;
    const toDelete = files.find(f => f.id === deleteDialog.id);
    let updated = fileList.filter(f => f.id !== deleteDialog.id);
    if (deleteDialog.isFolder && toDelete) {
      updated = updated.filter(f => !f.path.startsWith(toDelete.path + "/"));
    }
    setFileList(updated);
    setDeleteDialog({ open: false, id: null, isFolder: false });
    toast({ title: "Deleted", description: `${deleteDialog.isFolder ? "Folder" : "File"} deleted.` });
  };

  const renderFileTree = (items: CadFile[], parentPath = "/", depth = 0) => {
    const folderItems = items.filter(
      (item) =>
        item.type === "folder" &&
        item.path.startsWith(parentPath) &&
        item.path.split("/").length === parentPath.split("/").length + 1,
    )

    const fileItems = items.filter(
      (item) =>
        item.type === "file" &&
        item.path.startsWith(parentPath) &&
        item.path.split("/").length === parentPath.split("/").length + 1,
    )

    return (
      <div className="pl-4">
        {folderItems.map((folder) => (
          <div key={folder.id}>
            <div
              className="flex cursor-pointer items-center py-1 hover:bg-muted/50"
              onClick={() => toggleFolder(folder.path)}
            >
              <span className="mr-1">
                {expandedFolders[folder.path] ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </span>
              <Folder className="mr-2 h-4 w-4 text-blue-500" />
              <span className="flex-1">{folder.name}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleFolderRename(folder)}>Rename</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFolderDelete(folder)}>Delete</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFolderNewFolder(folder)}>New Folder</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFolderUpload(folder)}>Upload File</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {expandedFolders[folder.path] && renderFileTree(items, folder.path, depth + 1)}
          </div>
        ))}
        {fileItems.map((file) => (
          <div
            key={file.id}
            className="flex cursor-pointer items-center py-1 hover:bg-muted/50"
            onClick={() => onFileSelect(file)}
          >
            <span className="mr-1 w-4"></span>
            <FileText className="mr-2 h-4 w-4 text-gray-500" />
            <span className="flex-1">{file.name}</span>
            {file.checkedOut && (
              <>
                <Lock className="mr-2 h-4 w-4 text-amber-500" />
                <span className="sr-only">Checked out by {file.checkedOutBy}</span>
              </>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleFileDownload(file)}>Download</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFileCheck(file)}>{file.checkedOut ? "Check In" : "Check Out"}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFileRename(file)}>Rename</DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFileDelete(file)}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl">Files</CardTitle>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" onClick={handleNewFolder}>
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
          <Button size="sm" variant="default" onClick={handleUpload}>
            <Upload className="mr-2 h-4 w-4" />
            Upload
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center space-x-2">
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 rounded-[6px] border-2 border-emerald-600 focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
          />
          <Button size="sm" variant="ghost" className="h-9 w-9 p-0">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        <div className="h-[500px] overflow-auto">
          {searchQuery ? (
            <div className="space-y-1">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex cursor-pointer items-center rounded-md py-1 px-2 hover:bg-muted/50"
                  onClick={() => file.type === "file" && onFileSelect(file)}
                >
                  {file.type === "folder" ? (
                    <Folder className="mr-2 h-4 w-4 text-blue-500" />
                  ) : (
                    <FileText className="mr-2 h-4 w-4 text-gray-500" />
                  )}
                  <span className="flex-1">{file.name}</span>
                  <span className="text-xs text-muted-foreground">{file.path}</span>
                </div>
              ))}
            </div>
          ) : (
            renderFileTree(files)
          )}
        </div>
      </CardContent>
      <Dialog open={showNewFolder} onOpenChange={setShowNewFolder}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            placeholder="Folder name"
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder() }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewFolder(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={renameDialog.open} onOpenChange={open => setRenameDialog({ ...renameDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            placeholder="New name"
            value={renameDialog.name}
            onChange={e => setRenameDialog({ ...renameDialog, name: e.target.value })}
            onKeyDown={e => { if (e.key === 'Enter') handleRename() }}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialog({ open: false, id: null, name: "" })}>Cancel</Button>
            <Button onClick={handleRename} disabled={!renameDialog.name.trim()}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteDialog.open} onOpenChange={open => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {deleteDialog.isFolder ? "Folder" : "File"}?</DialogTitle>
          </DialogHeader>
          <div>Are you sure you want to delete this {deleteDialog.isFolder ? "folder and all its contents" : "file"}?</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, id: null, isFolder: false })}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
