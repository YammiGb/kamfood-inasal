import React, { useState } from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { CartItem, PaymentMethod, ServiceType } from '../types';
import { usePaymentMethods } from '../hooks/usePaymentMethods';

interface CheckoutProps {
  cartItems: CartItem[];
  totalPrice: number;
  onBack: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cartItems, totalPrice, onBack }) => {
  const { paymentMethods } = usePaymentMethods();
  const [step, setStep] = useState<'details' | 'payment'>('details');
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('dine-in');
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pickupTime, setPickupTime] = useState('5-10');
  const [customTime, setCustomTime] = useState('');
  // Dine-in specific state
  const [partySize, setPartySize] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('gcash');
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  // Set default payment method when payment methods are loaded
  React.useEffect(() => {
    if (paymentMethods.length > 0 && !paymentMethod) {
      setPaymentMethod(paymentMethods[0].id as PaymentMethod);
    }
  }, [paymentMethods, paymentMethod]);

  const selectedPaymentMethod = paymentMethods.find(method => method.id === paymentMethod);

  const handleProceedToPayment = () => {
    setStep('payment');
  };

  const handlePlaceOrder = () => {
    const timeInfo = serviceType === 'pickup' 
      ? (pickupTime === 'custom' ? customTime : `${pickupTime} minutes`)
      : '';
    
    const dineInInfo = serviceType === 'dine-in' 
      ? `👥 Party Size: ${partySize} person${partySize !== 1 ? 's' : ''}`
      : '';
    
    const orderDetails = `
🛒 Kamfood Inasal ORDER

👤 Customer: ${customerName}
📞 Contact: ${contactNumber}
📍 Service: ${serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}
${serviceType === 'delivery' ? `🏠 Address: ${address}${landmark ? `\n🗺️ Landmark: ${landmark}` : ''}` : ''}
${serviceType === 'pickup' ? `⏰ Pickup Time: ${timeInfo}` : ''}
${serviceType === 'dine-in' ? dineInInfo : ''}


ORDER DETAILS:
${cartItems.map(item => {
  let itemDetails = `• ${item.name}`;
  if (item.selectedVariation) {
    itemDetails += ` (${item.selectedVariation.name})`;
  }
  if (item.selectedAddOns && item.selectedAddOns.length > 0) {
    itemDetails += ` + ${item.selectedAddOns.map(addOn => 
      addOn.quantity && addOn.quantity > 1 
        ? `${addOn.name} x${addOn.quantity}`
        : addOn.name
    ).join(', ')}`;
  }
  itemDetails += ` x${item.quantity} - ₱${item.totalPrice * item.quantity}`;
  return itemDetails;
}).join('\n')}

💰 TOTAL: ₱${totalPrice}
${serviceType === 'delivery' ? `🛵 DELIVERY FEE:` : ''}

Payment: ${paymentMethod === 'cash' ? 'Cash' : (selectedPaymentMethod?.name || paymentMethod)}
${paymentMethod !== 'cash' ? '📸 Payment Screenshot: Please attach your payment receipt screenshot' : '💵 Cash payment upon ' + (serviceType === 'delivery' ? 'delivery' : serviceType === 'pickup' ? 'pickup' : 'arrival')}

${notes ? `📝 Notes: ${notes}` : ''}

Please confirm this order to proceed. Thank you for choosing Kamfood Inasal! 🥟
    `.trim();

    const encodedMessage = encodeURIComponent(orderDetails);
    const messengerUrl = `https://m.me/100092989982548?text=${encodedMessage}`;
    
    window.open(messengerUrl, '_blank');
    
  };

  const isDetailsValid = customerName && contactNumber && 
    (serviceType !== 'delivery' || address) && 
    (serviceType !== 'pickup' || (pickupTime !== 'custom' || customTime)) &&
    (serviceType !== 'dine-in' || partySize > 0);

  if (step === 'details') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8 bg-white rounded-xl p-4 shadow-inasal">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-inasal-green hover:text-inasal-green-light transition-colors duration-200 font-semibold"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Cart</span>
            </button>
            <span className="text-gray-400">|</span>
            <h1 className="text-xl font-bold text-inasal-green">Order Details</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="card-inasal p-6">
            <h2 className="text-2xl font-bold text-inasal-green mb-6 border-b-2 border-inasal-green/20 pb-3">🛒 Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 border-b-2 border-inasal-cream-dark">
                  <div>
                    <h4 className="font-bold text-inasal-green">{item.name}</h4>
                    {item.selectedVariation && (
                      <p className="text-sm text-inasal-brown font-medium">📏 Size: {item.selectedVariation.name}</p>
                    )}
                    {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                      <p className="text-sm text-inasal-brown font-medium">
                        ➕ Add-ons: {item.selectedAddOns.map(addOn => addOn.name).join(', ')}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">₱{item.totalPrice} x {item.quantity}</p>
                  </div>
                  <span className="font-bold text-inasal-green text-lg">₱{item.totalPrice * item.quantity}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t-2 border-inasal-green/30 pt-4 bg-inasal-cream/50 -mx-6 px-6 py-4 mt-6">
              <div className="flex items-center justify-between text-2xl font-bold text-inasal-green">
                <span>Total:</span>
                <span>₱{totalPrice}</span>
              </div>
            </div>
          </div>

          {/* Customer Details Form */}
          <div className="card-inasal p-6">
            <h2 className="text-2xl font-bold text-inasal-green mb-6 border-b-2 border-inasal-green/20 pb-3">👤 Customer Information</h2>
            
            <form className="space-y-6">
              {/* Customer Information */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Full Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-inasal-green/30 rounded-lg focus:ring-2 focus:ring-inasal-green focus:border-inasal-green transition-all duration-200"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">Contact Number *</label>
                <input
                  type="tel"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-inasal-green/30 rounded-lg focus:ring-2 focus:ring-inasal-green focus:border-inasal-green transition-all duration-200"
                  placeholder="09XX XXX XXXX"
                  required
                />
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-sm font-medium text-black mb-3">Service Type *</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'dine-in', label: 'Dine In', icon: '🪑' },
                    { value: 'pickup', label: 'Pickup', icon: '🚶' },
                    { value: 'delivery', label: 'Delivery', icon: '🛵' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setServiceType(option.value as ServiceType)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        serviceType === option.value
                          ? 'border-inasal-green bg-inasal-green text-white shadow-inasal'
                          : 'border-inasal-green/30 bg-white text-gray-700 hover:border-inasal-green'
                      }`}
                    >
                      <div className="text-2xl mb-1">{option.icon}</div>
                      <div className="text-sm font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dine-in Details */}
              {serviceType === 'dine-in' && (
                <div>
                  <label className="block text-sm font-medium text-black mb-2">Party Size *</label>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={() => setPartySize(Math.max(1, partySize - 1))}
                      className="w-10 h-10 rounded-lg border-2 border-inasal-green/30 flex items-center justify-center text-inasal-green hover:border-inasal-green hover:bg-inasal-cream transition-all duration-200"
                    >
                      -
                    </button>
                    <span className="text-2xl font-semibold text-black min-w-[3rem] text-center">{partySize}</span>
                    <button
                      type="button"
                      onClick={() => setPartySize(Math.min(20, partySize + 1))}
                      className="w-10 h-10 rounded-lg border-2 border-inasal-green/30 flex items-center justify-center text-inasal-green hover:border-inasal-green hover:bg-inasal-cream transition-all duration-200"
                    >
                      +
                    </button>
                    <span className="text-sm text-gray-600 ml-2">person{partySize !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              )}

              {/* Pickup Time Selection */}
              {serviceType === 'pickup' && (
                <div>
                  <label className="block text-sm font-medium text-black mb-3">Pickup Time *</label>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: '5-10', label: '5-10 minutes' },
                        { value: '15-20', label: '15-20 minutes' },
                        { value: '25-30', label: '25-30 minutes' },
                        { value: 'custom', label: 'Custom Time' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setPickupTime(option.value)}
                          className={`p-3 rounded-lg border-2 transition-all duration-200 text-sm ${
                            pickupTime === option.value
                              ? 'border-red-600 bg-red-600 text-white'
                              : 'border-red-300 bg-white text-gray-700 hover:border-red-400'
                          }`}
                        >
                          <Clock className="h-4 w-4 mx-auto mb-1" />
                          {option.label}
                        </button>
                      ))}
                    </div>
                    
                    {pickupTime === 'custom' && (
                      <input
                        type="text"
                        value={customTime}
                        onChange={(e) => setCustomTime(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-inasal-green/30 rounded-lg focus:ring-2 focus:ring-inasal-green focus:border-inasal-green transition-all duration-200"
                        placeholder="e.g., 45 minutes, 1 hour, 2:30 PM"
                        required
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Delivery Address */}
              {serviceType === 'delivery' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Delivery Address *</label>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-inasal-green/30 rounded-lg focus:ring-2 focus:ring-inasal-green focus:border-inasal-green transition-all duration-200"
                      placeholder="Enter your complete delivery address"
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Landmark</label>
                    <input
                      type="text"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-inasal-green/30 rounded-lg focus:ring-2 focus:ring-inasal-green focus:border-inasal-green transition-all duration-200"
                      placeholder="e.g., Near McDonald's, Beside 7-Eleven, In front of school"
                    />
                  </div>
                </>
              )}

              {/* Special Notes */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">Special Instructions</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-inasal-green/30 rounded-lg focus:ring-2 focus:ring-inasal-green focus:border-inasal-green transition-all duration-200"
                  placeholder="Any special requests or notes..."
                  rows={3}
                />
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={!isDetailsValid}
                className={`w-full py-4 rounded-xl font-medium text-lg transition-all duration-200 transform ${
                  isDetailsValid
                    ? 'btn-inasal-primary hover:scale-[1.02]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Proceed to Payment
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Payment Step
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <button
          onClick={() => setStep('details')}
          className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors duration-200"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Details</span>
        </button>
        <h1 className="text-3xl font-bold text-inasal-green ml-8">💳 Payment</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Method Selection */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold text-inasal-green mb-6 border-b-2 border-inasal-green/20 pb-3">💰 Choose Payment Method</h2>
          
          <div className="grid grid-cols-1 gap-4 mb-6">
            {paymentMethods.map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3 ${
                  paymentMethod === method.id
                    ? 'border-red-600 bg-red-600 text-white'
                    : 'border-red-300 bg-white text-gray-700 hover:border-red-400'
                }`}
              >
                <span className="text-2xl">💳</span>
                <span className="font-medium">{method.name}</span>
              </button>
            ))}
            {/* Cash Payment Option */}
            <button
              type="button"
              onClick={() => setPaymentMethod('cash')}
              className={`p-4 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3 ${
                paymentMethod === 'cash'
                  ? 'border-red-600 bg-red-600 text-white'
                  : 'border-red-300 bg-white text-gray-700 hover:border-red-400'
              }`}
            >
              <span className="text-2xl">💵</span>
              <span className="font-medium">Cash</span>
            </button>
          </div>

          {/* Payment Details with QR Code */}
          {selectedPaymentMethod && paymentMethod !== 'cash' && (
            <div className="bg-inasal-cream rounded-lg p-6 mb-6 border-2 border-inasal-green/20">
              <h3 className="font-medium text-black mb-4">Payment Details</h3>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{selectedPaymentMethod.name}</p>
                  <p className="font-mono text-black font-medium">{selectedPaymentMethod.account_number}</p>
                  <p className="text-sm text-gray-600 mb-3">Account Name: {selectedPaymentMethod.account_name}</p>
                  <p className="text-xl font-semibold text-black">Amount: ₱{totalPrice}</p>
                </div>
                <div className="flex-shrink-0">
                  <img 
                    src={selectedPaymentMethod.qr_code_url} 
                    alt={`${selectedPaymentMethod.name} QR Code`}
                    className="w-32 h-32 rounded-lg border-2 border-inasal-green shadow-inasal"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop';
                    }}
                  />
                  <p className="text-xs text-gray-500 text-center mt-2">Scan to pay</p>
                </div>
              </div>
            </div>
          )}

          {/* Cash Payment Info */}
          {paymentMethod === 'cash' && (
            <div className="bg-inasal-cream rounded-lg p-6 mb-6 border-2 border-inasal-green/20">
              <h3 className="font-medium text-black mb-4">Cash Payment</h3>
              <p className="text-sm text-gray-700 mb-2">You will pay in cash when you receive your order.</p>
              <p className="text-xl font-semibold text-black">Amount to pay: ₱{totalPrice}</p>
            </div>
          )}

          {/* Payment Instructions */}
          <div className="bg-inasal-orange/10 border-2 border-inasal-orange rounded-lg p-4">
            {paymentMethod === 'cash' ? (
              <>
                <h4 className="font-medium text-black mb-2">💵 Cash Payment</h4>
                <p className="text-sm text-gray-700">
                  Please prepare the exact amount when you {serviceType === 'delivery' ? 'receive your delivery' : serviceType === 'pickup' ? 'pick up your order' : 'arrive for dine-in'}.
                </p>
              </>
            ) : (
              <>
                <h4 className="font-medium text-black mb-2">📸 Payment Proof Required</h4>
                <p className="text-sm text-gray-700">
                  After making your payment, please take a screenshot of your payment receipt and attach it when you send your order via Messenger. This helps us verify and process your order quickly.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-2xl font-bold text-inasal-green mb-6 border-b-2 border-inasal-green/20 pb-3">📋 Final Order Summary</h2>
          
          <div className="space-y-4 mb-6">
            <div className="bg-inasal-cream rounded-lg p-4 border-2 border-inasal-green/20">
              <h4 className="font-medium text-black mb-2">Customer Details</h4>
              <p className="text-sm text-gray-600">Name: {customerName}</p>
              <p className="text-sm text-gray-600">Contact: {contactNumber}</p>
              <p className="text-sm text-gray-600">Service: {serviceType.charAt(0).toUpperCase() + serviceType.slice(1)}</p>
              {serviceType === 'delivery' && (
                <>
                  <p className="text-sm text-gray-600">Address: {address}</p>
                  {landmark && <p className="text-sm text-gray-600">Landmark: {landmark}</p>}
                </>
              )}
              {serviceType === 'pickup' && (
                <p className="text-sm text-gray-600">
                  Pickup Time: {pickupTime === 'custom' ? customTime : `${pickupTime} minutes`}
                </p>
              )}
              {serviceType === 'dine-in' && (
                <p className="text-sm text-gray-600">
                  Party Size: {partySize} person{partySize !== 1 ? 's' : ''}
                </p>
              )}
            </div>

              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b-2 border-inasal-cream-dark">
                <div>
                  <h4 className="font-medium text-black">{item.name}</h4>
                  {item.selectedVariation && (
                    <p className="text-sm text-gray-600">Size: {item.selectedVariation.name}</p>
                  )}
                  {item.selectedAddOns && item.selectedAddOns.length > 0 && (
                    <p className="text-sm text-gray-600">
                      Add-ons: {item.selectedAddOns.map(addOn => 
                        addOn.quantity && addOn.quantity > 1 
                          ? `${addOn.name} x${addOn.quantity}`
                          : addOn.name
                      ).join(', ')}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">₱{item.totalPrice} x {item.quantity}</p>
                </div>
                <span className="font-semibold text-black">₱{item.totalPrice * item.quantity}</span>
              </div>
            ))}
          </div>
          
          <div className="border-t-2 border-inasal-green/30 pt-4 mb-6 bg-inasal-cream/50 -mx-6 px-6 py-4">
            <div className="flex items-center justify-between text-2xl font-bold text-inasal-green">
              <span>Total:</span>
              <span>₱{totalPrice}</span>
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="w-full btn-inasal-primary py-4 text-lg transform hover:scale-[1.02]"
          >
            Place Order via Messenger
          </button>
          
          <p className="text-xs text-gray-500 text-center mt-3">
            You'll be redirected to Facebook Messenger to confirm your order. Don't forget to attach your payment screenshot!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;