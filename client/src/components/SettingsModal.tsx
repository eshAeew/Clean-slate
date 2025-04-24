import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  editorOptions: any;
  onUpdateOptions: (options: any) => void;
}

const SettingsModal = ({ isOpen, onClose, editorOptions, onUpdateOptions }: SettingsModalProps) => {
  const [settings, setSettings] = useState({
    fontSize: editorOptions.fontSize,
    wordWrap: editorOptions.wordWrap === 'on',
    theme: editorOptions.theme === 'vs-dark' ? 'dark' : 'light',
    lineHeight: editorOptions.lineHeight ? 
      (editorOptions.lineHeight >= 1.8 ? 'loose' : 
       editorOptions.lineHeight <= 1.3 ? 'tight' : 'normal') : 'normal',
    autoSave: true,
  });

  const handleSaveSettings = () => {
    // Convert line height string to numeric value
    let lineHeightValue = 1.5;
    switch (settings.lineHeight) {
      case 'tight':
        lineHeightValue = 1.2;
        break;
      case 'normal':
        lineHeightValue = 1.6;
        break;
      case 'loose':
        lineHeightValue = 2.0;
        break;
    }

    // Pass the settings to the parent component
    const options = {
      fontSize: settings.fontSize,
      wordWrap: settings.wordWrap ? 'on' : 'off',
      theme: settings.theme === 'dark' ? 'vs-dark' : 'vs',
      lineHeight: lineHeightValue,
      minimap: { enabled: false }
    };
    
    console.log('Updating editor options:', options);
    onUpdateOptions(options);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] apple-dialog">
        <DialogHeader>
          <DialogTitle className="text-gray-800 font-medium text-xl">Settings</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-5 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="theme" className="text-right font-medium text-gray-700">
              Theme
            </Label>
            <Select 
              value={settings.theme} 
              onValueChange={(value) => setSettings({ ...settings, theme: value })}
            >
              <SelectTrigger id="theme" className="col-span-3 border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System Default</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="font-size" className="text-right font-medium text-gray-700">
              Font Size
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Slider
                id="font-size"
                min={10}
                max={24}
                step={1}
                value={[settings.fontSize]}
                onValueChange={(value) => setSettings({ ...settings, fontSize: value[0] })}
                className="flex-1"
              />
              <span className="text-sm">{settings.fontSize}px</span>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="line-height" className="text-right font-medium text-gray-700">
              Line Height
            </Label>
            <div className="col-span-3">
              <Select 
                value={settings.lineHeight} 
                onValueChange={(value) => setSettings({ ...settings, lineHeight: value })}
              >
                <SelectTrigger id="line-height" className="border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Select line height" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="loose">Loose</SelectItem>
                  <SelectItem value="tight">Tight</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="auto-save" className="text-right font-medium text-gray-700">
              Auto-save
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Switch
                id="auto-save"
                checked={settings.autoSave}
                onCheckedChange={(checked) => setSettings({ ...settings, autoSave: checked })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="word-wrap" className="text-right font-medium text-gray-700">
              Word wrap
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Switch
                id="word-wrap"
                checked={settings.wordWrap}
                onCheckedChange={(checked) => setSettings({ ...settings, wordWrap: checked })}
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={handleSaveSettings} 
            className="apple-button-primary rounded-full px-5 py-2"
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
