import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { apiDelete, apiGet, apiPost, apiPut } from "../../../components/apiClient";

interface BlogItem {
  id: number;
  title: string;
  content_md: string;
  tags: string[];
  slug: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

interface BlogFormState {
  id?: number;
  title: string;
  content_md: string;
  tags: string;
  published: boolean;
}

/**
 * 博客管理页：增删改查 + Markdown 实时预览（基于 react-markdown）。
 */
export default function AdminBlogPage() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<BlogFormState>({
    title: "",
    content_md: "",
    tags: "",
    published: false,
  });

  const loadBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<BlogItem[]>("/api/admin/blogs", true);
      setBlogs(data);
    } catch (err: any) {
      setError(err?.message || "加载博客列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const resetForm = () => {
    setForm({ title: "", content_md: "", tags: "", published: false });
  };

  const onEdit = (blog: BlogItem) => {
    setForm({
      id: blog.id,
      title: blog.title,
      content_md: blog.content_md,
      tags: (blog.tags || []).join(","),
      published: blog.published,
    });
  };

  const onDelete = async (id: number) => {
    if (!window.confirm("确定要删除该博客吗？")) return;
    try {
      await apiDelete(`/api/admin/blogs/${id}`, true);
      await loadBlogs();
    } catch (err: any) {
      alert(err?.message || "删除失败");
    }
  };

  const onSubmit = async () => {
    if (!form.title || !form.content_md) {
      alert("标题和内容不能为空。");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      title: form.title,
      content_md: form.content_md,
      tags: form.tags,
      published: form.published,
    };

    try {
      if (form.id) {
        await apiPut(`/api/admin/blogs/${form.id}`, payload, true);
      } else {
        await apiPost("/api/admin/blogs", payload, true);
      }
      await loadBlogs();
      resetForm();
    } catch (err: any) {
      setError(err?.message || "保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>博客管理</h1>
      <p style={{ marginBottom: "1rem", color: "#4b5563" }}>
        在这里可以创建、编辑、删除博客文章，并实时预览 Markdown 渲染效果。
      </p>

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

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1.1fr 1.1fr",
          gap: "1rem",
          alignItems: "flex-start",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>
            {form.id ? "编辑博客" : "新建博客"}
          </h2>
          <div style={{ marginBottom: "0.6rem" }}>
            <label
              style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.9rem" }}
            >
              标题
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
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
              标签（以逗号分隔）
            </label>
            <input
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              placeholder="例如：技术,生活"
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
              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) =>
                  setForm({ ...form, published: e.target.checked })
                }
              />
              <span style={{ fontSize: "0.9rem" }}>发布（勾选后对外可见）</span>
            </label>
          </div>
          <div style={{ marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.9rem", color: "#6b7280" }}>
              下方为 Markdown 文本编辑区，右侧为实时渲染预览。
            </span>
          </div>
          <textarea
            value={form.content_md}
            onChange={(e) =>
              setForm({ ...form, content_md: e.target.value })
            }
            rows={18}
            style={{
              width: "100%",
              padding: "0.6rem 0.7rem",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              fontFamily: "monospace",
              fontSize: "0.9rem",
              resize: "vertical",
            }}
          />
          <div style={{ marginTop: "0.75rem" }}>
            <button
              type="button"
              onClick={onSubmit}
              disabled={saving}
              style={{
                padding: "0.45rem 1.1rem",
                borderRadius: 6,
                border: "none",
                backgroundColor: saving ? "#9ca3af" : "#2563eb",
                color: "#ffffff",
                cursor: saving ? "not-allowed" : "pointer",
                marginRight: "0.5rem",
              }}
            >
              {saving ? "保存中..." : form.id ? "更新" : "创建"}
            </button>
            {form.id && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: "0.45rem 0.9rem",
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                  backgroundColor: "#ffffff",
                  cursor: "pointer",
                }}
              >
                取消编辑
              </button>
            )}
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>实时预览</h2>
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 8,
              padding: "0.8rem 0.9rem",
              border: "1px solid #e5e7eb",
              maxHeight: 480,
              overflow: "auto",
            }}
          >
            <h3 style={{ marginTop: 0 }}>{form.title || "（标题预览）"}</h3>
            <ReactMarkdown
              remarkPlugins={[remarkGfm as any]}
              rehypePlugins={[rehypeHighlight as any]}
            >
              {form.content_md || "这里将展示 Markdown 渲染效果"}
            </ReactMarkdown>
          </div>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>博客列表</h2>
        {loading ? (
          <p>加载中...</p>
        ) : blogs.length === 0 ? (
          <p>暂无博客。</p>
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
                  状态
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
              {blogs.map((b) => (
                <tr key={b.id}>
                  <td
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      padding: "0.5rem",
                    }}
                  >
                    {b.title}
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      padding: "0.5rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    {b.published ? "已发布" : "草稿"}
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      padding: "0.5rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    {new Date(b.created_at).toLocaleString("zh-CN")}
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
                      onClick={() => onEdit(b)}
                      style={{
                        marginRight: "0.4rem",
                        padding: "0.25rem 0.6rem",
                        borderRadius: 4,
                        border: "1px solid #d1d5db",
                        backgroundColor: "#ffffff",
                        cursor: "pointer",
                      }}
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(b.id)}
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
