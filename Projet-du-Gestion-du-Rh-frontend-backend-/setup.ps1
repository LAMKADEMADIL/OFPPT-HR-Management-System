# Script de configuration automatique pour le projet RH (Laravel + React)
# Usage: .\setup.ps1

$ErrorActionPreference = "Stop"

# Couleurs pour le terminal
function Write-Header ($msg) { Write-Host "`n=== $msg ===" -ForegroundColor Cyan }
function Write-Success ($msg) { Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Error-Custom ($msg) { Write-Host "[ERREUR] $msg" -ForegroundColor Red }
function Write-Info ($msg) { Write-Host "[INFO] $msg" -ForegroundColor Yellow }

Write-Header "DÉMARRAGE DE L'INSTALLATION"

# 1. Vérification des prérequis
Write-Header "1. Vérification des prérequis"

try {
    $phpVersion = php -v
    Write-Success "PHP est installé."
} catch {
    Write-Error-Custom "PHP n'est pas installé. Veuillez l'installer avant de continuer."
    exit
}

try {
    $composerVersion = composer --version
    Write-Success "Composer est installé."
} catch {
    Write-Error-Custom "Composer n'est pas installé. Veuillez l'installer avant de continuer."
    exit
}

try {
    $nodeVersion = node -v
    Write-Success "Node.js est installé ($nodeVersion)."
} catch {
    Write-Error-Custom "Node.js n'est pas installé. Veuillez l'installer avant de continuer."
    exit
}

# 2. Installation des dépendances
Write-Header "2. Installation des dépendances"

Write-Info "Installation des dépendances Backend (Composer)..."
composer install
Write-Success "Dépendances Backend installées."

Write-Info "Installation des dépendances Frontend (NPM)..."
Set-Location "ofppt-rh-frontend"
npm install
Set-Location ".."
Write-Success "Dépendances Frontend installées."

# 3. Configuration de l'environnement
Write-Header "3. Configuration de l'environnement"

if (-not (Test-Path ".env")) {
    Write-Info "Création du fichier .env à partir de .env.example..."
    Copy-Item ".env.example" ".env"
    Write-Success "Fichier .env créé."
} else {
    Write-Info "Le fichier .env existe déjà. Passage à l'étape suivante."
}

Write-Info "Génération de la clé d'application..."
php artisan key:generate
Write-Success "Clé d'application générée."

# 4. Base de données
Write-Header "4. Configuration de la base de données"

Write-Host "Veuillez vous assurer que votre base de données est créée dans MySQL (XAMPP)." -ForegroundColor Yellow
$response = Read-Host "Voulez-vous exécuter les migrations et les seeds maintenant ? (O/N)"

if ($response -eq "O" -or $response -eq "o") {
    Write-Info "Exécution des migrations..."
    try {
        php artisan migrate:fresh --seed
        Write-Success "Base de données migrée et initialisée."
    } catch {
        Write-Error-Custom "La migration a échoué. Vérifiez vos accès DB dans le fichier .env."
    }
} else {
    Write-Info "Migration ignorée. N'oubliez pas de la faire manuellement avec 'php artisan migrate'."
}

# 5. Finalisation
Write-Header "5. Finalisation"

Write-Info "Création du lien symbolique de stockage..."
php artisan storage:link
Write-Success "Lien de stockage créé."

Write-Info "Compilation des assets frontend..."
Set-Location "ofppt-rh-frontend"
npm run build
Set-Location ".."
Write-Success "Assets compilés."

Write-Header "INSTALLATION TERMINÉE AVEC SUCCÈS !"
Write-Host "Vous pouvez maintenant lancer le projet :" -ForegroundColor Green
Write-Host "1. Backend : php artisan serve" -ForegroundColor White
Write-Host "2. Frontend : cd ofppt-rh-frontend; npm run dev" -ForegroundColor White
Write-Host "`nLien du site (par défaut) : http://127.0.0.1:8000" -ForegroundColor Cyan
