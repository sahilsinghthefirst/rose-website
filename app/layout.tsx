import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;
  const title = "ROSE | A new way to move work";
  const description = "Meet ROSE, a robotic-arm concept exploring a clearer and more approachable future for automation.";
  const image = `${origin}/og.png`;

  return {
    metadataBase: new URL(origin),
    title,
    description,
    icons: { icon: "/concepts/logo-hinge-r.png" },
    openGraph: { title, description, type: "website", url: origin, images: [{ url: image, width: 1536, height: 910, alt: "ROSE robotic arm concept" }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

const themeScript = `
try {
  const saved = localStorage.getItem('rose-theme');
  const dark = saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
} catch (_) {}
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
      <body>{children}</body>
    </html>
  );
}
