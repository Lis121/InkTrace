import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export const runtime = 'experimental-edge'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Handle missing environment variables gracefully
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        console.warn("Supabase keys not found in environment variables. Proxy authentication skipped.")
        return response
    }

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const protectedRoutes = ['/dashboard', '/inventory', '/reports', '/onboarding']
    const isProtectedRoute = protectedRoutes.some((route) =>
        request.nextUrl.pathname.startsWith(route)
    )

    if (isProtectedRoute && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (request.nextUrl.pathname === '/login' && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Onboarding Check
    if (user && isProtectedRoute) {
        // We need to check if the user has completed onboarding.
        // Doing a joined query can sometimes fail with RLS or be tricky.
        // We act safer by doing two simple queries.

        // 1. Get profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('studio_id')
            .eq('id', user.id)
            .single()

        let onboardingCompleted = false

        if (profile?.studio_id) {
            // 2. Get studio status
            const { data: studio } = await supabase
                .from('studios')
                .select('onboarding_completed')
                .eq('id', profile.studio_id)
                .single()

            // @ts-ignore
            if (studio?.onboarding_completed) {
                onboardingCompleted = true
            }
        }

        const isOnboardingPage = request.nextUrl.pathname.startsWith('/onboarding')

        if (!onboardingCompleted && !isOnboardingPage && !request.nextUrl.pathname.startsWith('/api')) {
            return NextResponse.redirect(new URL('/onboarding', request.url))
        }

        if (onboardingCompleted && isOnboardingPage) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
