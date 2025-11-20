import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
  const { t } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className={`text-2xl font-bold ${theme.accent}`}>
              🎁 {t('navbar.title')}
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <LanguageSelector />
            {isAuthenticated ? (
              <>
                <Link
                  to="/groups"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('navbar.myGroups')}
                </Link>
                <span className="text-gray-700 text-sm">{t('navbar.hello', { name: user?.nombre })}</span>
                <button
                  onClick={handleLogout}
                  className={`${theme.primary} text-white px-4 py-2 rounded-md text-sm font-medium`}
                >
                  {t('navbar.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  {t('navbar.login')}
                </Link>
                <Link
                  to="/register"
                  className={`${theme.primary} text-white px-4 py-2 rounded-md text-sm font-medium`}
                >
                  {t('navbar.register')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
