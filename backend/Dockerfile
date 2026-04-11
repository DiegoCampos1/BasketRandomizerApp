FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt requirements-dev.txt* ./
ARG DEV=false
RUN if [ "$DEV" = "true" ]; then \
        pip install --no-cache-dir -r requirements-dev.txt; \
    else \
        pip install --no-cache-dir -r requirements.txt; \
    fi

COPY . .

RUN if [ "$DEV" = "false" ]; then python manage.py collectstatic --noinput; fi

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py ensure_superuser && uvicorn config.asgi:application --host 0.0.0.0 --port ${PORT:-8000} --workers 1 --lifespan off"]
