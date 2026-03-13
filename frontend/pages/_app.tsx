import type { AppProps } from "next/app";
import Head from "next/head";
import { ChakraProvider } from "@chakra-ui/react";
import Layout from "../components/Layout";
import "../styles/globals.css";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

/**
 * 自定义 App 组件，用于注入全局布局与样式。
 */
export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <Head>
        <title>ThomasLee的博客</title>
        <meta
          name="description"
          content="ThomasLee 的个人博客与内部工具（博客管理、报告管理、待办事项）。"
        />
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ChakraProvider>
  );
}
