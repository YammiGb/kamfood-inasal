import React, { useState } from 'react';
import { Plus, Minus, X, ShoppingCart } from 'lucide-react';
import { MenuItem, Variation, AddOn } from '../types';

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity?: number, variation?: Variation, addOns?: AddOn[]) => void;
  quantity: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ 
  item, 
  onAddToCart, 
  quantity, 
  onUpdateQuantity 
}) => {
  const [showCustomization, setShowCustomization] = useState(false);
  const [selectedVariation, setSelectedVariation] = useState<Variation | undefined>(
    item.variations?.[0]
  );
  const [selectedAddOns, setSelectedAddOns] = useState<(AddOn & { quantity: number })[]>([]);

  const calculatePrice = () => {
    // Use effective price (discounted or regular) as base
    let price = item.effectivePrice || item.basePrice;
    if (selectedVariation) {
      price = (item.effectivePrice || item.basePrice) + selectedVariation.price;
    }
    selectedAddOns.forEach(addOn => {
      price += addOn.price * addOn.quantity;
    });
    return price;
  };

  const handleAddToCart = () => {
    if (item.variations?.length || item.addOns?.length) {
      setShowCustomization(true);
    } else {
      onAddToCart(item, 1);
    }
  };

  const handleCustomizedAddToCart = () => {
    // Convert selectedAddOns back to regular AddOn array for cart
    const addOnsForCart: AddOn[] = selectedAddOns.flatMap(addOn => 
      Array(addOn.quantity).fill({ ...addOn, quantity: undefined })
    );
    onAddToCart(item, 1, selectedVariation, addOnsForCart);
    setShowCustomization(false);
    setSelectedAddOns([]);
  };

  const handleIncrement = () => {
    onUpdateQuantity(item.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      onUpdateQuantity(item.id, quantity - 1);
    }
  };

  const updateAddOnQuantity = (addOn: AddOn, quantity: number) => {
    setSelectedAddOns(prev => {
      const existingIndex = prev.findIndex(a => a.id === addOn.id);
      
      if (quantity === 0) {
        // Remove add-on if quantity is 0
        return prev.filter(a => a.id !== addOn.id);
      }
      
      if (existingIndex >= 0) {
        // Update existing add-on quantity
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], quantity };
        return updated;
      } else {
        // Add new add-on with quantity
        return [...prev, { ...addOn, quantity }];
      }
    });
  };

  const groupedAddOns = item.addOns?.reduce((groups, addOn) => {
    const category = addOn.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(addOn);
    return groups;
  }, {} as Record<string, AddOn[]>);

  return (
    <>
      <div className={`card-inasal group animate-scale-in relative overflow-hidden ${!item.available ? 'opacity-60' : ''}`}>
        {/* Image Container with Badges */}
        <div className="relative h-52 bg-gradient-to-br from-inasal-cream to-inasal-cream-dark">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <div className={`absolute inset-0 flex items-center justify-center ${item.image ? 'hidden' : ''}`}>
            <div className="text-7xl opacity-20">🍗</div>
          </div>
          
          {/* Green overlay on hover */}
          <div className="absolute inset-0 bg-inasal-green/0 group-hover:bg-inasal-green/10 transition-all duration-300" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {item.popular && (
              <div className="bg-gradient-to-r from-inasal-orange to-inasal-yellow text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
                ⭐ POPULAR
              </div>
            )}
            {item.isOnDiscount && item.discountPrice && (
              <div className="bg-gradient-to-r from-inasal-red to-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg animate-pulse-slow">
                🔥 SALE
              </div>
            )}
          </div>
          
          {!item.available && (
            <div className="absolute top-3 right-3 bg-gray-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg">
              SOLD OUT
            </div>
          )}
          
          {/* Discount Percentage Badge */}
          {item.isOnDiscount && item.discountPrice && (
            <div className="absolute bottom-3 right-3 bg-inasal-red text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg">
              {Math.round(((item.basePrice - item.discountPrice) / item.basePrice) * 100)}% OFF
            </div>
          )}
        </div>
        
        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <h4 className="text-lg font-semibold text-gray-900 leading-tight flex-1 pr-2">{item.name}</h4>
            {item.variations && item.variations.length > 0 && (
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
                {item.variations.length} sizes
              </div>
            )}
          </div>
          
          <p className={`text-sm mb-4 leading-relaxed ${!item.available ? 'text-gray-400' : 'text-gray-600'}`}>
            {!item.available ? 'Currently Unavailable' : item.description}
          </p>
          
          {/* Pricing Section */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              {item.isOnDiscount && item.discountPrice ? (
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-inasal-red">
                      ₱{item.discountPrice.toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      ₱{item.basePrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-inasal-orange font-semibold">
                    Save ₱{(item.basePrice - item.discountPrice).toFixed(2)}!
                  </div>
                </div>
              ) : (
                <div className="text-2xl font-bold text-inasal-green">
                  ₱{item.basePrice.toFixed(2)}
                </div>
              )}
              
              {item.variations && item.variations.length > 0 && (
                <div className="text-xs text-gray-500 mt-1">
                  Starting price
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex-shrink-0">
              {!item.available ? (
                <button
                  disabled
                  className="bg-gray-200 text-gray-500 px-4 py-2.5 rounded-lg cursor-not-allowed font-medium text-sm"
                >
                  Sold Out
                </button>
              ) : quantity === 0 ? (
                <button
                  onClick={handleAddToCart}
                  className="btn-inasal-primary text-sm"
                >
                  {item.variations?.length || item.addOns?.length ? 'Customize' : 'Add'}
                </button>
              ) : (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-inasal-cream to-inasal-cream-dark rounded-lg p-1 border-2 border-inasal-green">
                  <button
                    onClick={handleDecrement}
                    className="p-2 hover:bg-inasal-green hover:text-white rounded-lg transition-all duration-200"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="font-bold text-inasal-green min-w-[28px] text-center text-sm">{quantity}</span>
                  <button
                    onClick={handleIncrement}
                    className="p-2 hover:bg-inasal-green hover:text-white rounded-lg transition-all duration-200"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Add-ons indicator */}
          {item.addOns && item.addOns.length > 0 && (
            <div className="flex items-center space-x-1 text-xs text-inasal-green bg-inasal-cream px-2 py-1 rounded-lg font-medium">
              <span>+</span>
              <span>{item.addOns.length} add-on{item.addOns.length > 1 ? 's' : ''} available</span>
            </div>
          )}
        </div>
      </div>

      {/* Customization Modal */}
      {showCustomization && (
        <div className="fixed inset-0 bg-inasal-green/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-inasal-green">
            <div className="sticky top-0 bg-gradient-to-r from-inasal-green to-inasal-green-light border-b-2 border-inasal-orange p-6 flex items-center justify-between rounded-t-2xl">
              <div>
                <h3 className="text-xl font-bold text-white">Customize {item.name}</h3>
                <p className="text-sm text-inasal-cream mt-1">🍗 Choose your preferences</p>
              </div>
              <button
                onClick={() => setShowCustomization(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
              >
                <X className="h-5 w-5 text-white" />
              </button>
            </div>

            <div className="p-6">
              {/* Size Variations */}
              {item.variations && item.variations.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-inasal-green mb-4 flex items-center space-x-2">
                    <span>📏 Choose Size</span>
                  </h4>
                  <div className="space-y-3">
                    {item.variations.map((variation) => (
                      <label
                        key={variation.id}
                        className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedVariation?.id === variation.id
                            ? 'border-inasal-green bg-inasal-cream shadow-inasal'
                            : 'border-gray-200 hover:border-inasal-green/50 hover:bg-inasal-cream/30'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="radio"
                            name="variation"
                            checked={selectedVariation?.id === variation.id}
                            onChange={() => setSelectedVariation(variation)}
                            className="text-inasal-green focus:ring-inasal-green"
                          />
                          <span className="font-semibold text-gray-900">{variation.name}</span>
                        </div>
                        <span className="text-inasal-green font-bold">
                          ₱{((item.effectivePrice || item.basePrice) + variation.price).toFixed(2)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-ons */}
              {groupedAddOns && Object.keys(groupedAddOns).length > 0 && (
                <div className="mb-6">
                  <h4 className="font-bold text-inasal-green mb-4 flex items-center space-x-2">
                    <span>➕ Add-ons & Extras</span>
                  </h4>
                  {Object.entries(groupedAddOns).map(([category, addOns]) => (
                    <div key={category} className="mb-4">
                      <h5 className="text-sm font-semibold text-inasal-brown mb-3 capitalize">
                        {category.replace('-', ' ')}
                      </h5>
                      <div className="space-y-3">
                        {addOns.map((addOn) => (
                          <div
                            key={addOn.id}
                            className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-inasal-green/50 hover:bg-inasal-cream/30 transition-all duration-200"
                          >
                            <div className="flex-1">
                              <span className="font-semibold text-gray-900">{addOn.name}</span>
                              <div className="text-sm text-inasal-green font-medium">
                                {addOn.price > 0 ? `₱${addOn.price.toFixed(2)} each` : '🎉 Free'}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              {selectedAddOns.find(a => a.id === addOn.id) ? (
                                <div className="flex items-center space-x-2 bg-inasal-cream rounded-lg p-1 border-2 border-inasal-green">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const current = selectedAddOns.find(a => a.id === addOn.id);
                                      updateAddOnQuantity(addOn, (current?.quantity || 1) - 1);
                                    }}
                                    className="p-1.5 hover:bg-inasal-green hover:text-white rounded-lg transition-all duration-200"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span className="font-bold text-inasal-green min-w-[24px] text-center text-sm">
                                    {selectedAddOns.find(a => a.id === addOn.id)?.quantity || 0}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const current = selectedAddOns.find(a => a.id === addOn.id);
                                      updateAddOnQuantity(addOn, (current?.quantity || 0) + 1);
                                    }}
                                    className="p-1.5 hover:bg-inasal-green hover:text-white rounded-lg transition-all duration-200"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => updateAddOnQuantity(addOn, 1)}
                                  className="btn-inasal-secondary text-xs"
                                >
                                  <Plus className="h-3 w-3 inline mr-1" />
                                  Add
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Price Summary */}
              <div className="border-t-2 border-inasal-green/20 pt-4 mb-6 bg-inasal-cream/50 -mx-6 px-6 py-4">
                <div className="flex items-center justify-between text-2xl font-bold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-inasal-green">₱{calculatePrice().toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCustomizedAddToCart}
                className="w-full btn-inasal-primary py-4 text-base flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Add to Cart - ₱{calculatePrice().toFixed(2)}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MenuItemCard;