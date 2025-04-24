import { useState, useEffect, useCallback } from 'react';
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
  DialogHeader, DialogTitle, DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [originalContent, setOriginalContent] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  
  // State for the currently editing note
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveAsNew, setSaveAsNew] = useState(false);
  const [saveData, setSaveData] = useState({
    title: '',
    folderId: null as number | null
  });

  // Editor loading state
  const [isEditorLoading, setIsEditorLoading] = useState(true);
  const [editorLoadError, setEditorLoadError] = useState(false);
  
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
  
  // Handle editor load success
  const handleEditorDidMountWrapper = (editor: any) => {
    setIsEditorLoading(false);
    setEditorLoadError(false);
    handleEditorDidMount(editor);
  };
  
  // Handle editor load error
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isEditorLoading) {
        setEditorLoadError(true);
      }
    }, 5000); // Wait 5 seconds before showing error
    
    return () => clearTimeout(timeout);
  }, [isEditorLoading]);
  
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

  // Check for unsaved changes
  useEffect(() => {
    if (content !== originalContent) {
      setHasUnsavedChanges(true);
    } else {
      setHasUnsavedChanges(false);
    }
  }, [content, originalContent]);
  
  // Set original content when loading a note
  useEffect(() => {
    if (editorRef.current) {
      setOriginalContent(editorRef.current.getValue());
    }
  }, [editorRef.current]);

  // Handle navigation with unsaved changes
  const handleNavigation = useCallback((path: string) => {
    if (hasUnsavedChanges) {
      // Show confirmation dialog
      setPendingNavigation(path);
      setShowUnsavedDialog(true);
    } else {
      // Navigate directly if no unsaved changes
      setLocation(path);
    }
  }, [hasUnsavedChanges, setLocation]);

  // Navigate without saving
  const discardChangesAndNavigate = () => {
    if (pendingNavigation) {
      setShowUnsavedDialog(false);
      setHasUnsavedChanges(false);
      setLocation(pendingNavigation);
      setPendingNavigation(null);
    }
  };

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
    
    // Update states
    setEditingNoteId(saveAsNew ? savedNote.id : editingNoteId);
    setNoteTitle(savedNote.title);
    setOriginalContent(currentContent);
    setHasUnsavedChanges(false);
    
    // If we're navigating after saving
    if (pendingNavigation) {
      setShowUnsavedDialog(false);
      setLocation(pendingNavigation);
      setPendingNavigation(null);
    } else {
      // Navigate back to notes page if not part of a prompt
      setTimeout(() => {
        setLocation('/notes');
      }, 1000);
    }
  };

  // Function to save and then navigate
  const saveAndNavigate = () => {
    // First open the save dialog
    setSaveDialogOpen(true);
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
            {editorLoadError ? (
              <div className="flex flex-col items-center justify-center h-full p-6 bg-gray-50 rounded-lg text-center">
                <i className="ri-error-warning-line text-red-500 text-4xl mb-4"></i>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Editor failed to load</h3>
                <p className="text-gray-600 mb-4">We're having trouble loading the rich text editor component.</p>
                
                <div className="w-full max-w-2xl">
                  <label htmlFor="fallbackEditor" className="block text-sm font-medium text-gray-700 mb-1">
                    You can still edit your note here:
                  </label>
                  <textarea
                    id="fallbackEditor"
                    className="w-full h-64 p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={content}
                    onChange={(e) => {
                      setContent(e.target.value);
                      handleContentChange(e.target.value);
                    }}
                    placeholder="Enter your note content here..."
                  ></textarea>
                </div>
                
                <button 
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    setIsEditorLoading(true);
                    setEditorLoadError(false);
                    setTimeout(() => window.location.reload(), 100);
                  }}
                >
                  <i className="ri-refresh-line mr-1"></i>
                  Try Again
                </button>
              </div>
            ) : (
              <Editor
                height="100%"
                defaultLanguage="plaintext"
                value={content}
                onChange={handleContentChange}
                options={{
                  ...editorOptions,
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  minimap: { enabled: editorOptions.minimap?.enabled },
                  fontSize: editorOptions.fontSize || 14,
                  fontFamily: editorOptions.fontFamily || 'Consolas, Monaco, "Courier New", monospace'
                }}
                onMount={handleEditorDidMountWrapper}
                theme={editorOptions.theme === 'vs-dark' ? 'vs-dark' : 'vs'}
                className="rounded-t-lg"
                loading={
                  <div className="flex items-center justify-center h-full p-6">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading editor...</p>
                    </div>
                  </div>
                }
              />
            )}
          </div>

          <EditorStatusBar 
            stats={stats}
            onFullScreenToggle={toggleFullScreen}
          />
        </div>
      </main>

      {/* Back to Notes button with unsaved changes check */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <Button 
          size="icon" 
          className="rounded-full h-14 w-14 bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 shadow-xl transition-all duration-200 border-2 border-white dark:border-gray-800 flex items-center justify-center transform hover:scale-105"
          onClick={() => handleNavigation('/notes')}
          title="Back to notes"
        >
          <i className="ri-arrow-left-line h-7 w-7 text-white drop-shadow-sm"></i>
          <span className="sr-only">Back to notes</span>
        </Button>
      </div>

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

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent className="max-w-md border-l-4 border-amber-500">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-lg font-semibold text-amber-600">
              <i className="ri-error-warning-line mr-2 text-2xl"></i>
              Unsaved Changes
            </AlertDialogTitle>
            <AlertDialogDescription className="pt-2 text-gray-600">
              The document has been modified. Do you want to save your changes before leaving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel 
              onClick={discardChangesAndNavigate}
              className="hover:bg-gray-200 transition-colors"
            >
              Don't Save
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={saveAndNavigate}
              className="bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <i className="ri-save-line mr-1"></i> Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Save Note Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="sm:max-w-[450px] border-t-4 border-blue-500">
          <DialogHeader>
            <DialogTitle className="flex items-center text-lg font-semibold text-blue-600">
              <i className="ri-save-3-line mr-2 text-2xl"></i>
              {saveAsNew ? 'Save as New Note' : 'Save Note'}
            </DialogTitle>
            <DialogDescription className="pt-1 text-gray-600">
              {saveAsNew 
                ? 'Enter a title and select a folder to save your note.' 
                : 'Update the existing note or save as a new note.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="flex items-center text-sm font-medium">
                <i className="ri-file-text-line mr-1 text-gray-500"></i> Note Title
              </Label>
              <Input
                id="title"
                value={saveData.title}
                onChange={(e) => setSaveData({...saveData, title: e.target.value})}
                placeholder="Enter note title"
                className="focus-visible:ring-blue-500"
                autoFocus
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="folder" className="flex items-center text-sm font-medium">
                <i className="ri-folder-line mr-1 text-gray-500"></i> Folder
              </Label>
              <Select
                value={saveData.folderId?.toString() || 'none'}
                onValueChange={(value) => setSaveData({
                  ...saveData, 
                  folderId: value === 'none' ? null : parseInt(value)
                })}
              >
                <SelectTrigger className="focus-visible:ring-blue-500">
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
          
          <DialogFooter className="gap-2">
            {!saveAsNew && editingNoteId && (
              <Button 
                variant="outline" 
                onClick={() => setSaveAsNew(true)}
                className="hover:bg-gray-100 transition-colors"
              >
                <i className="ri-file-copy-line mr-1"></i> Save as New
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => setSaveDialogOpen(false)}
              className="hover:bg-gray-100 transition-colors"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveNote}
              className="bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <i className="ri-save-line mr-1"></i> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotepadEditor;