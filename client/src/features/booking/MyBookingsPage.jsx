import { useState } from 'react';
import { useBookings } from '@/hooks/useBookings';
import { BookingCard } from '@/components/cards/BookingCard';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Calendar } from 'lucide-react';

export const MyBookingsPage = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const { data: bookings, isLoading } = useBookings();

  if (isLoading) return <div className="h-[60vh] flex items-center justify-center"><Spinner size="lg" /></div>;

  const tabs = [
    { id: 'upcoming', label: 'Upcoming', statuses: ['CONFIRMED'] },
    { id: 'active', label: 'Active', statuses: ['ACTIVE', 'RETURNED', 'OVERDUE'] },
    { id: 'past', label: 'Past', statuses: ['COMPLETED'] },
    { id: 'disputes', label: 'Disputes', statuses: ['DISPUTED'] },
  ];

  const filteredBookings = (bookings || []).filter(b => 
    tabs.find(t => t.id === activeTab)?.statuses.includes(b.status.toUpperCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-text-main">My Bookings</h1>
      
      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 mb-6 pb-2 border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-chip whitespace-nowrap transition-colors ${
              activeTab === tab.id 
                ? 'bg-text-main text-white' 
                : 'text-text-muted hover:bg-surface-alt'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map(booking => (
            <BookingCard key={booking.id} booking={booking} isOwnerView={false} />
          ))
        ) : (
          <div className="mt-8">
            <EmptyState 
              icon={Calendar}
              title={`No ${activeTab} bookings`}
              description="You don't have any bookings in this category right now."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
