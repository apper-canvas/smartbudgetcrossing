import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { budgetService } from "@/services/api/budgetService";
import { categoryService } from "@/services/api/categoryService";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import Error from "@/components/ui/Error";

const BudgetModal = ({ isOpen, onClose, budget = null, onSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
const [formData, setFormData] = useState({
    title_c: "",
    category_c: "",
    limit_c: "",
    month_c: "",
    year_c: new Date().getFullYear()
  });

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  useEffect(() => {
    loadCategories();
  }, []);

useEffect(() => {
if (budget) {
const categoryId = budget.category_c?.Id || budget.category_c || budget.category;
      const limit = budget.limit_c || budget.limit;
      const month = budget.month_c || budget.month;
      const year = budget.year_c || budget.year;
      const title = budget.title_c || budget.title;
      
      setFormData({
        title_c: title || "",
        category_c: parseInt(categoryId) || "",
        limit_c: limit.toString(),
        month_c: month,
        year_c: year
      });
    } else {
      const currentMonth = months[new Date().getMonth()];
      setFormData({
        category_c: "",
        limit_c: "",
        month_c: currentMonth,
        year_c: new Date().getFullYear()
      });
    }
  }, [budget, isOpen]);

const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data.filter(cat => (cat.type_c || cat.type) === "expense"));
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };
const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!formData.category_c || !formData.limit_c || !formData.month_c) {
        throw new Error("Please fill in all required fields");
      }

const budgetData = {
        title_c: formData.title_c,
        category_c: parseInt(formData.category_c),
        limit_c: parseFloat(formData.limit_c),
        spent_c: budget?.spent_c || budget?.spent || 0,
        month_c: formData.month_c,
        year_c: parseInt(formData.year_c)
      };

      if (budget) {
        await budgetService.update(budget.Id, budgetData);
        toast.success("Budget updated successfully");
      } else {
        await budgetService.create(budgetData);
        toast.success("Budget created successfully");
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to save budget");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

const getCategoryOptions = () => {
    return categories.map(cat => ({ 
      value: cat.Id.toString(), 
      label: cat.Name || cat.name_c || cat.name 
    }));
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
              onClick={onClose}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="inline-block w-full max-w-md my-8 overflow-hidden text-left align-middle bg-white shadow-xl rounded-2xl transform transition-all relative"
            >
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    {budget ? "Edit Budget" : "Create Budget"}
                  </h3>
                  <button
                    onClick={onClose}
                    className="p-1.5 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-all duration-200"
                  >
                    <ApperIcon name="X" size={18} />
                  </button>
                </div>
              </div>

<form onSubmit={handleSubmit} className="p-6 space-y-4">
                <FormField
                  type="input"
                  inputType="text"
                  label="Budget Title (Optional)"
                  placeholder="e.g., Monthly Groceries Budget"
                  value={formData.title_c}
                  onChange={(e) => handleChange("title_c", e.target.value)}
                />
<FormField
                  type="select"
                  label="Category"
                  value={formData.category_c}
                  onChange={(e) => handleChange("category_c", e.target.value)}
                  options={getCategoryOptions()}
                  placeholder="Select a category"
                  required
                />
<FormField
                  type="input"
                  inputType="number"
                  label="Budget Limit"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  value={formData.limit_c}
                  onChange={(e) => handleChange("limit_c", e.target.value)}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
<FormField
                    type="select"
                    label="Month"
                    value={formData.month_c}
                    onChange={(e) => handleChange("month_c", e.target.value)}
                    options={getMonthOptions()}
                    required
                  />
                  <FormField
                    type="select"
                    label="Year"
                    value={formData.year_c}
                    onChange={(e) => handleChange("year_c", parseInt(e.target.value))}
                    options={getYearOptions()}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={onClose}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </div>
                    ) : (
                      budget ? "Update Budget" : "Create Budget"
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BudgetModal;