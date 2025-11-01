import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface FloatingCartButtonProps {
  itemCount: number;
  onCartClick: () => void;
}

const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ itemCount, onCartClick }) => {
  if (itemCount === 0) return null;

  return (
    <button
      onClick={onCartClick}
      className="fixed bottom-6 right-6 bg-gradient-to-br from-inasal-green to-inasal-green-dark text-white p-4 rounded-full shadow-inasal-lg hover:shadow-2xl transition-all duration-200 transform hover:scale-110 z-40 md:hidden border-2 border-inasal-orange animate-bounce-gentle"
    >
      <div className="relative">
        <ShoppingCart className="h-7 w-7" />
        <span className="absolute -top-2 -right-2 bg-gradient-to-r from-inasal-orange to-inasal-yellow text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
          {itemCount}
        </span>
      </div>
    </button>
  );
};

export default FloatingCartButton;