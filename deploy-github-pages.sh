#!/bin/bash

# ════════════════════════════════════════════════════════════════
# SCRIPT DE DEPLOY AUTOMÁTICO PARA GITHUB PAGES
# Aplica correcciones y despliega a main
# ════════════════════════════════════════════════════════════════

echo "🚀 Iniciando deploy de Brailletopía a GitHub Pages..."
echo ""

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "index.html" ]; then
    echo -e "${RED}❌ Error: No se encuentra index.html${NC}"
    echo "Asegúrate de estar en la carpeta raíz del proyecto brailletopia"
    exit 1
fi

echo -e "${GREEN}✓${NC} Directorio correcto detectado"

# Verificar que no hay cambios sin commit
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  Hay cambios sin commit${NC}"
    echo ""
    git status -s
    echo ""
    read -p "¿Quieres hacer commit de estos cambios? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        read -p "Mensaje de commit: " commit_msg
        git add .
        git commit -m "$commit_msg"
        echo -e "${GREEN}✓${NC} Commit realizado"
    else
        echo -e "${RED}❌ Deploy cancelado. Commit tus cambios primero.${NC}"
        exit 1
    fi
fi

# Asegurarse de estar en dev
echo ""
echo "📍 Cambiando a rama dev..."
git checkout dev

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al cambiar a rama dev${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} En rama dev"

# Push dev al remoto
echo ""
echo "📤 Actualizando rama dev en GitHub..."
git push origin dev

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al hacer push de dev${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Rama dev actualizada"

# Cambiar a main
echo ""
echo "📍 Cambiando a rama main..."
git checkout main

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al cambiar a rama main${NC}"
    exit 1
fi

# Actualizar main con remoto
echo ""
echo "🔄 Actualizando main desde GitHub..."
git pull origin main

if [ $? -ne 0 ]; then
    echo -e "${YELLOW}⚠️  Hubo un problema al hacer pull. Intentando continuar...${NC}"
fi

# Merge dev a main
echo ""
echo "🔀 Haciendo merge de dev a main..."
git merge dev -m "Deploy: Actualización de Brailletopía desde dev"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error en el merge. Hay conflictos que resolver.${NC}"
    echo ""
    echo "Archivos en conflicto:"
    git diff --name-only --diff-filter=U
    echo ""
    echo "Resuelve los conflictos manualmente y luego ejecuta:"
    echo "  git add ."
    echo "  git commit -m 'Resolver conflictos'"
    echo "  git push origin main"
    exit 1
fi

echo -e "${GREEN}✓${NC} Merge completado sin conflictos"

# Push main
echo ""
echo "🚀 Desplegando a GitHub Pages (push a main)..."
git push origin main

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al hacer push a main${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Deploy completado exitosamente"

# Volver a dev
echo ""
echo "📍 Regresando a rama dev..."
git checkout dev

# Actualizar dev con main (sincronizar)
echo ""
echo "🔄 Sincronizando dev con main..."
git merge main
git push origin dev

echo ""
echo "════════════════════════════════════════════════════════════"
echo -e "${GREEN}✅ DEPLOY COMPLETADO EXITOSAMENTE${NC}"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "🌐 Tu sitio estará disponible en 1-2 minutos en:"
echo "   https://cdoaweb.github.io/brailletopia/"
echo ""
echo "📊 Información del deploy:"
echo "   Rama actual: $(git branch --show-current)"
echo "   Último commit en main: $(git log main -1 --oneline)"
echo ""
echo "💡 Comandos útiles:"
echo "   Ver estado: git status"
echo "   Ver logs: git log --oneline -5"
echo "   Ver ramas: git branch -a"
echo ""
echo "════════════════════════════════════════════════════════════"
