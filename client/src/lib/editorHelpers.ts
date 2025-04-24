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

export function downloadTextFile(content: string, filename = 'note.txt'): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
