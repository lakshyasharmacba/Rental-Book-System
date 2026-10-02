import { Link } from 'react-router-dom';
import { Calendar, ChevronRight } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { getStatusColor, getStatusLabel, formatDate, formatPrice } from '@/lib/utils';

export const BookingCard = ({ booking, isOwnerView }) => {
  const { id, item, status, startDate, endDate, totalAmount } = booking;
  
  // Action logic
  let nextAction = null;
  if (status === 'CONFIRMED') {
    nextAction = isOwnerView ? 'Prepare for pickup' : 'Show pickup code';
  } else if (status === 'ACTIVE') {
    nextAction = isOwnerView ? 'Wait for return' : 'Return item soon';
  } else if (status === 'RETURNED') {
    nextAction = isOwnerView ? 'Inspect & Complete' : 'Waiting for inspection';
  }

  return (
    <div className="flex flex-col sm:flex-row bg-surface rounded-card border border-border overflow-hidden hover:shadow-md transition-shadow group">
      <div className="w-full sm:w-48 h-32 sm:h-auto bg-gray-200 shrink-0">
        <img src={item.defaultImage} alt={item.title} className="w-full h-full object-cover" />
      </div>
      
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2 gap-4">
            <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
            <Badge className={`shrink-0 ${getStatusColor(status)}`}>
              {getStatusLabel(status)}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-text-muted mb-2">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(startDate)} - {formatDate(endDate)}</span>
          </div>
          
          <div className="text-sm font-medium">
            Total: {formatPrice(totalAmount)}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
          <span className="text-sm text-primary font-medium">
            {nextAction}
          </span>
          <Link 
            to={`/bookings/${id}`}
            className="flex items-center text-sm font-medium text-text-muted group-hover:text-primary transition-colors"
          >
            Manage <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};
