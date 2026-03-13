import { FormEvent, useEffect, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "../../../components/apiClient";

interface TodoItem {
  id: number;
  title: string;
  description: string | null;
  priority: number;
  due_date: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

interface TodoFormState {
  title: string;
  description: string;
  priority: number;
  due_date: string;
}

/**
 * 待办管理页：新增、状态切换、删除、筛选。
 */
export default function AdminTodosPage() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<TodoFormState>({
    title: "",
    description: "",
    priority: 1,
    due_date: "",
  });

  const [filterCompleted, setFilterCompleted] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const buildQuery = () => {
    const params = new URLSearchParams();
    if (filterCompleted === "done") params.append("completed", "true");
    if (filterCompleted === "pending") params.append("completed", "false");
    if (filterPriority !== "all") params.append("priority", filterPriority);
    const query = params.toString();
    return query ? `?${query}` : "";
  };

  const loadTodos = async () => {
    setLoading(true);
    setError(null);
    try {
      const query = buildQuery();
      const data = await apiGet<TodoItem[]>(`/api/admin/todos${query}`, true);
      setTodos(data);
    } catch (err: any) {
      setError(err?.message || "加载待办列表失败");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCompleted, filterPriority]);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.title) {
      alert("标题不能为空。");
      return;
    }

    const payload: any = {
      title: form.title,
      description: form.description || null,
      priority: form.priority,
      completed: false,
    };
    if (form.due_date) {
      payload.due_date = new Date(form.due_date).toISOString();
    }

    try {
      await apiPost("/api/admin/todos", payload, true);
      setForm({ title: "", description: "", priority: 1, due_date: "" });
      await loadTodos();
    } catch (err: any) {
      alert(err?.message || "创建失败");
    }
  };

  const toggleCompleted = async (todo: TodoItem) => {
    try {
      await apiPut(
        `/api/admin/todos/${todo.id}`,
        { completed: !todo.completed },
        true
      );
      await loadTodos();
    } catch (err: any) {
      alert(err?.message || "更新失败");
    }
  };

  const onDelete = async (id: number) => {
    if (!window.confirm("确定要删除该待办吗？")) return;
    try {
      await apiDelete(`/api/admin/todos/${id}`, true);
      await loadTodos();
    } catch (err: any) {
      alert(err?.message || "删除失败");
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>待办管理</h1>
      <p style={{ marginBottom: "1rem", color: "#4b5563" }}>
        管理个人待办事项，支持新增、标记完成以及按优先级和状态筛选。
      </p>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>新增待办</h2>
        <form onSubmit={handleCreate} style={{ maxWidth: 640 }}>
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
              描述
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              style={{
                width: "100%",
                padding: "0.5rem 0.55rem",
                borderRadius: 6,
                border: "1px solid #d1d5db",
              }}
            />
          </div>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginBottom: "0.6rem",
              flexWrap: "wrap",
            }}
          >
            <div>
              <label
                style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.9rem" }}
              >
                优先级（1-5）
              </label>
              <input
                type="number"
                min={1}
                max={5}
                value={form.priority}
                onChange={(e) =>
                  setForm({ ...form, priority: Number(e.target.value) || 1 })
                }
                style={{
                  width: 120,
                  padding: "0.45rem 0.55rem",
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                }}
              />
            </div>
            <div>
              <label
                style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.9rem" }}
              >
                截止日期
              </label>
              <input
                type="date"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                style={{
                  padding: "0.45rem 0.55rem",
                  borderRadius: 6,
                  border: "1px solid #d1d5db",
                }}
              />
            </div>
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
            }}
          >
            添加
          </button>
        </form>
      </section>

      <section>
        <h2 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>待办列表</h2>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <span style={{ marginRight: 6, fontSize: "0.9rem" }}>状态：</span>
            <select
              value={filterCompleted}
              onChange={(e) => setFilterCompleted(e.target.value)}
              style={{
                padding: "0.3rem 0.5rem",
                borderRadius: 6,
                border: "1px solid #d1d5db",
              }}
            >
              <option value="all">全部</option>
              <option value="pending">未完成</option>
              <option value="done">已完成</option>
            </select>
          </div>
          <div>
            <span style={{ marginRight: 6, fontSize: "0.9rem" }}>优先级：</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              style={{
                padding: "0.3rem 0.5rem",
                borderRadius: 6,
                border: "1px solid #d1d5db",
              }}
            >
              <option value="all">全部</option>
              {[1, 2, 3, 4, 5].map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

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
        ) : todos.length === 0 ? (
          <p>暂无待办。</p>
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
                  优先级
                </th>
                <th style={{ borderBottom: "1px solid #e5e7eb", padding: "0.5rem" }}>
                  截止日期
                </th>
                <th style={{ borderBottom: "1px solid #e5e7eb", padding: "0.5rem" }}>
                  状态
                </th>
                <th style={{ borderBottom: "1px solid #e5e7eb", padding: "0.5rem" }}>
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {todos.map((t) => (
                <tr key={t.id}>
                  <td
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      padding: "0.5rem",
                    }}
                  >
                    <div
                      style={{
                        textDecoration: t.completed ? "line-through" : "none",
                      }}
                    >
                      {t.title}
                    </div>
                    {t.description && (
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "#6b7280",
                          marginTop: "0.15rem",
                        }}
                      >
                        {t.description}
                      </div>
                    )}
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      padding: "0.5rem",
                      textAlign: "center",
                    }}
                  >
                    {t.priority}
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      padding: "0.5rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    {t.due_date
                      ? new Date(t.due_date).toLocaleDateString("zh-CN")
                      : "-"}
                  </td>
                  <td
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      padding: "0.5rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    {t.completed ? "已完成" : "未完成"}
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
                      onClick={() => toggleCompleted(t)}
                      style={{
                        marginRight: "0.4rem",
                        padding: "0.25rem 0.6rem",
                        borderRadius: 4,
                        border: "1px solid #d1d5db",
                        backgroundColor: "#ffffff",
                        cursor: "pointer",
                      }}
                    >
                      {t.completed ? "标记未完成" : "标记完成"}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(t.id)}
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
