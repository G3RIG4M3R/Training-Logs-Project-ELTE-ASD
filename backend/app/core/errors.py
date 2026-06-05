from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError


class ApiError(Exception):
    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        details: Any | None = None,
    ) -> None:
        self.status_code = status_code
        self.code = code
        self.message = message
        self.details = details or []


def error_payload(code: str, message: str, details: Any | None = None) -> dict[str, Any]:
    return {"error": {"code": code, "message": message, "details": details or []}}


def error_response(
    status_code: int,
    code: str,
    message: str,
    details: Any | None = None,
) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content=jsonable_encoder(error_payload(code, message, details)),
    )


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(ApiError)
    async def api_error_handler(_: Request, exc: ApiError) -> JSONResponse:
        return error_response(exc.status_code, exc.code, exc.message, exc.details)

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
        return error_response(
            status_code=422,
            code="validation_error",
            message="Request validation failed",
            details=exc.errors(),
        )

    @app.exception_handler(HTTPException)
    async def http_error_handler(_: Request, exc: HTTPException) -> JSONResponse:
        detail = exc.detail
        message = detail if isinstance(detail, str) else "HTTP error"
        return error_response(
            status_code=exc.status_code,
            code="http_error",
            message=message,
            details=[] if isinstance(detail, str) else detail,
        )

    @app.exception_handler(IntegrityError)
    async def integrity_error_handler(_: Request, __: IntegrityError) -> JSONResponse:
        return error_response(
            status_code=409,
            code="database_integrity_error",
            message="The request conflicts with existing data",
        )
