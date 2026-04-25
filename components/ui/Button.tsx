import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-red disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-brand-red text-white hover:bg-brand-black": variant === "primary",
            "bg-white text-brand-black border border-brand-gray-200 hover:border-brand-black hover:bg-brand-gray-50":
              variant === "secondary",
            "bg-transparent text-brand-black hover:bg-brand-gray-100":
              variant === "ghost",
            "bg-red-600 text-white hover:bg-red-700": variant === "danger",
          },
          {
            "h-8 px-3 text-sm rounded": size === "sm",
            "h-10 px-5 text-sm rounded": size === "md",
            "h-12 px-7 text-base rounded": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
