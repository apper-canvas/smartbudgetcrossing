import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import { format } from "date-fns";

const TransactionItem = ({ transaction, onEdit, onDelete }) => {
const amount = transaction.amount_c || transaction.amount;
  const type = transaction.type_c || transaction.type;
  const title = transaction.title_c || transaction.title;
  const description = transaction.description_c || transaction.description;
  const categoryName = transaction.category_c?.Name || transaction.category;
  const date = transaction.date_c || transaction.date;

  const formatAmount = (amount, type) => {
    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(Math.abs(amount));

    return type === "income" ? `+${formatted}` : `-${formatted}`;
  };

  const getAmountColor = (type) => {
    return type === "income" ? "text-success-600" : "text-error-600";
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
      "Other": "DollarSign",
      "Salary": "Briefcase",
      "Freelance": "Laptop",
      "Business": "Building2",
      "Investments": "TrendingUp",
      "Side Hustle": "Zap"
    };
    return icons[category] || "DollarSign";
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            type === "income" 
              ? "bg-gradient-to-r from-success-100 to-success-200" 
              : "bg-gradient-to-r from-error-100 to-error-200"
          }`}>
            <ApperIcon 
              name={getCategoryIcon(categoryName)} 
              size={18} 
              className={type === "income" ? "text-success-600" : "text-error-600"}
            />
          </div>
        </div>
        <div className="flex-1 min-w-0">
<p className="text-sm font-medium text-gray-900 truncate">
            {title || description}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant={type === "income" ? "success" : "default"} size="sm">
              {categoryName}
            </Badge>
            <span className="text-xs text-gray-500">
              {format(new Date(date), "MMM dd, yyyy")}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <span className={`text-lg font-bold font-tabular ${getAmountColor(type)}`}>
          {formatAmount(amount, type)}
        </span>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onEdit(transaction)}
            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
          >
            <ApperIcon name="Edit2" size={16} />
          </button>
          <button
            onClick={() => onDelete(transaction.Id)}
            className="p-1.5 text-gray-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-all duration-200"
          >
            <ApperIcon name="Trash2" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
export default TransactionItem;