export default function DashboardSkeleton() {
  const Box = ({ className }) => (
    <div className={`animate-pulse rounded-2xl bg-slate-200/70 ${className}`} />
  );
  return (
    <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6">
      <Box className="mb-6 h-20 w-full" />
      <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Box key={i} className="h-32" />
        ))}
      </div>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Box key={i} className="h-32" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Box className="h-80 lg:col-span-2" />
        <Box className="h-80" />
      </div>
    </div>
  );
}
