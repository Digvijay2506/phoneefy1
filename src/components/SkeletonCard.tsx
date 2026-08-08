interface SkeletonCardProps {
  type?: 'phone' | 'shop' | 'list';
}

export default function SkeletonCard({ type = 'phone' }: SkeletonCardProps) {
  if (type === 'list') {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-3.5 flex gap-3.5">
        <div className="w-[100px] h-[120px] rounded-xl animate-shimmer flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-2 py-1">
          <div className="h-4 w-3/4 rounded animate-shimmer" />
          <div className="h-3 w-1/2 rounded animate-shimmer" />
          <div className="h-5 w-1/3 rounded animate-shimmer" />
          <div className="h-3 w-2/3 rounded animate-shimmer" />
        </div>
      </div>
    );
  }

  if (type === 'shop') {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-4 flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-xl animate-shimmer flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-4 w-2/3 rounded animate-shimmer" />
          <div className="h-3 w-3/4 rounded animate-shimmer" />
          <div className="h-3 w-1/2 rounded animate-shimmer" />
        </div>
        <div className="w-16 h-8 rounded-lg animate-shimmer flex-shrink-0" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="w-full h-[160px] animate-shimmer" />
      <div className="p-3 flex flex-col gap-2">
        <div className="h-4 w-3/4 rounded animate-shimmer" />
        <div className="h-5 w-1/2 rounded animate-shimmer" />
        <div className="h-3 w-2/3 rounded animate-shimmer" />
        <div className="h-3 w-1/2 rounded animate-shimmer" />
      </div>
    </div>
  );
}
