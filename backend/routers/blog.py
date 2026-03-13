"""博客相关路由（公开接口与管理接口）。"""

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from slugify import slugify
from sqlalchemy.orm import Session

from database import get_db
from models import Blog


# 公开接口路由：/api/blogs...
public_router = APIRouter(tags=["博客公开接口"])

# 管理接口路由：由 main.py 以 /api/admin 前缀挂载
admin_router = APIRouter(tags=["博客管理接口"])


# --------- Pydantic 模型定义 ---------


class BlogBase(BaseModel):
    """博客基础信息。"""

    title: str
    content_md: str
    tags: Optional[str] = None  # 逗号分隔字符串，由前端传入
    published: bool = False


class BlogCreate(BlogBase):
    """创建博客入参。"""

    pass


class BlogUpdate(BaseModel):
    """更新博客入参（全部字段可选）。"""

    title: Optional[str] = None
    content_md: Optional[str] = None
    tags: Optional[str] = None
    published: Optional[bool] = None


class BlogSummaryOut(BaseModel):
    """博客列表返回（摘要信息）。"""

    id: int
    title: str
    summary: str
    tags: List[str]
    slug: str
    created_at: datetime

    class Config:
        orm_mode = True


class BlogDetailOut(BaseModel):
    """博客详情返回。"""

    id: int
    title: str
    content_md: str
    summary: Optional[str]
    tags: List[str]
    slug: str
    published: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# --------- 工具函数 ---------


def _split_tags(tags_str: Optional[str]) -> List[str]:
    """将逗号分隔的标签字符串拆分为列表。"""

    if not tags_str:
        return []
    return [tag.strip() for tag in tags_str.split(",") if tag.strip()]


def _ensure_summary(blog: Blog) -> str:
    """确保博客有摘要，如果数据库中未存储则从正文截取前 N 字。"""

    if blog.summary:
        return blog.summary
    # 简单截取前 150 个字符作为摘要
    return (blog.content_md or "")[:150]


def _generate_unique_slug(db: Session, title: str) -> str:
    """根据标题生成唯一 slug。"""

    base_slug = slugify(title) or "post"
    slug = base_slug
    counter = 1
    while db.query(Blog).filter(Blog.slug == slug).first() is not None:
        slug = f"{base_slug}-{counter}"
        counter += 1
    return slug


# --------- 公开接口 ---------


@public_router.get("/blogs", response_model=List[BlogSummaryOut])
def list_published_blogs(
    tag: Optional[str] = Query(None, description="按标签过滤"),
    db: Session = Depends(get_db),
):
    """获取已发布博客列表，仅返回摘要信息。

    - 仅返回 published=True 的博客
    - 支持通过 tag 查询参数按标签过滤
    """

    query = db.query(Blog).filter(Blog.published.is_(True))

    if tag:
        # 简单包含匹配，避免复杂正则
        like_expr = f"%{tag}%"
        query = query.filter(Blog.tags.ilike(like_expr))

    blogs = query.order_by(Blog.created_at.desc()).all()

    result: List[BlogSummaryOut] = []
    for blog in blogs:
        result.append(
            BlogSummaryOut(
                id=blog.id,
                title=blog.title,
                summary=_ensure_summary(blog),
                tags=_split_tags(blog.tags),
                slug=blog.slug,
                created_at=blog.created_at,
            )
        )
    return result


@public_router.get("/blogs/{slug}", response_model=BlogDetailOut)
def get_blog_detail(slug: str, db: Session = Depends(get_db)):
    """根据 slug 获取单篇已发布博客详情。"""

    blog = (
        db.query(Blog)
        .filter(Blog.slug == slug, Blog.published.is_(True))
        .first()
    )
    if not blog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="博客不存在或未发布")

    return BlogDetailOut(
        id=blog.id,
        title=blog.title,
        content_md=blog.content_md,
        summary=_ensure_summary(blog),
        tags=_split_tags(blog.tags),
        slug=blog.slug,
        published=blog.published,
        created_at=blog.created_at,
        updated_at=blog.updated_at,
    )


# --------- 管理端接口（需在 main 中挂载到 /api/admin） ---------


@admin_router.get("/blogs", response_model=List[BlogDetailOut])
def admin_list_blogs(db: Session = Depends(get_db)):
    """管理员：获取所有博客（包含草稿）。"""

    blogs = db.query(Blog).order_by(Blog.created_at.desc()).all()
    return [
        BlogDetailOut(
            id=blog.id,
            title=blog.title,
            content_md=blog.content_md,
            summary=_ensure_summary(blog),
            tags=_split_tags(blog.tags),
            slug=blog.slug,
            published=blog.published,
            created_at=blog.created_at,
            updated_at=blog.updated_at,
        )
        for blog in blogs
    ]


@admin_router.post("/blogs", response_model=BlogDetailOut, status_code=status.HTTP_201_CREATED)
def admin_create_blog(payload: BlogCreate, db: Session = Depends(get_db)):
    """管理员：创建新博客。"""

    slug = _generate_unique_slug(db, payload.title)
    summary = (payload.content_md or "")[:150]

    blog = Blog(
        title=payload.title,
        content_md=payload.content_md,
        summary=summary,
        tags=payload.tags,
        slug=slug,
        published=payload.published,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(blog)
    db.commit()
    db.refresh(blog)

    return BlogDetailOut(
        id=blog.id,
        title=blog.title,
        content_md=blog.content_md,
        summary=_ensure_summary(blog),
        tags=_split_tags(blog.tags),
        slug=blog.slug,
        published=blog.published,
        created_at=blog.created_at,
        updated_at=blog.updated_at,
    )


@admin_router.put("/blogs/{blog_id}", response_model=BlogDetailOut)
def admin_update_blog(
    blog_id: int,
    payload: BlogUpdate,
    db: Session = Depends(get_db),
):
    """管理员：更新博客。"""

    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="博客不存在")

    if payload.title is not None:
        blog.title = payload.title
    if payload.content_md is not None:
        blog.content_md = payload.content_md
        # 若未显式指定摘要，则根据最新正文更新摘要
        if blog.summary is None:
            blog.summary = (payload.content_md or "")[:150]
    if payload.tags is not None:
        blog.tags = payload.tags
    if payload.published is not None:
        blog.published = payload.published

    blog.updated_at = datetime.utcnow()

    db.add(blog)
    db.commit()
    db.refresh(blog)

    return BlogDetailOut(
        id=blog.id,
        title=blog.title,
        content_md=blog.content_md,
        summary=_ensure_summary(blog),
        tags=_split_tags(blog.tags),
        slug=blog.slug,
        published=blog.published,
        created_at=blog.created_at,
        updated_at=blog.updated_at,
    )


@admin_router.delete("/blogs/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_blog(blog_id: int, db: Session = Depends(get_db)):
    """管理员：删除博客。"""

    blog = db.query(Blog).filter(Blog.id == blog_id).first()
    if not blog:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="博客不存在")

    db.delete(blog)
    db.commit()
    return None
