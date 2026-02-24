import express from 'express';
import prisma from '../lib/prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Middleware: require admin role
const requireAdmin = (req: AuthRequest, res: express.Response, next: express.NextFunction) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// GET /api/admin/users - List all users and session counts
router.get('/users', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                _count: {
                    select: { sessions: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const formatted = users.map((u: any) => ({
            id: u.id,
            email: u.email,
            role: u.role,
            createdAt: u.createdAt,
            sessionCount: u._count.sessions,
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Admin users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// PATCH /api/admin/users/:id/role - Update user role
router.patch('/users/:id/role', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role. Must be "user" or "admin"' });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { role },
            select: { id: true, email: true, role: true },
        });

        res.json(updatedUser);
    } catch (error) {
        console.error('Update role error:', error);
        res.status(500).json({ error: 'Failed to update role' });
    }
});

// POST /api/admin/users/:id/reset-password - Admin resets a user's password
router.post('/users/:id/reset-password', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const bcrypt = require('bcryptjs');
        const hashed = await bcrypt.hash(newPassword, 10);

        const user = await prisma.user.update({
            where: { id },
            data: { password: hashed },
            select: { id: true, email: true },
        });

        res.json({ success: true, message: `Password reset for ${user.email}` });
    } catch (error) {
        console.error('Admin reset password error:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// DELETE /api/admin/users/:id - Delete a user
router.delete('/users/:id', authenticateToken, requireAdmin, async (req: AuthRequest, res) => {
    try {
        const { id } = req.params;

        // Don't allow admins to delete themselves
        if (id === req.user?.userId) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        await prisma.studySession.deleteMany({ where: { userId: id } });
        await prisma.user.delete({ where: { id } });

        res.json({ success: true });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

export default router;
