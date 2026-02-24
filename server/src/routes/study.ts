import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all sessions for user
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        const sessions = await prisma.studySession.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { flashcards: true, mcqs: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const formattedSessions = sessions.map((session: any) => ({
            ...session,
            flashcard_count: session._count.flashcards,
            mcq_count: session._count.mcqs,
        }));

        res.json(formattedSessions);
    } catch (error) {
        console.error('Fetch sessions error:', error);
        res.status(500).json({ error: 'Failed to fetch sessions' });
    }
});

// Get single session
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;

        const session = await prisma.studySession.findFirst({
            where: { id, userId },
            include: { flashcards: true, mcqs: true },
        });

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        const response = {
            session: {
                id: session.id,
                title: session.title,
                content: session.content,
                difficulty: session.difficulty,
                created_at: session.createdAt,
            },
            materials: {
                flashcards: session.flashcards.map((f: any) => ({ front: f.front, back: f.back })),
                mcqs: session.mcqs.map((m: any) => ({
                    question: m.question,
                    options: JSON.parse(m.options),
                    correct_answer: m.correctAnswer,
                    explanation: m.explanation,
                })),
            },
        };

        res.json(response);
    } catch (error) {
        console.error('Fetch session error:', error);
        res.status(500).json({ error: 'Failed to fetch session' });
    }
});

interface CreateSessionBody {
    title: string;
    content: string;
    difficulty: string;
    materials: {
        flashcards: { front: string; back: string }[];
        mcqs: {
            question: string;
            options: string[];
            correct_answer: string;
            explanation: string;
        }[];
    };
}

// Create new session
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { title, content, difficulty, materials } = req.body as CreateSessionBody;

        const result = await prisma.$transaction(async (tx: any) => {
            const session = await tx.studySession.create({
                data: {
                    title,
                    content,
                    difficulty,
                    userId,
                }
            });

            if (materials.flashcards?.length) {
                await tx.flashcard.createMany({
                    data: materials.flashcards.map((f: any) => ({
                        sessionId: session.id,
                        front: f.front,
                        back: f.back,
                    })),
                });
            }

            if (materials.mcqs?.length) {
                await tx.mCQ.createMany({
                    data: materials.mcqs.map((m: any) => ({
                        sessionId: session.id,
                        question: m.question,
                        options: JSON.stringify(m.options),
                        correctAnswer: m.correct_answer,
                        explanation: m.explanation,
                    })),
                });
            }

            return session;
        });

        res.json(result);
    } catch (error) {
        console.error('Save session error:', error);
        res.status(500).json({ error: 'Failed to save session' });
    }
});

// Delete session
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;

        const session = await prisma.studySession.findFirst({ where: { id, userId } });
        if (!session) {
            return res.status(404).json({ error: 'Session not found or unauthorized' });
        }

        await prisma.studySession.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        console.error('Delete session error:', error);
        res.status(500).json({ error: 'Failed to delete session' });
    }
});

export default router;
