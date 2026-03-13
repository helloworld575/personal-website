"""报告管理相关路由（仅管理员接口）。"""

import io
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from docx import Document

from database import get_db
from models import Report


admin_router = APIRouter(tags=["报告管理接口"])


class ReportBase(BaseModel):
    """报告基础信息。"""

    title: str
    content_md: str


class ReportCreate(ReportBase):
    """创建报告入参。"""

    pass


class ReportListOut(BaseModel):
    """报告列表返回。"""

    id: int
    title: str
    created_at: datetime

    class Config:
        orm_mode = True


class ReportDetailOut(BaseModel):
    """报告详情返回。"""

    id: int
    title: str
    content_md: str
    created_at: datetime

    class Config:
        orm_mode = True


@admin_router.get("/reports", response_model=List[ReportListOut])
def admin_list_reports(db: Session = Depends(get_db)):
    """管理员：获取报告列表。"""

    reports = db.query(Report).order_by(Report.created_at.desc()).all()
    return reports


@admin_router.get("/reports/{report_id}", response_model=ReportDetailOut)
def admin_get_report(report_id: int, db: Session = Depends(get_db)):
    """管理员：获取单个报告详情。"""

    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="报告不存在")
    return report


@admin_router.post(
    "/reports", response_model=ReportDetailOut, status_code=status.HTTP_201_CREATED
)
def admin_create_report(payload: ReportCreate, db: Session = Depends(get_db)):
    """管理员：通过粘贴内容创建报告。"""

    report = Report(
        title=payload.title,
        content_md=payload.content_md,
        created_at=datetime.utcnow(),
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@admin_router.post(
    "/reports/upload",
    response_model=ReportDetailOut,
    status_code=status.HTTP_201_CREATED,
)
async def admin_upload_report(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """管理员：上传 docx 文件并解析为 Markdown 文本保存。

    - 简单读取段落文本，以换行拼接为 Markdown 风格文本
    - 标题优先取首行非空文本，否则使用文件名
    """

    if not file.filename.lower().endswith(".docx"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="仅支持 docx 文件")

    contents = await file.read()
    doc = Document(io.BytesIO(contents))

    paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
    if not paragraphs:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="文档内容为空")

    title = paragraphs[0] or file.filename
    content_md = "\n\n".join(paragraphs)

    report = Report(
        title=title,
        content_md=content_md,
        created_at=datetime.utcnow(),
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@admin_router.delete("/reports/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def admin_delete_report(report_id: int, db: Session = Depends(get_db)):
    """管理员：删除报告。"""

    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="报告不存在")

    db.delete(report)
    db.commit()
    return None
