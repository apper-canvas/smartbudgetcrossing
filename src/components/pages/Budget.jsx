import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { budgetService } from "@/services/api/budgetService";
import { transactionService } from "@/services/api/transactionService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import BudgetModal from "@/components/organisms/BudgetModal";
import BudgetCard from "@/components/molecules/BudgetCard";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentMonth = months[new Date().getMonth()];

  useEffect(() => {
    setSelectedMonth(currentMonth);
  }, [currentMonth]);

  useEffect(() => {
if (selectedMonth && selectedYear) {
      loadData();
    }
  }, [selectedMonth, selectedYear]);

const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [budgetsData, transactionsData] = await Promise.all([
        budgetService.getAll(),
        transactionService.getAll()
      ]);

      // Filter budgets by selected month/year
      const filteredBudgets = budgetsData.filter(budget => 
        (budget.month_c || budget.month) === selectedMonth && 
        (budget.year_c || budget.year) === selectedYear
      );

// Calculate spent amounts from transactions
      const updatedBudgets = await Promise.all(
        filteredBudgets.map(async (budget) => {
          const categoryName = budget.category_c?.Name || budget.category;
          const spent = transactionsData
            .filter(transaction => {
              const transactionDate = new Date(transaction.date_c || transaction.date);
              const transactionMonth = months[transactionDate.getMonth()];
              const transactionYear = transactionDate.getFullYear();
              const transactionCategory = transaction.category_c?.Name || transaction.category;
              return (
                transactionCategory === categoryName &&
                transactionMonth === selectedMonth &&
                transactionYear === selectedYear &&
                (transaction.type_c || transaction.type) === "expense"
              );
            })
            .reduce((sum, t) => sum + (t.amount_c || t.amount), 0);

          const updatedBudget = { 
            ...budget, 
            spent_c: spent,
            spent: spent
          };
          
          await budgetService.update(budget.Id, updatedBudget);
          return updatedBudget;
        })
      );

      setBudgets(updatedBudgets);
    } catch (err) {
      setError("Failed to load budgets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditBudget = (budget) => {
    setSelectedBudget(budget);
    setIsModalOpen(true);
  };

  const handleBudgetSuccess = () => {
    loadData();
  };

const getBudgetSummary = () => {
    const totalBudget = budgets.reduce((sum, budget) => sum + (budget.limit_c || budget.limit), 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + (budget.spent_c || budget.spent), 0);
    const totalRemaining = totalBudget - totalSpent;
    const budgetsOverLimit = budgets.filter(budget => 
      (budget.spent_c || budget.spent) > (budget.limit_c || budget.limit)
    ).length;
    return {
      totalBudget,
      totalSpent,
      totalRemaining,
      budgetsOverLimit,
      utilizationRate: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
    };
  };

  const getMonthOptions = () => {
    return months.map(month => ({ value: month, label: month }));
  };

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => {
      const year = currentYear - 2 + i;
      return { value: year, label: year.toString() };
    });
  };

  const summary = getBudgetSummary();

  if (loading) return <Loading variant="skeleton" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget</h1>
          <p className="text-gray-500">Monitor your spending limits and stay on track</p>
        </div>
        <Button
          onClick={() => {
            setSelectedBudget(null);
            setIsModalOpen(true);
          }}
          variant="primary"
          className="sm:w-auto w-full"
        >
          <ApperIcon name="Plus" size={18} className="mr-2" />
          Create Budget
        </Button>
      </div>

      {/* Period Selector and Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Period Selector */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Period</h3>
          <div className="space-y-4">
            <Select
              label="Month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              options={getMonthOptions()}
            />
            <Select
              label="Year"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              options={getYearOptions()}
            />
          </div>
        </motion.div>

        {/* Budget Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Total Budget</p>
            <p className="text-xl font-bold text-primary-600 font-tabular">
              ${summary.totalBudget.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Total Spent</p>
            <p className="text-xl font-bold text-gray-900 font-tabular">
              ${summary.totalSpent.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Remaining</p>
            <p className={`text-xl font-bold font-tabular ${
              summary.totalRemaining >= 0 ? "text-success-600" : "text-error-600"
            }`}>
              ${Math.abs(summary.totalRemaining).toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Utilization</p>
            <p className={`text-xl font-bold font-tabular ${
              summary.utilizationRate > 100 ? "text-error-600" : 
              summary.utilizationRate > 80 ? "text-warning-600" : "text-success-600"
            }`}>
              {summary.utilizationRate.toFixed(1)}%
            </p>
          </div>
        </motion.div>
      </div>

      {/* Over Budget Alert */}
      {summary.budgetsOverLimit > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-error-50 to-error-100 border border-error-200 rounded-xl p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-error-500 rounded-full flex items-center justify-center">
              <ApperIcon name="AlertTriangle" size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-error-800">Budget Alert</h3>
              <p className="text-error-700">
                You have {summary.budgetsOverLimit} budget{summary.budgetsOverLimit > 1 ? "s" : ""} over the limit for {selectedMonth} {selectedYear}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Budget Cards */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedMonth} {selectedYear} Budgets
          </h3>
          <p className="text-sm text-gray-500">
            {budgets.length} budget{budgets.length !== 1 ? "s" : ""} created
          </p>
        </div>

        {budgets.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {budgets.map((budget, index) => (
              <motion.div
                key={budget.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <BudgetCard
                  budget={budget}
                  onEdit={handleEditBudget}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <Empty
            title="No budgets for this period"
            message={`Create your first budget for ${selectedMonth} ${selectedYear} to start tracking your spending limits`}
            actionLabel="Create Budget"
            onAction={() => setIsModalOpen(true)}
            icon="Target"
          />
        )}
      </div>

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBudget(null);
        }}
        budget={selectedBudget}
        onSuccess={handleBudgetSuccess}
      />
    </div>
  );
};

export default Budget;