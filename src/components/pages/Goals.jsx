import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GoalCard from "@/components/molecules/GoalCard";
import GoalModal from "@/components/organisms/GoalModal";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { goalService } from "@/services/api/goalService";
import { toast } from "react-toastify";
import { differenceInDays } from "date-fns";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await goalService.getAll();
      setGoals(data);
    } catch (err) {
      setError("Failed to load goals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGoal = async (id) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      try {
        await goalService.delete(id);
        setGoals(prev => prev.filter(g => g.Id !== id));
        toast.success("Goal deleted successfully");
      } catch (error) {
        toast.error("Failed to delete goal");
      }
    }
  };

  const handleEditGoal = (goal) => {
    setSelectedGoal(goal);
    setIsModalOpen(true);
  };

  const handleGoalSuccess = () => {
    loadData();
  };

  const getGoalStats = () => {
    const totalGoals = goals.length;
    const completedGoals = goals.filter(goal => 
      goal.currentAmount >= goal.targetAmount
    ).length;
    const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const overdue = goals.filter(goal => 
      differenceInDays(new Date(goal.targetDate), new Date()) < 0 && 
      goal.currentAmount < goal.targetAmount
    ).length;

    return {
      totalGoals,
      completedGoals,
      totalTargetAmount,
      totalCurrentAmount,
      overdue,
      completionRate: totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0,
      progressRate: totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0
    };
  };

  const getSortedGoals = () => {
    return goals.sort((a, b) => {
      // Completed goals last
      const aCompleted = a.currentAmount >= a.targetAmount;
      const bCompleted = b.currentAmount >= b.targetAmount;
      
      if (aCompleted && !bCompleted) return 1;
      if (!aCompleted && bCompleted) return -1;
      
      // Overdue goals first (among incomplete)
      const aDaysLeft = differenceInDays(new Date(a.targetDate), new Date());
      const bDaysLeft = differenceInDays(new Date(b.targetDate), new Date());
      
      if (aDaysLeft < 0 && bDaysLeft >= 0) return -1;
      if (aDaysLeft >= 0 && bDaysLeft < 0) return 1;
      
      // Sort by days remaining
      return aDaysLeft - bDaysLeft;
    });
  };

  const stats = getGoalStats();
  const sortedGoals = getSortedGoals();

  if (loading) return <Loading variant="skeleton" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Savings Goals</h1>
          <p className="text-gray-500">Track your progress towards financial milestones</p>
        </div>
        <Button
          onClick={() => {
            setSelectedGoal(null);
            setIsModalOpen(true);
          }}
          variant="success"
          className="sm:w-auto w-full"
        >
          <ApperIcon name="Plus" size={18} className="mr-2" />
          Create Goal
        </Button>
      </div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-5 gap-4"
      >
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Goals</p>
          <p className="text-2xl font-bold text-gray-900 font-tabular">{stats.totalGoals}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Completed</p>
          <p className="text-2xl font-bold text-success-600 font-tabular">{stats.completedGoals}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Overdue</p>
          <p className="text-2xl font-bold text-error-600 font-tabular">{stats.overdue}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Target</p>
          <p className="text-xl font-bold text-primary-600 font-tabular">
            ${stats.totalTargetAmount.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Saved</p>
          <p className="text-xl font-bold text-success-600 font-tabular">
            ${stats.totalCurrentAmount.toLocaleString()}
          </p>
        </div>
      </motion.div>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-success-50 to-success-100 border border-success-200 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-success-800">Overall Progress</h3>
            <p className="text-success-700">
              {stats.completionRate.toFixed(1)}% of goals completed • {stats.progressRate.toFixed(1)}% of total target saved
            </p>
          </div>
          <div className="w-16 h-16 bg-success-500 rounded-full flex items-center justify-center">
            <ApperIcon name="Trophy" size={24} className="text-white" />
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-success-700">
            <span>Savings Progress</span>
            <span className="font-medium">${stats.totalCurrentAmount.toLocaleString()} of ${stats.totalTargetAmount.toLocaleString()}</span>
          </div>
          <div className="w-full bg-success-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-success-500 to-success-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(stats.progressRate, 100)}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* Goals Grid */}
      <div className="space-y-6">
        {sortedGoals.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1, delay: 0.2 }}
          >
            {sortedGoals.map((goal, index) => (
              <motion.div
                key={goal.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GoalCard
                  goal={goal}
                  onEdit={handleEditGoal}
                  onDelete={handleDeleteGoal}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Empty
            title="No savings goals yet"
            message="Create your first savings goal to start building your financial future"
            actionLabel="Create Goal"
            onAction={() => setIsModalOpen(true)}
            icon="Trophy"
          />
        )}
      </div>

      {/* Goal Modal */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedGoal(null);
        }}
        goal={selectedGoal}
        onSuccess={handleGoalSuccess}
      />
    </div>
  );
};

export default Goals;