import { Flashcard } from "./Flashcard";
import { MCQCard } from "./MCQCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, ListChecks, Trophy, RotateCcw, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { saveStudySession } from "@/lib/study-service";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface StudyMaterial {
  flashcards: Array<{ front: string; back: string }>;
  mcqs: Array<{
    question: string;
    options: string[];
    correct_answer: string;
    explanation: string;
  }>;
}

interface StudyResultsProps {
  materials: StudyMaterial;
  content: string;
  difficulty: string;
  onReset: () => void;
  onSaved?: () => void;
  isSaved?: boolean;
}

export function StudyResults({ materials, content, difficulty, onReset, onSaved, isSaved }: StudyResultsProps) {
  const { flashcards, mcqs } = materials;
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [title, setTitle] = useState("");

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save your study materials.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your study session.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);
      await saveStudySession({
        userId: user.id,
        title: title.trim(),
        content,
        difficulty,
        materials,
      });
      toast({
        title: "Saved to library!",
        description: "Your study materials are now in your library.",
      });
      setShowSaveDialog(false);
      onSaved?.();
    } catch (error) {
      console.error("Error saving session:", error);
      toast({
        title: "Save failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h2 className="text-xl font-serif font-semibold text-foreground">
              Your Study Materials
            </h2>
            <p className="text-sm text-muted-foreground">
              {flashcards.length} flashcards • {mcqs.length} questions
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user && !isSaved && (
            showSaveDialog ? (
              <div className="flex items-center gap-2 animate-fade-in">
                <Input
                  placeholder="Session title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-48"
                  autoFocus
                />
                <Button
                  variant="hero"
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving || !title.trim()}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save"
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSaveDialog(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="secondary"
                onClick={() => setShowSaveDialog(true)}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                Save to Library
              </Button>
            )
          )}
          <Button variant="outline" onClick={onReset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            New Topic
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="flashcards" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="flashcards" className="gap-2">
            <BookOpen className="w-4 h-4" />
            Flashcards ({flashcards.length})
          </TabsTrigger>
          <TabsTrigger value="mcqs" className="gap-2">
            <ListChecks className="w-4 h-4" />
            MCQs ({mcqs.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flashcards" className="mt-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {flashcards.map((card, index) => (
              <Flashcard
                key={index}
                front={card.front}
                back={card.back}
                index={index}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="mcqs" className="mt-0">
          <div className="grid gap-6 lg:grid-cols-2">
            {mcqs.map((mcq, index) => (
              <MCQCard
                key={index}
                question={mcq.question}
                options={mcq.options}
                correctAnswer={mcq.correct_answer}
                explanation={mcq.explanation}
                index={index}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
