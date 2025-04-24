import { useState, useRef, useEffect } from 'react';
import { editor as monacoEditor } from 'monaco-editor';
import { generateTextStats, downloadTextFile } from '@/lib/editorHelpers';

type EditorRef = monacoEditor.IStandaloneCodeEditor | null;

const useEditor = (initialContent: string, setContent: (content: string) => void) => {
  const editorRef = useRef<EditorRef>(null);
  const [stats, setStats] = useState(generateTextStats(initialContent));

  // Update stats whenever initialContent changes (component remounts, etc.)
  useEffect(() => {
    updateStats(initialContent);
  }, [initialContent]);

  const handleEditorDidMount = (editor: monacoEditor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    
    // Add an event listener to update stats when content changes directly in the editor
    editor.onDidChangeModelContent(() => {
      updateStats(editor.getValue());
    });
    
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
    
    // Get current selection
    const selection = editor.getSelection();
    if (!selection) return;
    
    // Create an edit operation
    const editOperation = (text: string) => {
      editor.executeEdits('', [
        {
          range: selection,
          text: text,
          forceMoveMarkers: true
        }
      ]);
    };
    
    // Get selected text
    const selectedText = model.getValueInRange(selection);
    
    switch (action) {
      case 'undo':
        editor.trigger('keyboard', 'undo', null);
        break;
      case 'redo':
        editor.trigger('keyboard', 'redo', null);
        break;
      case 'cut':
        // First copy the text to clipboard
        navigator.clipboard.writeText(selectedText).then(() => {
          // Then delete the selected text
          editor.executeEdits('', [
            {
              range: selection,
              text: '',
              forceMoveMarkers: true
            }
          ]);
        }).catch(err => {
          console.error('Failed to cut text: ', err);
        });
        break;
      case 'copy':
        navigator.clipboard.writeText(selectedText).catch(err => {
          console.error('Failed to copy text: ', err);
        });
        break;
      case 'paste':
        navigator.clipboard.readText().then(text => {
          editOperation(text);
        }).catch(err => {
          console.error('Failed to paste text: ', err);
        });
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
        // We now receive the full fontFamily string directly 
        editor.updateOptions({ fontFamily: value });
        break;
      case 'lineHeight':
        editor.updateOptions({ lineHeight: value });
        break;
      case 'indent':
        editor.trigger('keyboard', 'tab', null);
        break;
      case 'outdent':
        editor.trigger('keyboard', 'outdent', null);
        break;
      case 'alignLeft':
        // Apply left alignment to the selected lines
        const leftAlignedText = selectedText.split('\n').map(line => line.trimStart()).join('\n');
        editOperation(leftAlignedText);
        break;
      case 'alignCenter':
        // Apply center alignment (using spaces for simplicity)
        const maxLength = Math.max(...selectedText.split('\n').map(line => line.trim().length));
        const centeredText = selectedText.split('\n').map(line => {
          const trimmedLine = line.trim();
          const padding = Math.max(0, Math.floor((maxLength - trimmedLine.length) / 2));
          return ' '.repeat(padding) + trimmedLine;
        }).join('\n');
        editOperation(centeredText);
        break;
      case 'alignRight':
        // Apply right alignment (using spaces)
        const lines = selectedText.split('\n');
        const maxLineLength = Math.max(...lines.map(line => line.trim().length));
        const rightAlignedText = lines.map(line => {
          const trimmedLine = line.trim();
          const padding = Math.max(0, maxLineLength - trimmedLine.length);
          return ' '.repeat(padding) + trimmedLine;
        }).join('\n');
        editOperation(rightAlignedText);
        break;
      case 'bulletList':
        // Convert each line to a bullet point
        const bulletPoints = selectedText.split('\n').map(line => `• ${line.trim()}`).join('\n');
        editOperation(bulletPoints);
        break;
      case 'numberedList':
        // Convert each line to a numbered list item
        const numberedList = selectedText.split('\n').map((line, index) => `${index + 1}. ${line.trim()}`).join('\n');
        editOperation(numberedList);
        break;
      default:
        break;
    }
  };

  const downloadContent = (fileType: string = 'txt') => {
    if (!editorRef.current) return;
    const content = editorRef.current.getValue();
    downloadTextFile(content, fileType);
  };

  const newFile = () => {
    if (!editorRef.current) return;
    // Clear the editor content
    editorRef.current.setValue('');
    // Clear the content state
    setContent('');
  };
  
  // Method to directly update the editor value
  const updateEditorValue = (value: string) => {
    if (editorRef.current) {
      editorRef.current.setValue(value);
    }
    setContent(value);
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
    updateEditorValue,
  };
};

export default useEditor;
