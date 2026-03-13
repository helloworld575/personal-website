import Link from "next/link";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

/**
 * 全站通用布局组件，负责头部导航与内容容器。
 */
export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <header
        style={{
          borderBottom: "1px solid #e5e7eb",
          backgroundColor: "#ffffff",
        }}
      >
        <nav
          style={{
            maxWidth: 960,
            margin: "0 auto",
            padding: "0.75rem 1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Link href="/">
              <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                个人网站 / 博客
              </span>
            </Link>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", fontSize: "0.95rem" }}>
            <Link href="/">博客</Link>
            <Link href="/admin">管理后台</Link>
          </div>
        </nav>
      </header>
      <main>{children}</main>
      <footer
        style={{
          textAlign: "center",
          padding: "1.5rem 0 2rem",
          fontSize: "0.85rem",
          color: "#6b7280",
        }}
      >
        <div>© {new Date().getFullYear()} 个人网站 · Powered by Next.js &amp; FastAPI</div>
      </footer>
    </>
  );
}
