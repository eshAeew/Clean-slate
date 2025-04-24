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
    lineHeight: 'normal',
    autoSave: true,
    spellCheck: true,
  });

  const handleSaveSettings = () => {
    onUpdateOptions({
      fontSize: settings.fontSize,
      wordWrap: settings.wordWrap ? 'on' : 'off',
      theme: settings.theme === 'dark' ? 'vs-dark' : 'vs',
      minimap: { enabled: false }
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="theme" className="text-right">
              Theme
            </Label>
            <Select 
              value={settings.theme} 
              onValueChange={(value) => setSettings({ ...settings, theme: value })}
            >
              <SelectTrigger id="theme" className="col-span-3">
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
            <Label htmlFor="font-size" className="text-right">
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
            <Label htmlFor="line-height" className="text-right">
              Line Height
            </Label>
            <Select 
              value={settings.lineHeight} 
              onValueChange={(value) => setSettings({ ...settings, lineHeight: value })}
            >
              <SelectTrigger id="line-height" className="col-span-3">
                <SelectValue placeholder="Select line height" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="loose">Loose</SelectItem>
                <SelectItem value="tight">Tight</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="auto-save" className="text-right">
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
            <Label htmlFor="spellcheck" className="text-right">
              Spell checking
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Switch
                id="spellcheck"
                checked={settings.spellCheck}
                onCheckedChange={(checked) => setSettings({ ...settings, spellCheck: checked })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="word-wrap" className="text-right">
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
          <Button onClick={handleSaveSettings}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
