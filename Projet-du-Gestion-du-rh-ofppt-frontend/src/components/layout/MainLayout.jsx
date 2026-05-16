import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

export default function MainLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-fadeIn max-w-screen-xl mx-auto">
            {children}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
