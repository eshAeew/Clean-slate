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
import StyledButton from "@/components/StyledButton";
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
    <div className="fixed bottom-8 right-8 flex flex-col z-50">
      <Link href="/editor" onClick={handleNewNote} className="block relative">
        <div className="absolute inset-0 w-full h-full opacity-30 animate-pulse-ring"></div>
        <StyledButton text="New Note" />
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
