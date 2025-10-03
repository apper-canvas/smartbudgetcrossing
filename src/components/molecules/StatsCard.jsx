import React from "react";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  variant = "default",
  trend = null,
  trendLabel = null,
  className 
}) => {
  const formatValue = (val) => {
    if (typeof val === "number") {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(val);
    }
    return val;
  };

  const getTrendColor = () => {
    if (!trend) return "text-gray-500";
    return trend > 0 ? "text-success-600" : "text-error-600";
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend > 0 ? "TrendingUp" : "TrendingDown";
  };

  return (
    <Card variant={variant} className={cn("p-6", className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 font-tabular mb-2">
            {formatValue(value)}
          </p>
          {trend !== null && (
            <div className="flex items-center space-x-1">
              <ApperIcon 
                name={getTrendIcon()} 
                size={16} 
                className={getTrendColor()} 
              />
              <span className={cn("text-sm font-medium", getTrendColor())}>
                {Math.abs(trend)}% {trendLabel || "vs last month"}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center shadow-lg">
              <ApperIcon name={icon} size={24} className="text-white" />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default StatsCard;