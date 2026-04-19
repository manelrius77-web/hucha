# PRD - App de Control de Huchas

## Problema Original
App de control para poner dinero en una hucha, poder poner nombre a cada hucha, elegir monedas y cantidad. Solo euros, histórico, estadísticas y login múltiples usuarios. Muestra la cantidad real de dinero en cada hucha.

## Arquitectura
- **Frontend**: React + TailwindCSS + Shadcn UI (puerto 3000)
- **Backend**: FastAPI (puerto 8001)
- **Base de datos**: MongoDB
- **Mobile**: Capacitor (iOS/Android) + GitHub Actions CI/CD

## Esquema de BD
- `users`: {email, hashed_password, name, role, created_at}
- `piggy_banks`: {user_id, name, color, icon, balance, goal, created_at}
- `transactions`: {piggy_bank_id, user_id, type, amount, description, date}

## Endpoints API
- POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
- GET /api/piggy-banks, POST /api/piggy-banks, DELETE /api/piggy-banks/{id}
- POST /api/piggy-banks/{id}/transactions
- GET /api/statistics

## Features Implementadas
- [x] Autenticación multi-usuario (JWT)
- [x] CRUD de huchas con 12 iconos y colores personalizables
- [x] Calculadora de monedas y billetes Euro
- [x] Balance en tiempo real por hucha
- [x] Historial de transacciones por hucha
- [x] Dashboard de estadísticas con gráficos
- [x] Doble confirmación para eliminar huchas
- [x] Configuración Capacitor para mobile
- [x] GitHub Actions workflow para builds iOS
- [x] Health Check de despliegue - PASSED

## Backlog
- [ ] Refactorizar PiggyBankDetail.js (extraer modales)
- [ ] Configuración PWA
- [ ] Mejoras UI/UX adicionales

## Deployment Status
- Health Check: PASSED (Feb 2026)
- Preview URL: https://savings-jar.preview.emergentagent.com
