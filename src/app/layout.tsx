import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Content Order System",
  description: "Order content and track deliverables per client",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex flex-col">
          <header className="bg-white border-b border-slate-200">
            <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
              <Link href="/" className="font-semibold text-slate-900">
                Content Order System
              </Link>
              <nav className="flex gap-4 text-sm">
                <Link href="/order" className="text-slate-600 hover:text-slate-900">
                  New order
                </Link>
                <Link href="/deliverables" className="text-slate-600 hover:text-slate-900">
                  Deliverables
                </Link>
                <Link href="/clients" className="text-slate-600 hover:text-slate-900">
                  Clients
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">{children}</main>
          <footer className="py-6 text-center text-xs text-slate-400">
            Internal tool. Tasks are synced to the Content Team Asana project.
          </footer>
        </div>
      </body>
    </html>
  );
}
