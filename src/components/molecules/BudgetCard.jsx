import React from "react";
import Card from "@/components/atoms/Card";
import ProgressBar from "@/components/atoms/ProgressBar";
import ApperIcon from "@/components/ApperIcon";

const BudgetCard = ({ budget, onEdit }) => {
  const limit = budget.limit_c || budget.limit;
  const spent = budget.spent_c || budget.spent;
  const categoryName = budget.category_c?.Name || budget.category;
  const month = budget.month_c || budget.month;
  const year = budget.year_c || budget.year;
  const title = budget.title_c || budget.title;
  
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;
  const remaining = limit - spent;
  const isOverBudget = percentage > 100;
  const isNearLimit = percentage > 80 && percentage <= 100;

  const getProgressVariant = () => {
    if (isOverBudget) return "error";
    if (isNearLimit) return "warning";
    return "success";
  };

  const getCategoryIcon = (category) => {
    const icons = {
      "Food & Dining": "UtensilsCrossed",
      "Transportation": "Car",
      "Shopping": "ShoppingBag",
      "Entertainment": "Gamepad2",
      "Bills & Utilities": "Receipt",
      "Healthcare": "Heart",
      "Travel": "Plane",
      "Education": "GraduationCap",
      "Gifts": "Gift",
      "Other": "DollarSign"
    };
    return icons[category] || "DollarSign";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isOverBudget 
              ? "bg-gradient-to-r from-error-100 to-error-200" 
              : isNearLimit
                ? "bg-gradient-to-r from-warning-100 to-warning-200"
                : "bg-gradient-to-r from-success-100 to-success-200"
          }`}>
            <ApperIcon 
              name={getCategoryIcon(categoryName)} 
              size={20} 
              className={
                isOverBudget 
                  ? "text-error-600" 
                  : isNearLimit
                    ? "text-warning-600"
                    : "text-success-600"
              }
            />
          </div>
<div>
            <h3 className="font-semibold text-gray-900">{title || categoryName}</h3>
            {title && <p className="text-xs text-gray-600">{categoryName}</p>}
            <p className="text-sm text-gray-500">
              {month} {year}
            </p>
          </div>
        </div>
        <button
          onClick={() => onEdit(budget)}
          className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
        >
          <ApperIcon name="Edit2" size={16} />
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Spent</span>
          <span className="font-medium text-gray-900 font-tabular">
            {formatCurrency(spent)} of {formatCurrency(limit)}
          </span>
        </div>
        
        <ProgressBar
          value={spent}
          max={limit}
          variant={getProgressVariant()}
          size="md"
        />
        
        <div className="flex items-center justify-between text-sm">
          <span className={`font-medium font-tabular ${
            isOverBudget ? "text-error-600" : "text-gray-900"
          }`}>
            {percentage.toFixed(1)}% Used
          </span>
          <span className={`font-medium font-tabular ${
            remaining < 0 ? "text-error-600" : "text-success-600"
          }`}>
            {remaining < 0 ? "Over by " : "Remaining: "}{formatCurrency(remaining)}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default BudgetCard;