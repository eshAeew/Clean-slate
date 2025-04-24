import { useState } from "react";
import EditorToolbar from "./EditorToolbar";
import Menu from "./Menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Settings } from "lucide-react";

interface HeaderProps {
  onSettingsClick: () => void;
  onNewFile: () => void;
  onDownload: () => void;
  onSearch: (searchTerm: string) => void;
  onFormat: (action: string) => void;
}

const Header = ({ 
  onSettingsClick, 
  onNewFile, 
  onDownload, 
  onSearch,
  onFormat 
}: HeaderProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  return (
    <header className="app-header">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-6">
          {/* Logo and Title */}
          <div className="flex items-center">
            <h1 className="app-title">SimpleNote</h1>
          </div>
          
          {/* File Operations */}
          <div className="flex items-center space-x-4">
            <Menu 
              title="File"
              items={[
                { label: "New", icon: "ri-file-add-line", onClick: onNewFile },
                { label: "Save", icon: "ri-save-line", onClick: () => {} },
                { label: "Export", icon: "ri-download-line", onClick: onDownload }
              ]}
            />
            
            <Menu 
              title="Edit"
              items={[
                { label: "Undo", icon: "ri-arrow-go-back-line", onClick: () => onFormat("undo") },
                { label: "Redo", icon: "ri-arrow-go-forward-line", onClick: () => onFormat("redo") },
                { type: "separator" },
                { label: "Cut", icon: "ri-scissors-cut-line", onClick: () => onFormat("cut") },
                { label: "Copy", icon: "ri-file-copy-line", onClick: () => onFormat("copy") },
                { label: "Paste", icon: "ri-clipboard-line", onClick: () => onFormat("paste") },
                { type: "separator" },
                { label: "Select All", icon: "ri-select-all", onClick: () => onFormat("selectAll") }
              ]}
            />
            
            <Menu 
              title="View"
              items={[
                { 
                  label: "Word Wrap", 
                  icon: "ri-text-wrap", 
                  onClick: () => onFormat("toggleWordWrap") 
                }
              ]}
            />
          </div>
        </div>
        
        {/* Search and User Actions */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Input
              type="search"
              placeholder="Search in text..."
              className="pl-8 pr-2 py-1.5 text-sm w-56 rounded-full border-gray-200 bg-gray-50 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          
          <Button variant="ghost" size="icon" onClick={onSettingsClick} title="Settings" className="app-icon-button">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      <EditorToolbar onFormat={onFormat} />
    </header>
  );
};

export default Header;
