'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const { setUser } = useUser();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [countdown]);

  const handleSendCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号');
      return;
    }
    setError('');
    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCountdown(60);
      } else {
        setError(data.error || '发送失败，请重试');
      }
    } catch (e) {
      setError('发送失败，请重试');
    }
  };

  const handleLogin = async () => {
    if (!phone || !code) {
      setError('请填写手机号和验证码');
      return;
    }
    if (code !== '123456') {
      setError('验证码错误');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (res.ok && data.userId) {
        setUser({ userId: data.userId, phone: data.phone });
        router.push('/history');
      } else {
        setError(data.error || '登录失败');
      }
    } catch (e) {
      setError('网络异常，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f1a] px-4">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-6"
        >
          <span className="mr-1">←</span>
          返回首页
        </Link>

        <h1
          className="text-3xl font-bold text-white text-center mb-8"
          style={{ textShadow: '0 0 30px rgba(196,30,58,0.4)' }}
        >
          AI 八字命理分析
        </h1>

        <div className="space-y-4">
          <div>
            <input
              type="tel"
              placeholder="手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#c41e3a] transition-colors"
              maxLength={11}
            />
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="验证码"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#c41e3a] transition-colors"
              maxLength={6}
            />
            <button
              onClick={handleSendCode}
              disabled={countdown > 0}
              className="px-4 py-3 rounded-xl bg-[#c41e3a]/20 text-white text-sm hover:bg-[#c41e3a]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {countdown > 0 ? `${countdown}秒` : '获取验证码'}
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #c41e3a, #a01830)',
              color: '#ffffff',
              boxShadow: '0 4px 20px rgba(196,30,58,0.3)',
            }}
          >
            {loading ? '登录中...' : '登录'}
          </button>

          <p className="text-center text-gray-500 text-xs mt-4">
            登录即表示同意《用户协议》
          </p>
        </div>
      </div>
    </div>
  );
}