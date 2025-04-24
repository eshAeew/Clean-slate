import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  AlignLeft, AlignCenter, AlignRight,
  Indent, Outdent, List, ListOrdered
} from "lucide-react";

interface EditorToolbarProps {
  onFormat: (action: string, value?: any) => void;
}

const EditorToolbar = ({ onFormat }: EditorToolbarProps) => {
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
    </div>
  );
};

export default EditorToolbar;
