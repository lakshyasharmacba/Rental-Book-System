export const SkeletonCard = () => {
  return (
    <div className="flex flex-col bg-surface rounded-card overflow-hidden border border-border shadow-sm animate-pulse">
      <div className="aspect-[4/3] w-full bg-gray-200"></div>
      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-start gap-2">
          <div className="h-5 bg-gray-200 rounded w-2/3"></div>
          <div className="h-5 bg-gray-200 rounded w-12"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="flex items-end justify-between mt-2 pt-2 border-t border-border">
          <div className="h-6 bg-gray-200 rounded w-20"></div>
          <div className="h-5 bg-gray-200 rounded-chip w-16"></div>
        </div>
      </div>
    </div>
  );
};
