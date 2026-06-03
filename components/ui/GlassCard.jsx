"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/format";

// Executive section card (white, clean). Name kept for compatibility.
export default function GlassCard({
  children,
  className,
  title,
  subtitle,
  icon: Icon,
  action,
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className={cn("card p-5 sm:p-6", className)}
    >
      {(title || action) && (
        <div className="mb-5 flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            {Icon && (
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">
                <Icon size={20} strokeWidth={2.2} />
              </span>
            )}
            <div>
              {title && (
                <h3 className="font-display text-lg font-bold leading-tight text-slate-900">
                  {title}
                </h3>
              )}
              {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
            </div>
          </div>
          {action}
        </div>
      )}
      {children}
    </motion.div>
  );
}
