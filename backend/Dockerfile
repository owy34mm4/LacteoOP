FROM ghcr.io/astral-sh/uv:python3.14-trixie-slim
WORKDIR /app
COPY src/requirements.txt .
RUN uv pip install --system -r requirements.txt
COPY src/ .
EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
