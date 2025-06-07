import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Auth protection has been moved to AdminLayout for the rebuild phase
  // This middleware is kept for future use (headers, redirects, etc.)
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Add matchers for other middleware tasks as needed
  ],
}; 