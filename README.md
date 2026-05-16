# OFPPT HR Management System 

A comprehensive Human Resources and Schedule Management System designed for **OFPPT**, built with modern web technologies. This project consolidates both Backend and Frontend into a single, organized repository.

## 🛠️ Tech Stack

- **Backend:** Laravel 11 (PHP)
- **Frontend:** React (Vite)
- **Styling:** Tailwind CSS
- **Database:** MySQL

##  Features

- **Employee Management:** Efficiently track staff details and attendance.
- **Absence Tracking:** Monitor and manage employee absences.
- **Schedule Management:** Automated import and synchronization of timetables (Excel/XML).
- **Dashboard:** Real-time statistics and HR overview.

##  Installation & Setup

### 1. Backend Setup (Laravel)
```bash
cd Projet-du-Gestion-du-Rh-frontend-backend-
composer install
cp .env.example .env
php artisan key:generate
# Configure your database in .env
php artisan migrate
php artisan serve
