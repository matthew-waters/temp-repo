from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.catalog_registry import router as catalog_router  # adjust import if needed

app = FastAPI(title="AgentLab API", version="0.1.0")

# CORS so your Next app can call this during dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or env-driven list
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True}

app.include_router(catalog_router)
