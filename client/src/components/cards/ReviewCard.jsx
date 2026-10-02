import { Star } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Badge } from '../ui/Badge';

export const ReviewCard = ({ review }) => {
  const { authorName, authorImage, rating, comment, createdAt, tags } = review;
  
  return (
    <div className="p-4 rounded-card border border-border bg-surface">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
            {authorImage ? (
              <img src={authorImage} alt={authorName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted bg-surface-alt font-medium">
                {authorName?.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <div className="font-medium text-text-main">{authorName}</div>
            <div className="text-xs text-text-muted">{formatDate(createdAt)}</div>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-surface-alt px-2 py-1 rounded-chip text-sm font-medium">
          <Star className="w-4 h-4 fill-accent text-accent" />
          <span>{rating}</span>
        </div>
      </div>
      
      <p className="text-text-main text-sm mb-3 whitespace-pre-wrap">{comment}</p>
      
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <Badge key={tag} variant="gray">{tag}</Badge>
          ))}
        </div>
      )}
    </div>
  );
};
