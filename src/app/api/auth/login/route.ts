import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  const { phone, code } = await request.json();

  if (!phone || !code) {
    return NextResponse.json({ error: '参数错误' }, { status: 400 });
  }

  // Validate phone format
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    return NextResponse.json({ error: '手机号格式错误' }, { status: 400 });
  }

  // Simulated verification: code must be '123456'
  if (code !== '123456') {
    return NextResponse.json({ error: '验证码错误' }, { status: 401 });
  }

  const db = getDb();
  const now = new Date().toISOString();

  // Find or create user
  let user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone) as any;

  if (!user) {
    const id = 'usr_' + uuidv4().substring(0, 8);
    db.prepare('INSERT INTO users (id, phone, createdAt, lastLoginAt) VALUES (?, ?, ?, ?)')
      .run(id, phone, now, now);
    user = { id, phone };
  } else {
    db.prepare('UPDATE users SET lastLoginAt = ? WHERE id = ?').run(now, user.id);
  }

  // Mask phone for display (e.g., 13800138000 -> 138***8000)
  const maskedPhone = phone.substring(0, 3) + '***' + phone.substring(7);

  const response = NextResponse.json({ userId: user.id, phone: maskedPhone });
  response.cookies.set('fortune_user_id', user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  return response;
}
