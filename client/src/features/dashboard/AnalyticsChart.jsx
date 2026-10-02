import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatPrice } from '@/lib/utils';

export const AnalyticsChart = ({ data }) => {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0F766E" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0F766E" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#6B7280' }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#6B7280' }}
            tickFormatter={(value) => `₹${value / 1000}k`}
          />
          <CartesianGrid vertical={false} stroke="#E5E7EB" />
          <Tooltip 
            formatter={(value) => [formatPrice(value), 'Earnings']}
            contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
          />
          <Area 
            type="monotone" 
            dataKey="earnings" 
            stroke="#0F766E" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorEarnings)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
