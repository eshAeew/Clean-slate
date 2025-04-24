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
    
    // Check for live markdown formatting if the editor is available
    if (editorRef.current) {
      const editor = editorRef.current;
      const model = editor.getModel();
      if (!model) return;
      
      // Get current position
      const position = editor.getPosition();
      if (!position) return;
      
      // Get the line content
      const lineContent = model.getLineContent(position.lineNumber);
      
      // Check for patterns: **text** for bold and *text* for italic
      // This is a simple implementation - in a production app, you'd use more sophisticated regex
      
      // Check for bold pattern completion
      if (lineContent.includes('**') && lineContent.split('**').length > 2) {
        const segments = lineContent.split('**');
        for (let i = 0; i < segments.length - 1; i++) {
          if (i % 2 === 0 && segments[i+1].trim() !== '') {
            // Found a potential bold pattern
            // In a real implementation, you would add styling or conversion here
            // For now, we're just demonstrating the pattern detection
            console.log('Bold pattern detected:', segments[i+1]);
          }
        }
      }
      
      // Check for italic pattern completion
      if (lineContent.includes('*') && lineContent.split('*').length > 2) {
        const segments = lineContent.split('*');
        for (let i = 0; i < segments.length - 1; i++) {
          if (i % 2 === 0 && segments[i+1].trim() !== '' && !lineContent.includes('**')) {
            // Found a potential italic pattern
            // In a real implementation, you would add styling or conversion here
            console.log('Italic pattern detected:', segments[i+1]);
          }
        }
      }
    }
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
      case 'bold':
        // Add ** around the selected text for bold formatting
        editOperation(`**${selectedText}**`);
        break;
      case 'italic':
        // Add * around the selected text for italic formatting
        editOperation(`*${selectedText}*`);
        break;
      case 'addUrl':
        // Check if the value contains the URL, otherwise use a default placeholder
        const url = value || 'https://example.com';
        editOperation(`[${selectedText}](${url})`);
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
