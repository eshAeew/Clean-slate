import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Editor from "@/pages/Editor";
import Notes from "@/pages/Notes";
import { ThemeProvider } from "next-themes";
import { Button } from "@/components/ui/button";
import { Edit, FileText } from "lucide-react";
//import UserGuide from "@/components/UserGuide";

// Navigation component
const Navigation = () => {
  const [location] = useLocation();
  
  // If we're in the editor, don't show the navigation buttons as they're handled by the editor page
  if (location === '/editor') {
    return null;
  }
  
  // Handler for the "New Note" button
  const handleNewNote = () => {
    // Clear any existing editing note data
    localStorage.removeItem('editingNote');
  };
  
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      <Link href="/editor" onClick={handleNewNote} className="block relative group">
        {/* Pulsing effect */}
        <div className="absolute inset-0 rounded-full bg-blue-400 opacity-30 animate-pulse-ring group-hover:opacity-40"></div>
        
        {/* Main button */}
        <Button 
          size="icon" 
          className="relative rounded-full h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-2xl transition-all duration-300 border-2 border-white/80 dark:border-gray-800/80 flex items-center justify-center transform hover:scale-110 hover:rotate-3"
          title="Create new note"
        >
          <div className="absolute inset-0 rounded-full bg-blue-400/20 animate-pulse"></div>
          <div className="relative z-10 flex items-center justify-center">
            <Edit className="h-7 w-7 text-white drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
          </div>
          
          {/* Label tooltip */}
          <div className="absolute right-full mr-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm font-medium px-3 py-1.5 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap transform translate-x-4 group-hover:translate-x-0 pointer-events-none">
            Create new note
            <div className="absolute top-1/2 -right-1 transform -translate-y-1/2 rotate-45 w-2 h-2 bg-white dark:bg-gray-800"></div>
          </div>
          
          <span className="sr-only">Create new note</span>
        </Button>
      </Link>
    </div>
  );
};

function Router() {
  return (
    <>
      <Switch>
        <Route path="/" component={Notes} />
        <Route path="/editor" component={Editor} />
        <Route path="/notes" component={Notes} />
        <Route component={NotFound} />
      </Switch>
      <Navigation />
      {/* UserGuide is now added directly in Notes.tsx */}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
