#!/bin/bash
# =============================================
# Mochy API - Functional Test Suite
# Ejecutar con: bash tests/api-test.sh
# =============================================

BASE_URL="http://localhost:3000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS=0
FAIL=0

check() {
  local test_name=$1
  local expected_status=$2
  local actual_status=$3
  if [ "$actual_status" -eq "$expected_status" ]; then
    echo -e "${GREEN}✅ PASS${NC}: $test_name (HTTP $actual_status)"
    PASS=$((PASS + 1))
  else
    echo -e "${RED}❌ FAIL${NC}: $test_name (Esperado: $expected_status, Obtenido: $actual_status)"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo -e "${YELLOW}======================================${NC}"
echo -e "${YELLOW}  🚗 Mochy API - Test Suite${NC}"
echo -e "${YELLOW}======================================${NC}"
echo ""

# 1. REGISTRO
echo "--- Test: Registro de Usuario ---"
TIMESTAMP=$(date +%s)
TEST_EMAIL="test_${TIMESTAMP}@mochy.com"

REGISTER_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"test123\", \"name\": \"Test User\", \"role\": \"PASAJERO\"}")

REGISTER_STATUS=$(echo "$REGISTER_RESP" | tail -n1)
REGISTER_BODY=$(echo "$REGISTER_RESP" | sed '$d')
check "Registro de nuevo usuario" 201 "$REGISTER_STATUS"

# 2. LOGIN
echo ""
echo "--- Test: Login ---"
LOGIN_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"test123\"}")

LOGIN_STATUS=$(echo "$LOGIN_RESP" | tail -n1)
LOGIN_BODY=$(echo "$LOGIN_RESP" | sed '$d')
TOKEN=$(echo "$LOGIN_BODY" | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)
check "Login con credenciales válidas" 200 "$LOGIN_STATUS"

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ No se pudo obtener token, abortando tests restantes.${NC}"
  exit 1
fi

# 3. LOGIN CON CREDENCIALES INCORRECTAS
LOGIN_FAIL_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"password\": \"wrongpassword\"}")
LOGIN_FAIL_STATUS=$(echo "$LOGIN_FAIL_RESP" | tail -n1)
check "Login con contraseña incorrecta" 401 "$LOGIN_FAIL_STATUS"

# 4. ACCESO SIN TOKEN
echo ""
echo "--- Test: Endpoints protegidos ---"
NO_AUTH_RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/rides/me")
NO_AUTH_STATUS=$(echo "$NO_AUTH_RESP" | tail -n1)
check "Acceso sin token rechazado" 401 "$NO_AUTH_STATUS"

# 5. GET RIDES PÚBLICOS
echo ""
echo "--- Test: Viajes públicos ---"
RIDES_RESP=$(curl -s -w "\n%{http_code}" "$BASE_URL/rides" \
  -H "Authorization: Bearer $TOKEN")
RIDES_STATUS=$(echo "$RIDES_RESP" | tail -n1)
check "Listar viajes activos" 200 "$RIDES_STATUS"

# 6. VERIFICAR IDENTIDAD
echo ""
echo "--- Test: Verificación de Identidad ---"
VERIFY_RESP=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/users/verify" \
  -H "Authorization: Bearer $TOKEN")
VERIFY_STATUS=$(echo "$VERIFY_RESP" | tail -n1)
check "Verificar identidad" 200 "$VERIFY_STATUS"

# 7. REGISTRO CONDUCTOR
echo ""
echo "--- Test: Flujo de Conductor ---"
DRIVER_EMAIL="driver_${TIMESTAMP}@mochy.com"
DRIVER_REG=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$DRIVER_EMAIL\", \"password\": \"test123\", \"name\": \"Driver Test\", \"role\": \"CONDUCTOR\"}")
DRIVER_REG_STATUS=$(echo "$DRIVER_REG" | tail -n1)
check "Registro de conductor" 201 "$DRIVER_REG_STATUS"

DRIVER_LOGIN=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$DRIVER_EMAIL\", \"password\": \"test123\"}")
DRIVER_TOKEN=$(echo "$DRIVER_LOGIN" | sed '$d' | grep -o '"token":"[^"]*"' | head -1 | cut -d'"' -f4)

# 8. PUBLICAR VIAJE
RIDE_RESP=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/rides" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DRIVER_TOKEN" \
  -d "{\"origin\": \"CDMX\", \"destination\": \"Puebla\", \"date\": \"2026-04-01\", \"availableSeats\": 3, \"price\": 150}")
RIDE_STATUS=$(echo "$RIDE_RESP" | tail -n1)
RIDE_BODY=$(echo "$RIDE_RESP" | sed '$d')
RIDE_ID=$(echo "$RIDE_BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
check "Publicar viaje como conductor" 201 "$RIDE_STATUS"

# ======= RESUMEN =======
echo ""
echo -e "${YELLOW}======================================${NC}"
echo -e "${YELLOW}  RESUMEN DE RESULTADOS${NC}"
echo -e "${YELLOW}======================================${NC}"
echo -e "${GREEN}✅ Pasados: $PASS${NC}"
echo -e "${RED}❌ Fallidos: $FAIL${NC}"
TOTAL=$((PASS + FAIL))
echo -e "Total: $TOTAL tests"
echo ""

if [ $FAIL -gt 0 ]; then
  exit 1
fi
