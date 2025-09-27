import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { KnowledgeProvider } from "@/components/knowledge-provider";
import { ThemeProvider, ThemeToggleButton } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "A-Recap 知识卡片助手",
  description:
    "使用知识卡片快速记录与复习，结合 AI 智能出题与反馈，打造个人高效复习系统。",
};

const navItems = [
  { href: "/", label: "首页" },
  { href: "/input", label: "知识录入" },
  { href: "/manage", label: "知识管理" },
  { href: "/review", label: "智能复习" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <KnowledgeProvider>
            <div className="app-shell">
              <header className="app-header">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-semibold tracking-tight text-white"
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-blue-300">
                      AI
                    </span>
                    A-Recap
                  </Link>
                  <nav className="flex items-center gap-2 text-sm font-medium">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="rounded-full px-4 py-2 text-slate-200 transition hover:bg-white/10 hover:text-white"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                  <ThemeToggleButton />
                </div>
              </header>
              <main className="mx-auto flex w-full max-w-6xl flex-1 px-6 py-10">{children}</main>
              <footer className="app-footer">
                <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-6 text-sm sm:flex-row">
                  <p>© {new Date().getFullYear()} A-Recap. 让知识记录与复习更高效。</p>
                  <p className="text-xs text-slate-500">
                    数据安全地存储在服务器数据库中，可随时备份导出。
                  </p>
                </div>
              </footer>
            </div>
          </KnowledgeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
