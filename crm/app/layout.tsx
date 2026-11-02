import "./globals.css";
import "./workspace.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "SleekTech CRM",
  description: "The connected SleekTech revenue workspace.",
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
