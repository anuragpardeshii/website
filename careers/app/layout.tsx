import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "SleekTech Talent",
  description: "The connected SleekTech careers and recruitment platform.",
  icons: { icon: "/favicon.svg" },
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
