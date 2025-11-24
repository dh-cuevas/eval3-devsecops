FROM python:3.9-slim

WORKDIR /app

# Instalar SQLite
RUN apt-get update && apt-get install -y --no-install-recommends sqlite3 \
    && rm -rf /var/lib/apt/lists/*

# Copiar dependencias e instalarlas
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo el código de la aplicación
COPY . .

# Crear la base de datos en el build
RUN python create_db.py

# Exponer el puerto de Flask
EXPOSE 5000

# Ejecutar la aplicación vulnerable
CMD ["python", "vulnerable_flask_apo.py"]
