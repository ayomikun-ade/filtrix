import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "Filtrix — Visual Query Builder";
const description =
  "Build complex, nested database queries visually. Preview SQL, MongoDB, and GraphQL in real time, then run them against sample datasets.";

export const metadata: Metadata = {
  metadataBase: new URL("https://filtrixx.vercel.app"),
  title: {
    default: title,
    template: "%s · Filtrix",
  },
  description,
  applicationName: "Filtrix",
  authors: [{ name: "Ayomikun", url: "https://github.com/ayomikun-ade" }],
  creator: "Ayomikun",
  keywords: [
    "visual query builder",
    "query builder",
    "filter builder",
    "SQL",
    "MongoDB",
    "GraphQL",
    "Next.js",
    "nested conditions",
    "AND OR groups",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title,
    description,
    siteName: "Filtrix",
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@ayomikun-ade",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
