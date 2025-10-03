import React from "react";
import Card from "@/components/atoms/Card";
import ProgressBar from "@/components/atoms/ProgressBar";
import Badge from "@/components/atoms/Badge";
import ApperIcon from "@/components/ApperIcon";
import { format, differenceInDays } from "date-fns";

const GoalCard = ({ goal, onEdit, onDelete }) => {
const name = goal.Name || goal.name_c || goal.name;
  const currentAmount = goal.current_amount_c || goal.currentAmount;
  const targetAmount = goal.target_amount_c || goal.targetAmount;
  const targetDate = goal.target_date_c || goal.targetDate;
  
  const progress = (currentAmount / targetAmount) * 100;
  const daysRemaining = differenceInDays(new Date(targetDate), new Date());
  const isOverdue = daysRemaining < 0;
  const isCompleted = progress >= 100;

  const getStatusBadge = () => {
    if (isCompleted) return <Badge variant="success" size="sm">Completed</Badge>;
    if (isOverdue) return <Badge variant="error" size="sm">Overdue</Badge>;
    if (daysRemaining <= 30) return <Badge variant="warning" size="sm">Due Soon</Badge>;
    return <Badge variant="primary" size="sm">On Track</Badge>;
  };

  const getProgressVariant = () => {
    if (isCompleted) return "success";
    if (isOverdue) return "error";
    if (daysRemaining <= 30) return "warning";
    return "primary";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{name}</h3>
          <div className="flex items-center space-x-2">
            {getStatusBadge()}
            <span className="text-sm text-gray-500">
              Due {format(new Date(targetDate), "MMM dd, yyyy")}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-1 ml-4">
          <button
            onClick={() => onEdit(goal)}
            className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
          >
            <ApperIcon name="Edit2" size={16} />
          </button>
          <button
            onClick={() => onDelete(goal.Id)}
            className="p-1.5 text-gray-400 hover:text-error-600 hover:bg-error-50 rounded-lg transition-all duration-200"
          >
            <ApperIcon name="Trash2" size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-900">
            {formatCurrency(currentAmount)} of {formatCurrency(targetAmount)}
          </span>
        </div>
        
        <ProgressBar
          value={currentAmount}
          max={targetAmount}
          variant={getProgressVariant()}
          size="lg"
        />
        
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-900 font-tabular">
            {progress.toFixed(1)}% Complete
          </span>
          <span className={`font-medium ${isOverdue ? 'text-error-600' : 'text-gray-600'}`}>
            {isOverdue 
              ? `${Math.abs(daysRemaining)} days overdue`
              : `${daysRemaining} days remaining`
            }
          </span>
        </div>
      </div>
    </Card>
  );
};

export default GoalCard;