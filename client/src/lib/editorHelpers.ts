export const DEFAULT_EDITOR_OPTIONS = {
  fontSize: 14,
  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
  lineHeight: 1.5,
  minimap: { enabled: false },
  wordWrap: 'on',
  theme: 'vs',
  scrollbar: {
    verticalScrollbarSize: 10,
    horizontalScrollbarSize: 10
  },
  lineNumbers: 'on',
  glyphMargin: false,
  folding: true,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  padding: {
    top: 16,
  }
};

export function countWords(text: string): number {
  if (!text || text.trim() === '') return 0;
  const words = text.trim().split(/\s+/);
  return words.length;
}

export function countLines(text: string): number {
  if (!text) return 0;
  return text.split('\n').length;
}

export function generateTextStats(text: string): { lines: number; characters: number; words: number } {
  return {
    lines: countLines(text),
    characters: text?.length || 0,
    words: countWords(text),
  };
}

export function downloadTextFile(content: string, fileType: string = 'txt'): void {
  let mimeType = 'text/plain';
  let fileContent = content;
  let filename = `note.${fileType}`;
  
  // Convert content based on file type
  switch (fileType) {
    case 'txt':
      mimeType = 'text/plain;charset=utf-8';
      break;
    case 'html':
      mimeType = 'text/html;charset=utf-8';
      fileContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Exported Note</title>
</head>
<body>
  <pre>${content}</pre>
</body>
</html>`;
      break;
    case 'csv':
      mimeType = 'text/csv;charset=utf-8';
      // Simple conversion - each line becomes a CSV row
      fileContent = content.split('\n').map(line => 
        line.replace(/"/g, '""')  // Escape quotes
      ).join('\n');
      break;
    case 'json':
      mimeType = 'application/json;charset=utf-8';
      try {
        // Try to parse as JSON if it's valid JSON
        JSON.parse(content);
        fileContent = content;
      } catch (e) {
        // If it's not valid JSON, create a simple JSON object with the content
        fileContent = JSON.stringify({ content: content });
      }
      break;
    case 'md':
      mimeType = 'text/markdown;charset=utf-8';
      break;
    default:
      mimeType = 'text/plain;charset=utf-8';
      filename = 'note.txt';
  }
  
  const blob = new Blob([fileContent], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
