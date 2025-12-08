#!/bin/bash
# Script para reiniciar o servidor FastAPI

cd /home/ubuntu/rocket-engineering-app/python_backend

# Encontrar e matar processo Python do FastAPI
PID=$(ps aux | grep "python main.py" | grep -v grep | awk '{print $2}')

if [ -n "$PID" ]; then
    echo "Parando servidor FastAPI (PID: $PID)..."
    kill $PID
    sleep 2
fi

# Iniciar servidor novamente
echo "Iniciando servidor FastAPI..."
source venv/bin/activate
nohup python main.py > /tmp/fastapi.log 2>&1 &

sleep 3
echo "Servidor reiniciado!"
echo "Testando endpoint..."
curl -s http://localhost:8000/health
echo ""
