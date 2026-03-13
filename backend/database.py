"""数据库配置与会话管理模块（SQLite + SQLAlchemy）。"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite 数据库 URL，这里使用相对路径，数据库文件为 app.db
DATABASE_URL = "sqlite:///./app.db"

# 对于 SQLite，需要设置 check_same_thread=False 以允许多线程访问
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

# 创建 SessionLocal，每个请求使用一个独立的 Session 实例
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 声明性基类，所有 ORM 模型需要继承自 Base
Base = declarative_base()


def get_db():
    """FastAPI 依赖项：获取数据库会话。

    每个请求获取一个独立的 Session，对应请求结束后自动关闭，
    避免连接泄露。
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
