import { Button } from './Button';

export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-surface rounded-card border border-border">
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-surface-alt flex items-center justify-center mb-4 text-text-muted">
          <Icon className="w-8 h-8" />
        </div>
      )}
      <h3 className="text-lg font-bold text-text-main mb-2">{title}</h3>
      {description && (
        <p className="text-text-muted max-w-sm mb-6">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
