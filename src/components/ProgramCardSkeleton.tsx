export default function ProgramCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded p-4 min-h-[200px]">
      <div className="skeleton h-6 w-3/4 rounded mb-3"></div>
      <div className="skeleton h-4 w-full rounded mb-2"></div>
      <div className="skeleton h-4 w-5/6 rounded mb-4"></div>
      <div className="flex gap-2 mb-3">
        <div className="skeleton h-6 w-16 rounded-full"></div>
        <div className="skeleton h-6 w-16 rounded-full"></div>
      </div>
      <div className="skeleton h-4 w-1/2 rounded"></div>
    </div>
  );
}
