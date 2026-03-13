import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { apiGet, getStoredApiKey } from "../../components/apiClient";

/**
 * 管理首页：输入并校验 API Key。
 */
export default function AdminHomePage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 初次进入时尝试从 localStorage 读取已有的 API Key
    const stored = getStoredApiKey();
    if (stored) {
      setApiKey(stored);
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("API_KEY", apiKey.trim());
      }
      // 调用一个管理员接口简单校验（例如获取博客列表）
      await apiGet("/api/admin/blogs", true);
      router.push("/admin/blog");
    } catch (err: any) {
      setError(err?.message || "校验失败，请确认 API Key 是否正确。");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>管理后台入口</h1>
      <p style={{ marginBottom: "1.1rem", color: "#4b5563" }}>
        请输入管理员 API Key 后进入内部工具，包括博客管理、报告管理与待办事项。
      </p>
      <form onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
        <label
          htmlFor="apiKey"
          style={{ display: "block", marginBottom: "0.5rem", fontWeight: 500 }}
        >
          API Key
        </label>
        <input
          id="apiKey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="请输入后端配置的 ADMIN_API_KEY"
          style={{
            width: "100%",
            padding: "0.5rem 0.6rem",
            borderRadius: 6,
            border: "1px solid #d1d5db",
            marginBottom: "0.75rem",
          }}
        />
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
        <button
          type="submit"
          disabled={loading || !apiKey}
          style={{
            padding: "0.45rem 1.1rem",
            borderRadius: 6,
            border: "none",
            backgroundColor: loading || !apiKey ? "#9ca3af" : "#2563eb",
            color: "#ffffff",
            cursor: loading || !apiKey ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "校验中..." : "进入管理后台"}
        </button>
      </form>
    </div>
  );
}
