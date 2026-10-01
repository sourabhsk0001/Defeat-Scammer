import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", ...props }, ref) => {
    const variantStyles = {
      default: "bg-cyan-600 text-white shadow-lg shadow-cyan-600/25 hover:bg-cyan-500",
      destructive: "bg-rose-600 text-white shadow-lg shadow-rose-600/25 hover:bg-rose-500",
      outline: "border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-200",
      secondary: "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700",
      ghost: "hover:bg-slate-800 text-slate-300 hover:text-white",
      link: "text-cyan-400 underline-offset-4 hover:underline"
    };

    const sizeStyles = {
      default: "h-9 px-4 py-2 text-xs font-semibold",
      sm: "h-8 rounded-lg px-3 text-[11px]",
      lg: "h-11 rounded-xl px-6 text-sm",
      icon: "h-9 w-9 p-0 flex items-center justify-center"
    };

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center rounded-xl transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-95 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
