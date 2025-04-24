import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  AlignLeft, AlignCenter, AlignRight,
  Indent, Outdent, List, ListOrdered, ChevronDown, ChevronUp
} from "lucide-react";

interface EditorToolbarProps {
  onFormat: (action: string, value?: any) => void;
}

const EditorToolbar = ({ onFormat }: EditorToolbarProps) => {
  const [fontSize, setFontSize] = useState<number>(14);

  const handleFontSizeChange = (value: string) => {
    const size = parseInt(value);
    setFontSize(size);
    onFormat("fontSize", size);
  };

  const decreaseFontSize = () => {
    if (fontSize > 10) {
      setFontSize(fontSize - 1);
      onFormat("fontSize", fontSize - 1);
    }
  };

  const increaseFontSize = () => {
    if (fontSize < 24) {
      setFontSize(fontSize + 1);
      onFormat("fontSize", fontSize + 1);
    }
  };

  return (
    <div className="editor-toolbar px-6 py-2 flex items-center">
      <div className="flex space-x-3 text-sm">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full text-gray-700 hover:bg-gray-100" 
          title="Align Left" 
          onClick={() => onFormat("alignLeft")}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
          title="Align Center" 
          onClick={() => onFormat("alignCenter")}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
          title="Align Right" 
          onClick={() => onFormat("alignRight")}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
          title="Indent" 
          onClick={() => onFormat("indent")}
        >
          <Indent className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
          title="Outdent" 
          onClick={() => onFormat("outdent")}
        >
          <Outdent className="h-4 w-4" />
        </Button>
        
        <Separator orientation="vertical" className="h-6 mx-1" />
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
          title="List" 
          onClick={() => onFormat("bulletList")}
        >
          <List className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
          title="Numbered List" 
          onClick={() => onFormat("numberedList")}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Font Settings */}
      <div className="ml-auto flex items-center space-x-3">
        <Select 
          defaultValue="Consolas, Monaco, 'Courier New', monospace" 
          onValueChange={(value) => onFormat("fontFamily", value)}
        >
          <SelectTrigger className="h-8 w-48">
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            <SelectItem value="Consolas, Monaco, 'Courier New', monospace" style={{fontFamily: "Consolas, Monaco, 'Courier New', monospace"}}>Consolas</SelectItem>
            <SelectItem value="Monaco, Consolas, 'Courier New', monospace" style={{fontFamily: "Monaco, Consolas, 'Courier New', monospace"}}>Monaco</SelectItem>
            <SelectItem value="'Courier New', Courier, monospace" style={{fontFamily: "'Courier New', Courier, monospace"}}>Courier New</SelectItem>
            <SelectItem value="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" style={{fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"}}>System UI</SelectItem>
            <SelectItem value="'Roboto Mono', monospace" style={{fontFamily: "'Roboto Mono', monospace"}}>Roboto Mono</SelectItem>
            <SelectItem value="'Fira Code', monospace" style={{fontFamily: "'Fira Code', monospace"}}>Fira Code</SelectItem>
            <SelectItem value="'JetBrains Mono', monospace" style={{fontFamily: "'JetBrains Mono', monospace"}}>JetBrains Mono</SelectItem>
            <SelectItem value="'Source Code Pro', monospace" style={{fontFamily: "'Source Code Pro', monospace"}}>Source Code Pro</SelectItem>
            <SelectItem value="Georgia, 'Times New Roman', serif" style={{fontFamily: "Georgia, 'Times New Roman', serif"}}>Georgia</SelectItem>
            <SelectItem value="'Times New Roman', Times, serif" style={{fontFamily: "'Times New Roman', Times, serif"}}>Times New Roman</SelectItem>
            
            {/* Custom fonts will be added here dynamically */}
            {JSON.parse(localStorage.getItem('custom-fonts') || '[]').map((font: any) => (
              <SelectItem key={font.name} value={font.value} style={{fontFamily: font.name}}>
                {font.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            title="Decrease Font Size" 
            onClick={decreaseFontSize}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <span className="mx-1 text-sm">{fontSize}</span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            title="Increase Font Size" 
            onClick={increaseFontSize}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditorToolbar;
