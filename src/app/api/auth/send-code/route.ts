import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { phone } = await request.json();

  // Validate phone number format (Chinese mobile)
  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    return NextResponse.json({ error: '手机号格式错误' }, { status: 400 });
  }

  // Simulated: in production, call 腾讯云/阿里云 SMS here
  // For now, just return success
  return NextResponse.json({ success: true });
}
