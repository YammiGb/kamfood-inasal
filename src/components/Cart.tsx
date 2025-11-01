import React from 'react';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';
import { CartItem } from '../types';

interface CartProps {
  cartItems: CartItem[];
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  onContinueShopping: () => void;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({
  cartItems,
  updateQuantity,
  removeFromCart,
  clearCart,
  getTotalPrice,
  onContinueShopping,
  onCheckout
}) => {
  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-xl p-4 shadow-inasal mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onContinueShopping}
                className="text-inasal-green hover:text-inasal-green-light transition-colors duration-200"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h1 className="text-3xl font-bold text-inasal-green">Your Cart</h1>
            </div>
            <button
              onClick={clearCart}
              className="text-inasal-red hover:text-red-700 transition-colors duration-200 font-semibold"
            >
              Clear All
            </button>
          </div>
        </div>
        <div className="text-center py-16 bg-white rounded-2xl shadow-inasal">
          <div className="text-8xl mb-4">🍗</div>
          <h2 className="text-3xl font-bold text-inasal-green mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some delicious inasal to get started!</p>
        </div>
      </div>
    );
  }

  return (
      <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl p-4 shadow-inasal mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onContinueShopping}
              className="text-inasal-green hover:text-inasal-green-light transition-colors duration-200"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-3xl font-bold text-inasal-green">Your Cart</h1>
          </div>
          <button
            onClick={clearCart}
            className="text-inasal-red hover:text-red-700 transition-colors duration-200 font-semibold"
          >
            Clear All
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-inasal overflow-hidden mb-8 border-2 border-inasal-green/20">
        {cartItems.map((item, index) => (
          <div key={item.id} className={`p-6 ${index !== cartItems.length - 1 ? 'border-b-2 border-inasal-cream-dark' : ''}`}>
            <div className="flex flex-col space-y-3">
              {/* Item Info */}
              <div>
                <h3 className="text-lg font-bold text-inasal-green mb-1">{item.name}</h3>
                {item.selectedVariation && (
                  <p className="text-sm text-inasal-brown mb-1 font-medium">📏 Size: {item.selectedVariation.name}</p>
                )}
                {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                  <p className="text-sm text-inasal-brown mb-1 font-medium">
                    ➕ Add-ons: {item.selectedAddOns.map(addOn => 
                      addOn.quantity && addOn.quantity > 1 
                        ? `${addOn.name} x${addOn.quantity}`
                        : addOn.name
                    ).join(', ')}
                  </p>
                )}
                <p className="text-sm text-gray-600">₱{item.totalPrice} each</p>
              </div>
              
              {/* Bottom Row: Quantity Controls, Price, and Delete */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 bg-gradient-to-r from-inasal-cream to-inasal-cream-dark rounded-lg p-1 border-2 border-inasal-green">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-2 hover:bg-inasal-green hover:text-white rounded-lg transition-all duration-200"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-bold text-inasal-green min-w-[32px] text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-2 hover:bg-inasal-green hover:text-white rounded-lg transition-all duration-200"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                <p className="text-xl font-bold text-inasal-green">₱{item.totalPrice * item.quantity}</p>
                
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-2 text-inasal-red hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-inasal-green to-inasal-green-dark rounded-xl shadow-inasal-lg p-6 border-2 border-inasal-orange">
        <div className="flex items-center justify-between text-3xl font-bold text-white mb-6">
          <span>Total:</span>
          <span>₱{parseFloat(getTotalPrice() || 0).toFixed(2)}</span>
        </div>
        
        <button
          onClick={onCheckout}
          className="w-full bg-gradient-to-r from-inasal-orange to-inasal-yellow text-white py-4 rounded-xl hover:from-inasal-yellow hover:to-inasal-orange transition-all duration-200 transform hover:scale-[1.02] font-bold text-lg shadow-lg hover:shadow-xl"
        >
          🛒 Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default Cart;