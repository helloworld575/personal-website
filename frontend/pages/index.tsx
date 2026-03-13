import { GetStaticProps } from "next";
import Link from "next/link";
import { useState } from "react";
import { API_BASE_URL } from "../components/apiClient";

interface BlogSummary {
  id: number;
  title: string;
  summary: string;
  tags: string[];
  slug: string;
  created_at: string;
}

interface HomeProps {
  blogs: BlogSummary[];
}

/**
 * 博客列表页（公开访问，SSG + ISR）。
 */
export default function HomePage({ blogs }: HomeProps) {
  const allTags = Array.from(
    new Set(blogs.flatMap((b) => b.tags || []))
  ).sort();

  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const filteredBlogs = selectedTag
    ? blogs.filter((b) => b.tags?.includes(selectedTag))
    : blogs;

  return (
    <div>
      <h1 style={{ fontSize: "1.6rem", marginBottom: "1rem" }}>博客列表</h1>
      <p style={{ marginBottom: "1.25rem", color: "#4b5563" }}>
        这里展示所有已发布的博客文章，支持按标签简单筛选。
      </p>

      {allTags.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <span style={{ marginRight: "0.5rem", fontWeight: 500 }}>标签：</span>
          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            style={{
              marginRight: "0.5rem",
              padding: "0.15rem 0.6rem",
              borderRadius: 999,
              border: "1px solid #e5e7eb",
              backgroundColor: selectedTag === null ? "#2563eb" : "#ffffff",
              color: selectedTag === null ? "#ffffff" : "#374151",
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            全部
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag)}
              style={{
                marginRight: "0.5rem",
                padding: "0.15rem 0.6rem",
                borderRadius: 999,
                border: "1px solid #e5e7eb",
                backgroundColor:
                  selectedTag === tag ? "#2563eb" : "#ffffff",
                color: selectedTag === tag ? "#ffffff" : "#374151",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {filteredBlogs.length === 0 && <p>暂无博客。</p>}

      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {filteredBlogs.map((blog) => (
          <li
            key={blog.id}
            style={{
              borderRadius: 8,
              padding: "1rem 1.1rem",
              marginBottom: "0.9rem",
              backgroundColor: "#ffffff",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "1.15rem" }}>
              <Link href={`/blog/${blog.slug}`}>{blog.title}</Link>
            </h2>
            <div
              style={{
                fontSize: "0.85rem",
                color: "#6b7280",
                margin: "0.3rem 0 0.5rem",
              }}
            >
              发布于 {new Date(blog.created_at).toLocaleDateString("zh-CN")}
            </div>
            <p style={{ margin: "0.35rem 0 0.5rem", color: "#374151" }}>
              {blog.summary}
            </p>
            <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
              {blog.tags?.map((tag) => (
                <span
                  key={tag}
                  style={{
                    display: "inline-block",
                    padding: "0.1rem 0.5rem",
                    borderRadius: 999,
                    border: "1px solid #e5e7eb",
                    marginRight: "0.4rem",
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const res = await fetch(`${API_BASE_URL}/api/blogs`);
  const blogs: BlogSummary[] = await res.json();

  return {
    props: {
      blogs,
    },
    revalidate: 60, // ISR：每 60 秒最多重新生成一次
  };
};
