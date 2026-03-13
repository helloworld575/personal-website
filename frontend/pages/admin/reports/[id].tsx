import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { apiGet } from "../../../components/apiClient";

interface ReportDetail {
  id: number;
  title: string;
  content_md: string;
  created_at: string;
}

/**
 * 报告详情页（管理端，Markdown 渲染）。
 */
export default function AdminReportDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet<ReportDetail>(
          `/api/admin/reports/${id}`,
          true
        );
        setReport(data);
      } catch (err: any) {
        setError(err?.message || "加载报告失败");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <p>加载中...</p>;
  if (error) return <p style={{ color: "#b91c1c" }}>{error}</p>;
  if (!report) return <p>未找到报告。</p>;

  return (
    <article>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.75rem" }}>
        {report.title}
      </h1>
      <div
        style={{
          fontSize: "0.9rem",
          color: "#6b7280",
          marginBottom: "1rem",
        }}
      >
        创建于 {new Date(report.created_at).toLocaleString("zh-CN")}
      </div>
      <ReactMarkdown
        remarkPlugins={[remarkGfm as any]}
        rehypePlugins={[rehypeHighlight as any]}
      >
        {report.content_md}
      </ReactMarkdown>
    </article>
  );
}
