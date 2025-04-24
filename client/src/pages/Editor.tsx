import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import EditorStatusBar from "@/components/EditorStatusBar";
import SettingsModal from "@/components/SettingsModal";
import useLocalStorage from "@/hooks/useLocalStorage";
import useEditor from "@/hooks/useEditor";
import Editor from "@monaco-editor/react";
import { DEFAULT_EDITOR_OPTIONS } from "@/lib/editorHelpers";

const NotepadEditor = () => {
  const { toast } = useToast();
  const [showSettings, setShowSettings] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [editorOptions, setEditorOptions] = useState(DEFAULT_EDITOR_OPTIONS);
  
  const [content, setContent] = useLocalStorage('notepad-content', 
    `// Welcome to SimpleNote

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

greet();`
  );
  
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
    setEditorOptions({
      ...editorOptions,
      ...options
    });
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
        onDownload={downloadContent}
        onSearch={handleSearch}
        onFormat={handleFormat}
      />
      
      <main className="flex-1 overflow-hidden flex">
        <div className="flex-1 flex flex-col h-full">
          <div className="flex-1 relative bg-primary">
            <Editor
              height="100%"
              defaultLanguage="plaintext"
              defaultValue={content}
              onChange={handleContentChange}
              options={editorOptions}
              onMount={handleEditorDidMount}
              theme={editorOptions.theme === 'vs-dark' ? 'vs-dark' : 'vs'}
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
    </div>
  );
};

export default NotepadEditor;
