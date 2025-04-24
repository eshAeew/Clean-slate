import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Upload, Plus, Info } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  editorOptions: any;
  onUpdateOptions: (options: any) => void;
}

// List of built-in fonts 
const AVAILABLE_FONTS = [
  { name: "Consolas", value: "Consolas, Monaco, 'Courier New', monospace" },
  { name: "Monaco", value: "Monaco, Consolas, 'Courier New', monospace" },
  { name: "Courier New", value: "'Courier New', Courier, monospace" },
  { name: "Roboto Mono", value: "'Roboto Mono', monospace" },
  { name: "Fira Code", value: "'Fira Code', monospace" },
  { name: "JetBrains Mono", value: "'JetBrains Mono', monospace" },
  { name: "Source Code Pro", value: "'Source Code Pro', monospace" },
  { name: "IBM Plex Mono", value: "'IBM Plex Mono', monospace" },
  { name: "SF Mono", value: "'SF Mono', monospace" },
  { name: "Menlo", value: "Menlo, monospace" },
  { name: "Ubuntu Mono", value: "'Ubuntu Mono', monospace" },
  { name: "Droid Sans Mono", value: "'Droid Sans Mono', monospace" },
  { name: "Anonymous Pro", value: "'Anonymous Pro', monospace" },
  { name: "Cascadia Code", value: "'Cascadia Code', monospace" },
  { name: "Operator Mono", value: "'Operator Mono', monospace" }
];

const SettingsModal = ({ isOpen, onClose, editorOptions, onUpdateOptions }: SettingsModalProps) => {
  // Get stored custom fonts from localStorage
  const getCustomFonts = () => {
    try {
      const stored = localStorage.getItem('custom-fonts');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Error loading custom fonts:", e);
      return [];
    }
  };
  
  const [customFonts, setCustomFonts] = useState(getCustomFonts());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fontUploadAlert, setFontUploadAlert] = useState(false);
  const [newFontName, setNewFontName] = useState("");
  
  const [settings, setSettings] = useState({
    fontSize: editorOptions.fontSize,
    wordWrap: editorOptions.wordWrap === 'on',
    theme: editorOptions.theme === 'vs-dark' ? 'dark' : 'light',
    lineHeight: editorOptions.lineHeight ? 
      (editorOptions.lineHeight >= 1.8 ? 'loose' : 
       editorOptions.lineHeight <= 1.3 ? 'tight' : 'normal') : 'normal',
    fontFamily: editorOptions.fontFamily || AVAILABLE_FONTS[0].value,
    autoSave: true,
  });

  // Handle font file upload
  const handleFontFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Only accept font files
    if (!file.name.match(/\.(woff2?|ttf|otf)$/i)) {
      alert("Please select a valid font file (.woff, .woff2, .ttf, or .otf)");
      return;
    }
    
    // Show dialog to name the font
    setFontUploadAlert(true);
    
    // Read the font file
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        // Store the font data as a data URL
        const fontData = event.target.result as string;
        
        // We'll use this when the user names the font
        localStorage.setItem('temp-font-data', fontData);
      }
    };
    reader.readAsDataURL(file);
  };
  
  // Save the custom font with the provided name
  const saveCustomFont = () => {
    if (!newFontName.trim()) {
      alert("Please provide a name for the font");
      return;
    }
    
    const fontData = localStorage.getItem('temp-font-data');
    if (!fontData) return;
    
    // Create a new style element to load the font
    const fontFace = `
      @font-face {
        font-family: "${newFontName}";
        src: url(${fontData});
        font-weight: normal;
        font-style: normal;
      }
    `;
    
    // Add the font to the document
    const styleEl = document.createElement('style');
    styleEl.textContent = fontFace;
    document.head.appendChild(styleEl);
    
    // Save to localStorage
    const newFont = {
      name: newFontName,
      value: `"${newFontName}", monospace`,
      data: fontData
    };
    
    const updatedFonts = [...customFonts, newFont];
    setCustomFonts(updatedFonts);
    localStorage.setItem('custom-fonts', JSON.stringify(updatedFonts));
    
    // Clean up
    localStorage.removeItem('temp-font-data');
    setNewFontName("");
    setFontUploadAlert(false);
    
    // Set the new font as the current font
    setSettings({ ...settings, fontFamily: newFont.value });
  };

  // Load any previously saved custom fonts when the component mounts
  const loadCustomFonts = () => {
    customFonts.forEach(font => {
      // Create style element for each custom font
      const fontFace = `
        @font-face {
          font-family: "${font.name}";
          src: url(${font.data});
          font-weight: normal;
          font-style: normal;
        }
      `;
      
      const styleEl = document.createElement('style');
      styleEl.textContent = fontFace;
      document.head.appendChild(styleEl);
    });
  };
  
  // Load custom fonts
  useState(() => {
    loadCustomFonts();
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
      fontFamily: settings.fontFamily,
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
            <Label htmlFor="font-family" className="text-right font-medium text-gray-700">
              Font
            </Label>
            <div className="col-span-3">
              <Select 
                value={settings.fontFamily} 
                onValueChange={(value) => setSettings({ ...settings, fontFamily: value })}
              >
                <SelectTrigger id="font-family" className="border-gray-200 rounded-md focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <div className="p-2 flex justify-between items-center border-b">
                    <span className="text-sm font-medium">System Fonts</span>
                  </div>
                  {AVAILABLE_FONTS.map(font => (
                    <SelectItem key={font.name} value={font.value} style={{fontFamily: font.value}}>
                      {font.name}
                    </SelectItem>
                  ))}
                  
                  {customFonts.length > 0 && (
                    <>
                      <div className="p-2 flex justify-between items-center border-b border-t">
                        <span className="text-sm font-medium">Custom Fonts</span>
                      </div>
                      {customFonts.map(font => (
                        <SelectItem key={font.name} value={font.value} style={{fontFamily: font.name}}>
                          {font.name}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
              
              <div className="flex items-center mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs flex items-center gap-1 mr-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={12} />
                  Upload Font
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".woff,.woff2,.ttf,.otf"
                  onChange={handleFontFileChange}
                />
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Info size={12} />
                  Supports .woff, .woff2, .ttf, .otf
                </span>
              </div>
            </div>
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
