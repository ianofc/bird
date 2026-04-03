@echo off
echo Rebuild completo do Bird...
docker-compose down -v
docker-compose build --no-cache frontend backend
docker-compose up -d
echo.
echo Logs do frontend:
docker-compose logs -f frontend
