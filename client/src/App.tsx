import { Switch, Route, Link } from "wouter";
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
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
      <Link href="/editor">
        <Button size="icon" className="rounded-full h-12 w-12 bg-blue-600 hover:bg-blue-700 shadow-lg">
          <Edit className="h-6 w-6" />
        </Button>
      </Link>
      <Link href="/notes">
        <Button size="icon" className="rounded-full h-12 w-12 bg-green-600 hover:bg-green-700 shadow-lg">
          <FileText className="h-6 w-6" />
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
