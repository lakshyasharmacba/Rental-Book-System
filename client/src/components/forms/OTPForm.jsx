import React, { useRef, useState, useEffect } from 'react';

export const OTPForm = ({ length = 6, onComplete, isLoading }) => {
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtp = [...otp];
    // Take only the last character if multiple are entered (fallback)
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-advance
    if (value && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }

    if (newOtp.every(v => v !== '')) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text/plain').slice(0, length).replace(/\D/g, '');
    if (!pasteData) return;
    
    const newOtp = [...otp];
    for (let i = 0; i < pasteData.length; i++) {
      newOtp[i] = pasteData[i];
    }
    setOtp(newOtp);
    
    if (pasteData.length === length) {
      onComplete(newOtp.join(''));
      inputRefs.current[length - 1].blur();
    } else {
      inputRefs.current[pasteData.length].focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {otp.map((value, index) => (
        <input
          key={index}
          ref={el => inputRefs.current[index] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          disabled={isLoading}
          className="w-12 h-14 text-center text-xl font-bold rounded-card border border-border focus:border-primary focus:ring-2 focus:ring-primary outline-none disabled:opacity-50"
        />
      ))}
    </div>
  );
};
