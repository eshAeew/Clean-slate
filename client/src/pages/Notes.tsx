import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  DndContext, 
  DragOverlay, 
  DragEndEvent, 
  DragStartEvent, 
  closestCenter, 
  useSensor, 
  useSensors, 
  PointerSensor,
  MouseSensor,
  useDraggable,
  useDroppable,
  DragMoveEvent,
  UniqueIdentifier
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Link, useLocation } from "wouter";
import { 
  Folder, 
  File, 
  Tag, 
  Plus, 
  Trash2, 
  Archive, 
  MoreVertical, 
  Star,
  Edit,
  Copy,
  ChevronRight,
  ChevronDown,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// Types matching our schema
interface IFolder {
  id: number;
  name: string;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
  isExpanded?: boolean; // UI state, not stored
  children?: IFolder[]; // For hierarchical view
}

interface ILabel {
  id: number;
  name: string;
  color: string;
  createdAt: string;
}

interface INote {
  id: number;
  title: string;
  content: string;
  folderId: number | null;
  isArchived: boolean;
  isTrashed: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  labels?: ILabel[]; // Labels associated with this note
}

// Mock data for initial UI development
const MOCK_FOLDERS: IFolder[] = [
  { 
    id: 1, 
    name: "Personal", 
    parentId: null, 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString(),
    isExpanded: true,
    children: [
      { 
        id: 2, 
        name: "Journal", 
        parentId: 1, 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString(),
        isExpanded: false
      },
      { 
        id: 3, 
        name: "Ideas", 
        parentId: 1, 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString(),
        isExpanded: false
      }
    ]
  },
  { 
    id: 4, 
    name: "Work", 
    parentId: null, 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString(),
    isExpanded: true,
    children: [
      { 
        id: 5, 
        name: "Projects", 
        parentId: 4, 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString(),
        isExpanded: false
      },
      { 
        id: 6, 
        name: "Meetings", 
        parentId: 4, 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString(),
        isExpanded: false
      }
    ]
  }
];

const MOCK_LABELS: ILabel[] = [
  { id: 1, name: "Important", color: "#FF5733", createdAt: new Date().toISOString() },
  { id: 2, name: "Personal", color: "#33FF57", createdAt: new Date().toISOString() },
  { id: 3, name: "Work", color: "#3357FF", createdAt: new Date().toISOString() },
  { id: 4, name: "Todo", color: "#F3FF33", createdAt: new Date().toISOString() },
];

const MOCK_NOTES: INote[] = [
  { 
    id: 1, 
    title: "Meeting Notes", 
    content: "Discussed project timeline and assigned tasks to team members.", 
    folderId: 6, 
    isArchived: false, 
    isTrashed: false, 
    isPinned: true, 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString(),
    labels: [MOCK_LABELS[2], MOCK_LABELS[0]] 
  },
  { 
    id: 2, 
    title: "Shopping List", 
    content: "Milk, Eggs, Bread, Vegetables", 
    folderId: 1, 
    isArchived: false, 
    isTrashed: false, 
    isPinned: false, 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString(),
    labels: [MOCK_LABELS[1]] 
  },
  { 
    id: 3, 
    title: "Project Ideas", 
    content: "1. Mobile app for task management\n2. Blog website redesign\n3. E-commerce platform", 
    folderId: 5, 
    isArchived: false, 
    isTrashed: false, 
    isPinned: false, 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString(),
    labels: [MOCK_LABELS[2], MOCK_LABELS[3]] 
  },
  { 
    id: 4, 
    title: "Journal Entry", 
    content: "Today was productive. I completed the report and started planning for the upcoming presentation.", 
    folderId: 2, 
    isArchived: false, 
    isTrashed: false, 
    isPinned: false, 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString(),
    labels: [MOCK_LABELS[1]] 
  },
];

type DialogType = 'folder' | 'note' | 'label' | null;

const NotesPage: React.FC = () => {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  // Load data from localStorage if available, otherwise use mock data
  const [folders, setFolders] = useState<IFolder[]>(() => {
    const savedFolders = localStorage.getItem('folders');
    return savedFolders ? JSON.parse(savedFolders) : MOCK_FOLDERS;
  });
  
  const [notes, setNotes] = useState<INote[]>(() => {
    const savedNotes = localStorage.getItem('notes');
    return savedNotes ? JSON.parse(savedNotes) : MOCK_NOTES;
  });
  
  const [labels, setLabels] = useState<ILabel[]>(() => {
    const savedLabels = localStorage.getItem('labels');
    return savedLabels ? JSON.parse(savedLabels) : MOCK_LABELS;
  });
  
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [selectedNote, setSelectedNote] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  
  // Function to open a note in the editor
  const openNoteInEditor = (note: INote) => {
    // First clear any existing content in the editor
    localStorage.removeItem('notepad-content');
    
    // Store the note in localStorage to be accessed from the editor page
    localStorage.setItem('editingNote', JSON.stringify({
      id: note.id,
      title: note.title,
      content: note.content,
      folderId: note.folderId
    }));
    
    // Navigate to the editor page
    setLocation('/editor');
    toast({ description: "Opening note in editor" });
  };
  
  // Dialog states
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [dialogData, setDialogData] = useState<any>({});
  
  // Drag and drop state
  const [activeItem, setActiveItem] = useState<any>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Min distance before drag starts
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  
  // Function to organize folders into a hierarchical structure
  const organizeFoldersHierarchy = (foldersList: IFolder[]): IFolder[] => {
    // Create a map for quick lookup
    const folderMap = new Map<number, IFolder>();
    
    // First pass: Store all folders in the map
    foldersList.forEach(folder => {
      folderMap.set(folder.id, { ...folder, children: [] });
    });
    
    // Second pass: Organize into tree structure
    const rootFolders: IFolder[] = [];
    
    foldersList.forEach(folder => {
      const currentFolder = folderMap.get(folder.id);
      if (currentFolder) {
        if (folder.parentId === null) {
          // This is a root folder
          rootFolders.push(currentFolder);
        } else {
          // This is a child folder
          const parentFolder = folderMap.get(folder.parentId);
          if (parentFolder) {
            if (!parentFolder.children) {
              parentFolder.children = [];
            }
            parentFolder.children.push(currentFolder);
          } else {
            // If parent not found, treat as root
            rootFolders.push(currentFolder);
          }
        }
      }
    });
    
    return rootFolders;
  };

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('folders', JSON.stringify(folders));
  }, [folders]);
  
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);
  
  useEffect(() => {
    localStorage.setItem('labels', JSON.stringify(labels));
  }, [labels]);
  
  // Filtered notes based on search and selected folder
  const filteredNotes = notes.filter(note => {
    // Filter by search
    const matchesSearch = searchTerm === "" || 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      note.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by folder if selected
    const matchesFolder = selectedFolder === null || note.folderId === selectedFolder;
    
    // Don't show archived or trashed notes in normal view
    const isVisible = !note.isArchived && !note.isTrashed;
    
    return matchesSearch && matchesFolder && isVisible;
  });
  
  // Function to toggle folder expansion
  const toggleFolderExpansion = (folderId: number) => {
    setFolders(prevFolders => {
      return prevFolders.map(folder => {
        if (folder.id === folderId) {
          return { ...folder, isExpanded: !folder.isExpanded };
        } else if (folder.children) {
          const updatedChildren = folder.children.map(child => {
            if (child.id === folderId) {
              return { ...child, isExpanded: !child.isExpanded };
            }
            return child;
          });
          return { ...folder, children: updatedChildren };
        }
        return folder;
      });
    });
  };
  
  // Function to open dialog for creating or editing
  const openDialog = (type: DialogType, data: any = {}) => {
    setDialogType(type);
    setDialogData(data);
    setDialogOpen(true);
  };
  
  // Function to handle dialog submission
  const handleDialogSubmit = () => {
    if (dialogType === 'folder') {
      if (dialogData.id) {
        // Edit existing folder
        setFolders(prevFolders => 
          prevFolders.map(folder => 
            folder.id === dialogData.id ? 
              { ...folder, name: dialogData.name, updatedAt: new Date().toISOString() } : 
              folder
          )
        );
        toast({ description: "Folder updated" });
      } else {
        // Create new folder
        const newFolder: IFolder = {
          id: Math.max(...folders.map(f => f.id), 0) + 1,
          name: dialogData.name,
          parentId: dialogData.parentId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isExpanded: false
        };
        
        setFolders(prevFolders => [...prevFolders, newFolder]);
        toast({ description: "Folder created" });
      }
    } else if (dialogType === 'note') {
      if (dialogData.id) {
        // Edit existing note
        setNotes(prevNotes => 
          prevNotes.map(note => 
            note.id === dialogData.id ? 
              { ...note, title: dialogData.title, content: dialogData.content, updatedAt: new Date().toISOString() } : 
              note
          )
        );
        toast({ description: "Note updated" });
      } else {
        // Create new note
        const newNote: INote = {
          id: Math.max(...notes.map(n => n.id), 0) + 1,
          title: dialogData.title,
          content: dialogData.content,
          folderId: selectedFolder,
          isArchived: false,
          isTrashed: false,
          isPinned: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        setNotes(prevNotes => [...prevNotes, newNote]);
        toast({ description: "Note created" });
      }
    } else if (dialogType === 'label') {
      if (dialogData.id) {
        // Edit existing label
        setLabels(prevLabels => 
          prevLabels.map(label => 
            label.id === dialogData.id ? 
              { ...label, name: dialogData.name, color: dialogData.color } : 
              label
          )
        );
        toast({ description: "Label updated" });
      } else {
        // Create new label
        const newLabel: ILabel = {
          id: Math.max(...labels.map(l => l.id), 0) + 1,
          name: dialogData.name,
          color: dialogData.color,
          createdAt: new Date().toISOString()
        };
        
        setLabels(prevLabels => [...prevLabels, newLabel]);
        toast({ description: "Label created" });
      }
    }
    
    setDialogOpen(false);
    setDialogType(null);
    setDialogData({});
  };
  
  // Function to delete a folder
  const deleteFolder = (folderId: number) => {
    // First, check if folder has any notes
    const hasNotes = notes.some(note => note.folderId === folderId);
    
    if (hasNotes) {
      if (confirm("This folder contains notes. Deleting it will move all associated notes to the trash. Continue?")) {
        // Move all notes in this folder to trash
        setNotes(prevNotes => 
          prevNotes.map(note => 
            note.folderId === folderId 
              ? { ...note, isTrashed: true, updatedAt: new Date().toISOString() } 
              : note
          )
        );
        
        // Remove the folder
        setFolders(prevFolders => prevFolders.filter(folder => folder.id !== folderId));
        
        toast({ 
          description: "Folder deleted and notes moved to trash",
          duration: 3000
        });
      }
    } else {
      // Just delete the folder as it has no notes
      setFolders(prevFolders => prevFolders.filter(folder => folder.id !== folderId));
      toast({ 
        description: "Folder deleted",
        duration: 2000
      });
    }
  };
  
  // Function to edit a folder
  const editFolder = (folderId: number, newName: string) => {
    setFolders(prevFolders => 
      prevFolders.map(folder => 
        folder.id === folderId 
          ? { ...folder, name: newName, updatedAt: new Date().toISOString() } 
          : folder
      )
    );
    toast({ 
      description: "Folder renamed",
      duration: 2000
    });
  };
  
  // Function to move note to trash
  const moveNoteToTrash = (noteId: number) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === noteId ? { ...note, isTrashed: true } : note
      )
    );
    toast({ description: "Note moved to trash" });
  };
  
  // Function to archive a note
  const archiveNote = (noteId: number) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === noteId ? { ...note, isArchived: true } : note
      )
    );
    toast({ description: "Note archived" });
  };
  
  // Function to toggle pin status
  const togglePinNote = (noteId: number) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === noteId ? { ...note, isPinned: !note.isPinned } : note
      )
    );
  };
  
  // Move a note to a specific folder
  const moveNoteToFolder = (noteId: number, folderId: number | null) => {
    setNotes(prevNotes => 
      prevNotes.map(note => 
        note.id === noteId ? { ...note, folderId: folderId, updatedAt: new Date().toISOString() } : note
      )
    );
    
    const folderName = folderId === null ? "All Notes" : 
      folders.find(f => f.id === folderId)?.name || "selected folder";
    
    toast({ 
      description: `Note moved to ${folderName}`,
      duration: 2000
    });
  };

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    console.log('Drag start:', event);
    setIsDragging(true);
    
    const idStr = event.active.id.toString();
    
    // Note ID format: note-123
    if (idStr.startsWith('note-')) {
      const noteId = parseInt(idStr.replace('note-', ''));
      const draggedNote = notes.find(note => note.id === noteId);
      
      if (draggedNote) {
        console.log('Dragging note:', draggedNote);
        setActiveItem({ ...draggedNote, type: 'note' });
      }
    }
    // Folder ID format: folder-123
    else if (idStr.startsWith('folder-')) {
      const folderId = parseInt(idStr.replace('folder-', ''));
      const draggedFolder = folders.find(folder => folder.id === folderId);
      
      if (draggedFolder) {
        console.log('Dragging folder:', draggedFolder);
        setActiveItem({ ...draggedFolder, type: 'folder' });
      }
    }
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    console.log('Drag end:', event);
    setIsDragging(false);
    
    const { active, over } = event;
    
    if (!over) {
      console.log('No drop target');
      setActiveItem(null);
      return;
    }
    
    // Get active ID
    const activeId = active.id.toString();
    // Get over ID
    const overId = over.id.toString();
    
    console.log(`Dropping ${activeId} onto ${overId}`);
    
    // Handle note drops
    if (activeId.startsWith('note-')) {
      const noteId = parseInt(activeId.replace('note-', ''));
      
      // Dropping on "All Notes"
      if (overId === 'all-notes') {
        console.log(`Moving note ${noteId} to All Notes`);
        moveNoteToFolder(noteId, null);
      }
      // Dropping on a folder
      else if (overId.startsWith('folder-')) {
        const folderId = parseInt(overId.replace('folder-', ''));
        console.log(`Moving note ${noteId} to folder ${folderId}`);
        moveNoteToFolder(noteId, folderId);
      }
    }
    
    setActiveItem(null);
  };
  
  // Component for a droppable folder
  const DroppableFolder = ({ folder, level }: { folder: IFolder, level: number }) => {
    const paddingLeft = level * 16;
    
    // Setup the droppable area
    const { isOver, setNodeRef } = useDroppable({
      id: `folder-${folder.id}`,
      data: {
        id: folder.id,
        type: 'folder'
      }
    });
    
    return (
      <div ref={setNodeRef}>
        <ContextMenu>
          <ContextMenuTrigger className="block">
            <div 
              className={cn(
                "flex items-center py-1 px-2 rounded-md cursor-pointer hover:bg-gray-100 group",
                selectedFolder === folder.id && "bg-blue-50",
                isOver && "bg-blue-100 ring-2 ring-blue-300" // Highlight when dragging over
              )}
              style={{ paddingLeft: `${paddingLeft + 8}px` }}
              onClick={() => setSelectedFolder(folder.id)}
            >
              <div 
                className="mr-1 text-gray-500 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolderExpansion(folder.id);
                }}
              >
                {folder.children && folder.children.length > 0 ? (
                  folder.isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                ) : (
                  <span className="w-4"></span>
                )}
              </div>
              <Folder size={16} className={cn("mr-2", isOver ? "text-blue-600" : "text-blue-500")} />
              <span className="flex-1 truncate">{folder.name}</span>
              <div className="hidden group-hover:flex">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDialog('folder', folder);
                  }}
                >
                  <Edit size={14} />
                </Button>
              </div>
            </div>
          </ContextMenuTrigger>
          
          <ContextMenuContent>
            <ContextMenuItem onClick={() => openDialog('note', { folderId: folder.id })}>
              <File className="mr-2 h-4 w-4" />
              <span>New Note</span>
            </ContextMenuItem>
            <ContextMenuItem onClick={() => openDialog('folder', { parentId: folder.id })}>
              <Folder className="mr-2 h-4 w-4" />
              <span>New Subfolder</span>
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={() => openDialog('folder', folder)}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Rename</span>
            </ContextMenuItem>
            <ContextMenuItem className="text-red-600" onClick={() => deleteFolder(folder.id)}>
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
        
        {folder.isExpanded && folder.children && folder.children.length > 0 && (
          <div>
            {folder.children.map(childFolder => renderFolder(childFolder, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Component for a draggable note card
  const DraggableNote = ({ note }: { note: INote }) => {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
      id: `note-${note.id}`,
      data: {
        id: note.id,
        type: 'note'
      }
    });
    
    // Handler for clicking a note
    const handleClick = (e: React.MouseEvent) => {
      if (!isDragging) {
        setSelectedNote(note.id);
      }
    };
    
    // Handler for double-clicking a note
    const handleDoubleClick = (e: React.MouseEvent) => {
      if (!isDragging) {
        openNoteInEditor(note);
      }
    };
    
    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <div 
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={cn(
              "bg-white rounded-lg border border-gray-200 p-4 cursor-pointer transition-shadow hover:shadow-md",
              selectedNote === note.id && "ring-2 ring-blue-500",
              isDragging && "opacity-50"
            )}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            style={{
              touchAction: 'none' // Prevents scrolling on touch devices
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900 truncate">{note.title}</h3>
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(
                    "h-7 w-7",
                    note.isPinned ? "text-yellow-500" : "text-gray-400 hover:text-yellow-500"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePinNote(note.id);
                  }}
                >
                  <Star size={16} fill={note.isPinned ? "#EAB308" : "none"} />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={e => e.stopPropagation()}
                    >
                      <MoreVertical size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openDialog('note', note)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openNoteInEditor(note)}>
                      <File className="mr-2 h-4 w-4" />
                      <span>Open in Editor</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Copy className="mr-2 h-4 w-4" />
                      <span>Duplicate</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => archiveNote(note.id)}>
                      <Archive className="mr-2 h-4 w-4" />
                      <span>Archive</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => moveNoteToTrash(note.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Move to Trash</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <p className="text-gray-600 text-sm line-clamp-3">{note.content}</p>
            {note.labels && note.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {note.labels.map(label => (
                  <div 
                    key={label.id}
                    className="px-2 py-0.5 rounded-full text-xs"
                    style={{ backgroundColor: `${label.color}20`, color: label.color }}
                  >
                    {label.name}
                  </div>
                ))}
              </div>
            )}
            <div className="text-xs text-gray-500 mt-3">
              {new Date(note.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => openDialog('note', note)}>
            <Edit className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </ContextMenuItem>
          <ContextMenuItem onClick={() => openNoteInEditor(note)}>
            <File className="mr-2 h-4 w-4" />
            <span>Open in Editor</span>
          </ContextMenuItem>
          <ContextMenuItem>
            <Copy className="mr-2 h-4 w-4" />
            <span>Duplicate</span>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem onClick={() => archiveNote(note.id)}>
            <Archive className="mr-2 h-4 w-4" />
            <span>Archive</span>
          </ContextMenuItem>
          <ContextMenuItem className="text-red-600" onClick={() => moveNoteToTrash(note.id)}>
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Move to Trash</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  // Render each folder and its subfolders recursively
  const renderFolder = (folder: IFolder, level = 0) => {
    return <DroppableFolder key={folder.id} folder={folder} level={level} />;
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
        <div className="p-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Notes</h1>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => openDialog('note')}
          >
            <Plus size={18} />
          </Button>
        </div>
        
        <div className="px-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search notes..."
              className="pl-10 pr-2 py-1.5 text-sm w-full rounded-md border-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <ScrollArea>
            <div className="px-3 py-2">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                {/* Fixed sections */}
                <div className="mb-4">
                  {/* Make "All Notes" a droppable target */}
                  {(() => {
                    const { isOver, setNodeRef } = useDroppable({
                      id: `all-notes`,
                      data: {
                        id: null,
                        type: 'all-notes'
                      }
                    });
                    
                    return (
                      <div 
                        ref={setNodeRef}
                        className={cn(
                          "flex items-center py-1 px-2 rounded-md cursor-pointer hover:bg-gray-100",
                          selectedFolder === null && "bg-blue-50",
                          isOver && "bg-blue-100 ring-2 ring-blue-300"
                        )}
                        onClick={() => setSelectedFolder(null)}
                      >
                        <File size={16} className={cn("mr-2", isOver ? "text-blue-600" : "text-gray-500")} />
                        <span>All Notes</span>
                      </div>
                    );
                  })()}
                </div>
                
                {/* Folders section */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <h2 className="text-xs text-gray-500 font-medium uppercase">Folders</h2>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5"
                      onClick={() => openDialog('folder')}
                    >
                      <Plus size={14} />
                    </Button>
                  </div>
                  
                  <SortableContext items={folders.map(f => f.id.toString())} strategy={verticalListSortingStrategy}>
                    {organizeFoldersHierarchy(folders).map(folder => renderFolder(folder))}
                  </SortableContext>
                </div>
                
                {/* Labels section */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <h2 className="text-xs text-gray-500 font-medium uppercase">Labels</h2>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5"
                      onClick={() => openDialog('label')}
                    >
                      <Plus size={14} />
                    </Button>
                  </div>
                  
                  {labels.map(label => (
                    <div 
                      key={label.id} 
                      className="flex items-center py-1 px-2 rounded-md cursor-pointer hover:bg-gray-100"
                    >
                      <Tag size={16} className="mr-2" style={{ color: label.color }} />
                      <span>{label.name}</span>
                    </div>
                  ))}
                </div>
                
                {/* Drag overlay */}
                <DragOverlay>
                  {activeItem && activeItem.type === 'note' && (
                    <div className="p-3 bg-white rounded-md shadow-md border border-gray-200 opacity-75 max-w-xs">
                      <h3 className="text-sm font-medium truncate">{activeItem.title}</h3>
                      <p className="text-xs text-gray-500 truncate">{activeItem.content}</p>
                    </div>
                  )}
                  
                  {activeItem && activeItem.type === 'folder' && (
                    <div className="flex items-center p-2 bg-white rounded-md shadow-md border border-gray-200 opacity-75">
                      <Folder size={16} className="mr-2 text-blue-500" />
                      <span>{activeItem.name}</span>
                    </div>
                  )}
                </DragOverlay>
              </DndContext>
            </div>
          </ScrollArea>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Notes list */}
        <div className="h-full p-4 overflow-auto">
          {/* Pinned notes section */}
          {filteredNotes.some(note => note.isPinned) && (
            <div className="mb-6">
              <h2 className="text-xs font-medium text-gray-500 uppercase mb-2">Pinned</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredNotes
                  .filter(note => note.isPinned)
                  .map(note => (
                    <DraggableNote key={note.id} note={note} />
                  ))}
              </div>
            </div>
          )}
          
          {/* Other notes */}
          <div>
            <h2 className="text-xs font-medium text-gray-500 uppercase mb-2">Notes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotes
                .filter(note => !note.isPinned)
                .map(note => (
                  <DraggableNote key={note.id} note={note} />
                ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Dialogs */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {dialogType === 'folder' && (dialogData.id ? 'Edit Folder' : 'Create Folder')}
              {dialogType === 'note' && (dialogData.id ? 'Edit Note' : 'Create Note')}
              {dialogType === 'label' && (dialogData.id ? 'Edit Label' : 'Create Label')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {dialogType === 'folder' && (
              <div className="grid gap-2">
                <Label htmlFor="name">Folder Name</Label>
                <Input
                  id="name"
                  value={dialogData.name || ''}
                  onChange={(e) => setDialogData({ ...dialogData, name: e.target.value })}
                  placeholder="Enter folder name"
                />
              </div>
            )}
            
            {dialogType === 'note' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={dialogData.title || ''}
                    onChange={(e) => setDialogData({ ...dialogData, title: e.target.value })}
                    placeholder="Enter note title"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">Content</Label>
                  <textarea
                    id="content"
                    rows={5}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={dialogData.content || ''}
                    onChange={(e) => setDialogData({ ...dialogData, content: e.target.value })}
                    placeholder="Enter note content"
                  />
                </div>
              </>
            )}
            
            {dialogType === 'label' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="name">Label Name</Label>
                  <Input
                    id="name"
                    value={dialogData.name || ''}
                    onChange={(e) => setDialogData({ ...dialogData, name: e.target.value })}
                    placeholder="Enter label name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    type="color"
                    value={dialogData.color || '#808080'}
                    onChange={(e) => setDialogData({ ...dialogData, color: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDialogSubmit}>
              {dialogData.id ? 'Save Changes' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesPage;