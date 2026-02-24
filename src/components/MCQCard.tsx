import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, X, Lightbulb } from "lucide-react";

interface MCQCardProps {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  index: number;
}

export function MCQCard({ question, options, correctAnswer, explanation, index }: MCQCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const isCorrect = selectedAnswer === correctAnswer;
  const hasAnswered = selectedAnswer !== null;

  const handleSelect = (option: string) => {
    if (!hasAnswered) {
      setSelectedAnswer(option);
      setShowExplanation(true);
    }
  };

  const reset = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  return (
    <div
      className="bg-card border border-border rounded-lg shadow-card p-6 animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
          {index + 1}
        </span>
        {hasAnswered && (
          <button
            onClick={reset}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Try again
          </button>
        )}
      </div>

      <h3 className="text-lg font-serif font-medium text-foreground mb-6 leading-relaxed">
        {question}
      </h3>

      <div className="space-y-3">
        {options.map((option, optIndex) => {
          const isSelected = selectedAnswer === option;
          const isCorrectOption = option === correctAnswer;
          const showCorrectHighlight = hasAnswered && isCorrectOption;
          const showIncorrectHighlight = hasAnswered && isSelected && !isCorrectOption;

          return (
            <button
              key={optIndex}
              onClick={() => handleSelect(option)}
              disabled={hasAnswered}
              className={cn(
                "w-full text-left p-4 rounded-lg border transition-all duration-200",
                "hover:border-primary/50 hover:bg-muted/50",
                !hasAnswered && "cursor-pointer",
                hasAnswered && "cursor-default",
                showCorrectHighlight && "bg-accent/10 border-accent text-foreground",
                showIncorrectHighlight && "bg-destructive/10 border-destructive text-foreground",
                !showCorrectHighlight && !showIncorrectHighlight && "border-border bg-background"
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{option}</span>
                {showCorrectHighlight && (
                  <Check className="w-5 h-5 text-accent" />
                )}
                {showIncorrectHighlight && (
                  <X className="w-5 h-5 text-destructive" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {showExplanation && (
        <div className={cn(
          "mt-6 p-4 rounded-lg animate-fade-in",
          isCorrect ? "bg-accent/10 border border-accent/30" : "bg-secondary/10 border border-secondary/30"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className={cn(
              "w-4 h-4",
              isCorrect ? "text-accent" : "text-secondary"
            )} />
            <span className={cn(
              "text-sm font-semibold",
              isCorrect ? "text-accent" : "text-secondary"
            )}>
              {isCorrect ? "Correct!" : "Not quite right"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {explanation}
          </p>
        </div>
      )}
    </div>
  );
}
