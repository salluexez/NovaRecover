from fastapi import FastAPI

app = FastAPI(title="novarecover-ai")


@app.get("/health")
async def health():
    return {"status": "ok"}
