import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { transactionService } from "@/services/api/transactionService";
import { categoryService } from "@/services/api/categoryService";
import { toast } from "react-toastify";
import { endOfMonth, format, startOfMonth } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";
import Badge from "@/components/atoms/Badge";
import TransactionModal from "@/components/organisms/TransactionModal";
import SearchBar from "@/components/molecules/SearchBar";
import TransactionItem from "@/components/molecules/TransactionItem";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [dateRange, setDateRange] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [transactionsData, categoriesData] = await Promise.all([
        transactionService.getAll(),
        categoryService.getAll()
      ]);
      
      setTransactions(transactionsData);
      setCategories(categoriesData);
    } catch (err) {
      setError("Failed to load transactions. Please try again.");
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
    setIsModalOpen(true);
  };

  const handleTransactionSuccess = () => {
    loadData();
  };

const getFilteredTransactions = () => {
    let filtered = transactions;

    // Search filter
    if (searchTerm) {
filtered = filtered.filter(transaction => {
        const title = transaction.title_c || transaction.title || "";
        const description = transaction.description_c || transaction.description || "";
        const categoryName = transaction.category_c?.Name || transaction.category || "";
        return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               description.toLowerCase().includes(searchTerm.toLowerCase()) ||
               categoryName.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(transaction => {
        const categoryName = transaction.category_c?.Name || transaction.category;
        return categoryName === selectedCategory;
      });
    }

    // Type filter
    if (selectedType) {
      filtered = filtered.filter(transaction => (transaction.type_c || transaction.type) === selectedType);
    }

    // Date range filter
    if (dateRange !== "all") {
      const now = new Date();
      let startDate, endDate;

      switch (dateRange) {
        case "thisMonth":
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case "lastMonth":
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          startDate = startOfMonth(lastMonth);
          endDate = endOfMonth(lastMonth);
          break;
        case "last3Months":
          startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
          endDate = now;
          break;
        default:
          startDate = null;
          endDate = null;
      }

      if (startDate && endDate) {
        filtered = filtered.filter(transaction => {
          const transactionDate = new Date(transaction.date_c || transaction.date);
          return transactionDate >= startDate && transactionDate <= endDate;
        });
      }
    }

    return filtered.sort((a, b) => new Date(b.date_c || b.date) - new Date(a.date_c || a.date));
  };

const getStats = () => {
    const filtered = getFilteredTransactions();
    const totalIncome = filtered
      .filter(t => (t.type_c || t.type) === "income")
      .reduce((sum, t) => sum + (t.amount_c || t.amount), 0);
    
    const totalExpenses = filtered
      .filter(t => (t.type_c || t.type) === "expense")
      .reduce((sum, t) => sum + (t.amount_c || t.amount), 0);

    return {
      totalTransactions: filtered.length,
      totalIncome,
      totalExpenses,
      netAmount: totalIncome - totalExpenses
    };
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedType("");
    setDateRange("all");
  };

  const filteredTransactions = getFilteredTransactions();
  const stats = getStats();

const categoryOptions = categories.map(cat => ({ 
    value: cat.Name || cat.name_c || cat.name, 
    label: cat.Name || cat.name_c || cat.name 
  }));
  const typeOptions = [
    { value: "income", label: "Income" },
    { value: "expense", label: "Expense" }
  ];
  const dateOptions = [
    { value: "all", label: "All Time" },
    { value: "thisMonth", label: "This Month" },
    { value: "lastMonth", label: "Last Month" },
    { value: "last3Months", label: "Last 3 Months" }
  ];

  if (loading) return <Loading variant="skeleton" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500">Manage all your income and expenses</p>
        </div>
        <Button
          onClick={() => {
            setSelectedTransaction(null);
            setIsModalOpen(true);
          }}
          variant="primary"
          className="sm:w-auto w-full"
        >
          <ApperIcon name="Plus" size={18} className="mr-2" />
          Add Transaction
        </Button>
      </div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Transactions</p>
          <p className="text-2xl font-bold text-gray-900 font-tabular">{stats.totalTransactions}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Income</p>
          <p className="text-2xl font-bold text-success-600 font-tabular">
            ${stats.totalIncome.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Expenses</p>
          <p className="text-2xl font-bold text-error-600 font-tabular">
            ${stats.totalExpenses.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Net Amount</p>
          <p className={`text-2xl font-bold font-tabular ${
            stats.netAmount >= 0 ? "text-success-600" : "text-error-600"
          }`}>
            ${stats.netAmount.toLocaleString()}
          </p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search transactions..."
            />
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={categoryOptions}
              placeholder="All Categories"
            />
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              options={typeOptions}
              placeholder="All Types"
            />
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              options={dateOptions}
            />
          </div>
          
          {(searchTerm || selectedCategory || selectedType || dateRange !== "all") && (
            <Button
              onClick={clearFilters}
              variant="ghost"
              size="sm"
              className="flex-shrink-0"
            >
              <ApperIcon name="X" size={16} className="mr-1" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Active Filters */}
        {(searchTerm || selectedCategory || selectedType || dateRange !== "all") && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchTerm && (
              <Badge variant="primary" size="sm">
                Search: "{searchTerm}"
              </Badge>
            )}
            {selectedCategory && (
              <Badge variant="primary" size="sm">
                Category: {selectedCategory}
              </Badge>
            )}
            {selectedType && (
              <Badge variant="primary" size="sm">
                Type: {selectedType}
              </Badge>
            )}
            {dateRange !== "all" && (
              <Badge variant="primary" size="sm">
                Period: {dateOptions.find(opt => opt.value === dateRange)?.label}
              </Badge>
            )}
          </div>
        )}
      </motion.div>

      {/* Transactions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              All Transactions ({filteredTransactions.length})
            </h3>
          </div>

          <div className="space-y-3">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.Id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TransactionItem
                    transaction={transaction}
                    onEdit={handleEditTransaction}
                    onDelete={handleDeleteTransaction}
                  />
                </motion.div>
              ))
            ) : (
              <Empty
                title="No transactions found"
                message={
                  searchTerm || selectedCategory || selectedType || dateRange !== "all"
                    ? "Try adjusting your filters to see more transactions"
                    : "Add your first transaction to get started tracking your finances"
                }
                actionLabel="Add Transaction"
                onAction={() => setIsModalOpen(true)}
                icon="Receipt"
              />
            )}
          </div>
        </div>
      </motion.div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  );
};

export default Transactions;