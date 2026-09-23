import './globals.css';

export const metadata = {
  title: 'RefundPilot AI',
  description: 'AI-assisted customer support refund system',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans">
        <div className="max-w-5xl mx-auto px-6">
          <header className="flex items-center justify-between py-6 border-b border-line">
            <a href="/" className="font-semibold tracking-tight text-lg">
              RefundPilot AI <span className="text-slate font-normal">/ Refunds</span>
            </a>
            <nav className="flex gap-5 text-sm text-slate">
              <a href="/" className="hover:text-ink">Request a refund</a>
              <a href="/admin" className="hover:text-ink">Support dashboard</a>
            </nav>
          </header>
          <main className="py-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
