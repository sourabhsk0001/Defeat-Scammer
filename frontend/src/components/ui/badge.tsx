import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
}

export function Badge({ className = "", variant = "default", ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-cyan-500/20 text-cyan-400 border-cyan-500/40",
    secondary: "bg-slate-800 text-slate-300 border-slate-700",
    destructive: "bg-rose-500/20 text-rose-400 border-rose-500/40",
    outline: "text-slate-300 border-slate-800",
    success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    warning: "bg-amber-500/20 text-amber-300 border-amber-500/40"
  };

  return (
    <div
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${variantStyles[variant]} ${className}`}
      {...props}
    />
  );
}
