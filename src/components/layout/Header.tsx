import React, { useState } from 'react';
import { Menu, X, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../common/Button';

export const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();

  const toggleLanguage = () => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-md">
      <div className="container mx-auto mobile-container">
        <div className="flex items-center justify-between h-16 mobile-header">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">{t('appName')}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {/* Non-authenticated users (patients) */}
            {!isAuthenticated && (
              <>
                <Link to="/services" className="text-gray-700 hover:text-primary transition-colors font-medium">
                  {t('services')}
                </Link>
                
                <Link 
                  to="/doctor-welcome" 
                  className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground hover:bg-gray-100 border border-gray-200 rounded-lg font-medium transition-all duration-200"
                >
                  {t('areDoctorQuestion')}
                </Link>
                
                <Link 
                  to="/supplier-welcome" 
                  className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground hover:bg-gray-100 border border-gray-200 rounded-lg font-medium transition-all duration-200"
                >
                  {t('areYouSupplier')}
                </Link>
                
                <Link 
                  to="/login" 
                  className="px-3 py-1.5 text-sm bg-primary text-primary-foreground hover:bg-primary-dark shadow-md rounded-lg font-medium transition-all duration-200 active:scale-95"
                >
                  {t('login')}
                </Link>
              </>
            )}
            
            {/* Authenticated users */}
            {isAuthenticated && (
              <>
                <Link 
                  to={user?.role === 'doctor' ? '/doctor' : '/supplier'} 
                  className="text-gray-700 hover:text-primary transition-colors"
                >
                  {t('overview')}
                </Link>
                <button 
                  onClick={logout}
                  className="px-3 py-1.5 text-sm bg-transparent hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-all duration-200"
                >
                  تسجيل الخروج
                </button>
              </>
            )}

            <button
              onClick={toggleLanguage}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Globe className="w-5 h-5" />
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t animate-fade-in mobile-menu-container">
            <nav className="flex flex-col gap-0">
              {/* Non-authenticated users (patients) */}
              {!isAuthenticated && (
                <>
                  <Link 
                    to="/services" 
                    className="mobile-nav-item hover:bg-gray-100 transition-colors mobile-nav-text rtl-text"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('services')}
                  </Link>
                  
                  <Link 
                    to="/doctor-welcome" 
                    className="mobile-nav-item hover:bg-gray-100 transition-colors mobile-nav-text rtl-text"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('areDoctorQuestion')}
                  </Link>
                  
                  <Link 
                    to="/supplier-welcome" 
                    className="mobile-nav-item hover:bg-gray-100 transition-colors mobile-nav-text rtl-text"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('areYouSupplier')}
                  </Link>
                  
                  <Link 
                    to="/login" 
                    className="mobile-nav-item hover:bg-gray-100 transition-colors mobile-nav-text rtl-text"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('login')}
                  </Link>
                </>
              )}
              
              {/* Authenticated users */}
              {isAuthenticated && (
                <>
                  <Link 
                    to={user?.role === 'doctor' ? '/doctor' : '/supplier'} 
                    className="mobile-nav-item hover:bg-gray-100 transition-colors mobile-nav-text rtl-text"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {t('overview')}
                  </Link>
                  <button 
                    onClick={() => { logout(); setIsMenuOpen(false); }}
                    className="mobile-nav-item text-left text-red-600 hover:bg-red-50 transition-colors mobile-nav-text rtl-text"
                  >
                    تسجيل الخروج
                  </button>
                </>
              )}
              
              <button
                onClick={toggleLanguage}
                className="mobile-nav-item flex items-center gap-2 hover:bg-gray-100 transition-colors text-right mobile-nav-text rtl-text"
              >
                <Globe className="w-5 h-5" />
                <span>{language === 'ar' ? 'English' : 'العربية'}</span>
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
