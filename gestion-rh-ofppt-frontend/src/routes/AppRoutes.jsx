import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Loader } from '../components/common/index';
import { ROLES } from '../utils/constants';

// --- Auth & Main Pages ---
const Login         = lazy(() => import('../pages/Auth/Login'));
const Register      = lazy(() => import('../pages/Auth/Register'));
const Dashboard     = lazy(() => import('../pages/Dashboard/Dashboard'));
const ProfilePage   = lazy(() => import('../pages/Profile/ProfilePage'));

// --- Personnel & RH Modules ---
const PersonnelPage = lazy(() => import('../pages/Personnel/PersonnelPage'));
const ShowPersonnel = lazy(() => import('../pages/Personnel/PersonnelPage').then(m => ({ default: m.ShowPersonnel })));
const EditPersonnel = lazy(() => import('../pages/Personnel/PersonnelPage').then(m => ({ default: m.EditPersonnel })));
const CongesPage    = lazy(() => import('../pages/Conges/CongesPage'));
const AbsencesPage  = lazy(() => import('../pages/Absences/AbsencesPage'));

// --- Emploi & Planning ---
const EmploiUnifie  = lazy(() => import('../pages/Emploi/EmploiUnifie'));
const EmploiImport  = lazy(() => import('../pages/Emploi/EmploiImportPage'));

// --- Admin / User Management ---
const UserList      = lazy(() => import('../pages/Users/index').then(m => ({ default: m.UserList })));
const CreateUser    = lazy(() => import('../pages/Users/index').then(m => ({ default: m.CreateUser })));
const EditUser      = lazy(() => import('../pages/Users/index').then(m => ({ default: m.EditUser })));

const PageFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader />
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/auth/login" element={<Login />} />
        <Route path= "/auth/register" element={<Register />} />

        {/* Global Protected Routes (Accessible by both roles) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/personnels" element={<PersonnelPage />} />
          <Route path="/personnels/:id" element={<ShowPersonnel />} />
          <Route path="/personnels/:id/edit" element={<EditPersonnel />} />
          <Route path="/conges" element={<CongesPage />} />
          <Route path="/absences" element={<AbsencesPage />} />
          <Route path="/emploi-du-temps" element={<EmploiUnifie />} />
          <Route path="/emploi-du-temps/import" element={<EmploiImport />} />
        </Route>

        {/* Restricted Admin Routes (Directeur Only) */}
        <Route element={<ProtectedRoute allowedRoles={[ROLES.DIRECTEUR_COMPLEXE]} />}>
          <Route path="/users" element={<UserList />} />
          <Route path="/users/create" element={<CreateUser />} />
          <Route path="/users/:id/edit" element={<EditUser />} />
        </Route>

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}