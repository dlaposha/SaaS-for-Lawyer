from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from src.core.database import get_db
from src.core.security import get_current_user
from . import service, schemas
from src.modules.auth.models import User

router = APIRouter(prefix="/invoices", tags=["invoices"])

@router.post("/", response_model=schemas.InvoiceResponse, status_code=status.HTTP_201_CREATED)
async def create_invoice(
    invoice: schemas.InvoiceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoice_service = service.InvoiceService(db)
    return await invoice_service.create(invoice)

@router.get("/", response_model=List[schemas.InvoiceResponse])
async def list_invoices(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    client_id: Optional[UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoice_service = service.InvoiceService(db)
    return await invoice_service.get_all(skip, limit, status, client_id)

@router.get("/{invoice_id}", response_model=schemas.InvoiceResponse)
async def get_invoice(
    invoice_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoice_service = service.InvoiceService(db)
    db_invoice = await invoice_service.get_by_id(invoice_id)
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return db_invoice

@router.patch("/{invoice_id}/status", response_model=schemas.InvoiceResponse)
async def update_invoice_status(
    invoice_id: UUID,
    status: schemas.InvoiceStatus,
    payment_method: Optional[schemas.PaymentMethod] = None,
    payment_reference: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoice_service = service.InvoiceService(db)
    db_invoice = await invoice_service.update_status(
        invoice_id, status.value, payment_method.value if payment_method else None, payment_reference
    )
    if not db_invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return db_invoice

@router.get("/stats/dashboard", response_model=schemas.InvoiceStats)
async def get_invoice_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    invoice_service = service.InvoiceService(db)
    return await invoice_service.get_stats()