import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import StatsCard from "@/components/molecules/StatsCard";
import TransactionItem from "@/components/molecules/TransactionItem";
import SpendingChart from "@/components/organisms/SpendingChart";
import TransactionModal from "@/components/organisms/TransactionModal";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { transactionService } from "@/services/api/transactionService";
import { budgetService } from "@/services/api/budgetService";
import { goalService } from "@/services/api/goalService";
import { toast } from "react-toastify";

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [transactionsData, budgetsData, goalsData] = await Promise.all([
        transactionService.getAll(),
        budgetService.getAll(),
        goalService.getAll()
      ]);
      
      setTransactions(transactionsData);
      setBudgets(budgetsData);
      setGoals(goalsData);
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await transactionService.delete(id);
        setTransactions(prev => prev.filter(t => t.Id !== id));
        toast.success("Transaction deleted successfully");
      } catch (error) {
        toast.error("Failed to delete transaction");
      }
    }
  };

  const handleEditTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setIsTransactionModalOpen(true);
  };

  const handleTransactionSuccess = () => {
    loadData();
  };

  const calculateStats = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
const monthlyTransactions = transactions.filter(t => {
      const date = new Date(t.date_c || t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const totalIncome = monthlyTransactions
      .filter(t => (t.type_c || t.type) === "income")
      .reduce((sum, t) => sum + (t.amount_c || t.amount), 0);

    const totalExpenses = monthlyTransactions
      .filter(t => (t.type_c || t.type) === "expense")
      .reduce((sum, t) => sum + (t.amount_c || t.amount), 0);

    const totalBudget = budgets.reduce((sum, b) => sum + (b.limit_c || b.limit), 0);
    const budgetUsed = budgets.reduce((sum, b) => sum + (b.spent_c || b.spent), 0);

    return {
      totalIncome,
      totalExpenses,
      netIncome: totalIncome - totalExpenses,
      totalBudget,
      budgetRemaining: totalBudget - budgetUsed
    };
  };

const getChartData = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = transactions.filter(t => {
      const date = new Date(t.date_c || t.date);
      return (t.type_c || t.type) === "expense" && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const categoryTotals = monthlyExpenses.reduce((acc, transaction) => {
      const categoryName = transaction.category_c?.Name || transaction.category;
      acc[categoryName] = (acc[categoryName] || 0) + (transaction.amount_c || transaction.amount);
      return acc;
    }, {});

    return Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount
    }));
  };

const getRecentTransactions = () => {
    return transactions
      .sort((a, b) => new Date(b.date_c || b.date) - new Date(a.date_c || a.date))
      .slice(0, 5);
  };

  const stats = calculateStats();
  const chartData = getChartData();
  const recentTransactions = getRecentTransactions();

  if (loading) return <Loading variant="skeleton" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Overview of your financial health</p>
        </div>
        <Button
          onClick={() => {
            setSelectedTransaction(null);
            setIsTransactionModalOpen(true);
          }}
          variant="primary"
          className="sm:w-auto w-full"
        >
          <ApperIcon name="Plus" size={18} className="mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatsCard
          title="Total Income"
          value={stats.totalIncome}
          icon="TrendingUp"
          variant="success"
          trend={12}
          trendLabel="vs last month"
        />
        <StatsCard
          title="Total Expenses"
          value={stats.totalExpenses}
          icon="TrendingDown"
          variant="error"
          trend={-8}
          trendLabel="vs last month"
        />
        <StatsCard
          title="Net Income"
          value={stats.netIncome}
          icon="DollarSign"
          variant={stats.netIncome >= 0 ? "success" : "error"}
        />
        <StatsCard
          title="Budget Remaining"
          value={stats.budgetRemaining}
          icon="Target"
          variant="primary"
        />
      </motion.div>

      {/* Charts and Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <SpendingChart data={chartData} type="pie" />
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              <p className="text-sm text-gray-500">Your latest financial activity</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = "/transactions"}
            >
              View All
              <ApperIcon name="ArrowRight" size={16} className="ml-1" />
            </Button>
          </div>

          <div className="space-y-3">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((transaction) => (
                <TransactionItem
                  key={transaction.Id}
                  transaction={transaction}
                  onEdit={handleEditTransaction}
                  onDelete={handleDeleteTransaction}
                />
              ))
            ) : (
              <Empty
                title="No transactions yet"
                message="Add your first transaction to get started tracking your finances"
                actionLabel="Add Transaction"
                onAction={() => setIsTransactionModalOpen(true)}
                icon="Receipt"
              />
            )}
          </div>
        </motion.div>
      </div>

      {/* Active Goals Preview */}
      {goals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Active Goals</h3>
              <p className="text-sm text-gray-500">Track your savings progress</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = "/goals"}
            >
              View All
              <ApperIcon name="ArrowRight" size={16} className="ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
{goals.slice(0, 3).map((goal) => {
              const currentAmount = goal.current_amount_c || goal.currentAmount;
              const targetAmount = goal.target_amount_c || goal.targetAmount;
              const goalName = goal.Name || goal.name_c || goal.name;
              const progress = (currentAmount / targetAmount) * 100;
              return (
                <div key={goal.Id} className="p-4 border border-gray-200 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">{goalName}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-success-500 to-success-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>${currentAmount.toLocaleString()}</span>
                      <span>${targetAmount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  );
};

export default Dashboard;