"""FastAPI 后端入口。

- 提供公开博客接口（/api/...）
- 提供管理员接口（/api/admin/...），通过 X-API-Key 头部与 .env 中 ADMIN_API_KEY 校验
- 使用 SQLite + SQLAlchemy 作为持久层
"""

import os
from typing import List

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware

from database import Base, engine
from routers import blog, reports, todos


# 加载 backend/.env 中的环境变量
load_dotenv()

ADMIN_API_KEY = os.getenv("ADMIN_API_KEY")


def verify_api_key(x_api_key: str = Header(..., alias="X-API-Key")):
    """校验管理员 API Key 的依赖函数。

    仅管理员接口会使用该依赖，普通公开接口无需提供头部。
    """

    if not ADMIN_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="服务器未配置管理员 API Key",
        )
    if x_api_key != ADMIN_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="无效的 API Key",
        )


# 创建数据库表（简单场景直接在应用启动时创建）
Base.metadata.create_all(bind=engine)


app = FastAPI(title="Personal Website API")


# 允许跨域，开发阶段放开所有来源；生产环境建议改为前端实际域名
origins: List[str] = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 挂载公开博客接口到 /api 前缀
app.include_router(blog.public_router, prefix="/api")

# 挂载管理员接口到 /api/admin 前缀，并统一添加 API Key 鉴权依赖
app.include_router(
    blog.admin_router, prefix="/api/admin", dependencies=[Depends(verify_api_key)]
)
app.include_router(
    reports.admin_router, prefix="/api/admin", dependencies=[Depends(verify_api_key)]
)
app.include_router(
    todos.admin_router, prefix="/api/admin", dependencies=[Depends(verify_api_key)]
)


@app.get("/api/health")
def health_check():
    """健康检查接口，便于探活与调试。"""

    return {"status": "ok"}
