import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Card = forwardRef(({ 
  children, 
  variant = "default", 
  className,
  ...props 
}, ref) => {
  const baseStyles = "bg-white rounded-xl shadow-sm border transition-all duration-200";
  
  const variants = {
    default: "border-gray-200 hover:shadow-md",
    success: "border-l-4 border-l-success-500 hover:shadow-md hover:border-l-success-600",
    warning: "border-l-4 border-l-warning-500 hover:shadow-md hover:border-l-warning-600",
    error: "border-l-4 border-l-error-500 hover:shadow-md hover:border-l-error-600",
    primary: "border-l-4 border-l-primary-500 hover:shadow-md hover:border-l-primary-600",
    gradient: "bg-gradient-to-br from-white to-gray-50 border-gray-200 hover:shadow-lg"
  };

  return (
    <div
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;