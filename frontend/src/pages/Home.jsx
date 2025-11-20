import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-red-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            🎁 {t('home.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
            {t('home.subtitle')}
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center mb-12 max-w-4xl mx-auto">
            <div className="flex-1 bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-bold text-blue-900 mb-1">🎁 {t('home.anonymousWishlist.title')}</h3>
              <p className="text-sm text-gray-700">
                {t('home.anonymousWishlist.description')}
              </p>
            </div>
            <div className="flex-1 bg-purple-50 border-2 border-purple-200 rounded-lg p-4">
              <h3 className="text-lg font-bold text-purple-900 mb-1">🎭 {t('home.secretSanta.title')}</h3>
              <p className="text-sm text-gray-700">
                {t('home.secretSanta.description')}
              </p>
            </div>
          </div>

          <div className="flex gap-4 justify-center mb-20">
            {isAuthenticated ? (
              <Link
                to="/groups"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-lg font-medium"
              >
                {t('home.viewGroups')}
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg text-lg font-medium"
                >
                  {t('home.startNow')}
                </Link>
                <Link
                  to="/login"
                  className="bg-white hover:bg-gray-50 text-purple-600 border-2 border-purple-600 px-8 py-3 rounded-lg text-lg font-medium"
                >
                  {t('navbar.login')}
                </Link>
              </>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-4xl mb-4">🎲</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('home.features.gameModes.title')}
              </h3>
              <p className="text-gray-600">
                {t('home.features.gameModes.description')}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-4xl mb-4">🎨</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('home.features.customThemes.title')}
              </h3>
              <p className="text-gray-600">
                {t('home.features.customThemes.description')}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="text-4xl mb-4">🔔</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('home.features.notifications.title')}
              </h3>
              <p className="text-gray-600">
                {t('home.features.notifications.description')}
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="mt-20 max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">{t('home.howItWorks.title')}</h2>
            <div className="space-y-6 text-left">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{t('home.howItWorks.step1.title')}</h4>
                  <p className="text-gray-600">
                    {t('home.howItWorks.step1.description')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{t('home.howItWorks.step2.title')}</h4>
                  <p className="text-gray-600">
                    {t('home.howItWorks.step2.description')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{t('home.howItWorks.step3.title')}</h4>
                  <p className="text-gray-600">
                    {t('home.howItWorks.step3.description')}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">{t('home.howItWorks.step4.title')}</h4>
                  <p className="text-gray-600">
                    {t('home.howItWorks.step4.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600 space-y-2">
            <div className="flex justify-center gap-6 text-sm">
              <Link to="/terms-of-service" className="hover:text-purple-600">
                {t('home.footer.termsOfService')}
              </Link>
              <span>•</span>
              <Link to="/privacy-policy" className="hover:text-purple-600">
                {t('home.footer.privacyPolicy')}
              </Link>
            </div>
            <p className="text-sm">
              {t('home.footer.copyright', { year: new Date().getFullYear() })}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
