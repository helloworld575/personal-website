import NextLink from "next/link";
import { ReactNode } from "react";
import {
  Box,
  Container,
  Flex,
  Link as ChakraLink,
  Text,
} from "@chakra-ui/react";

interface LayoutProps {
  children: ReactNode;
}

/**
 * 全站通用布局组件，负责头部导航与内容容器。
 */
export default function Layout({ children }: LayoutProps) {
  const currentYear = new Date().getFullYear();

  return (
    <Box minH="100vh" bg="gray.50" display="flex" flexDirection="column">
      <Box as="header" borderBottomWidth="1px" borderColor="gray.200" bg="white">
        <Container maxW="6xl" py={3} px={{ base: 4, md: 6 }}>
          <Flex align="center" justify="space-between">
            <ChakraLink
              as={NextLink}
              href="/"
              fontWeight="bold"
              fontSize="lg"
              _hover={{ textDecoration: "none", color: "blue.500" }}
            >
              个人网站 · 博客
            </ChakraLink>
            <Flex gap={4} fontSize="sm" color="gray.700">
              <ChakraLink
                as={NextLink}
                href="/"
                _hover={{ color: "blue.500" }}
              >
                博客
              </ChakraLink>
              <ChakraLink
                as={NextLink}
                href="/admin"
                _hover={{ color: "blue.500" }}
              >
                管理后台
              </ChakraLink>
            </Flex>
          </Flex>
        </Container>
      </Box>

      <Box as="main" flex="1 0 auto" py={8}>
        <Container maxW="6xl" px={{ base: 4, md: 6 }}>
          {children}
        </Container>
      </Box>

      <Box
        as="footer"
        flexShrink={0}
        textAlign="center"
        py={6}
        fontSize="sm"
        color="gray.500"
      >
        <Text>
          © {currentYear} 个人网站 · Powered by Next.js &amp; FastAPI
        </Text>
      </Box>
    </Box>
  );
}
