import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Routes publiques qui ne nécessitent pas d'authentification
  const publicRoutes = ['/login', '/forgot', '/reset', '/signup'];
  
  // Vérifier si la route actuelle est publique
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Si c'est une route publique, permettre l'accès
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Routes protégées qui nécessitent une authentification
  const isProtected = [
    "/overview",
    "/subject",
    "/courses",
    "/achievement",
    "/quizz",
    "/ai",
    "/settings",
    "/support"
  ].some((route) => pathname.startsWith(route));
  
  // Si ce n'est pas une route protégée, permettre l'accès
  if (!isProtected) {
    return NextResponse.next();
  }
  
  // Vérifier l'authentification pour les routes protégées
  const token = request.cookies.get('auth-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  // If user is NOT logged in and tries to access protected routes
  if (!token) {
    // Rediriger vers la page de connexion
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Si l'utilisateur est authentifié, permettre l'accès
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
}; 