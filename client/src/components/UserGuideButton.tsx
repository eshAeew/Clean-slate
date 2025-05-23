import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  MousePointerClick, 
  FileEdit, 
  FolderPlus, 
  Tag, 
  Trash2,
  Archive,
  Star,
  Move,
  Copy,
  HelpCircle
} from "lucide-react";

const UserGuideButton = () => {
  const [open, setOpen] = useState(false);
  
  const showGuide = () => {
    // Reset the "has seen guide" flag
    localStorage.removeItem('hasSeenGuide');
    setOpen(true);
  };
  
  const closeGuide = () => {
    localStorage.setItem('hasSeenGuide', 'true');
    setOpen(false);
  };
  
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        id="guide-btn"
        className="w-full flex items-center justify-center text-gray-700"
        onClick={showGuide}
      >
        <HelpCircle size={16} className="mr-2" />
        Show User Guide
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Welcome to Modern Notepad</DialogTitle>
            <DialogDescription>
              A quick guide to help you get started with the app
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <MousePointerClick className="mr-2 h-5 w-5 text-blue-500" />
                Basic Interactions
              </h3>
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>Double-click</strong> on any note to open it in the editor</li>
                <li><strong>Click</strong> on folders or labels to filter your notes</li>
                <li>Use the <strong>floating action buttons</strong> at the bottom right to quickly create new notes or access the editor</li>
                <li>Use the folder dropdown when creating notes to organize them</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <FileEdit className="mr-2 h-5 w-5 text-green-500" />
                Notes Management
              </h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Create notes with a title, content, and optional labels</li>
                <li>Right-click on a note for a context menu with additional options</li>
                <li><strong>Pin</strong> important notes to keep them at the top</li>
                <li><strong>Archive</strong> notes you don't need right now but want to keep</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <FolderPlus className="mr-2 h-5 w-5 text-orange-500" />
                Folders and Organization
              </h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Create folders and subfolders to organize your notes</li>
                <li>Click the <strong>+</strong> button next to "Folders" to create a new folder</li>
                <li>Expand/collapse folders by clicking the arrow icon</li>
                <li>Edit or delete folders using the buttons or context menu</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Tag className="mr-2 h-5 w-5 text-purple-500" />
                Labels
              </h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Create color-coded labels to categorize your notes</li>
                <li>Click the <strong>+</strong> button next to "Labels" to create a new label</li>
                <li>Edit labels by clicking the edit button (pencil icon)</li>
                <li>Delete labels by clicking the trash icon</li>
                <li>Filter notes by clicking on a label</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Trash2 className="mr-2 h-5 w-5 text-red-500" />
                <Archive className="mr-2 h-5 w-5 text-amber-500" />
                Managing Note Status
              </h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Use the <strong>Archive</strong> button to move notes to the archive</li>
                <li>View archived notes by clicking on "Archive" in the sidebar</li>
                <li>Restore notes from the archive when needed</li>
                <li>Use the <strong>Trash</strong> option to move notes to trash</li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Star className="mr-2 h-5 w-5 text-yellow-500" />
                <Move className="mr-2 h-5 w-5 text-blue-500" />
                <Copy className="mr-2 h-5 w-5 text-indigo-500" />
                Advanced Features
              </h3>
              <ul className="list-disc ml-6 space-y-2">
                <li>Use the star icon to <strong>pin</strong> important notes to the top</li>
                <li><strong>Duplicate</strong> notes to create a copy with similar content</li>
                <li>Use the <strong>search bar</strong> to quickly find notes by title or content</li>
                <li>Organize notes by selecting folders in the creation/edit dialog</li>
                <li>Add multiple labels to a note for better categorization</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter className="flex justify-between items-center">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Show Later
            </Button>
            <Button onClick={closeGuide}>
              Got it!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserGuideButton;