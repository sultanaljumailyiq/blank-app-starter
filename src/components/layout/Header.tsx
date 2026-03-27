import { Globe, Stethoscope, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { usePlatform } from '../../contexts/PlatformContext';

export const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { isAuthenticated, logout } = useAuth();
  const { settings } = usePlatform();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-11 sm:h-12">
          {/* Logo */}
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-xl" />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm sm:text-base">S</span>
              </div>
            )}
          </Link>

          {/* Navigation Items */}
          <nav className="flex items-center gap-1.5 sm:gap-3">
            {!isAuthenticated && (
              <>
                <Link 
                  to="/services" 
                  className="group relative px-2 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 text-[11px] sm:text-sm flex items-center gap-1"
                >
                  <Stethoscope className="w-3.5 h-3.5 sm:w-4 h-4" />
                  <span>الخدمات الطبية</span>
                </Link>

                <Link 
                  to="/" 
                  className="group relative px-2 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 text-[11px] sm:text-sm flex items-center gap-1"
                >
                  <Home className="w-3.5 h-3.5 sm:w-4 h-4" />
                  <span>الصفحة العامة</span>
                </Link>
              </>
            )}

            {isAuthenticated && (
              <button 
                onClick={logout}
                className="px-2 py-1 text-xs sm:text-sm bg-transparent hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-all duration-200"
              >
                تسجيل الخروج
              </button>
            )}

            <button
              onClick={toggleLanguage}
              className="p-1 sm:p-2 hover:bg-gray-100 rounded-xl transition-colors"
              title={language === 'ar' ? 'English' : 'العربية'}
            >
              <Globe className="w-4 h-4 sm:w-5 h-5 text-gray-600" />
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

