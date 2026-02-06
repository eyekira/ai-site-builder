import { NextResponse } from 'next/server';

export async function POST() {
  try {
    return NextResponse.json(
      { ok: false, error: 'Publishing requires login and subscription' },
      { status: 403 },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Publishing requires login and subscription' },
      { status: 403 },
    );
  }
}
