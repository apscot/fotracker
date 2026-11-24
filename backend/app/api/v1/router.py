from fastapi import APIRouter
from app.api.v1 import auth, home, tradebook, pnl, target

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(home.router)
api_router.include_router(tradebook.router)
api_router.include_router(pnl.router)
api_router.include_router(target.router)
