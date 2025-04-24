import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  AlignLeft, AlignCenter, AlignRight,
  Indent, Outdent, List, ListOrdered, ChevronDown, ChevronUp,
  Bold, Italic, Link
} from "lucide-react";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogFooter, DialogClose 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface EditorToolbarProps {
  onFormat: (action: string, value?: any) => void;
}

const EditorToolbar = ({ onFormat }: EditorToolbarProps) => {
  const [fontSize, setFontSize] = useState<number>(14);
  const [showUrlDialog, setShowUrlDialog] = useState<boolean>(false);
  const [url, setUrl] = useState<string>('https://');

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
  
  const handleAddUrl = () => {
    onFormat("addUrl", url);
    setShowUrlDialog(false);
  };

  return (
    <>
      <div className="editor-toolbar px-6 py-2 flex items-center">
        <div className="flex space-x-3 text-sm">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full text-gray-700 hover:bg-gray-100" 
            title="Bold Text (**text**)" 
            onClick={() => onFormat("bold")}
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            title="Italic Text (*text*)" 
            onClick={() => onFormat("italic")}
          >
            <Italic className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            title="Add URL" 
            onClick={() => setShowUrlDialog(true)}
          >
            <Link className="h-4 w-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-6 mx-1" />
          
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
      
      {/* URL Dialog */}
      <Dialog open={showUrlDialog} onOpenChange={setShowUrlDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add URL Link</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Input 
                id="url" 
                value={url} 
                onChange={(e) => setUrl(e.target.value)} 
                className="col-span-4" 
                placeholder="https://example.com" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setShowUrlDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddUrl}>Add Link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditorToolbar;
