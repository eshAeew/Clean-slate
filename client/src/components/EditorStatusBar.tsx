import { Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditorStats {
  lines: number;
  characters: number;
  words: number;
}

interface EditorStatusBarProps {
  stats: EditorStats;
  onFullScreenToggle: () => void;
}

const EditorStatusBar = ({ stats, onFullScreenToggle }: EditorStatusBarProps) => {
  return (
    <div className="bg-secondary border-t border-border px-4 py-1 text-xs flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <span className="text-muted-foreground">Lines: {stats.lines}</span>
        <span className="text-muted-foreground">Characters: {stats.characters}</span>
        <span className="text-muted-foreground">Words: {stats.words}</span>
      </div>
      <div className="flex items-center space-x-3">
        <span className="flex items-center text-green-600">
          <i className="ri-save-line mr-1"></i> Auto-saved
        </span>
        <span className="text-muted-foreground">UTF-8</span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0" 
          onClick={onFullScreenToggle} 
          title="Toggle full screen"
        >
          <Maximize className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default EditorStatusBar;
