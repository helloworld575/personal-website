# 个人网站（Next.js + FastAPI）

这是一个全栈个人网站项目，结合了 Next.js 前端与 FastAPI 后端，并使用 SQLite 作为数据库。项目包含一个公开的博客系统和一套受 API Key 保护的内部管理工具。

## 功能特性

- **公开博客**：
  - 博客列表页，支持按标签筛选。
  - 博客详情页，使用 Markdown 渲染，支持代码高亮。
  - 页面通过 Next.js 的 SSG (静态站点生成) + ISR (增量静态再生) 实现，SEO 友好且性能出色。
- **内部管理后台**：
  - **API Key 认证**：所有管理接口均通过 `X-API-Key` 请求头进行保护。
  - **博客管理**：提供完整的 CRUD 功能，包含一个所见即所得的 Markdown 实时预览编辑器。
  - **报告管理**：支持粘贴文本或上传 `.docx` 文件创建报告，后台会自动将 Word 文档解析为 Markdown。
  - **待办管理**：一个简单的 To-Do List，支持新增、标记完成、删除以及按优先级和状态筛选。

## 技术栈

- **前端**:
  - [Next.js](https://nextjs.org/) (TypeScript)
  - [React](https://reactjs.org/)
  - [react-markdown](https://github.com/remarkjs/react-markdown) + `rehype-highlight` (Markdown 渲染与代码高亮)
  - [@uiw/react-md-editor](https://github.com/uiwjs/react-md-editor) (Markdown 实时预览编辑器)
- **后端**:
  - [FastAPI](https://fastapi.tiangolo.com/) (Python)
  - [SQLAlchemy](https://www.sqlalchemy.org/) (ORM)
  - [SQLite](https://www.sqlite.org/index.html) (数据库)
  - [Pydantic](https://docs.pydantic.dev/) (数据校验)
  - `python-docx` (Word 文档解析)
- **工程化**:
  - TypeScript, ESLint
  - Git

## 目录结构

```
personal-website/
├── frontend/          # Next.js 前端应用
│   ├── pages/         # 页面组件
│   │   ├── index.tsx          # 博客列表页 (SSG+ISR)
│   │   ├── blog/[slug].tsx    # 博客详情页 (SSG+ISR)
│   │   └── admin/             # 内部管理后台
│   │       ├── index.tsx      # API Key 校验入口
│   │       ├── blog/          # 博客管理
│   │       ├── reports/       # 报告管理
│   │       └── todos/         # 待办管理
│   ├── components/      # 可复用组件 (如布局、API客户端)
│   └── package.json
├── backend/           # FastAPI 后端应用
│   ├── main.py        # FastAPI 应用入口
│   ├── models.py      # SQLAlchemy ORM 模型
│   ├── database.py    # 数据库配置
│   ├── routers/       # API 路由模块
│   │   ├── blog.py
│   │   ├── reports.py
│   │   └── todos.py
│   ├── requirements.txt
│   └── .env           # (不入库) 存放 API Key 等配置
├── README.md          # 本文档
└── .gitignore         # Git 忽略配置
```

## 本地启动步骤

### 1. 环境变量配置

在启动服务前，需要配置必要的环境变量。

#### 后端

在 `backend/` 目录下创建一个 `.env` 文件，并设置管理员 API Key：

```env
# backend/.env
ADMIN_API_KEY=your_secure_32_char_hex_api_key
```

> 你可以自己生成一个安全的随机字符串作为 API Key。

#### 前端

在 `frontend/` 目录下创建一个 `.env.local` 文件，指定后端 API 的访问地址：

```env
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 2. 启动后端服务

```bash
# 进入后端目录
cd personal-website/backend

# (建议) 创建并激活 Python 虚拟环境
python3 -m venv venv
source venv/bin/activate  # macOS / Linux
# venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 启动后端服务
# --reload 会在代码变更时自动重启
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

服务启动后，你可以在 `http://localhost:8000/docs` 查看自动生成的 API 文档。

### 3. 启动前端服务

```bash
# 进入前端目录
cd personal-website/frontend

# 安装依赖 (若首次运行或依赖有变动)
npm install

# 启动开发服务器
npm run dev -- -p 3000
```

服务启动后，在浏览器中打开 `http://localhost:3000` 即可访问。

**重要提示**：由于前端博客页面采用了 SSG/ISR，`npm run dev` 或 `npm run build` 时会尝试从后端 API 拉取数据。因此，**必须先启动后端服务，再启动前端服务**。

## 访问与部署

- **本地访问**：
  - 前端：`http://localhost:3000`
  - 后端 API：`http://localhost:8000`
- **部署**：
  - 后端可部署在任何支持 ASGI 的服务器上（如 Docker 容器）。
  - 前端可通过 `npm run build` 构建成静态文件与 Next.js 服务，并部署在 Vercel 或其他 Node.js 服务器环境。
  - 部署时，请务必正确设置生产环境下的 `NEXT_PUBLIC_API_URL` 环境变量，使其指向后端服务的公网地址。
