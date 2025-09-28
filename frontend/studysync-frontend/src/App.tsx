import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Layout from "./components/Layout";
import AuthLayout from "./components/AuthLayout";
import AuthGuard from "./components/AuthGuard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyNotes from "./pages/MyNotes";
import SharedNotes from "./pages/SharedNotes";
import NotesSharedByMe from "./pages/NotesSharedByMe";
import Profile from "./pages/Profile";
import AddEditNote from "./pages/AddEditNote";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<AuthLayout><Login /></AuthLayout>} />
            <Route path="/register" element={<AuthLayout><Register /></AuthLayout>} />
            
            {/* Protected routes */}
            <Route path="/" element={<AuthGuard><Layout><Dashboard /></Layout></AuthGuard>} />
            <Route path="/dashboard" element={<AuthGuard><Layout><Dashboard /></Layout></AuthGuard>} />
            <Route path="/my-notes" element={<AuthGuard><Layout><MyNotes /></Layout></AuthGuard>} />
            <Route path="/shared-notes" element={<AuthGuard><Layout><SharedNotes /></Layout></AuthGuard>} />
            <Route path="/notes-shared-by-me" element={<AuthGuard><Layout><NotesSharedByMe /></Layout></AuthGuard>} />
            <Route path="/profile" element={<AuthGuard><Layout><Profile /></Layout></AuthGuard>} />
            <Route path="/add-note" element={<AuthGuard><Layout><AddEditNote /></Layout></AuthGuard>} />
            <Route path="/edit-note/:id" element={<AuthGuard><Layout><AddEditNote /></Layout></AuthGuard>} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
