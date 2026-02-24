import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { BookOpen, Sparkles, GraduationCap, Brain, Zap, Upload, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface StudyInputProps {
  onGenerate: (data: {
    content: string;
    difficulty: string;
    flashcardCount: number;
    mcqCount: number;
  }) => void;
  isLoading: boolean;
}

const difficulties = [
  { value: "Easy", label: "Easy", description: "Recall & basics", icon: BookOpen },
  { value: "Medium", label: "Medium", description: "Application", icon: Brain },
  { value: "Hard", label: "Hard", description: "Analysis", icon: GraduationCap },
];

export function StudyInput({ onGenerate, isLoading }: StudyInputProps) {
  const [content, setContent] = useState("");
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null);
  const [difficulty, setDifficulty] = useState("Medium");
  const [flashcardCount, setFlashcardCount] = useState([5]);
  const [mcqCount, setMcqCount] = useState([5]);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalContent = (content + "\n\n" + (attachedFile?.content || "")).trim();

    if (!finalContent) return;

    onGenerate({
      content: finalContent,
      difficulty,
      flashcardCount: flashcardCount[0],
      mcqCount: mcqCount[0],
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsReadingFile(true);
    try {
      let extractedText = "";
      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(" ");
          extractedText += pageText + "\n\n";
        }
      } else {
        // Assume text file
        extractedText = await file.text();
      }

      setAttachedFile({ name: file.name, content: extractedText });

    } catch (error) {
      console.error("Error reading file:", error);
      // You might want to add a toast here via prop or context
    } finally {
      setIsReadingFile(false);
      // Reset input to allow resizing same file if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeFile = () => {
    setAttachedFile(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Content Input */}
      <div className="space-y-6">

        {/* File Upload Section */}
        <div className="bg-card border border-border rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-secondary" />
              Upload Notes
            </Label>
            <span className="text-xs text-muted-foreground bg-secondary/10 px-2 py-1 rounded">
              Optional
            </span>
          </div>

          {!attachedFile ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5 transition-all rounded-lg p-6 cursor-pointer text-center",
                (isReadingFile || isLoading) && "pointer-events-none opacity-50"
              )}
            >
              <input
                type="file"
                accept=".txt,.pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                {isReadingFile ? (
                  <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-2" />
                ) : (
                  <Upload className="w-8 h-8 mb-2 text-muted-foreground/50" />
                )}
                <p className="text-sm font-medium text-foreground">Click to upload PDF or Text file</p>
                <p className="text-xs">Supported formats: .pdf, .txt</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium truncate">{attachedFile.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {(attachedFile.content.length / 1000).toFixed(1)}k characters extracted
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                onClick={removeFile}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Text Area Section */}
        <div className="space-y-3">
          <Label htmlFor="content" className="text-base font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-secondary" />
            Additional Text / Topic
          </Label>
          <Textarea
            id="content"
            placeholder={attachedFile ? "e.g., Focus on chapter 3, or generate harder questions..." : "Enter a topic (e.g., 'Quantum Physics') or paste text here..."}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] text-base resize-none bg-background border-border focus:border-primary focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Difficulty Selection */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Difficulty Level</Label>
        <div className="grid grid-cols-3 gap-3">
          {difficulties.map((diff) => {
            const Icon = diff.icon;
            const isSelected = difficulty === diff.value;
            return (
              <button
                key={diff.value}
                type="button"
                onClick={() => setDifficulty(diff.value)}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all duration-200 text-left",
                  isSelected
                    ? "border-primary bg-primary/5 shadow-soft"
                    : "border-border hover:border-primary/30 hover:bg-muted/50"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 mb-2",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )} />
                <div className={cn(
                  "font-semibold text-sm",
                  isSelected ? "text-primary" : "text-foreground"
                )}>
                  {diff.label}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {diff.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Flashcards</Label>
            <span className="text-2xl font-bold text-primary">{flashcardCount[0]}</span>
          </div>
          <Slider
            value={flashcardCount}
            onValueChange={setFlashcardCount}
            min={1}
            max={15}
            step={1}
            className="w-full"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">MCQs</Label>
            <span className="text-2xl font-bold text-primary">{mcqCount[0]}</span>
          </div>
          <Slider
            value={mcqCount}
            onValueChange={setMcqCount}
            min={1}
            max={15}
            step={1}
            className="w-full"
          />
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="hero"
        size="xl"
        disabled={isLoading || (!content.trim() && !attachedFile)}
        className="w-full"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
            Generating Study Materials...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" />
            Generate Study Materials
          </>
        )}
      </Button>
    </form>
  );
}
