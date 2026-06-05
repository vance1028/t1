import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(username, password);
    setLoading(false);
    if (success) {
      navigate('/');
    } else {
      setError('用户名或密码错误');
    }
  };

  return (
    <div className="min-h-screen bg-tunnel-dark flex items-center justify-center">
      <div className="w-full max-w-sm bg-tunnel-panel border border-tunnel-border rounded-lg p-8 shadow-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mb-4 animate-glow-accent">
            <Shield className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-xl font-bold text-gray-100">管廊运维控制台</h1>
          <p className="text-sm text-gray-500 mt-1">SCADA Operations Console</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-tunnel-dark border border-tunnel-border rounded-md px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
              placeholder="请输入用户名"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-tunnel-dark border border-tunnel-border rounded-md px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-colors"
              placeholder="请输入密码"
              required
            />
          </div>

          {error && (
            <div className="text-sm text-alarm-3 bg-alarm-3/10 border border-alarm-3/30 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-dim disabled:opacity-50 disabled:cursor-not-allowed text-tunnel-dark font-medium rounded-md py-2.5 text-sm transition-colors"
          >
            {loading ? '登录中...' : '登 录'}
          </button>
        </form>
      </div>
    </div>
  );
}
