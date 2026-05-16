# OFPPT RH Management System

A comprehensive web application designed for Managing Human Resources and Schedules at OFPPT. The system features a robust Laravel backend and a dynamic React frontend, providing a seamless experience for administrators and staff.

## 🚀 Features

- **Employee Management:** Track attendance, absences, and profile details.
- **Schedule Management (Emploi du Temps):** Import and visualize schedules from Excel/XML files.
- **Automated Imports:** Sync data directly from institutional Excel sheets.
- **Dashboard:** Real-time statistics and overview of HR activities.
- **Responsive UI:** Modern design built with React and Vite.

## 🛠️ Tech Stack

- **Backend:** [Laravel 11](https://laravel.com/) (PHP)
- **Frontend:** [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Database:** [MySQL](https://www.mysql.com/)
- **Styling:** CSS3 / Vanilla CSS

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- PHP >= 8.2
- Composer
- Node.js & NPM
- MySQL (XAMPP / Laragon)

## 🔧 Installation

We've provided a setup script to automate the process.

### Using the Setup Script (Recommended)

**Windows:**
```powershell
.\setup.ps1
```

**Linux/macOS:**
```bash
chmod +x setup.sh
./setup.sh
```

### Manual Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/ofppt-rh-management.git
   cd ofppt-rh-management
   ```

2. **Backend Setup:**
   ```bash
   composer install
   cp .env.example .env
   php artisan key:generate
   # Configure your database in .env then:
   php artisan migrate --seed
   php artisan storage:link
   ```

3. **Frontend Setup:**
   ```bash
   cd ofppt-rh-frontend
   npm install
   npm run build
   ```

## 🏃 Running the Application

1. **Start the Laravel Server:**
   ```bash
   php artisan serve
   ```

2. **Start the Vite Dev Server:**
   ```bash
   cd ofppt-rh-frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://127.0.0.1:8000`.

## 📁 Folder Structure

```text
├── app/                # Laravel Core Logic (Models, Controllers, Services)
├── bootstrap/          # Laravel Initialization
├── config/             # Configuration files
├── database/           # Migrations and Seeders
├── ofppt-rh-frontend/  # React Vite Frontend Source
│   ├── src/            # Components, Hooks, Assets
│   └── public/         # Static assets
├── public/             # Laravel Entry point & compiled assets
├── resources/          # Backend views & raw assets
├── routes/             # API & Web routes
├── storage/            # Logs & Uploaded files
└── setup.ps1           # Automation script
```

## 📄 License

Distributed under the MIT License.
