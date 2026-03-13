/**
 * 管理后台统一的 API 请求封装。
 *
 * - 从 NEXT_PUBLIC_API_URL 读取后端地址
 * - 对管理端接口自动注入 X-API-Key 头部（从 localStorage('API_KEY') 获取）
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/** 获取当前存储的 API Key（仅浏览器环境可用）。 */
export function getStoredApiKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem("API_KEY");
  } catch (e) {
    return null;
  }
}

async function requestJson<T>(
  path: string,
  options: RequestInit = {},
  requireAuth: boolean = false
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (requireAuth) {
    const apiKey = getStoredApiKey();
    if (apiKey) {
      (headers as Record<string, string>)["X-API-Key"] = apiKey;
    }
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `请求失败：${res.status}`);
  }

  if (res.status === 204) {
    // 无内容
    return undefined as unknown as T;
  }

  return (await res.json()) as T;
}

export function apiGet<T>(path: string, requireAuth: boolean = false) {
  return requestJson<T>(path, { method: "GET" }, requireAuth);
}

export function apiPost<T>(
  path: string,
  data: unknown,
  requireAuth: boolean = false
) {
  return requestJson<T>(
    path,
    { method: "POST", body: JSON.stringify(data) },
    requireAuth
  );
}

export function apiPut<T>(
  path: string,
  data: unknown,
  requireAuth: boolean = false
) {
  return requestJson<T>(
    path,
    { method: "PUT", body: JSON.stringify(data) },
    requireAuth
  );
}

export function apiDelete(path: string, requireAuth: boolean = false) {
  return requestJson<null>(path, { method: "DELETE" }, requireAuth);
}

/**
 * 上传文件（主要用于 docx 报告上传）。
 * 这里使用 FormData，因此不显式设置 Content-Type，交由浏览器自动处理。
 */
export async function apiUploadFile<T>(path: string, file: File) {
  const url = `${API_BASE_URL}${path}`;
  const formData = new FormData();
  formData.append("file", file);

  const headers: HeadersInit = {};
  const apiKey = getStoredApiKey();
  if (apiKey) {
    (headers as Record<string, string>)["X-API-Key"] = apiKey;
  }

  const res = await fetch(url, {
    method: "POST",
    body: formData,
    headers,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `文件上传失败：${res.status}`);
  }

  return (await res.json()) as T;
}
