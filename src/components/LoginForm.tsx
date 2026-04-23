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
  const [mounted, setMounted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    <div className="min-h-screen relative overflow-hidden" style={{
      background: 'linear-gradient(180deg, #0a0a12 0%, #1a0a1a 50%, #0d0d1a 100%)',
    }}>
      {/* Animated star field background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-twinkle"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              background: 'rgba(212, 175, 55, ' + (Math.random() * 0.5 + 0.2) + ')',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animationDelay: Math.random() * 5 + 's',
              animationDuration: (Math.random() * 3 + 2) + 's',
            }}
          />
        ))}
      </div>

      {/* Decorative gradient orbs */}
      <div
        className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(196,30,58,0.4) 0%, transparent 70%)',
          top: '-20%',
          right: '-10%',
        }}
      />
      <div
        className="absolute w-80 h-80 rounded-full opacity-15 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(212,175,55,0.3) 0%, transparent 70%)',
          bottom: '-10%',
          left: '-15%',
        }}
      />

      {/* Main content */}
      <div className={`relative min-h-screen flex flex-col items-center justify-center px-4 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

        {/* Logo area */}
        <div className="text-center mb-12">
          {/* Mystical symbol */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full animate-pulse" style={{
              background: 'radial-gradient(circle, rgba(196,30,58,0.3) 0%, transparent 70%)',
            }} />
            <div className="absolute inset-2 rounded-full border border-[#c41e3a]/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl">☯</span>
            </div>
            {/* Rotating ring */}
            <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="48" fill="none" stroke="url(#goldGradient)" strokeWidth="0.5" strokeDasharray="4 4" />
              <defs>
                <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d4af37" />
                  <stop offset="100%" stopColor="#c41e3a" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <h1
            className="text-4xl md:text-5xl font-serif text-white mb-3 tracking-[0.2em]"
            style={{
              textShadow: '0 0 40px rgba(196,30,58,0.5), 0 0 80px rgba(196,30,58,0.3)',
              background: 'linear-gradient(180deg, #ffffff 0%, #d4af37 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            AI 八字命理
          </h1>
          <p className="text-gray-400 text-sm tracking-[0.3em]">解读命格 · 洞悉天机</p>
        </div>

        {/* Login card */}
        <div
          className="w-full max-w-sm relative"
          style={{
            background: 'linear-gradient(180deg, rgba(20,15,25,0.95) 0%, rgba(15,10,20,0.98) 100%)',
            border: '1px solid rgba(212,175,55,0.15)',
            boxShadow: '0 0 60px rgba(0,0,0,0.5), inset 0 0 60px rgba(196,30,58,0.05)',
          }}
        >
          {/* Corner decorations */}
          <div className="absolute -top-px -left-px w-8 h-8 border-t border-l" style={{ borderColor: '#d4af37' }} />
          <div className="absolute -top-px -right-px w-8 h-8 border-t border-r" style={{ borderColor: '#d4af37' }} />
          <div className="absolute -bottom-px -left-px w-8 h-8 border-b border-l" style={{ borderColor: '#d4af37' }} />
          <div className="absolute -bottom-px -right-px w-8 h-8 border-b border-r" style={{ borderColor: '#d4af37' }} />

          <div className="p-8 space-y-5">
            {/* Phone input */}
            <div className="space-y-2">
              <label htmlFor="phone" className="block text-xs text-gray-500 tracking-wider">手机号</label>
              <div className="relative">
                <input
                  id="phone"
                  type="tel"
                  placeholder="请输入手机号"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  aria-describedby={error ? "form-error" : undefined}
                  className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-600 bg-white/5 border border-white/10 transition-all duration-300 focus:outline-none focus:border-[#d4af37]/50 focus:bg-white/10 focus:shadow-[0_0_20px_rgba(212,175,55,0.1)]"
                  maxLength={11}
                />
                <div className="absolute inset-0 rounded-lg pointer-events-none opacity-0 focus-within:opacity-100 transition-opacity" style={{
                  boxShadow: 'inset 0 0 20px rgba(212,175,55,0.1)',
                }} />
              </div>
            </div>

            {/* Code input */}
            <div className="space-y-2">
              <label htmlFor="code" className="block text-xs text-gray-500 tracking-wider">验证码</label>
              <div className="flex gap-2 min-w-0">
                <input
                  id="code"
                  type="text"
                  placeholder="请输入验证码"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  aria-describedby={error ? "form-error" : undefined}
                  className="flex-1 min-w-0 px-4 py-3 rounded-lg text-white placeholder-gray-600 bg-white/5 border border-white/10 transition-all duration-300 focus:outline-none focus:border-[#d4af37]/50 focus:bg-white/10"
                  maxLength={6}
                />
                <button
                  onClick={handleSendCode}
                  disabled={countdown > 0}
                  className="px-3 py-3 rounded-lg font-medium text-xs transition-all duration-300 disabled:cursor-not-allowed whitespace-nowrap flex-shrink-0"
                  style={{
                    background: countdown > 0 ? 'rgba(212,175,55,0.1)' : 'linear-gradient(135deg, #c41e3a 0%, #8b0000 100%)',
                    color: countdown > 0 ? '#d4af37' : '#ffffff',
                    border: '1px solid ' + (countdown > 0 ? 'rgba(212,175,55,0.3)' : 'rgba(196,30,58,0.5)'),
                    boxShadow: countdown > 0 ? 'none' : '0 4px 15px rgba(196,30,58,0.3)',
                  }}
                >
                  {countdown > 0 ? `${countdown}s` : '获取验证码'}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <p id="form-error" role="alert" className="text-sm text-center py-2 rounded-md animate-shake" style={{
                color: '#c41e3a',
                background: 'rgba(196,30,58,0.1)',
                border: '1px solid rgba(196,30,58,0.2)',
              }}>
                {error}
              </p>
            )}

            {/* Login button */}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="relative w-full py-4 rounded-lg font-bold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #c41e3a 0%, #8b0000 100%)',
                boxShadow: '0 4px 20px rgba(196,30,58,0.4)',
              }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              }} />
              <span className="relative">{loading ? '登录中...' : '登录'}</span>
            </button>

            {/* Agreement */}
            <p className="text-center text-gray-600 text-xs pt-2">
              登录即表示同意<span className="text-gray-500 hover:text-gray-400 cursor-pointer transition-colors">《用户协议》</span>
            </p>
          </div>
        </div>

        {/* Footer tip */}
        <p className="mt-8 text-gray-600 text-xs tracking-wider">
          测算命运 · 趋吉避凶 · 把握机缘
        </p>
      </div>

      <style jsx global>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .animate-twinkle {
          animation: twinkle ease-in-out infinite;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
