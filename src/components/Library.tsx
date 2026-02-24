import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { fetchStudySessions, deleteStudySession } from "@/lib/study-service";
import { Button } from "@/components/ui/button";
import { BookOpen, Plus, Trash2, Clock, GraduationCap, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface StudySession {
  id: string;
  title: string;
  content: string;
  difficulty: string;
  created_at: string;
  flashcard_count: number;
  mcq_count: number;
}

interface LibraryProps {
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
}

export function Library({ onSelectSession, onNewSession }: LibraryProps) {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  const loadSessions = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const data = await fetchStudySessions(user.id);
      setSessions(data);
    } catch (error) {
      console.error("Error loading sessions:", error);
      toast({
        title: "Failed to load library",
        description: "Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    
    try {
      setDeletingId(sessionId);
      await deleteStudySession(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      toast({
        title: "Session deleted",
        description: "The study session has been removed from your library.",
      });
    } catch (error) {
      console.error("Error deleting session:", error);
      toast({
        title: "Delete failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy":
        return "bg-accent/10 text-accent";
      case "Medium":
        return "bg-secondary/10 text-secondary";
      case "Hard":
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif font-bold text-foreground">Your Library</h2>
          <p className="text-muted-foreground">
            {sessions.length} {sessions.length === 1 ? "study session" : "study sessions"} saved
          </p>
        </div>
        <Button onClick={onNewSession} variant="hero" className="gap-2">
          <Plus className="w-4 h-4" />
          New Session
        </Button>
      </div>

      {/* Sessions Grid */}
      {sessions.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No study sessions yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first study session to start building your library
          </p>
          <Button onClick={onNewSession} variant="secondary" className="gap-2">
            <Plus className="w-4 h-4" />
            Create Study Session
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session, index) => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={cn(
                "text-left bg-card border border-border rounded-lg p-5 shadow-soft",
                "hover:shadow-card hover:border-primary/30 transition-all duration-200",
                "animate-fade-in group"
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium",
                    getDifficultyColor(session.difficulty)
                  )}
                >
                  {session.difficulty}
                </span>
                <button
                  onClick={(e) => handleDelete(e, session.id)}
                  disabled={deletingId === session.id}
                  className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                >
                  {deletingId === session.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>

              <h3 className="font-serif font-semibold text-foreground mb-2 line-clamp-2">
                {session.title}
              </h3>

              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {session.content.slice(0, 100)}...
              </p>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  {session.flashcard_count} cards
                </span>
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {session.mcq_count} MCQs
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
                <Clock className="w-3.5 h-3.5" />
                {formatDate(session.created_at)}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
