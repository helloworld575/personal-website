import type { AppProps } from "next/app";
import Head from "next/head";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import Layout from "../components/Layout";
import "../styles/globals.css";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

/**
 * 自定义 App 组件，用于注入全局布局与样式。
 */
export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider value={defaultSystem}>
      <Head>
        <title>个人网站 · 博客与内部工具</title>
        <meta
          name="description"
          content="个人博客与内部工具（博客管理、报告管理、待办事项）。"
        />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ChakraProvider>
  );
}
