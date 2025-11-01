import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';

interface HeaderProps {
  cartItemsCount: number;
  onCartClick: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ cartItemsCount, onCartClick, onMenuClick }) => {
  const { siteSettings, loading } = useSiteSettings();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-inasal-green/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button 
            onClick={onMenuClick}
            className="flex items-center space-x-3 text-inasal-green hover:text-inasal-green-light transition-colors duration-200 group"
          >
            {loading ? (
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
            ) : (
              <img 
                src="/logo.jpg"
                alt={siteSettings?.site_name || "Kamfood Inasal"}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-inasal-green group-hover:ring-inasal-orange transition-all duration-200"
              />
            )}
            <div className="flex flex-col items-start">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-inasal-green">
                {loading ? (
                  <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
                ) : (
                  siteSettings?.site_name || "KAMFOOD INASAL"
                )}
              </h1>
              <p className="text-xs text-inasal-green font-medium hidden sm:block">
                Sarap na Binabalik-balikan
              </p>
            </div>
          </button>

          <div className="flex items-center space-x-2">
            <button 
              onClick={onCartClick}
              className="relative p-2.5 text-inasal-green hover:text-white hover:bg-inasal-green rounded-full transition-all duration-200 border-2 border-inasal-green"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-inasal-red text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-bounce-gentle shadow-lg">
                  {cartItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;