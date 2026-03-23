import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md p-8 shadow-soft animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">🪞 MoodMirror</h1>
          <p className="text-muted-foreground mt-2">Reset your password</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <p className="text-foreground">Check your email for a password reset link.</p>
            <Link to="/auth" className="text-primary hover:underline text-sm font-medium">
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                Send Reset Link
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Back to Sign In
              </Link>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
