import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  Badge,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  Text,
} from "@chakra-ui/react";
import { apiDelete, apiGet, apiPost, apiPut } from "../../../components/apiClient";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
}) as any;

const MDEditorPreview = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default.Markdown),
  { ssr: false }
) as any;

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
 * 博客管理页：增删改查 + 专业 Markdown 编辑器 + 实时预览。
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
    if (typeof window !== "undefined") {
      const ok = window.confirm("确定要删除该博客吗？");
      if (!ok) return;
    }

    try {
      await apiDelete(`/api/admin/blogs/${id}`, true);
      await loadBlogs();
    } catch (err: any) {
      if (typeof window !== "undefined") {
        window.alert(err?.message || "删除失败");
      }
    }
  };

  const onSubmit = async () => {
    if (!form.title || !form.content_md) {
      if (typeof window !== "undefined") {
        window.alert("标题和内容不能为空。");
      }
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
    <Container maxW="7xl" py={2} px={{ base: 0, md: 0 }}>
      <Box bg="transparent" mb={6}>
        <Heading as="h1" size="lg" mb={2}>
          博客管理
        </Heading>
        <Text color="gray.600" fontSize="sm">
          在这里可以创建、编辑、删除博客文章，并使用专业 Markdown 编辑器进行实时预览。
        </Text>
      </Box>

      {error && (
        <Box
          mb={4}
          borderWidth="1px"
          borderColor="red.200"
          bg="red.50"
          borderRadius="md"
          p={3}
        >
          <Text fontSize="sm" color="red.600">
            {error}
          </Text>
        </Box>
      )}

      <Flex
        direction={{ base: "column", lg: "row" }}
        align="flex-start"
        gap={6}
        mb={10}
      >
        <Box flex="1" bg="white" p={5} borderRadius="lg" boxShadow="sm">
          <Flex justify="space-between" align="center" mb={4}>
            <Heading as="h2" size="md">
              {form.id ? "编辑博客" : "新建博客"}
            </Heading>
            {form.id && (
              <Button variant="ghost" size="sm" onClick={resetForm}>
                取消编辑
              </Button>
            )}
          </Flex>

          <Box display="flex" flexDirection="column" gap={4}>
            <Box>
              <Text fontSize="sm" mb={1}>
                标题
              </Text>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="请输入博客标题"
              />
            </Box>

            <Box>
              <Text fontSize="sm" mb={1}>
                标签（以逗号分隔）
              </Text>
              <Input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="例如：技术,生活"
              />
            </Box>

            <Box display="flex" alignItems="center" gap={2}>
              <input
                id="published"
                type="checkbox"
                checked={form.published}
                onChange={(e) =>
                  setForm({ ...form, published: e.target.checked })
                }
              />
              <label htmlFor="published">
                <Text as="span" fontSize="sm">
                  发布（勾选后对外可见）
                </Text>
              </label>
            </Box>

            <Box>
              <Text fontSize="sm" color="gray.500" mb={2}>
                下方为 Markdown 编辑器，右侧为渲染预览。
              </Text>
              <Box data-color-mode="light">
                <MDEditor
                  value={form.content_md}
                  onChange={(val: string | undefined) =>
                    setForm({ ...form, content_md: val || "" })
                  }
                  height={420}
                />
              </Box>
            </Box>

            <Flex justify="flex-end" pt={2} gap={3}>
              <Button
                colorScheme="blue"
                onClick={onSubmit}
                loading={saving}
              >
                {form.id ? "更新" : "创建"}
              </Button>
              {form.id && (
                <Button variant="outline" onClick={resetForm}>
                  重置表单
                </Button>
              )}
            </Flex>
          </Box>
        </Box>

        <Box
          flex="1"
          bg="white"
          p={5}
          borderRadius="lg"
          boxShadow="sm"
          maxH={{ base: "auto", lg: "640px" }}
          overflowY="auto"
        >
          <Heading as="h2" size="md" mb={4}>
            实时预览
          </Heading>
          <Box borderWidth="1px" borderRadius="md" p={4} bg="gray.50">
            <Heading as="h3" size="sm" mb={3}>
              {form.title || "（标题预览）"}
            </Heading>
            <Box className="wmde-markdown" fontSize="sm">
              <MDEditorPreview
                source={
                  form.content_md || "这里将展示 Markdown 渲染效果"
                }
              />
            </Box>
          </Box>
        </Box>
      </Flex>

      <Box bg="white" p={5} borderRadius="lg" boxShadow="sm">
        <Heading as="h2" size="md" mb={4}>
          博客列表
        </Heading>
        {loading ? (
          <Text color="gray.500" fontSize="sm">
            加载中...
          </Text>
        ) : blogs.length === 0 ? (
          <Text color="gray.500" fontSize="sm">
            暂无博客。
          </Text>
        ) : (
          <Box display="flex" flexDirection="column" gap={3}>
            {blogs.map((b) => (
              <Box
                key={b.id}
                borderWidth="1px"
                borderRadius="md"
                p={3}
                _hover={{ bg: "gray.50" }}
              >
                <Flex justify="space-between" align="flex-start" mb={1}>
                  <Text fontWeight="medium" maxW="260px">
                    {b.title}
                  </Text>
                  <Badge
                    colorScheme={b.published ? "green" : "gray"}
                    variant={b.published ? "solid" : "subtle"}
                  >
                    {b.published ? "已发布" : "草稿"}
                  </Badge>
                </Flex>
                <Text fontSize="xs" color="gray.500" mb={2}>
                  {new Date(b.created_at).toLocaleString("zh-CN")}
                </Text>
                <Flex gap={2}>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => onEdit(b)}
                  >
                    编辑
                  </Button>
                  <Button
                    size="xs"
                    colorScheme="red"
                    variant="ghost"
                    onClick={() => onDelete(b.id)}
                  >
                    删除
                  </Button>
                </Flex>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
}
