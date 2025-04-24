import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import EditorStatusBar from "@/components/EditorStatusBar";
import SettingsModal from "@/components/SettingsModal";
import ExportDialog from "@/components/ExportDialog";
import useLocalStorage from "@/hooks/useLocalStorage";
import useEditor from "@/hooks/useEditor";
import Editor from "@monaco-editor/react";
import { DEFAULT_EDITOR_OPTIONS } from "@/lib/editorHelpers";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const NotepadEditor = () => {
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [editorOptions, setEditorOptions] = useState(DEFAULT_EDITOR_OPTIONS);
  
  // Initialize with localStorage note content or default
  const defaultContent = `// Welcome to SimpleNote

This is a clean, distraction-free text editor for all your note-taking needs.

Features:
- Auto-saving as you type
- Basic text formatting
- Distraction-free writing environment
- Line and character counting
- Easy export options

Try typing something to get started!

function greet() {
  console.log("Hello, world!");
}

greet();`;

  // Get stored note from the Notes page, if any
  const [content, setContent] = useLocalStorage('notepad-content', defaultContent);
  const [noteTitle, setNoteTitle] = useState<string>('Untitled Note');
  
  // useLocation hook for navigation
  const [, setLocation] = useLocation();
  
  // Custom format handler to support save operation
  const handleCustomAction = (action: string) => {
    if (action === "save") {
      setSaveDialogOpen(true);
    } else {
      handleFormat(action);
    }
  };
  
  const { 
    editorRef,
    stats,
    handleEditorDidMount,
    handleContentChange,
    handleSearch,
    handleFormat,
    downloadContent,
    newFile,
  } = useEditor(content, setContent);

  const toggleFullScreen = () => {
    const element = document.documentElement;
    if (!isFullScreen) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullScreen(!isFullScreen);
  };

  const updateEditorOptions = (options: typeof editorOptions) => {
    console.log('Received editor options:', options);
    // Update the editor options
    setEditorOptions({
      ...editorOptions,
      ...options
    });
    
    // Apply the lineHeight change to the editor if present
    if (options.lineHeight && editorRef.current) {
      handleFormat('lineHeight', options.lineHeight);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  // State to track the currently editing note
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveAsNew, setSaveAsNew] = useState(false);
  const [saveData, setSaveData] = useState({
    title: '',
    folderId: null as number | null
  });

  // Check for editing note from Notes page
  useEffect(() => {
    const editingNoteJson = localStorage.getItem('editingNote');
    if (editingNoteJson) {
      try {
        const editingNote = JSON.parse(editingNoteJson);
        if (editingNote && editingNote.content) {
          setContent(editingNote.content);
          setNoteTitle(editingNote.title || 'Untitled Note');
          setEditingNoteId(editingNote.id);
          setSaveData({
            title: editingNote.title || 'Untitled Note',
            folderId: editingNote.folderId
          });
          toast({
            description: `Opened note: ${editingNote.title}`,
            duration: 2000,
          });
          // Clear the editing note so refreshing doesn't re-open it
          localStorage.removeItem('editingNote');
        }
      } catch (err) {
        console.error('Error parsing editing note', err);
      }
    }
  }, [toast, setContent]);

  // Auto-save notification
  useEffect(() => {
    const interval = setInterval(() => {
      toast({
        description: "Note auto-saved",
        duration: 1500,
      });
    }, 60000); // Show notification every minute

    return () => clearInterval(interval);
  }, [toast]);

  return (
    <div className="h-screen flex flex-col">
      <Header 
        onSettingsClick={() => setShowSettings(true)}
        onNewFile={newFile}
        onDownload={() => setShowExportDialog(true)}
        onSearch={handleSearch}
        onFormat={handleCustomAction}
        title={noteTitle}
      />
      
      <main className="flex-1 overflow-hidden flex p-3 bg-gray-50">
        <div className="flex-1 flex flex-col h-full bg-white rounded-lg editor-container">
          <div className="flex-1 relative">
            <Editor
              height="100%"
              defaultLanguage="plaintext"
              defaultValue={content}
              onChange={handleContentChange}
              options={editorOptions}
              onMount={handleEditorDidMount}
              theme={editorOptions.theme === 'vs-dark' ? 'vs-dark' : 'vs'}
              className="rounded-t-lg"
            />
          </div>

          <EditorStatusBar 
            stats={stats}
            onFullScreenToggle={toggleFullScreen}
          />
        </div>
      </main>

      {showSettings && (
        <SettingsModal 
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          editorOptions={editorOptions}
          onUpdateOptions={updateEditorOptions}
        />
      )}

      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        onExport={(fileType) => downloadContent(fileType)}
      />

      {/* Save Note Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{saveAsNew ? 'Save as New Note' : 'Save Note'}</DialogTitle>
            <DialogDescription>
              {saveAsNew 
                ? 'Enter a title and select a folder to save your note.' 
                : 'Update the existing note or save as a new note.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Note Title</Label>
              <Input
                id="title"
                value={saveData.title}
                onChange={(e) => setSaveData({...saveData, title: e.target.value})}
                placeholder="Enter note title"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="folder">Folder</Label>
              <Select
                value={saveData.folderId?.toString() || 'none'}
                onValueChange={(value) => setSaveData({
                  ...saveData, 
                  folderId: value === 'none' ? null : parseInt(value)
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {/* We'll fetch the actual folders from localStorage */}
                  {JSON.parse(localStorage.getItem('folders') || '[]').map((folder: any) => (
                    <SelectItem key={folder.id} value={folder.id.toString()}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            {!saveAsNew && editingNoteId && (
              <Button variant="outline" onClick={() => setSaveAsNew(true)}>
                Save as New
              </Button>
            )}
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNote}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  // Function to handle saving a note
  function handleSaveNote() {
    const savedNote = {
      id: saveAsNew ? Date.now() : (editingNoteId || Date.now()),
      title: saveData.title || 'Untitled Note',
      content: content,
      folderId: saveData.folderId,
      isArchived: false,
      isTrashed: false,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Get existing notes from localStorage
    const notesJson = localStorage.getItem('notes');
    let notes = notesJson ? JSON.parse(notesJson) : [];

    if (saveAsNew || !editingNoteId) {
      // Add as new note
      notes.push(savedNote);
    } else {
      // Update existing note
      notes = notes.map((note: any) => 
        note.id === editingNoteId ? {...savedNote, createdAt: note.createdAt} : note
      );
    }

    // Save back to localStorage
    localStorage.setItem('notes', JSON.stringify(notes));
    
    // Show success message
    toast({
      description: saveAsNew ? "Note saved as new" : "Note updated",
      duration: 2000,
    });
    
    // Close dialog
    setSaveDialogOpen(false);
    setSaveAsNew(false);
    
    // Update state
    setEditingNoteId(saveAsNew ? savedNote.id : editingNoteId);
    setNoteTitle(savedNote.title);
    
    // Navigate back to notes page
    setTimeout(() => {
      setLocation('/notes');
    }, 1000);
  }
};

export default NotepadEditor;
