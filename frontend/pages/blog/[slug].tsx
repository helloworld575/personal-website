import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { API_BASE_URL } from "../../components/apiClient";

interface BlogDetail {
  id: number;
  title: string;
  content_md: string;
  tags: string[];
  slug: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

interface BlogPageProps {
  blog: BlogDetail | null;
}

/**
 * 博客详情页（公开访问，SSG + ISR）。
 */
export default function BlogDetailPage({ blog }: BlogPageProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <p>页面生成中...</p>;
  }

  if (!blog) {
    return <p>未找到该博客。</p>;
  }

  return (
    <article>
      <h1 style={{ fontSize: "1.6rem", marginBottom: "0.75rem" }}>{blog.title}</h1>
      <div
        style={{
          fontSize: "0.9rem",
          color: "#6b7280",
          marginBottom: "1rem",
        }}
      >
        发布于 {new Date(blog.created_at).toLocaleString("zh-CN")}
      </div>
      <div style={{ marginBottom: "1.25rem", fontSize: "0.85rem" }}>
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
      <ReactMarkdown
        // 这里进行简单的类型断言，避免由于不同版本 vfile 类型不一致导致的 TS 报错
        remarkPlugins={[remarkGfm as any]}
        rehypePlugins={[rehypeHighlight as any]}
        className="markdown-body"
      >
        {blog.content_md}
      </ReactMarkdown>
    </article>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // 预先生成所有已发布博客的路径
  const res = await fetch(`${API_BASE_URL}/api/blogs`);
  const blogs: { slug: string }[] = await res.json();

  const paths = blogs.map((b) => ({ params: { slug: b.slug } }));

  return {
    paths,
    fallback: true, // 允许新增博客后按需生成
  };
};

export const getStaticProps: GetStaticProps<BlogPageProps> = async (ctx) => {
  const slug = ctx.params?.slug as string;

  try {
    const res = await fetch(`${API_BASE_URL}/api/blogs/${slug}`);
    if (!res.ok) {
      return { props: { blog: null }, revalidate: 60 };
    }
    const blog: BlogDetail = await res.json();
    return {
      props: { blog },
      revalidate: 60,
    };
  } catch (e) {
    return {
      props: { blog: null },
      revalidate: 60,
    };
  }
};
