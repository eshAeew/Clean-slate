import { useState, useRef, useEffect } from 'react';
import { editor as monacoEditor } from 'monaco-editor';
import { generateTextStats, downloadTextFile } from '@/lib/editorHelpers';

type EditorRef = monacoEditor.IStandaloneCodeEditor | null;

const useEditor = (initialContent: string, setContent: (content: string) => void) => {
  const editorRef = useRef<EditorRef>(null);
  const [stats, setStats] = useState(generateTextStats(initialContent));

  const handleEditorDidMount = (editor: monacoEditor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    
    // Update stats on initial mount
    updateStats(initialContent);
  };

  const handleContentChange = (value: string | undefined) => {
    const newContent = value || '';
    setContent(newContent);
    updateStats(newContent);
  };

  const updateStats = (content: string) => {
    setStats(generateTextStats(content));
  };

  const handleSearch = (searchTerm: string) => {
    if (!editorRef.current || !searchTerm) return;
    
    const editor = editorRef.current;
    
    // Find all matches
    const findController = editor.getContribution('editor.contrib.findController') as any;
    if (findController) {
      findController.setSearchString(searchTerm);
      findController.start({
        searchString: searchTerm,
        isRegex: false,
        matchCase: false,
        matchWholeWord: false
      });
    }
  };

  const handleFormat = (action: string, value?: any) => {
    if (!editorRef.current) return;
    
    const editor = editorRef.current;
    const model = editor.getModel();
    if (!model) return;
    
    switch (action) {
      case 'undo':
        editor.trigger('keyboard', 'undo', null);
        break;
      case 'redo':
        editor.trigger('keyboard', 'redo', null);
        break;
      case 'cut':
        document.execCommand('cut');
        break;
      case 'copy':
        document.execCommand('copy');
        break;
      case 'paste':
        document.execCommand('paste');
        break;
      case 'selectAll':
        editor.setSelection(model.getFullModelRange());
        break;
      case 'toggleWordWrap':
        const options = editor.getOptions();
        const wordWrap = options.get(monacoEditor.EditorOption.wordWrap);
        editor.updateOptions({ wordWrap: wordWrap === 'on' ? 'off' : 'on' });
        break;
      case 'fontSize':
        editor.updateOptions({ fontSize: value });
        break;
      case 'fontFamily':
        let fontFamily = 'Consolas, Monaco, "Courier New", monospace';
        if (value === 'sans') {
          fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        } else if (value === 'serif') {
          fontFamily = 'Georgia, "Times New Roman", serif';
        }
        editor.updateOptions({ fontFamily });
        break;
      case 'indent':
        editor.trigger('keyboard', 'tab', null);
        break;
      case 'outdent':
        editor.trigger('keyboard', 'outdent', null);
        break;
      default:
        break;
    }
  };

  const downloadContent = () => {
    if (!editorRef.current) return;
    const content = editorRef.current.getValue();
    downloadTextFile(content);
  };

  const newFile = () => {
    if (!editorRef.current) return;
    // Clear the editor and set to default content
    editorRef.current.setValue('');
  };

  return {
    editorRef,
    stats,
    handleEditorDidMount,
    handleContentChange,
    handleSearch,
    handleFormat,
    downloadContent,
    newFile,
  };
};

export default useEditor;
