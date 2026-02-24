import { useState } from "react";
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
    DialogTrigger,
} from "@/components/ui/dialog";
import { Lock, Loader2, KeyRound } from "lucide-react";

export function ChangePasswordDialog() {
    const [open, setOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});

    const { toast } = useToast();
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

    const validate = () => {
        const errs: typeof errors = {};
        if (!currentPassword) errs.current = "Current password is required";
        if (!newPassword || newPassword.length < 6) errs.new = "New password must be at least 6 characters";
        if (newPassword !== confirmPassword) errs.confirm = "Passwords do not match";
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setIsLoading(true);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/auth/change-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to change password");

            toast({ title: "Password changed!", description: "Your password has been updated successfully." });
            setOpen(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setErrors({});
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to change password.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground w-full"
                >
                    <KeyRound className="w-4 h-4" />
                    Change Password
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-primary" />
                        Change Password
                    </DialogTitle>
                    <DialogDescription>
                        Enter your current password and choose a new one.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input
                            id="current-password"
                            type="password"
                            placeholder="••••••••"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className={errors.current ? "border-destructive" : ""}
                        />
                        {errors.current && <p className="text-xs text-destructive">{errors.current}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input
                            id="new-password"
                            type="password"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className={errors.new ? "border-destructive" : ""}
                        />
                        {errors.new && <p className="text-xs text-destructive">{errors.new}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={errors.confirm ? "border-destructive" : ""}
                        />
                        {errors.confirm && <p className="text-xs text-destructive">{errors.confirm}</p>}
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                "Save Password"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
