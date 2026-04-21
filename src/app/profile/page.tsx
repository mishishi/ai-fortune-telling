'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui';
import ConfirmModal from '@/components/ConfirmModal';
import CustomDropdown from '@/components/ui/CustomDropdown';

interface FamilyMember {
  id: string;
  name: string;
  gender: 'male' | 'female';
  birthDate: string;
}

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

  // Load members from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('fortune_members');
    if (stored) {
      try {
        setMembers(JSON.parse(stored));
      } catch (e) {
        setMembers([]);
      }
    }
  }, []);

  const saveMembers = (newMembers: FamilyMember[]) => {
    setMembers(newMembers);
    localStorage.setItem('fortune_members', JSON.stringify(newMembers));
  };

  const maskPhone = (phone: string) => {
    if (!phone || phone.length < 11) return phone;
    return phone.slice(0, 3) + '****' + phone.slice(-4);
  };

  const handleAdd = () => {
    if (!form.name || !form.birthDate) return;
    const newMember: FamilyMember = {
      id: crypto.randomUUID(),
      name: form.name,
      gender: form.gender,
      birthDate: form.birthDate,
    };
    saveMembers([...members, newMember]);
    setForm({ name: '', gender: 'male', birthDate: '' });
    setShowAddForm(false);
  };

  const handleEdit = (member: FamilyMember) => {
    setForm({ name: member.name, gender: member.gender, birthDate: member.birthDate });
    setEditingId(member.id);
  };

  const handleUpdate = () => {
    if (!form.name || !form.birthDate || !editingId) return;
    const updated = members.map(m =>
      m.id === editingId ? { ...m, name: form.name, gender: form.gender, birthDate: form.birthDate } : m
    );
    saveMembers(updated);
    setForm({ name: '', gender: 'male', birthDate: '' });
    setEditingId(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    // Simulate brief delay for feedback
    await new Promise(resolve => setTimeout(resolve, 200));
    saveMembers(members.filter(m => m.id !== deleteTarget));
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
      <main className="min-h-screen px-4 py-8 max-w-lg mx-auto bg-[#0a0e27] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-purple)]/30 border-t-[var(--color-purple)] rounded-full animate-spin" />
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen px-4 py-8 max-w-lg mx-auto bg-[#0a0e27]">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-gray-400 hover:text-white transition-colors mb-4"
        >
          <span className="mr-1">←</span>
          返回首页
        </Link>
        <h1
          className="text-2xl font-bold text-white"
          style={{ textShadow: '0 0 20px rgba(240,198,116,0.3)' }}
        >
          个人档案
        </h1>
      </div>

      {/* Phone Number */}
      <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-gold)] to-[var(--color-gold-dark)] flex items-center justify-center flex-shrink-0">
            <span className="text-2xl font-bold text-[var(--color-bg)]">
              {user.phone.slice(-4, -3)}
            </span>
          </div>
          <div>
            <p className="text-sm mb-1" style={{ color: 'var(--color-text-muted)' }}>登录手机</p>
            <p className="text-white text-lg font-medium">{maskPhone(user.phone)}</p>
          </div>
        </div>
      </div>

      {/* Family Members Section */}
      <div className="mb-8">
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
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-purple)] transition-colors"
              />
              <CustomDropdown
                value={form.gender}
                onChange={(val) => setForm({ ...form, gender: val as 'male' | 'female' })}
                options={[
                  { value: 'male', label: '男' },
                  { value: 'female', label: '女' },
                ]}
              />
              <input
                type="date"
                value={form.birthDate}
                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[var(--color-purple)] transition-colors [&::-webkit-calendar-picker-indicator]:invert"
              />
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
          <div className="text-center py-8 text-gray-500">
            <div className="text-5xl mb-3">👨‍👩‍👧</div>
            <p className="mb-2">暂无家庭成员</p>
            <p className="text-sm">点击上方按钮添加</p>
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
                    {member.gender === 'male' ? '男' : '女'} | {member.birthDate}
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
      <div className="mb-6">
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
            <div className="flex items-center gap-2">
              <Toggle
                checked={notifications}
                onChange={(val) => setNotifications(val)}
              />
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
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
            <div className="flex items-center gap-2">
              <Toggle
                checked={privacyMode}
                onChange={(val) => setPrivacyMode(val)}
              />
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
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