import { Maximize, Save } from "lucide-react";
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
    <div className="bg-gray-50 border-t border-gray-100 px-6 py-2 text-xs flex items-center justify-between rounded-b-lg">
      <div className="flex items-center space-x-5">
        <span className="text-gray-500">Lines: {stats.lines}</span>
        <span className="text-gray-500">Characters: {stats.characters}</span>
        <span className="text-gray-500">Words: {stats.words}</span>
      </div>
      <div className="flex items-center space-x-4">
        <span className="flex items-center text-green-600">
          <Save className="h-3 w-3 mr-1" /> Auto-saved
        </span>
        <span className="text-gray-500">UTF-8</span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0 rounded-full text-gray-500 hover:bg-gray-100" 
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
