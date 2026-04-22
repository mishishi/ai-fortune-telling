'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui';
import ConfirmModal from '@/components/ConfirmModal';
import CustomDropdown from '@/components/ui/CustomDropdown';
import BirthDatePicker from '@/components/BirthForm/BirthDatePicker';

interface BirthData {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  province: string;
  timeSegment: 'early' | 'middle' | 'late';
}

interface FamilyMember {
  id: string;
  name: string;
  gender: 'male' | 'female';
  birthData: BirthData;
  createdAt?: string;
  updatedAt?: string;
}

// Helper: convert BirthData to display string YYYY-MM-DD
const birthDataToDateString = (bd: BirthData): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${bd.year}-${pad(bd.month)}-${pad(bd.day)}`;
};

// Helper: convert YYYY-MM-DD string to BirthData (partial)
const dateStringToBirthData = (str: string, base: Partial<BirthData> = {}): BirthData => {
  const [year, month, day] = str.split('-').map(Number);
  return {
    year, month, day,
    hour: base.hour ?? 8,
    minute: base.minute ?? 0,
    province: base.province ?? '',
    timeSegment: base.timeSegment ?? 'middle',
  };
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, loading } = useUser();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', gender: 'male' as 'male' | 'female', birthDate: '' });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Redirect if not logged in (only after loading is complete)
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  // Load members from API, with localStorage as cache
  useEffect(() => {
    const stored = localStorage.getItem('fortune_members');
    if (stored) {
      try {
        setMembers(JSON.parse(stored));
      } catch (e) {
        setMembers([]);
      }
    }

    // Fetch latest from API
    fetch('/api/members')
      .then(r => r.ok ? r.json() : [])
      .then(apiMembers => {
        if (apiMembers.length > 0) {
          setMembers(apiMembers);
          localStorage.setItem('fortune_members', JSON.stringify(apiMembers));
        }
      })
      .catch(() => {});
  }, []);

  const maskPhone = (phone: string) => {
    if (!phone || phone.length < 11) return phone;
    return phone.slice(0, 3) + '****' + phone.slice(-4);
  };

  const handleAdd = async () => {
    if (!form.name || !form.birthDate) return;
    const birthData = dateStringToBirthData(form.birthDate);

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, gender: form.gender, birthData }),
      });
      if (res.ok) {
        const newMember: FamilyMember = await res.json();
        const updated = [newMember, ...members];
        setMembers(updated);
        localStorage.setItem('fortune_members', JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Failed to add member:', e);
    }
    setForm({ name: '', gender: 'male', birthDate: '' });
    setShowAddForm(false);
  };

  const handleEdit = (member: FamilyMember) => {
    setForm({
      name: member.name,
      gender: member.gender,
      birthDate: birthDataToDateString(member.birthData),
    });
    setEditingId(member.id);
  };

  const handleUpdate = async () => {
    if (!form.name || !form.birthDate || !editingId) return;
    const birthData = dateStringToBirthData(form.birthDate);

    try {
      const res = await fetch(`/api/members/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, gender: form.gender, birthData }),
      });
      if (res.ok) {
        const updatedMember: FamilyMember = await res.json();
        const updated = members.map(m => m.id === editingId ? updatedMember : m);
        setMembers(updated);
        localStorage.setItem('fortune_members', JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Failed to update member:', e);
    }
    setForm({ name: '', gender: 'male', birthDate: '' });
    setEditingId(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/members/${deleteTarget}`, { method: 'DELETE' });
      if (res.ok) {
        const updated = members.filter(m => m.id !== deleteTarget);
        setMembers(updated);
        localStorage.setItem('fortune_members', JSON.stringify(updated));
      }
    } catch (e) {
      console.error('Failed to delete member:', e);
    }
    setDeleteTarget(null);
    setDeleting(false);
  };

  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);

  const handleLogout = () => {
    setUser(null);
    router.push('/');
  };

  // Show loading while checking auth status
  if (loading) {
    return (
      <main className="min-h-screen px-4 py-8 max-w-lg mx-auto bg-[var(--color-bg-page)] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-purple)]/30 border-t-[var(--color-purple)] rounded-full animate-spin" />
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen px-4 py-8 max-w-lg mx-auto bg-[var(--color-bg-page)]">
      {/* Header */}
      <div className="mb-8 relative text-center">
        {/* Corner brackets decoration */}
        <div className="absolute -top-4 -left-4 w-8 h-8 border-l-2 border-t-2 border-[var(--color-accent)] opacity-40" />
        <div className="absolute -top-4 -right-4 w-8 h-8 border-r-2 border-t-2 border-[var(--color-accent)] opacity-40" />
        <div className="absolute -bottom-4 -left-4 w-8 h-8 border-l-2 border-b-2 border-[var(--color-accent)] opacity-40" />
        <div className="absolute -bottom-4 -right-4 w-8 h-8 border-r-2 border-b-2 border-[var(--color-accent)] opacity-40" />

        <Link
          href="/"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4"
        >
          <span className="mr-1">←</span>
          返回首页
        </Link>
        <h1
          className="text-h1 font-serif text-white title-underline"
          style={{ textShadow: '0 0 20px rgba(240,198,116,0.3)' }}
        >
          个人档案
        </h1>
      </div>

      {/* Phone Number */}
      <div className="mb-8 glass-card rounded-[var(--radius-lg)] p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-[var(--color-bg)]">
              {user.phone.slice(-4, -3)}
            </span>
          </div>
          <div>
            <p className="text-sm mb-1 text-[var(--color-text-muted)]">登录手机</p>
            <p className="text-white text-lg font-medium">{maskPhone(user.phone)}</p>
          </div>
        </div>
      </div>

      {/* Family Members Section */}
      <div className="mb-8 glass-card rounded-[var(--radius-lg)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">家庭成员</h2>
          <Button
            onClick={() => { setShowAddForm(true); setEditingId(null); setForm({ name: '', gender: 'male', birthDate: '' }); }}
            variant="primary"
            size="sm"
          >
            + 添加成员
          </Button>
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || editingId) && (
          <div className="mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="姓名"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                aria-invalid={!form.name}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-surface)] aria-invalid:border-red-500 transition-all duration-150 ease-out"
              />
              <CustomDropdown
                value={form.gender}
                onChange={(val) => setForm({ ...form, gender: val as 'male' | 'female' })}
                options={[
                  { value: 'male', label: '男' },
                  { value: 'female', label: '女' },
                ]}
              />
              {(() => {
                const [y, m, d] = form.birthDate ? form.birthDate.split('-').map(Number) : [0, 0, 0];
                return (
                  <BirthDatePicker
                    year={y || new Date().getFullYear()}
                    month={m || 1}
                    day={d || 1}
                    onChange={(year, month, day) => {
                      const pad = (n: number) => String(n).padStart(2, '0');
                      setForm({ ...form, birthDate: `${year}-${pad(month)}-${pad(day)}` });
                    }}
                    onBlur={() => {}}
                  />
                );
              })()}
              <div className="flex gap-2">
                <Button
                  onClick={editingId ? handleUpdate : handleAdd}
                  variant="primary"
                  className="flex-1"
                >
                  {editingId ? '保存修改' : '添加'}
                </Button>
                <Button
                  onClick={() => { setShowAddForm(false); setEditingId(null); setForm({ name: '', gender: 'male', birthDate: '' }); }}
                  variant="secondary"
                >
                  取消
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Members List */}
        {members.length === 0 ? (
          <div className="text-center py-8">
            {/* Oriental compass/feng shui illustration */}
            <div className="relative inline-block mb-6 animate-fade-in-up">
              <svg
                className="w-20 h-20 animate-float"
                viewBox="0 0 80 80"
                fill="none"
                style={{ animationDuration: '4s' }}
              >
                {/* Outer ring */}
                <circle cx="40" cy="40" r="36" stroke="var(--color-gold)" strokeWidth="0.5" opacity="0.4"/>
                <circle cx="40" cy="40" r="30" stroke="var(--color-gold)" strokeWidth="0.8" opacity="0.5"/>

                {/* Inner octagon - bagua base */}
                <path
                  d="M40 12 L54 22 L62 40 L54 58 L40 68 L26 58 L18 40 L26 22 Z"
                  stroke="var(--color-gold)"
                  strokeWidth="0.8"
                  fill="none"
                  opacity="0.5"
                />

                {/* Center compass needle */}
                <path d="M40 20 L44 40 L40 44 L36 40 Z" fill="var(--color-primary)" opacity="0.8"/>
                <path d="M40 60 L44 40 L40 36 L36 40 Z" fill="var(--color-gold)" opacity="0.7"/>

                {/* Direction markers */}
                <circle cx="40" cy="12" r="2" fill="var(--color-gold)" opacity="0.6"/>
                <circle cx="62" cy="40" r="2" fill="var(--color-gold)" opacity="0.6"/>
                <circle cx="40" cy="68" r="2" fill="var(--color-gold)" opacity="0.6"/>
                <circle cx="18" cy="40" r="2" fill="var(--color-gold)" opacity="0.6"/>

                {/* Diagonal markers */}
                <circle cx="55" cy="25" r="1.5" fill="var(--color-gold)" opacity="0.4"/>
                <circle cx="55" cy="55" r="1.5" fill="var(--color-gold)" opacity="0.4"/>
                <circle cx="25" cy="55" r="1.5" fill="var(--color-gold)" opacity="0.4"/>
                <circle cx="25" cy="25" r="1.5" fill="var(--color-gold)" opacity="0.4"/>

                {/* Center dot */}
                <circle cx="40" cy="40" r="4" fill="url(#compassCenter)" opacity="0.9"/>
                <circle cx="40" cy="40" r="2" fill="var(--color-primary)" opacity="0.8"/>

                <defs>
                  <radialGradient id="compassCenter" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--color-gold)"/>
                    <stop offset="100%" stopColor="var(--color-primary)"/>
                  </radialGradient>
                </defs>
              </svg>
            </div>

            <div className="gold-divider mx-auto mb-4 animate-fade-in" style={{ animationDelay: '100ms' }}></div>
            <p className="text-[var(--color-text-muted)] mb-1 animate-fade-in-up" style={{ animationDelay: '150ms' }}>暂无家庭成员</p>
            <p className="text-sm text-[var(--color-text-muted)]/60 animate-fade-in-up" style={{ animationDelay: '200ms' }}>点击上方按钮添加家庭成员</p>
            <button
              onClick={() => { setShowAddForm(true); setEditingId(null); setForm({ name: '', gender: 'male', birthDate: '' }); }}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
            >
              添加成员
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div>
                  <p className="text-white font-medium">{member.name}</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {member.gender === 'male' ? '男' : '女'} | {(member.birthData as any)?.year ? birthDataToDateString(member.birthData as BirthData) : (member.birthData as unknown as string)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(member)}
                    variant="secondary"
                    size="sm"
                  >
                    编辑
                  </Button>
                  <Button
                    onClick={() => setDeleteTarget(member.id)}
                    variant="danger"
                    size="sm"
                  >
                    删除
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings Section */}
      <div className="mb-6 glass-card rounded-[var(--radius-lg)] p-5">
        <h2 className="text-lg font-semibold text-white mb-4">设置</h2>
        <div className="space-y-3">
          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-purple)]/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-[var(--color-purple)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-medium">消息通知</p>
                <p className="text-gray-400 text-xs">接收分析报告完成通知</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Toggle
                checked={notifications}
                onChange={(val) => setNotifications(val)}
              />
              <span className="text-sm font-medium w-8" style={{ color: notifications ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                {notifications ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>

          {/* Privacy Mode Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-success)]/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-[var(--color-success)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-medium">隐私模式</p>
                <p className="text-gray-400 text-xs">历史报告中的姓名脱敏</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Toggle
                checked={privacyMode}
                onChange={(val) => setPrivacyMode(val)}
              />
              <span className="text-sm font-medium w-8" style={{ color: privacyMode ? 'var(--color-primary)' : 'var(--color-text-muted)' }}>
                {privacyMode ? 'ON' : 'OFF'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <Button
        onClick={handleLogout}
        variant="danger"
        className="w-full"
      >
        退出登录
      </Button>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        open={deleteTarget !== null}
        title="删除家庭成员"
        message="确定要删除这位家庭成员吗？此操作无法撤销。"
        confirmText="删除"
        cancelText="取消"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        danger
      />
    </main>
  );
}