import { useState, useEffect, useRef } from "react";
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

// List of built-in fonts
const AVAILABLE_FONTS = [
  { name: "Consolas", value: "Consolas, Monaco, 'Courier New', monospace" },
  { name: "Monaco", value: "Monaco, Consolas, 'Courier New', monospace" },
  { name: "Courier New", value: "'Courier New', Courier, monospace" },
  { name: "System UI", value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" },
  { name: "Roboto Mono", value: "'Roboto Mono', monospace" },
  { name: "Fira Code", value: "'Fira Code', monospace" },
  { name: "JetBrains Mono", value: "'JetBrains Mono', monospace" },
  { name: "Source Code Pro", value: "'Source Code Pro', monospace" },
  { name: "Georgia", value: "Georgia, 'Times New Roman', serif" },
  { name: "Times New Roman", value: "'Times New Roman', Times, serif" }
];

interface CustomFont {
  name: string;
  value: string;
  data: string;
}

const EditorToolbar = ({ onFormat }: EditorToolbarProps) => {
  const [fontSize, setFontSize] = useState<number>(14);
  const [customFonts, setCustomFonts] = useState<CustomFont[]>([]);
  const [currentFont, setCurrentFont] = useState<string>(AVAILABLE_FONTS[0].value);
  const [loadedFonts, setLoadedFonts] = useState(false);
  
  // Use ref to track if this is the initial render
  const initialRender = useRef(true);

  // Load custom fonts from localStorage
  useEffect(() => {
    if (!loadedFonts) {
      try {
        const stored = localStorage.getItem('custom-fonts');
        if (stored) {
          const fonts = JSON.parse(stored);
          setCustomFonts(fonts);
          
          // Load the font styles into the document
          fonts.forEach((font: CustomFont) => {
            if (font.data) {
              const style = document.createElement('style');
              style.textContent = `
                @font-face {
                  font-family: "${font.name}";
                  src: url(${font.data}) format('woff2');
                }
              `;
              document.head.appendChild(style);
            }
          });
        }
      } catch (e) {
        console.error("Error loading custom fonts:", e);
      }
      
      // Get the current editor options to initialize the fontSize and font
      try {
        const editorOptions = localStorage.getItem('editor-options');
        if (editorOptions) {
          const options = JSON.parse(editorOptions);
          if (options.fontSize) {
            setFontSize(options.fontSize);
          }
          if (options.fontFamily) {
            setCurrentFont(options.fontFamily);
          }
        }
      } catch (e) {
        console.error("Error loading editor options:", e);
      }
      
      setLoadedFonts(true);
    }
  }, [loadedFonts, onFormat]);

  // Save options to localStorage when they change
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    
    try {
      const storedOptions = localStorage.getItem('editor-options');
      const options = storedOptions ? JSON.parse(storedOptions) : {};
      options.fontSize = fontSize;
      options.fontFamily = currentFont;
      localStorage.setItem('editor-options', JSON.stringify(options));
    } catch (e) {
      console.error("Error saving editor options:", e);
    }
  }, [fontSize, currentFont]);

  // Handle font change
  const handleFontChange = (value: string) => {
    console.log("Changing font to:", value);
    setCurrentFont(value);
    onFormat("fontFamily", value);
  };

  // Handle font size change
  const decreaseFontSize = () => {
    if (fontSize > 10) {
      const newSize = fontSize - 1;
      console.log("Decreasing font size to:", newSize);
      setFontSize(newSize);
      onFormat("fontSize", newSize);
    }
  };

  const increaseFontSize = () => {
    if (fontSize < 24) {
      const newSize = fontSize + 1;
      console.log("Increasing font size to:", newSize);
      setFontSize(newSize);
      onFormat("fontSize", newSize);
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
          value={currentFont}
          onValueChange={handleFontChange}
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
            
            {/* Custom fonts */}
            {customFonts.map((font: CustomFont) => (
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
