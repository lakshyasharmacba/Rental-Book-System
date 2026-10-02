import Config from '../models/Config.js';

export const trustFactor = (score, completedRentals) => {
  if (score >= 80 && completedRentals >= 5) return 0.70;
  if (score >= 50) return 1.00;
  if (score >= 30) return 1.25;
  return 1.50; // below 30
};

export const durationFactor = (days) => {
  if (days <= 7) return 1.00;
  if (days <= 30) return 1.25;
  return 1.50;
};

export const computeQuote = async (item, user, days) => {
  const cfg = await Config.findOne({ key: 'feePercent' });
  const feePercent = cfg?.value || 10;
  const rent = item.pricePerDay * days;
  const fee = Math.round(rent * feePercent / 100);
  const dur = durationFactor(days);
  const tf = trustFactor(user.trustScore, user.completedRentals);
  const rawDeposit = Math.round(item.baseDeposit * dur * tf);
  const minDeposit = Math.round(item.baseDeposit * 0.5);
  const deposit = Math.max(rawDeposit, minDeposit);
  return { rent, fee, deposit, total: rent + fee + deposit, feePercent, durationFactor: dur, trustFactor: tf };
};

