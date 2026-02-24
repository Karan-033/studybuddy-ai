import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import authRoutes from './routes/auth';
import studyRoutes from './routes/study';
import adminRoutes from './routes/admin';



dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/study', studyRoutes);
app.use('/api/admin', adminRoutes);



// Add Health Check Endpoint for Railway
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.post('/api/generate-study-materials', async (req, res) => {
    try {
        const { content, difficulty, flashcardCount, mcqCount } = req.body;

        console.log("Generating study materials:", { difficulty, flashcardCount, mcqCount });

        const key = process.env.GEMINI_API_KEY;
        if (!key) {
            throw new Error("GEMINI_API_KEY is not configured");
        }

        const genAI = new GoogleGenerativeAI(key);
        // Use a model that supports JSON mode if available, or just standard flash
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp", generationConfig: { responseMimeType: "application/json" } });

        const systemPrompt = `You are an advanced AI Study Assistant. Your goal is to analyze the provided text, topic, or image descriptions and generate high-quality study materials tailored to the requested difficulty level.

You must output your response in STRICT JSON format only. Do not add markdown formatting (like \`\`\`json) or conversational text.

OUTPUT STRUCTURE (JSON Schema):
{
  "flashcards": [
    {
      "front": "The concept, term, or question",
      "back": "The clear, concise definition or answer"
    }
  ],
  "mcqs": [
    {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": "The exact string of the correct option",
      "explanation": "A brief explanation of why the correct answer is right and/or why others are wrong."
    }
  ]
}

GUIDELINES:
1. For "Hard" difficulty, create scenarios or complex reasoning questions rather than simple definition checks.
2. For "Medium" difficulty, focus on application and understanding questions.
3. For "Easy" difficulty, focus on recall and basic comprehension.
4. Ensure distractors (wrong MCQ options) are plausible but clearly incorrect.
5. Keep flashcard "backs" concise (under 2 sentences) for easy memorization.
6. If the input text is insufficient, expand based on your knowledge of the topic.
7. Make questions educational and engaging.`;

        const userPrompt = `Generate study materials for the following content:

CONTENT/TOPIC:
${content}

REQUIREMENTS:
- Difficulty Level: ${difficulty}
- Number of Flashcards: ${flashcardCount}
- Number of MCQs: ${mcqCount}

Generate exactly ${flashcardCount} flashcards and ${mcqCount} multiple choice questions. Return ONLY valid JSON, no other text.`;

        const result = await model.generateContent([systemPrompt, userPrompt]);
        const response = await result.response;
        const text = response.text();

        console.log("Raw AI response:", text);

        // Parse JSON from the response (handle potential markdown code blocks if the model ignores MIME type)
        let parsedContent;
        try {
            // Remove potential markdown code block wrapping
            let cleanContent = text.trim();
            if (cleanContent.startsWith("```json")) {
                cleanContent = cleanContent.slice(7);
            } else if (cleanContent.startsWith("```")) {
                cleanContent = cleanContent.slice(3);
            }
            if (cleanContent.endsWith("```")) {
                cleanContent = cleanContent.slice(0, -3);
            }
            cleanContent = cleanContent.trim();

            parsedContent = JSON.parse(cleanContent);
        } catch (parseError) {
            console.error("Failed to parse AI response:", parseError);
            throw new Error("Invalid response format from AI");
        }

        console.log("Successfully generated study materials");

        res.json(parsedContent);

    } catch (error) {
        console.error("Error generating study materials:", error);
        res.status(500).json({ error: error instanceof Error ? error.message : "Unknown error occurred" });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Global Error Handling to prevent crashes
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});

process.on('unhandledRejection', (err: any) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    // Optional: gracefully close server
});
