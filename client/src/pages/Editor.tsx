import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import Editor from '@monaco-editor/react';
import { useToast } from '@/hooks/use-toast';
import useEditor from '@/hooks/useEditor';
import EditorToolbar from '@/components/EditorToolbar';
import EditorStatusBar from '@/components/EditorStatusBar';
import SettingsModal from '@/components/SettingsModal';
import ExportDialog from '@/components/ExportDialog';
import Header from '@/components/Header';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DEFAULT_EDITOR_OPTIONS = {
  minimap: { enabled: true },
  wordWrap: 'on' as const,
  lineNumbers: 'on' as const,
  theme: 'vs-light',
  fontSize: 14,
  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
  lineHeight: 1.5,
};

const NotepadEditor = () => {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [editorOptions, setEditorOptions] = useState(DEFAULT_EDITOR_OPTIONS);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  
  // Editor content state - initialize with a default welcome message
  const [content, setContent] = useState<string>('Welcome to Modern Notepad!\n\nStart typing here to create your note...');
  const [noteTitle, setNoteTitle] = useState<string>('Untitled Note');
  
  // State for the currently editing note
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveAsNew, setSaveAsNew] = useState(false);
  const [saveData, setSaveData] = useState({
    title: '',
    folderId: null as number | null
  });

  // Initialize the editor with hooks
  const { 
    editorRef,
    stats,
    handleEditorDidMount,
    handleContentChange,
    handleSearch,
    handleFormat,
    downloadContent,
    updateEditorValue
  } = useEditor(content, setContent);
  
  // Custom format handler to support save operation
  const handleCustomAction = (action: string) => {
    if (action === "save") {
      setSaveDialogOpen(true);
    } else {
      handleFormat(action);
    }
  };

  // Toggle full screen mode
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

  // Handle editor options updates
  const updateEditorOptions = (options: typeof editorOptions) => {
    console.log('Received editor options:', options);
    setEditorOptions({
      ...editorOptions,
      ...options
    });
    
    // Apply the lineHeight change to the editor if present
    if (options.lineHeight && editorRef.current) {
      handleFormat('lineHeight', options.lineHeight);
    }
  };

  // Monitor fullscreen changes from other sources (like Esc key)
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  // Create a new file
  const newFile = () => {
    // Clear content
    updateEditorValue('');
    
    // Reset state
    setNoteTitle('Untitled Note');
    setEditingNoteId(null);
    setSaveData({
      title: '',
      folderId: null
    });
    
    toast({
      description: "New note created",
      duration: 1500,
    });
  };

  // Load note from Notes page if any
  useEffect(() => {
    const editingNoteJson = localStorage.getItem('editingNote');
    if (editingNoteJson) {
      try {
        const editingNote = JSON.parse(editingNoteJson);
        if (editingNote) {
          // Update editor content
          updateEditorValue(editingNote.content || '');
          
          // Update state
          setContent(editingNote.content || '');
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
  }, [toast]);

  // Function to handle saving a note
  const handleSaveNote = () => {
    const currentContent = editorRef.current?.getValue() || content;
    
    const savedNote = {
      id: saveAsNew ? Date.now() : (editingNoteId || Date.now()),
      title: saveData.title || 'Untitled Note',
      content: currentContent,
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
      const noteIndex = notes.findIndex((note: any) => note.id === editingNoteId);
      if (noteIndex >= 0) {
        // Preserve createdAt from the original note
        const originalCreatedAt = notes[noteIndex].createdAt;
        notes[noteIndex] = {...savedNote, createdAt: originalCreatedAt};
      } else {
        // If not found (shouldn't happen), add as new
        notes.push(savedNote);
      }
    }

    // Save back to localStorage
    localStorage.setItem('notes', JSON.stringify(notes));
    
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
  };

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
              value={content}
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
};

export default NotepadEditor;