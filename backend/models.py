"""SQLAlchemy ORM 模型定义。

包含博客（Blog）、报告（Report）、待办（Todo）三类实体。
"""

from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text

from database import Base


class Blog(Base):
    """博客模型。"""

    __tablename__ = "blogs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False, index=True)
    content_md = Column(Text, nullable=False)
    summary = Column(String(500), nullable=True)
    tags = Column(String(200), nullable=True)  # 逗号分隔的标签字符串
    slug = Column(String(300), unique=True, index=True, nullable=False)
    published = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )


class Report(Base):
    """模型调用报告模型。"""

    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    content_md = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Todo(Base):
    """待办事项模型。"""

    __tablename__ = "todos"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False)
    description = Column(Text, nullable=True)
    priority = Column(Integer, default=1, nullable=False)  # 优先级，数值越大优先级越高
    due_date = Column(DateTime, nullable=True)
    completed = Column(Boolean, default=False, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
