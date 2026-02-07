import { NextRequest, NextResponse } from 'next/server';

const NON_CUSTOM_DOMAIN_PATHS = ['/api', '/_next', '/editor', '/dashboard', '/s', '/favicon.ico'];

function isReservedPath(pathname: string): boolean {
  return NON_CUSTOM_DOMAIN_PATHS.some((prefix) => pathname.startsWith(prefix));
}

function isLocalHost(host: string): boolean {
  return host.startsWith('localhost') || host.startsWith('127.0.0.1');
}

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.toLowerCase() ?? '';

  if (!host || isLocalHost(host) || isReservedPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const appHost = process.env.APP_HOST?.toLowerCase();
  if (appHost && host === appHost) {
    return NextResponse.next();
  }

  try {
    const resolveUrl = new URL('/api/sites/resolve-domain', request.url);
    resolveUrl.searchParams.set('domain', host);

    const response = await fetch(resolveUrl.toString());
    if (!response.ok) {
      return NextResponse.next();
    }

    const data = (await response.json()) as { slug?: string };
    if (!data.slug) {
      return NextResponse.next();
    }

    const rewriteUrl = new URL(`/s/${data.slug}${request.nextUrl.search}`, request.url);
    return NextResponse.rewrite(rewriteUrl);
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next).*)'],
};
