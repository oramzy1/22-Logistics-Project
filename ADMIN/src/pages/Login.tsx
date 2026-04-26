import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err: any) {
      toast.error(err.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const input = "h-10 w-full px-3 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/40";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="h-9 w-9 rounded-md bg-warning flex items-center justify-center text-warning-foreground font-bold">ZZ</div>
          <span className="text-xl font-semibold">22-Logistics</span>
        </div>

        <div className="bg-surface border border-border rounded-xl p-6 space-y-5">
          <div>
            <h1 className="text-xl font-semibold">Admin sign in</h1>
            <p className="text-sm text-muted-foreground mt-1">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={input}
                placeholder="admin@22logistics.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={`${input} pr-10`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;