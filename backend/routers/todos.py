"""待办事项管理相关路由（仅管理员接口）。"""

from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import Todo


admin_router = APIRouter(tags=["待办管理接口"])


class TodoBase(BaseModel):
    """待办基础信息。"""

    title: str
    description: Optional[str] = None
    priority: int = 1
    due_date: Optional[datetime] = None
    completed: bool = False


class TodoCreate(TodoBase):
    """创建待办入参。"""

    pass


class TodoUpdate(BaseModel):
    """更新待办入参（全部字段可选）。"""

    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[int] = None
    due_date: Optional[datetime] = None
    completed: Optional[bool] = None


class TodoOut(BaseModel):
    """待办返回模型。"""

    id: int
    title: str
    description: Optional[str]
    priority: int
    due_date: Optional[datetime]
    completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


@admin_router.get("/todos", response_model=List[TodoOut])
def admin_list_todos(
    priority: Optional[int] = Query(None, description="按优先级过滤"),
    completed: Optional[bool] = Query(None, description="按完成状态过滤"),
    db: Session = Depends(get_db),
):
    """管理员：获取待办列表，支持按优先级与完成状态筛选。"""

    query = db.query(Todo)
    if priority is not None:
        query = query.filter(Todo.priority == priority)
    if completed is not None:
        query = query.filter(Todo.completed.is_(completed))

    todos = query.order_by(Todo.priority.desc(), Todo.created_at.desc()).all()
    return todos


@admin_router.post("/todos", response_model=TodoOut, status_code=status.HTTP_201_CREATED)
def admin_create_todo(payload: TodoCreate, db: Session = Depends(get_db)):
    """管理员：创建待办。"""

    todo = Todo(
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        due_date=payload.due_date,
        completed=payload.completed,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


@admin_router.put("/todos/{todo_id}", response_model=TodoOut)
def admin_update_todo(
    todo_id: int,
    payload: TodoUpdate,
    db: Session = Depends(get_db),
):
    """管理员：更新待办，可用于状态切换等。"""

    todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="待办不存在")

    if payload.title is not None:
        todo.title = payload.title
    if payload.description is not None:
        todo.description = payload.description
    if payload.priority is not None:
        todo.priority = payload.priority
    if payload.due_date is not None:
        todo.due_date = payload.due_date
    if payload.completed is not None:
        todo.completed = payload.completed

    todo.updated_at = datetime.utcnow()

    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


@admin_router.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_todo(todo_id: int, db: Session = Depends(get_db)):
    """管理员：删除待办。"""

    todo = db.query(Todo).filter(Todo.id == todo_id).first()
    if not todo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="待办不存在")

    db.delete(todo)
    db.commit()
    return None
