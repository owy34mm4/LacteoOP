from fastapi import FastAPI

app = FastAPI(title="LácteoOp API")


@app.get("/")
def root():
    return {"message": "Hello from LácteoOp API"}


@app.get("/health")
def health():
    return {"status": "ok"}
