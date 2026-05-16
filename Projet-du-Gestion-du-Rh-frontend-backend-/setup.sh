#!/bin/bash

# Script de configuration automatique pour le projet RH (Laravel + React)
# Usage: ./setup.sh

# Couleurs pour le terminal
GREEN='\033[0;32m'
RED='\033[0;31m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "\n${CYAN}=== DÉMARRAGE DE L'INSTALLATION ===${NC}"

# 1. Vérification des prérequis
echo -e "\n${CYAN}1. Vérification des prérequis${NC}"

if ! [ -x "$(command -v php)" ]; then
  echo -e "${RED}[ERREUR] PHP n'est pas installé.${NC}" >&2
  exit 1
fi
echo -e "${GREEN}[OK] PHP est installé.${NC}"

if ! [ -x "$(command -v composer)" ]; then
  echo -e "${RED}[ERREUR] Composer n'est pas installé.${NC}" >&2
  exit 1
fi
echo -e "${GREEN}[OK] Composer est installé.${NC}"

if ! [ -x "$(command -v node)" ]; then
  echo -e "${RED}[ERREUR] Node.js n'est pas installé.${NC}" >&2
  exit 1
fi
echo -e "${GREEN}[OK] Node.js est installé.$(node -v)${NC}"

# 2. Installation des dépendances
echo -e "\n${CYAN}2. Installation des dépendances${NC}"

echo -e "${YELLOW}Installation des dépendances Backend (Composer)...${NC}"
composer install
echo -e "${GREEN}[OK] Dépendances Backend installées.${NC}"

echo -e "${YELLOW}Installation des dépendances Frontend (NPM)...${NC}"
cd ofppt-rh-frontend
npm install
cd ..
echo -e "${GREEN}[OK] Dépendances Frontend installées.${NC}"

# 3. Configuration de l'environnement
echo -e "\n${CYAN}3. Configuration de l'environnement${NC}"

if [ ! -f .env ]; then
    echo -e "${YELLOW}Création du fichier .env à partir de .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}[OK] Fichier .env créé.${NC}"
else
    echo -e "${YELLOW}Le fichier .env existe déjà. Passage à l'étape suivante.${NC}"
fi

echo -e "${YELLOW}Génération de la clé d'application...${NC}"
php artisan key:generate
echo -e "${GREEN}[OK] Clé d'application générée.${NC}"

# 4. Base de données
echo -e "\n${CYAN}4. Configuration de la base de données${NC}"

echo -e "${YELLOW}Veuillez vous assurer que votre base de données est créée.${NC}"
read -p "Voulez-vous exécuter les migrations et les seeds maintenant ? (O/N) : " response

if [[ "$response" =~ ^[Oo]$ ]]; then
    echo -e "${YELLOW}Exécution des migrations...${NC}"
    php artisan migrate:fresh --seed
    echo -e "${GREEN}[OK] Base de données migrée et initialisée.${NC}"
else
    echo -e "${YELLOW}Migration ignorée.${NC}"
fi

# 5. Finalisation
echo -e "\n${CYAN}5. Finalisation${NC}"

echo -e "${YELLOW}Création du lien symbolique de stockage...${NC}"
php artisan storage:link
echo -e "${GREEN}[OK] Lien de stockage créé.${NC}"

echo -e "${YELLOW}Compilation des assets frontend...${NC}"
cd ofppt-rh-frontend
npm run build
cd ..
echo -e "${GREEN}[OK] Assets compilés.${NC}"

echo -e "\n${CYAN}=== INSTALLATION TERMINÉE AVEC SUCCÈS ! ===${NC}"
echo -e "${GREEN}Vous pouvez maintenant lancer le projet :${NC}"
echo -e "1. Backend : php artisan serve"
echo -e "2. Frontend : cd ofppt-rh-frontend && npm run dev"
echo -e "\nLien du site : ${CYAN}http://127.0.0.1:8000${NC}"
