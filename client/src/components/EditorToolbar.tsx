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
    <div className="bg-secondary border-b border-border px-4 py-1.5 flex items-center">
      <div className="flex space-x-2 text-sm">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
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
        <Select defaultValue="mono" onValueChange={(value) => onFormat("fontFamily", value)}>
          <SelectTrigger className="h-8 w-40">
            <SelectValue placeholder="Select font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mono">Consolas</SelectItem>
            <SelectItem value="sans">System UI</SelectItem>
            <SelectItem value="serif">Georgia</SelectItem>
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
