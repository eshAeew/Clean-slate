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
      <Link href="/editor" onClick={handleNewNote}>
        <Button 
          size="icon" 
          className="rounded-full h-14 w-14 bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 shadow-xl transition-all duration-200 border-2 border-white dark:border-gray-800 flex items-center justify-center transform hover:scale-105"
          title="Create new note"
        >
          <Edit className="h-7 w-7 text-white drop-shadow-sm" />
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
