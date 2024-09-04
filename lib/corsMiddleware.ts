// lib/corsMiddleware.ts
import { NextResponse, NextRequest } from 'next/server';

export function runCorsMiddleware(req: NextRequest, res: NextResponse) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { headers });
  }

  Object.entries(headers).forEach(([key, value]) => {
    res.headers.set(key, value as string);
  });

  return res;
}
