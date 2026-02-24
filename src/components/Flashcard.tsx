import { useState } from "react";
import { cn } from "@/lib/utils";
import { RotateCcw } from "lucide-react";

interface FlashcardProps {
  front: string;
  back: string;
  index: number;
}

export function Flashcard({ front, back, index }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className={cn(
        "flip-card cursor-pointer group",
        isFlipped && "flipped"
      )}
      style={{
        animationDelay: `${index * 100}ms`,
        height: "280px"
      }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className="flip-card-inner">
        {/* Front */}
        <div className="flip-card-front bg-card border border-border shadow-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Question
            </span>
            <RotateCcw className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex-1 overflow-y-auto w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative">
            <div className="min-h-full flex items-center justify-center p-1">
              <p className="text-lg font-serif text-center leading-relaxed text-foreground break-words w-full">
                {front}
              </p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <span className="text-xs text-muted-foreground">Click to flip</span>
          </div>
        </div>

        {/* Back */}
        <div className="flip-card-back bg-primary text-primary-foreground shadow-card p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium uppercase tracking-wider text-primary-foreground/70">
              Answer
            </span>
            <RotateCcw className="w-4 h-4 text-primary-foreground/70 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex-1 overflow-y-auto w-full [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative">
            <div className="min-h-full flex items-center justify-center p-1">
              <p className="text-lg font-serif text-center leading-relaxed break-words w-full">
                {back}
              </p>
            </div>
          </div>
          <div className="mt-4 text-center">
            <span className="text-xs text-primary-foreground/70">Click to flip back</span>
          </div>
        </div>
      </div>
    </div>
  );
}
