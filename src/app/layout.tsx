import type { Metadata, Viewport } from "next";
import { Toaster } from "react-hot-toast";
import { ReduxProvider } from "@/components/ReduxProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "RotaPay — Professional Workforce Management",
    template: "%s | RotaPay",
  },
  description:
    "Manage shifts, track earnings, and stay on top of your work schedule with RotaPay.",
  keywords: ["workforce management", "shift scheduling", "payroll", "time tracking"],
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0f1e",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ReduxProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "rgba(15, 22, 41, 0.95)",
                color: "rgba(255,255,255,0.9)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(16px)",
                borderRadius: "12px",
                fontSize: "14px",
                fontFamily: "Inter, sans-serif",
                boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              },
              success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }}
          />
        </ReduxProvider>
      </body>
    </html>
  );
}
