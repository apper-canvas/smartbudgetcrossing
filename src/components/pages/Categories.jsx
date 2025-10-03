import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { categoryService } from "@/services/api/categoryService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Select from "@/components/atoms/Select";
import SearchBar from "@/components/molecules/SearchBar";
import CategoryModal from "@/components/organisms/CategoryModal";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Loading from "@/components/ui/Loading";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const categoriesData = await categoryService.getAll();
      setCategories(categoriesData);
    } catch (err) {
      setError("Failed to load categories. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await categoryService.delete(id);
        setCategories(prev => prev.filter(c => c.Id !== id));
        toast.success("Category deleted successfully");
      } catch (error) {
        toast.error("Failed to delete category");
      }
    }
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleCategorySuccess = () => {
    loadData();
  };

  const getFilteredCategories = () => {
    let filtered = categories;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(category => {
        const name = category.Name || category.name_c || category.name || "";
        return name.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Type filter
    if (selectedType) {
      filtered = filtered.filter(category => category.type === selectedType);
    }

    return filtered.sort((a, b) => {
      const nameA = (a.Name || a.name_c || a.name || "").toLowerCase();
      const nameB = (b.Name || b.name_c || b.name || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });
  };

  const getStats = () => {
    const incomeCategories = categories.filter(c => c.type === "income").length;
    const expenseCategories = categories.filter(c => c.type === "expense").length;

    return {
      total: categories.length,
      income: incomeCategories,
      expense: expenseCategories
    };
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedType("");
  };

  const filteredCategories = getFilteredCategories();
  const stats = getStats();

  const typeOptions = [
    { value: "income", label: "Income" },
    { value: "expense", label: "Expense" }
  ];

  if (loading) return <Loading variant="skeleton" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500">Organize your transactions with custom categories</p>
        </div>
        <Button
          onClick={() => {
            setSelectedCategory(null);
            setIsModalOpen(true);
          }}
          variant="primary"
          className="sm:w-auto w-full"
        >
          <ApperIcon name="Plus" size={18} className="mr-2" />
          Add Category
        </Button>
      </div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Categories</p>
          <p className="text-2xl font-bold text-gray-900 font-tabular">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Income Categories</p>
          <p className="text-2xl font-bold text-success-600 font-tabular">{stats.income}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Expense Categories</p>
          <p className="text-2xl font-bold text-error-600 font-tabular">{stats.expense}</p>
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
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search categories..."
            />
            <Select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              options={typeOptions}
              placeholder="All Types"
            />
          </div>
          
          {(searchTerm || selectedType) && (
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
        {(searchTerm || selectedType) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchTerm && (
              <Badge variant="primary" size="sm">
                Search: "{searchTerm}"
              </Badge>
            )}
            {selectedType && (
              <Badge variant="primary" size="sm">
                Type: {selectedType}
              </Badge>
            )}
          </div>
        )}
      </motion.div>

      {/* Categories Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category, index) => (
              <motion.div
                key={category.Id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: category.color || "#3b82f6" }}
                    >
                      <ApperIcon 
                        name={category.type === "income" ? "TrendingUp" : "TrendingDown"} 
                        size={24} 
                        className="text-white" 
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {category.Name || category.name_c || category.name}
                      </h3>
                      <Badge
                        variant={category.type === "income" ? "success" : "error"}
                        size="sm"
                        className="mt-1"
                      >
                        {category.type}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      <ApperIcon name="Pencil" size={18} />
                    </button>
                    {!category.isDefault && (
                      <button
                        onClick={() => handleDeleteCategory(category.Id)}
                        className="text-gray-400 hover:text-error-600 transition-colors"
                      >
                        <ApperIcon name="Trash2" size={18} />
                      </button>
                    )}
                  </div>
                </div>
                
                {category.isDefault && (
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                    <ApperIcon name="Lock" size={14} />
                    <span>Default category</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <Empty
              title="No categories found"
              message={
                searchTerm || selectedType
                  ? "Try adjusting your filters to see more categories"
                  : "Add your first category to organize your transactions"
              }
              actionLabel="Add Category"
              onAction={() => setIsModalOpen(true)}
              icon="FolderKanban"
            />
          </div>
        )}
      </motion.div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCategory(null);
        }}
        category={selectedCategory}
        onSuccess={handleCategorySuccess}
      />
    </div>
  );
};

export default Categories;