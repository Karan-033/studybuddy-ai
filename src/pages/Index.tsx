import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StudyInput } from "@/components/StudyInput";
import { StudyResults } from "@/components/StudyResults";
import { Library } from "@/components/Library";
// import { supabase } from "@/integrations/supabase/client"; // Removed unused import

import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { fetchStudySession } from "@/lib/study-service";
import { BookOpen, Sparkles, User, LogOut, Library as LibraryIcon, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChangePasswordDialog } from "@/components/ChangePasswordDialog";

interface StudyMaterial {
  flashcards: Array<{ front: string; back: string }>;
  mcqs: Array<{
    question: string;
    options: string[];
    correct_answer: string;
    explanation: string;
  }>;
}

type View = "input" | "results" | "library";

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [materials, setMaterials] = useState<StudyMaterial | null>(null);
  const [currentContent, setCurrentContent] = useState("");
  const [currentDifficulty, setCurrentDifficulty] = useState("");
  const [view, setView] = useState<View>("input");
  const [isSaved, setIsSaved] = useState(false);
  const [isLoadingSession, setIsLoadingSession] = useState(false);

  const { toast } = useToast();
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const handleGenerate = async (data: {
    content: string;
    difficulty: string;
    flashcardCount: number;
    mcqCount: number;
  }) => {
    setIsLoading(true);
    setCurrentContent(data.content);
    setCurrentDifficulty(data.difficulty);
    setIsSaved(false);

    try {
      // Use the new Node.js backend
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/generate-study-materials`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Error ${response.status}: Failed to generate materials`);
      }


      // if (error) block removed as fetch handles errors via response.ok


      // Result error check handled above


      setMaterials(result);
      setView("results");
      toast({
        title: "Study materials generated!",
        description: `Created ${result.flashcards?.length || 0} flashcards and ${result.mcqs?.length || 0} questions.`,
      });
    } catch (error) {
      console.error("Error generating materials:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMaterials(null);
    setCurrentContent("");
    setCurrentDifficulty("");
    setIsSaved(false);
    setView("input");
  };

  const handleSelectSession = async (sessionId: string) => {
    try {
      setIsLoadingSession(true);
      const data = await fetchStudySession(sessionId);
      setMaterials(data.materials);
      setCurrentContent(data.session.content);
      setCurrentDifficulty(data.session.difficulty);
      setIsSaved(true);
      setView("results");
    } catch (error) {
      console.error("Error loading session:", error);
      toast({
        title: "Failed to load session",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSession(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "Come back soon!",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleReset}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-soft">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-serif font-bold text-foreground">StudyAI</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Study Assistant</p>
              </div>
            </button>

            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Button
                    variant={view === "library" ? "secondary" : "ghost"}
                    onClick={() => setView(view === "library" ? "input" : "library")}
                    className="gap-2"
                  >
                    <LibraryIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Library</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <User className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        {user.email}
                      </div>
                      <DropdownMenuSeparator />
                      {user.role === "admin" && (
                        <DropdownMenuItem onClick={() => navigate("/admin")}>
                          <Shield className="w-4 h-4 mr-2" />
                          Admin Panel
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <ChangePasswordDialog />
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button onClick={() => navigate("/auth")} variant="hero">
                  Sign in
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 md:py-12">
        {isLoadingSession ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : view === "library" && user ? (
          <Library
            onSelectSession={handleSelectSession}
            onNewSession={() => setView("input")}
          />
        ) : view === "results" && materials ? (
          <StudyResults
            materials={materials}
            content={currentContent}
            difficulty={currentDifficulty}
            onReset={handleReset}
            onSaved={() => setIsSaved(true)}
            isSaved={isSaved}
          />
        ) : (
          <div className="max-w-2xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Powered by AI
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-4 leading-tight">
                Transform any topic into
                <span className="block text-primary">study materials</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto">
                Enter your study content or topic, and let AI generate flashcards
                and quiz questions tailored to your learning needs.
              </p>
            </div>

            {/* Input Card */}
            <div className="bg-card border border-border rounded-xl shadow-card p-6 md:p-8">
              <StudyInput onGenerate={handleGenerate} isLoading={isLoading} />
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                { title: "Flashcards", desc: "Flip to learn" },
                { title: "Multiple Choice", desc: "Test yourself" },
                { title: "3 Difficulty Levels", desc: "Match your pace" },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="text-center p-4 rounded-lg bg-muted/30"
                >
                  <div className="font-semibold text-sm text-foreground">{feature.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{feature.desc}</div>
                </div>
              ))}
            </div>

            {/* Sign in prompt for non-authenticated users */}
            {!user && (
              <div className="mt-8 text-center p-6 bg-primary/5 border border-primary/20 rounded-xl">
                <p className="text-sm text-muted-foreground mb-3">
                  Sign in to save your study materials and build your personal library
                </p>
                <Button onClick={() => navigate("/auth")} variant="hero" size="sm">
                  Sign in to save
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-auto">
        <div className="container max-w-5xl mx-auto px-4 text-center text-sm text-muted-foreground">
          StudyAI — Making learning smarter, one flashcard at a time.
        </div>
      </footer>
    </div>
  );
};

export default Index;
