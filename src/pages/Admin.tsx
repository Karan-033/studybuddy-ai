import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    BookOpen,
    ArrowLeft,
    Loader2,
    Shield,
    Users,
    KeyRound,
    Trash2,
    ChevronDown,
    Search,
    RefreshCw,
    UserCircle2,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AdminUser {
    id: string;
    email: string;
    role: string;
    createdAt: string;
    sessionCount: number;
}

export default function Admin() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [filtered, setFiltered] = useState<AdminUser[]>([]);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    // Reset password dialog
    const [resetTarget, setResetTarget] = useState<AdminUser | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [resetLoading, setResetLoading] = useState(false);

    // Delete confirm dialog
    const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const { user } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    /* ─── Auth guard ─── */
    useEffect(() => {
        if (!user) { navigate("/auth"); return; }
        if (user.role !== "admin") {
            toast({ title: "Access Denied", description: "Admin only.", variant: "destructive" });
            navigate("/");
            return;
        }
        fetchUsers();
    }, [user]);

    /* ─── Search filter ─── */
    useEffect(() => {
        const q = search.toLowerCase();
        setFiltered(users.filter(u => u.email.toLowerCase().includes(q) || u.role.includes(q)));
    }, [search, users]);

    const authHeaders = () => ({
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
    });

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const res = await fetch(`${API_URL}/api/admin/users`, { headers: authHeaders() });
            if (!res.ok) throw new Error("Failed to fetch users");
            const data = await res.json();
            setUsers(data);
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    };

    /* ─── Change role ─── */
    const updateRole = async (userId: string, newRole: string) => {
        try {
            setUpdatingId(userId);
            const res = await fetch(`${API_URL}/api/admin/users/${userId}/role`, {
                method: "PATCH",
                headers: authHeaders(),
                body: JSON.stringify({ role: newRole }),
            });
            if (!res.ok) throw new Error("Failed to update role");
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
            toast({ title: "Role updated", description: `User is now a ${newRole}.` });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setUpdatingId(null);
        }
    };

    /* ─── Admin password reset ─── */
    const handleResetPassword = async () => {
        if (!resetTarget) return;
        if (!newPassword || newPassword.length < 6) {
            toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" });
            return;
        }
        try {
            setResetLoading(true);
            const res = await fetch(`${API_URL}/api/admin/users/${resetTarget.id}/reset-password`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({ newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast({ title: "Password reset!", description: `New password set for ${resetTarget.email}.` });
            setResetTarget(null);
            setNewPassword("");
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setResetLoading(false);
        }
    };

    /* ─── Delete user ─── */
    const handleDeleteUser = async () => {
        if (!deleteTarget) return;
        try {
            setDeleteLoading(true);
            const res = await fetch(`${API_URL}/api/admin/users/${deleteTarget.id}`, {
                method: "DELETE",
                headers: authHeaders(),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
            toast({ title: "User deleted", description: `${deleteTarget.email} has been removed.` });
            setDeleteTarget(null);
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-soft">
                            <BookOpen className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <div>
                            <h1 className="text-xl font-serif font-bold text-foreground">StudyAI</h1>
                            <p className="text-xs text-muted-foreground">Admin Panel</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={fetchUsers} title="Refresh">
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
                            <ArrowLeft className="w-4 h-4" /> Back to App
                        </Button>
                    </div>
                </div>
            </header>

            <main className="container max-w-6xl mx-auto px-4 py-8">

                {/* Page title */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-foreground">User Management</h2>
                        <p className="text-muted-foreground text-sm">Search users, reset passwords, manage roles</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                    {[
                        { label: "Total Users", value: users.length, icon: <Users className="w-5 h-5 text-primary" /> },
                        { label: "Admins", value: users.filter(u => u.role === "admin").length, icon: <Shield className="w-5 h-5 text-primary" /> },
                        { label: "Total Sessions", value: users.reduce((a, u) => a + u.sessionCount, 0), icon: <BookOpen className="w-5 h-5 text-primary" /> },
                    ].map((s, i) => (
                        <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">{s.icon}</div>
                            <div>
                                <div className="text-2xl font-bold text-foreground">{s.value}</div>
                                <div className="text-xs text-muted-foreground">{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search bar */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by email..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Users Table */}
                <div className="bg-card border border-border rounded-xl shadow-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">
                            All Users {search && <span className="text-muted-foreground text-sm font-normal">— {filtered.length} result(s)</span>}
                        </h3>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-16 text-muted-foreground">
                            {search ? "No users match your search." : "No users found."}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-muted/30">
                                        {["Email", "Role", "Sessions", "Joined", "Actions"].map((h, i) => (
                                            <th key={i} className={`px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide ${i === 4 ? "text-right" : "text-left"}`}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((u, i) => (
                                        <tr key={u.id} className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${i % 2 !== 0 ? "bg-muted/10" : ""}`}>
                                            {/* Email */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm text-foreground">
                                                    <UserCircle2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                                                    {u.email}
                                                    {u.id === user?.id && (
                                                        <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">You</span>
                                                    )}
                                                </div>
                                            </td>
                                            {/* Role */}
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${u.role === "admin" ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
                                                    {u.role === "admin" && <Shield className="w-3 h-3" />}
                                                    {u.role}
                                                </span>
                                            </td>
                                            {/* Sessions */}
                                            <td className="px-6 py-4 text-sm text-muted-foreground">{u.sessionCount}</td>
                                            {/* Joined */}
                                            <td className="px-6 py-4 text-sm text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</td>
                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                {updatingId === u.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin ml-auto text-primary" />
                                                ) : (
                                                    <div className="flex items-center justify-end gap-2">
                                                        {/* Reset Password */}
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="gap-1 text-xs"
                                                            onClick={() => { setResetTarget(u); setNewPassword(""); }}
                                                        >
                                                            <KeyRound className="w-3 h-3" />
                                                            Reset Password
                                                        </Button>

                                                        {/* Role + Delete dropdown */}
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="outline" size="sm" className="gap-1">
                                                                    More <ChevronDown className="w-3 h-3" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem
                                                                    onClick={() => updateRole(u.id, "user")}
                                                                    disabled={u.role === "user" || u.id === user?.id}
                                                                >
                                                                    Set as User
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem
                                                                    onClick={() => updateRole(u.id, "admin")}
                                                                    disabled={u.role === "admin"}
                                                                >
                                                                    Set as Admin
                                                                </DropdownMenuItem>
                                                                {u.id !== user?.id && (
                                                                    <>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem
                                                                            className="text-destructive focus:text-destructive"
                                                                            onClick={() => setDeleteTarget(u)}
                                                                        >
                                                                            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                                                            Delete User
                                                                        </DropdownMenuItem>
                                                                    </>
                                                                )}
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>

            {/* ─── Reset Password Dialog ─── */}
            <Dialog open={!!resetTarget} onOpenChange={(o) => { if (!o) { setResetTarget(null); setNewPassword(""); } }}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <KeyRound className="w-5 h-5 text-primary" />
                            Reset Password
                        </DialogTitle>
                        <DialogDescription>
                            Set a new password for <span className="font-medium text-foreground">{resetTarget?.email}</span>.
                            Share the new password with them securely.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 pt-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="admin-new-pw">New Password</Label>
                            <Input
                                id="admin-new-pw"
                                type="text"
                                placeholder="Enter new password (min 6 chars)"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => { setResetTarget(null); setNewPassword(""); }}>Cancel</Button>
                            <Button className="flex-1" onClick={handleResetPassword} disabled={resetLoading}>
                                {resetLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Set Password
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* ─── Delete Confirm Dialog ─── */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete User?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <span className="font-medium text-foreground">{deleteTarget?.email}</span> and all their study sessions. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleDeleteUser}
                            disabled={deleteLoading}
                        >
                            {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
