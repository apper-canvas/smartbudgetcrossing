import React from "react";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Empty = ({ 
  title = "No data found",
  message = "Get started by adding your first item",
  actionLabel = "Get Started",
  onAction,
  icon = "FileText",
  className 
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 text-center", className)}>
      <div className="w-20 h-20 bg-gradient-to-r from-primary-100 to-primary-200 rounded-full flex items-center justify-center mb-6">
        <ApperIcon name={icon} size={36} className="text-primary-600" />
      </div>
      
      <div className="space-y-3 mb-6 max-w-md">
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        <p className="text-gray-600">{message}</p>
      </div>

      {onAction && (
        <Button 
          onClick={onAction} 
          variant="primary"
          className="min-w-[140px]"
        >
          <ApperIcon name="Plus" size={16} className="mr-2" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default Empty;