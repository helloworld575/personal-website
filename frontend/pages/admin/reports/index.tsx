import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  apiDelete,
  apiGet,
  apiPost,
  apiUploadFile,
} from "../../../components/apiClient";

interface ReportItem {
  id: number;
  title: string;
  created_at: string;
}

interface ReportDetail {
  id: number;
  title: string;
  content_md: string;
  created_at: string;
}

/**
 * 报告管理页：列表、粘贴内容新增、上传 docx 文件新增、删除。
 */
export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [contentMd, setContentMd] = useState("");
  const [uploading, setUploading] = useState(false);

  const loadReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<ReportItem[]>("/api/admin/reports", true);
      setReports(data);
    } catch (err: any) {
      setError(err?.message || "加载报告列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !contentMd) {
      alert("标题和内容不能为空。");
      return;
    }
    try {
      await apiPost<ReportDetail>(
        "/api/admin/reports",
        { title, content_md: contentMd },
        true
      );
      setTitle("");
      setContentMd("");
      await loadReports();
    } catch (err: any) {
      alert(err?.message || "创建失败");
    }
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await apiUploadFile<ReportDetail>("/api/admin/reports/upload", file);
      await loadReports();
    } catch (err: any) {
      alert(err?.message || "上传失败");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const onDelete = async (id: number) => {
    if (!window.confirm("确定要删除该报告吗？")) return;
    try {
      await apiDelete(`/api/admin/reports/${id}`, true);
      await loadReports();
    } catch (err: any) {
      alert(err?.message || "删除失败");
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>报告管理</h1>
      <p style={{ marginBottom: "1rem", color: "#4b5563" }}>
        支持手动粘贴内容创建报告，也支持上传 docx 文件自动解析为 Markdown 文本。
      </p>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>新建报告</h2>
        <form onSubmit={handleCreate} style={{ maxWidth: 640 }}>
          <div style={{ marginBottom: "0.6rem" }}>
            <label
              style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.9rem" }}
            >
              标题
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{
                width: "100%",
                padding: "0.45rem 0.55rem",
                borderRadius: 6,
                border: "1px solid #d1d5db",
              }}
            />
          </div>
          <div style={{ marginBottom: "0.6rem" }}>
            <label
              style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.9rem" }}
            >
              内容（Markdown 或普通文本）
            </label>
            <textarea
              value={contentMd}
              onChange={(e) => setContentMd(e.target.value)}
              rows={6}
              style={{
                width: "100%",
                padding: "0.5rem 0.55rem",
                borderRadius: 6,
                border: "1px solid #d1d5db",
                fontFamily: "monospace",
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: "0.45rem 1.1rem",
              borderRadius: 6,
              border: "none",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              cursor: "pointer",
              marginRight: "0.75rem",
            }}
          >
            保存
          </button>
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: "0.9rem",
              cursor: uploading ? "not-allowed" : "pointer",
            }}
          >
            <span
              style={{
                padding: "0.4rem 0.85rem",
                borderRadius: 6,
                border: "1px solid #d1d5db",
                backgroundColor: "#ffffff",
              }}
            >
              {uploading ? "上传中..." : "上传 docx 文件"}
            </span>
            <input
              type="file"
              accept=".docx"
              onChange={handleUpload}
              style={{ display: "none" }}
              disabled={uploading}
            />
          </label>
        </form>
      </section>

      <section>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>报告列表</h2>
        {error && (
          <div
            style={{
              marginBottom: "0.75rem",
              color: "#b91c1c",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}
        {loading ? (
          <p>加载中...</p>
        ) : reports.length === 0 ? (
          <p>暂无报告。</p>
        ) : (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              backgroundColor: "#ffffff",
            }}
          >
            <thead>
              <tr>
                <th style={{ borderBottom: "1px solid #e5e7eb", padding: "0.5rem" }}>
                  标题
                </th>
                <th style={{ borderBottom: "1px solid #e5e7eb", padding: "0.5rem" }}>
                  创建时间
                </th>
                <th style={{ borderBottom: "1px solid #e5e7eb", padding: "0.5rem" }}>
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      padding: "0.5rem",
                    }}
                  >
                    <Link href={`/admin/reports/${r.id}`}>{r.title}</Link>
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      padding: "0.5rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    {new Date(r.created_at).toLocaleString("zh-CN")}
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      padding: "0.5rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => onDelete(r.id)}
                      style={{
                        padding: "0.25rem 0.6rem",
                        borderRadius: 4,
                        border: "1px solid #fecaca",
                        backgroundColor: "#fef2f2",
                        color: "#b91c1c",
                        cursor: "pointer",
                      }}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
