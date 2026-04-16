from fastapi import FastAPI

app = FastAPI(title="Advanced Software Technology API")


@app.get("/")
def read_root() -> dict[str, str]:
    return {"message": "FastAPI backend is running"}
