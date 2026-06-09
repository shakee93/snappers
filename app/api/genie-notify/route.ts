import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Genie notify endpoint' });
}

export async function POST() {
  return NextResponse.json({ message: 'Genie notify endpoint' });
}