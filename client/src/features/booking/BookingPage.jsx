import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useItem } from '@/hooks/useItems';
import { useCreateBooking } from '@/hooks/useBookings';
import { PriceBreakdown } from '@/components/forms/PriceBreakdown';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useToast } from '@/components/ui/Toast';
import { formatPrice, diffDays } from '@/lib/utils';
import { Info } from 'lucide-react';
import api from '@/lib/api';

export const BookingPage = () => {
  const [searchParams] = useSearchParams();
  const itemId = searchParams.get('itemId');
  const startDate = searchParams.get('start');
  const endDate = searchParams.get('end');
  
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { data: item, isLoading } = useItem(itemId);
  const { mutateAsync: createBooking } = useCreateBooking();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [acceptDistance, setAcceptDistance] = useState(false);

  // Load Razorpay script dynamically
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  if (isLoading || !item) return <div className="h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>;

  const days = diffDays(startDate, endDate) || 1;
  const isDistant = item.distanceKm >= 100;

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // 1. Create Order on backend
      const { data: orderData } = await api.post('/payments/create-order', {
        itemId,
        startDate,
        endDate
      });

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: 'INR',
        name: 'RentLens',
        description: `Rental: ${item.title}`,
        order_id: orderData.razorpayOrderId,
        handler: async (response) => {
          try {
            // 3. Verify Payment & Create Booking
            const booking = await createBooking({
              itemId,
              startDate,
              endDate,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature
            });
            navigate(`/booking/${booking.id}/confirmed`);
          } catch (err) {
            addToast({ title: 'Payment Verification Failed', type: 'error' });
          }
        },
        theme: { color: '#0F766E' }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', () => {
        addToast({ title: 'Payment Failed', type: 'error' });
      });
      rzp.open();
    } catch (err) {
      addToast({ title: 'Error initializing payment', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center text-text-main">Review & Pay</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Summary */}
        <div className="bg-surface p-6 rounded-card border border-border shadow-sm h-fit">
          <div className="flex gap-4 mb-6 pb-6 border-b border-border">
            <img src={item.photos?.[0] || item.defaultImage} alt="" className="w-24 h-24 rounded object-cover" />
            <div>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-text-muted mt-1">{item.city}</p>
            </div>
          </div>

          <div className="flex justify-between mb-6 pb-6 border-b border-border">
            <div>
              <p className="text-xs text-text-muted font-bold uppercase mb-1">Check-in</p>
              <p className="font-medium">{new Date(startDate).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-muted font-bold uppercase mb-1">Check-out</p>
              <p className="font-medium">{new Date(endDate).toLocaleDateString()}</p>
            </div>
          </div>

          <PriceBreakdown 
            pricePerDay={item.pricePerDay}
            days={days}
            deposit={item.depositAmount}
          />
        </div>

        {/* Right: Payment Setup */}
        <div className="space-y-6">
          {isDistant && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-card flex gap-3 items-start">
              <Info className="w-5 h-5 text-danger shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-800 font-medium mb-3">
                  Warning: This item is {item.distanceKm}km away. You will need to travel to the owner's location for pickup and return.
                </p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-300 text-danger focus:ring-danger"
                    checked={acceptDistance}
                    onChange={(e) => setAcceptDistance(e.target.checked)}
                  />
                  <span className="text-sm text-red-700 font-medium">I agree to travel for pickup</span>
                </label>
              </div>
            </div>
          )}

          <div className="bg-surface p-6 rounded-card border border-border shadow-sm">
            <h3 className="font-semibold mb-4 text-lg">Payment</h3>
            <p className="text-sm text-text-muted mb-6">
              You will be redirected to Razorpay to complete your secure payment. 
              Your deposit will be held safely and returned after the rental.
            </p>
            <Button 
              className="w-full" 
              size="lg" 
              onClick={handlePayment}
              isLoading={isProcessing}
              disabled={isDistant && !acceptDistance}
            >
              Pay Securely
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
