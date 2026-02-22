import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "Ryder Cup Social",
  description: "Social tournament app"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui", margin: 0 }}>
        <header style={{ padding: 16, borderBottom: "1px solid #ddd" }}>
          <nav style={{ display: "flex", gap: 12 }}>
            <Link href="/">Home</Link>
            <Link href="/roster">Roster</Link>
            <Link href="/matches">Matches</Link>
          </nav>
        </header>
        <main style={{ padding: 16 }}>{children}</main>
      </body>
    </html>
  );
}
