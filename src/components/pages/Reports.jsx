import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { transactionService } from "@/services/api/transactionService";
import { budgetService } from "@/services/api/budgetService";
import { eachDayOfInterval, endOfMonth, format, parseISO, startOfMonth, subMonths } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Budget from "@/components/pages/Budget";
import Transactions from "@/components/pages/Transactions";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import SpendingChart from "@/components/organisms/SpendingChart";
import StatsCard from "@/components/molecules/StatsCard";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";

const Reports = () => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("thisMonth");
  const [selectedChart, setSelectedChart] = useState("pie");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [transactionsData, budgetsData] = await Promise.all([
        transactionService.getAll(),
        budgetService.getAll()
      ]);
      
      setTransactions(transactionsData);
      setBudgets(budgetsData);
    } catch (err) {
      setError("Failed to load report data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredTransactions = () => {
    const now = new Date();
    let startDate, endDate;

    switch (selectedPeriod) {
      case "thisMonth":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "lastMonth":
        const lastMonth = subMonths(now, 1);
        startDate = startOfMonth(lastMonth);
        endDate = endOfMonth(lastMonth);
        break;
      case "last3Months":
        startDate = startOfMonth(subMonths(now, 2));
        endDate = endOfMonth(now);
        break;
      case "last6Months":
        startDate = startOfMonth(subMonths(now, 5));
        endDate = endOfMonth(now);
        break;
      case "thisYear":
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      default:
        startDate = null;
        endDate = null;
    }

    if (!startDate || !endDate) return transactions;

    return transactions.filter(transaction => {
const transactionDate = parseISO(transaction.date_c || transaction.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  };

  const getReportStats = () => {
    const filtered = getFilteredTransactions();
const income = filtered.filter(t => (t.type_c || t.type) === "income");
    const expenses = filtered.filter(t => (t.type_c || t.type) === "expense");

const totalIncome = income.reduce((sum, t) => sum + (t.amount_c || t.amount), 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + (t.amount_c || t.amount), 0);
    const netIncome = totalIncome - totalExpenses;
    const averageTransaction = filtered.length > 0 ? 
filtered.reduce((sum, t) => sum + (t.amount_c || t.amount), 0) / filtered.length : 0;

    // Calculate category breakdown for expenses
const categoryBreakdown = expenses.reduce((acc, transaction) => {
      const categoryName = transaction.category_c?.Name || transaction.category;
      acc[categoryName] = (acc[categoryName] || 0) + (transaction.amount_c || transaction.amount);
      return acc;
    }, {});

    const topCategory = Object.entries(categoryBreakdown)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      totalIncome,
      totalExpenses,
      netIncome,
      averageTransaction,
      totalTransactions: filtered.length,
      topCategory: topCategory ? { name: topCategory[0], amount: topCategory[1] } : null,
      savingsRate: totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
    };
  };

  const getChartData = () => {
    const filtered = getFilteredTransactions();
    
    if (selectedChart === "pie") {
      // Category breakdown for pie chart
const expenses = filtered.filter(t => (t.type_c || t.type) === "expense");
      const categoryTotals = expenses.reduce((acc, transaction) => {
        const categoryName = transaction.category_c?.Name || transaction.category;
        acc[categoryName] = (acc[categoryName] || 0) + (transaction.amount_c || transaction.amount);
return acc;
      }, {});

      return Object.entries(categoryTotals).map(([category, amount]) => ({
        category,
        amount
      }));
    } else {
      // Daily spending for line chart
const expenses = filtered.filter(t => (t.type_c || t.type) === "expense");
      const now = new Date();
      const thirtyDaysAgo = subMonths(now, 1);
      const dateRange = eachDayOfInterval({ start: thirtyDaysAgo, end: now });

return dateRange.map(date => {
        const dayExpenses = expenses.filter(transaction => {
          const transactionDate = parseISO(transaction.date_c || transaction.date);
          return format(transactionDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd");
        });

        const totalAmount = dayExpenses.reduce((sum, t) => sum + (t.amount_c || t.amount), 0);
        return {
          date: format(date, "MMM dd"),
          amount: totalAmount
        };
      });
    }
  };

  const getBudgetComparison = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const monthName = months[currentMonth];

const currentBudgets = budgets.filter(budget => 
      (budget.month_c || budget.month) === monthName && (budget.year_c || budget.year) === currentYear
    );

const totalBudget = currentBudgets.reduce((sum, b) => sum + (b.limit_c || b.limit), 0);
const totalSpent = currentBudgets.reduce((sum, b) => sum + (b.spent_c || b.spent), 0);

    return {
      totalBudget,
totalSpent,
      remaining: totalBudget - totalSpent,
      utilizationRate: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0,
      overBudgetCategories: currentBudgets.filter(b => b.spent > b.limit).length
    };
  };

  const exportReport = () => {
    const stats = getReportStats();
    const budgetComparison = getBudgetComparison();
    
    const reportData = {
      period: selectedPeriod,
      generatedAt: new Date().toISOString(),
      stats,
      budgetComparison,
      transactions: getFilteredTransactions()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json"
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `financial-report-${format(new Date(), "yyyy-MM-dd")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const stats = getReportStats();
  const chartData = getChartData();
  const budgetComparison = getBudgetComparison();

  const periodOptions = [
    { value: "thisMonth", label: "This Month" },
    { value: "lastMonth", label: "Last Month" },
    { value: "last3Months", label: "Last 3 Months" },
    { value: "last6Months", label: "Last 6 Months" },
    { value: "thisYear", label: "This Year" }
  ];

  const chartOptions = [
    { value: "pie", label: "Category Breakdown" },
    { value: "line", label: "Spending Trends" }
  ];

  if (loading) return <Loading variant="skeleton" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500">Analyze your financial patterns and trends</p>
        </div>
        <Button
          onClick={exportReport}
          variant="primary"
          className="sm:w-auto w-full"
        >
          <ApperIcon name="Download" size={18} className="mr-2" />
          Export Report
        </Button>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Report Period"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            options={periodOptions}
          />
          <Select
            label="Chart Type"
            value={selectedChart}
            onChange={(e) => setSelectedChart(e.target.value)}
            options={chartOptions}
          />
        </div>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatsCard
          title="Total Income"
          value={stats.totalIncome}
          icon="TrendingUp"
          variant="success"
        />
        <StatsCard
          title="Total Expenses"
          value={stats.totalExpenses}
          icon="TrendingDown"
          variant="error"
        />
        <StatsCard
          title="Net Income"
          value={stats.netIncome}
          icon="DollarSign"
          variant={stats.netIncome >= 0 ? "success" : "error"}
        />
        <StatsCard
          title="Savings Rate"
          value={`${stats.savingsRate.toFixed(1)}%`}
          icon="PiggyBank"
          variant={stats.savingsRate >= 20 ? "success" : stats.savingsRate >= 10 ? "warning" : "error"}
        />
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SpendingChart data={chartData} type={selectedChart} />
        </motion.div>

        {/* Additional Insights */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Budget Performance */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Budget</span>
                <span className="font-semibold font-tabular">
                  ${budgetComparison.totalBudget.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Spent</span>
                <span className="font-semibold font-tabular">
                  ${budgetComparison.totalSpent.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Utilization Rate</span>
                <span className={`font-semibold font-tabular ${
                  budgetComparison.utilizationRate > 100 ? "text-error-600" : 
                  budgetComparison.utilizationRate > 80 ? "text-warning-600" : "text-success-600"
                }`}>
                  {budgetComparison.utilizationRate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    budgetComparison.utilizationRate > 100 ? "bg-gradient-to-r from-error-500 to-error-600" :
                    budgetComparison.utilizationRate > 80 ? "bg-gradient-to-r from-warning-500 to-warning-600" :
                    "bg-gradient-to-r from-success-500 to-success-600"
                  }`}
                  style={{ width: `${Math.min(budgetComparison.utilizationRate, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Top Spending Category */}
          {stats.topCategory && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Spending Category</h3>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-600 font-tabular mb-2">
                  ${stats.topCategory.amount.toLocaleString()}
                </p>
                <p className="text-gray-600">{stats.topCategory.name}</p>
                <p className="text-sm text-gray-500 mt-2">
                  {((stats.topCategory.amount / stats.totalExpenses) * 100).toFixed(1)}% of total expenses
                </p>
              </div>
            </div>
          )}

          {/* Transaction Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Transactions</span>
                <span className="font-semibold font-tabular">{stats.totalTransactions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Transaction</span>
                <span className="font-semibold font-tabular">
                  ${stats.averageTransaction.toLocaleString()}
                </span>
              </div>
              {budgetComparison.overBudgetCategories > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-error-600">Over Budget Categories</span>
                  <span className="font-semibold text-error-600 font-tabular">
                    {budgetComparison.overBudgetCategories}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Reports;