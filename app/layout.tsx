import type { Metadata } from "next";
export const runtime = 'edge';
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Hitta din drömtatuerare i Sverige | InkTrace",
  description: "InkTrace matchar dig med Sveriges bästa tatuerare. Beskriv din idé, få kostnadsfria prisförslag och boka din tid enkelt och tryggt.",
  keywords: ["tatuering", "hitta tatuerare", "tatueringsstudio", "tatuering sverige", "boka tatuering", "tatuering prisförslag"],
  openGraph: {
    title: "Hitta din drömtatuerare i Sverige | InkTrace",
    description: "InkTrace matchar dig med Sveriges bästa tatuerare. Beskriv din idé, få kostnadsfria prisförslag och boka din tid enkelt och tryggt.",
    type: "website",
    locale: "sv_SE",
    url: "https://inktrace.se",
    siteName: "InkTrace",
    images: [
      {
        url: "/inktrace_og_image.png", // We should probably create this or use a default
        width: 1200,
        height: 630,
        alt: "InkTrace - Hitta din tatuerare",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hitta din drömtatuerare i Sverige | InkTrace",
    description: "InkTrace matchar dig med Sveriges bästa tatuerare. Beskriv din idé, få kostnadsfria prisförslag och boka din tid enkelt och tryggt.",
    images: ["/inktrace_og_image.png"],
  },
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          id="microsoft-clarity-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "vlsodb8zv3");
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        {children}
        <Toaster position="top-center" expand={true} richColors />
      </body>
    </html>
  );
}
