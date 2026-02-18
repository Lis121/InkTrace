import { MetadataRoute } from 'next'

export const runtime = 'edge'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://inktrace.se'

    return {
        rules: {
            userAgent: '*',
            allow: [
                '/',
                '/pricing',
                '/login',
                '/signup',
            ],
            disallow: [
                '/dashboard/',
                '/api/',
                '/intake/',
                '/customers/',
                '/inventory/',
                '/reports/',
                '/team/',
                '/compliance/',
                '/feedback/',
                '/onboarding/',
                '/sessions/',
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
