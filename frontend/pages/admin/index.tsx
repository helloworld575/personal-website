import { FormEvent, useEffect, useState } from "react";
import NextLink from "next/link";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  Input,
  Text,
} from "@chakra-ui/react";
import { EditIcon, AttachmentIcon, CheckCircleIcon } from "@chakra-ui/icons";
import { apiGet, getStoredApiKey } from "../../components/apiClient";

/**
 * 管理首页：API Key 一次性输入 + 自动校验 + 工具仪表盘。
 */

type ViewState = "checking" | "input" | "dashboard";

export default function AdminHomePage() {
  const [view, setView] = useState<ViewState>("checking");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初次进入时自动校验 localStorage 中的 API Key
  useEffect(() => {
    const stored = getStoredApiKey();
    if (!stored) {
      setView("input");
      return;
    }

    setLoading(true);
    setError(null);

    apiGet("/api/admin/blogs", true)
      .then(() => {
        setApiKeyInput(stored);
        setView("dashboard");
      })
      .catch(() => {
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("API_KEY");
        }
        setApiKeyInput("");
        setView("input");
        setError("当前浏览器中保存的 API Key 已失效，请重新输入。");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const value = apiKeyInput.trim();
    if (!value) return;

    setLoading(true);
    setError(null);

    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem("API_KEY", value);
      }
      await apiGet("/api/admin/blogs", true);
      setView("dashboard");
    } catch (err: any) {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("API_KEY");
      }
      setError(err?.message || "校验失败，请确认 API Key 是否正确。");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("API_KEY");
    }
    setApiKeyInput("");
    setError(null);
    setView("input");
  };

  if (view === "checking") {
    return (
      <Flex
        align="center"
        justify="center"
        minH="60vh"
        direction="column"
        gap={4}
      >
        <Text color="gray.600" fontSize="sm">
          正在检查当前浏览器的 API Key 配置...
        </Text>
      </Flex>
    );
  }

  const renderInput = () => (
    <Box maxW="md" mx="auto">
      <Heading as="h1" size="lg" mb={4}>
        管理后台入口
      </Heading>
      <Text color="gray.600" mb={6} fontSize="sm">
        请输入管理员 API Key 后进入内部工具，包括博客管理、报告管理与待办事项。
      </Text>

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

      <Box
        as="form"
        onSubmit={handleSubmit}
        bg="white"
        borderRadius="md"
        boxShadow="sm"
        p={6}
      >
        <Box display="flex" flexDirection="column" gap={4}>
          <Box>
            <Text fontSize="sm" mb={1}>
              API Key
            </Text>
            <Input
              id="apiKey"
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="请输入后端配置的 ADMIN_API_KEY"
            />
          </Box>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={loading}
            isDisabled={!apiKeyInput.trim()}
          >
            进入管理后台
          </Button>
        </Box>
      </Box>
    </Box>
  );

  const renderDashboard = () => (
    <Box>
      <Flex align="center" justify="space-between" mb={6} gap={4}>
        <Box>
          <Heading as="h1" size="lg" mb={2}>
            管理工具仪表盘
          </Heading>
          <Text color="gray.600" fontSize="sm">
            已通过 API Key 校验，可在此进入博客管理、报告管理与待办事项工具。
          </Text>
        </Box>
        <Button variant="outline" colorScheme="red" size="sm" onClick={handleLogout}>
          重新设置 API Key / 登出
        </Button>
      </Flex>

      <Flex direction={{ base: "column", md: "row" }} gap={6} align="stretch">
        <Box as="section" bg="white" boxShadow="sm" borderRadius="lg" p={5} flex="1">
          <Flex align="center" gap={2} mb={2}>
            <Icon as={EditIcon} color="blue.500" />
            <Heading as="h2" size="md">
              博客管理
            </Heading>
          </Flex>
          <Text fontSize="sm" color="gray.600" mb={4}>
            创建、编辑与删除博客文章，支持 Markdown 编写与实时预览。
          </Text>
          <NextLink href="/admin/blog">
            <Button colorScheme="blue" size="sm">
              进入博客管理
            </Button>
          </NextLink>
        </Box>

        <Box as="section" bg="white" boxShadow="sm" borderRadius="lg" p={5} flex="1">
          <Flex align="center" gap={2} mb={2}>
            <Icon as={AttachmentIcon} color="teal.500" />
            <Heading as="h2" size="md">
              报告管理
            </Heading>
          </Flex>
          <Text fontSize="sm" color="gray.600" mb={4}>
            查看与管理模型调用报告，支持粘贴内容或上传 docx 自动解析。
          </Text>
          <NextLink href="/admin/reports">
            <Button colorScheme="teal" size="sm" variant="outline">
              打开报告管理
            </Button>
          </NextLink>
        </Box>

        <Box as="section" bg="white" boxShadow="sm" borderRadius="lg" p={5} flex="1">
          <Flex align="center" gap={2} mb={2}>
            <Icon as={CheckCircleIcon} color="purple.500" />
            <Heading as="h2" size="md">
              待办管理
            </Heading>
          </Flex>
          <Text fontSize="sm" color="gray.600" mb={4}>
            管理个人待办事项，支持优先级和状态筛选，记录工作节奏。
          </Text>
          <NextLink href="/admin/todos">
            <Button colorScheme="purple" size="sm" variant="outline">
              打开待办管理
            </Button>
          </NextLink>
        </Box>
      </Flex>
    </Box>
  );

  return (
    <Container maxW="6xl" py={2}>
      {view === "input" ? renderInput() : renderDashboard()}
    </Container>
  );
}
