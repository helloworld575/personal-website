import NextLink from "next/link";
import { ReactNode } from "react";
import {
  Box,
  Container,
  Flex,
  Icon,
  Link as ChakraLink,
  Text,
} from "@chakra-ui/react";
import { EditIcon, CheckCircleIcon } from "@chakra-ui/icons";

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
              display="flex"
              alignItems="center"
              gap={2}
              _hover={{ textDecoration: "none", color: "blue.500" }}
            >
              <Icon as={EditIcon} color="blue.500" boxSize={4} />
              <Text as="span">ThomasLee的博客</Text>
            </ChakraLink>
            <Flex gap={4} fontSize="sm" color="gray.700" align="center">
              <ChakraLink
                as={NextLink}
                href="/"
                display="flex"
                alignItems="center"
                gap={1}
                _hover={{ color: "blue.500" }}
              >
                <Text as="span">博客</Text>
              </ChakraLink>
              <ChakraLink
                as={NextLink}
                href="/admin"
                display="flex"
                alignItems="center"
                gap={1}
                _hover={{ color: "blue.500" }}
              >
                <Icon as={CheckCircleIcon} boxSize={3} />
                <Text as="span">管理后台</Text>
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
          © {currentYear} ThomasLee的博客 · Powered by Next.js &amp; FastAPI
        </Text>
      </Box>
    </Box>
  );
}
