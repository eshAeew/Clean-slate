import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (fileType: string) => void;
}

type FileType = {
  id: string;
  name: string;
  description: string;
};

const ExportDialog = ({ isOpen, onClose, onExport }: ExportDialogProps) => {
  const [selectedFormat, setSelectedFormat] = useState<string>("txt");

  const fileTypes: FileType[] = [
    { 
      id: "txt", 
      name: "Text File (.txt)", 
      description: "Simple plain text format" 
    },
    { 
      id: "md", 
      name: "Markdown (.md)", 
      description: "Text with lightweight formatting" 
    },
    { 
      id: "html", 
      name: "HTML (.html)", 
      description: "Web page format" 
    },
    { 
      id: "csv", 
      name: "CSV (.csv)", 
      description: "Comma-separated values" 
    },
    { 
      id: "json", 
      name: "JSON (.json)", 
      description: "JavaScript Object Notation" 
    }
  ];

  const handleExport = () => {
    onExport(selectedFormat);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] apple-dialog">
        <DialogHeader>
          <DialogTitle className="text-gray-800 font-medium text-xl">Export Note</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <RadioGroup 
            value={selectedFormat} 
            onValueChange={setSelectedFormat}
            className="space-y-3"
          >
            {fileTypes.map((type) => (
              <div 
                key={type.id} 
                className="flex items-center space-x-3 rounded-md border border-gray-200 p-3 cursor-pointer hover:bg-gray-50"
                onClick={() => setSelectedFormat(type.id)}
              >
                <RadioGroupItem value={type.id} id={`format-${type.id}`} className="text-blue-500" />
                <div className="flex flex-col">
                  <Label htmlFor={`format-${type.id}`} className="font-medium cursor-pointer text-gray-800">
                    {type.name}
                  </Label>
                  <span className="text-sm text-gray-500">
                    {type.description}
                  </span>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="apple-button rounded-full px-5 py-2"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleExport}
            className="apple-button-primary rounded-full px-5 py-2 ml-2"
          >
            Export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportDialog;