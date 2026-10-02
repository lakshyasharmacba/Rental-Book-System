import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Select } from '@/components/ui/Input'; // Assuming Input supports select or we use raw select

export const CitySelect = ({ value, onChange, className = '' }) => {
  const { data: cities = [], isLoading } = useQuery({
    queryKey: ['cities'],
    queryFn: async () => {
      const { data } = await api.get('/items/cities');
      return data;
    },
    staleTime: Infinity, // Cities rarely change
  });

  return (
    <div className="w-full flex flex-col gap-1">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input-field bg-surface ${className}`}
        disabled={isLoading}
      >
        <option value="">All Cities</option>
        {cities.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
    </div>
  );
};
