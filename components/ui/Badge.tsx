import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "green" | "yellow" | "gray" | "red" | "black";
  className?: string;
}

export function Badge({ children, variant = "gray", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-sm",
        {
          "bg-green-50 text-green-700": variant === "green",
          "bg-yellow-50 text-yellow-700": variant === "yellow",
          "bg-brand-gray-100 text-brand-gray-600": variant === "gray",
          "bg-brand-red/10 text-brand-red": variant === "red",
          "bg-brand-black text-white": variant === "black",
        },
        className
      )}
    >
      {variant === "green" && (
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
      )}
      {variant === "yellow" && (
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 inline-block" />
      )}
      {children}
    </span>
  );
}
