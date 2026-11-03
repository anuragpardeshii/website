import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "SleekTech",
  description: "The connected SleekTech careers and recruitment platform.",
  icons: {
    icon: [
      { url: "/favicon.ico?v=ribbon-20261103", sizes: "any" },
      { url: "/favicon.svg?v=ribbon-20261103", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png?v=ribbon-20261103",
  },
  applicationName: "SleekTech",
  manifest: "/site.webmanifest?v=ribbon-20261103",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
