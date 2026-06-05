from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import attendance, athletes, results, sessions
from app.core.config import get_settings
from app.core.errors import register_exception_handlers
from app.db.session import create_db_and_tables


def create_app(create_tables_on_startup: bool = True) -> FastAPI:
    settings = get_settings()
    app = FastAPI(
        title=settings.app_name,
        version=settings.api_version,
        description="REST API for managing training logs, athletes, attendance, and results.",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",
            "http://127.0.0.1:5173",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    register_exception_handlers(app)

    app.include_router(athletes.router)
    app.include_router(sessions.router)
    app.include_router(attendance.router)
    app.include_router(results.router)

    if create_tables_on_startup:
        @app.on_event("startup")
        def on_startup() -> None:
            create_db_and_tables()

    @app.get("/", tags=["Health"], summary="Root")
    def read_root() -> dict[str, str]:
        return {"message": "Training Logs API is running"}

    @app.get("/health", tags=["Health"], summary="Health check")
    def health_check() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
