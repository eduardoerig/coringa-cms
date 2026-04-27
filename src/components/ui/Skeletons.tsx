"use client";

export function CardSkeleton() {
  return (
    <div className="bg-white border border-text-100/50 rounded-[28px] overflow-hidden animate-pulse">
      <div className="h-[240px] bg-surface-100" />
      <div className="p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-3 w-16 bg-surface-100 rounded-full" />
          <div className="w-8 h-8 rounded-full bg-surface-100" />
        </div>
        <div className="h-5 w-3/4 bg-surface-100 rounded-full" />
      </div>
    </div>
  );
}

export function MenuCardSkeleton() {
  return (
    <div className="bg-white border border-text-100/50 rounded-2xl md:rounded-3xl overflow-hidden animate-pulse flex flex-col">
      <div className="h-[120px] md:h-[180px] bg-surface-100" />
      <div className="p-3 md:p-4 space-y-2">
        <div className="h-2.5 w-12 bg-surface-100 rounded-full" />
        <div className="h-4 w-3/4 bg-surface-100 rounded-full" />
        <div className="h-3 w-full bg-surface-100 rounded-full" />
      </div>
    </div>
  );
}
