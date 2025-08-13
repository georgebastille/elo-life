import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Ensure a simple session id cookie exists (for future rate limiting, etc.)
export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const sid = request.cookies.get('sid')?.value
  if (!sid) {
    const id = crypto.randomUUID()
    response.cookies.set('sid', id, { httpOnly: true, sameSite: 'lax', path: '/' })
  }
  return response
}

