import { useState, useRef, useEffect } from 'react';
import { editor as monacoEditor, Range } from 'monaco-editor';
import { generateTextStats, downloadTextFile } from '@/lib/editorHelpers';

type EditorRef = monacoEditor.IStandaloneCodeEditor | null;

const useEditor = (initialContent: string, setContent: (content: string) => void) => {
  const editorRef = useRef<EditorRef>(null);
  const [stats, setStats] = useState(generateTextStats(initialContent));
  const decorationsRef = useRef<string[]>([]);

  const handleEditorDidMount = (editor: monacoEditor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    
    // Update stats on initial mount
    updateStats(initialContent);
    
    // Initial styling when editor is mounted
    const model = editor.getModel();
    if (model) {
      processAllMarkdownStyling(model, editor);
    }
  };

  const handleContentChange = (value: string | undefined) => {
    const newContent = value || '';
    setContent(newContent);
    updateStats(newContent);
    
    // Apply markdown styling to the entire document on content change
    if (editorRef.current) {
      const editor = editorRef.current;
      const model = editor.getModel();
      if (!model) return;
      
      // Process the entire document for markdown styling
      processAllMarkdownStyling(model, editor);
    }
  };
  
  // Process all markdown styling in the document and apply decorations
  const processAllMarkdownStyling = (
    model: monacoEditor.ITextModel, 
    editor: monacoEditor.IStandaloneCodeEditor
  ) => {
    // Clear existing decorations
    if (decorationsRef.current.length > 0) {
      editor.deltaDecorations(decorationsRef.current, []);
      decorationsRef.current = [];
    }
    
    const decorations: monacoEditor.IModelDeltaDecoration[] = [];
    const totalLines = model.getLineCount();
    
    // Process each line in the document
    for (let lineNumber = 1; lineNumber <= totalLines; lineNumber++) {
      const lineContent = model.getLineContent(lineNumber);
      
      // Apply formatting decorations for the line
      processLineFormatting(lineNumber, lineContent, decorations, model);
    }
    
    // Apply the decorations to the editor
    if (decorations.length > 0) {
      decorationsRef.current = editor.deltaDecorations([], decorations);
    }
  };

  // Process a single line for formatting
  const processLineFormatting = (
    lineNumber: number,
    lineContent: string,
    decorations: monacoEditor.IModelDeltaDecoration[],
    model: monacoEditor.ITextModel
  ) => {
    // Regular expressions for finding markdown patterns
    const boldRegex = /\*\*([^*]+)\*\*/g;
    const italicRegex = /\*([^*]+)\*/g;
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const strikethroughRegex = /~~([^~]+)~~/g;
    const headingRegex = /^(#{1,3})\s+(.+)$/;
    const codeRegex = /`([^`]+)`/g;
    const codeBlockRegex = /```([^`]*)```/g;
    
    try {
      // Process bold text
      let boldMatch;
      while ((boldMatch = boldRegex.exec(lineContent)) !== null) {
        const startPos = boldMatch.index + 2; // Skip the first two **
        const endPos = startPos + boldMatch[1].length;
        
        decorations.push({
          range: new Range(lineNumber, startPos + 1, lineNumber, endPos + 1),
          options: {
            inlineClassName: 'editor-bold',
            stickiness: 2 // TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
          }
        });
      }
      
      // Process italic text (avoiding conflicts with bold)
      if (!lineContent.includes('**')) {
        let italicMatch;
        while ((italicMatch = italicRegex.exec(lineContent)) !== null) {
          const startPos = italicMatch.index + 1; // Skip the first *
          const endPos = startPos + italicMatch[1].length;
          
          decorations.push({
            range: new Range(lineNumber, startPos + 1, lineNumber, endPos + 1),
            options: {
              inlineClassName: 'editor-italic',
              stickiness: 2 // NeverGrowsWhenTypingAtEdges
            }
          });
        }
      }
      
      // Process links
      let linkMatch;
      while ((linkMatch = linkRegex.exec(lineContent)) !== null) {
        const text = linkMatch[1];
        const url = linkMatch[2];
        const startPos = linkMatch.index + 1; // Skip the [
        const endPos = startPos + text.length;
        
        decorations.push({
          range: new Range(lineNumber, startPos + 1, lineNumber, endPos + 1),
          options: {
            inlineClassName: 'editor-link',
            stickiness: 2, // NeverGrowsWhenTypingAtEdges
            hoverMessage: { value: url }
          }
        });
      }
      
      // Process strikethrough text
      let strikethroughMatch;
      while ((strikethroughMatch = strikethroughRegex.exec(lineContent)) !== null) {
        const startPos = strikethroughMatch.index + 2; // Skip the ~~
        const endPos = startPos + strikethroughMatch[1].length;
        
        decorations.push({
          range: new Range(lineNumber, startPos + 1, lineNumber, endPos + 1),
          options: {
            inlineClassName: 'editor-strikethrough',
            stickiness: 2 // NeverGrowsWhenTypingAtEdges
          }
        });
      }
      
      // Process headings
      const headingMatch = headingRegex.exec(lineContent);
      if (headingMatch) {
        const level = headingMatch[1].length; // Number of # symbols
        const headingText = headingMatch[2];
        const startPos = headingMatch.index + level + 1; // Skip the ### and space
        const endPos = startPos + headingText.length;
        
        decorations.push({
          range: new Range(lineNumber, startPos + 1, lineNumber, endPos + 1),
          options: {
            inlineClassName: `editor-heading editor-h${level}`,
            stickiness: 2 // NeverGrowsWhenTypingAtEdges
          }
        });
      }
      
      // Process inline code
      let codeMatch;
      while ((codeMatch = codeRegex.exec(lineContent)) !== null) {
        const startPos = codeMatch.index + 1; // Skip the first `
        const endPos = startPos + codeMatch[1].length;
        
        decorations.push({
          range: new Range(lineNumber, startPos + 1, lineNumber, endPos + 1),
          options: {
            inlineClassName: 'editor-code',
            stickiness: 2 // NeverGrowsWhenTypingAtEdges
          }
        });
      }
      
      // Process code blocks - this is more complex as it spans multiple lines
      let codeBlockMatch;
      while ((codeBlockMatch = codeBlockRegex.exec(lineContent)) !== null) {
        const blockContent = codeBlockMatch[1];
        const startLine = lineNumber;
        const endLine = lineNumber + blockContent.split('\n').length;
        
        decorations.push({
          range: new Range(startLine, codeBlockMatch.index + 4, endLine, 1),
          options: {
            inlineClassName: 'editor-code-block',
            stickiness: monacoEditor.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges
          }
        });
      }
    } catch (error) {
      console.error('Error processing markdown styling:', error);
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
      case 'strikethrough':
        // Add ~~ around the selected text for strikethrough formatting
        editOperation(`~~${selectedText}~~`);
        break;
      case 'heading1':
        // Add # for heading level 1
        editOperation(`# ${selectedText}`);
        break;
      case 'heading2':
        // Add ## for heading level 2
        editOperation(`## ${selectedText}`);
        break;
      case 'heading3':
        // Add ### for heading level 3
        editOperation(`### ${selectedText}`);
        break;
      case 'code':
        // Add ` around the selected text for inline code formatting
        editOperation(`\`${selectedText}\``);
        break;
      case 'codeBlock':
        // Add ``` around the selected text for code block formatting
        editOperation(`\`\`\`\n${selectedText}\n\`\`\``);
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
