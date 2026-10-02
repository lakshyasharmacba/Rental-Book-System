import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { Button } from '../ui/Button';

export const PriceBreakdown = ({ 
  pricePerDay, 
  days, 
  feePercent = 10, 
  deposit = 0, 
  distanceKm = 0,
  deliveryFeePerKm = 0
}) => {
  const rentTotal = pricePerDay * days;
  const serviceFee = Math.round(rentTotal * (feePercent / 100));
  const deliveryFee = distanceKm * deliveryFeePerKm * 100; // Assuming deliveryFeePerKm is in rupees, convert to paise
  const total = rentTotal + serviceFee + deposit + deliveryFee;

  return (
    <div className="flex flex-col gap-3 py-4 border-t border-b border-border text-sm">
      <div className="flex justify-between text-text-main">
        <span>{formatPrice(pricePerDay)} × {days} days</span>
        <span>{formatPrice(rentTotal)}</span>
      </div>
      
      <div className="flex justify-between text-text-main">
        <span>Service fee ({feePercent}%)</span>
        <span>{formatPrice(serviceFee)}</span>
      </div>

      {deliveryFee > 0 && (
        <div className="flex justify-between text-text-main">
          <span>Delivery fee ({distanceKm} km)</span>
          <span>{formatPrice(deliveryFee)}</span>
        </div>
      )}

      {deposit > 0 && (
        <div className="flex justify-between text-text-muted">
          <span>Security deposit (Refundable)</span>
          <span>{formatPrice(deposit)}</span>
        </div>
      )}

      <div className="flex justify-between font-bold text-base mt-2 pt-2 border-t border-border">
        <span>Total</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  );
};
