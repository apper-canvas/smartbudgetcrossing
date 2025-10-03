import React, { useState, useEffect } from "react";
import { categoryService } from "@/services/api/categoryService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";

const CategoryModal = ({ isOpen, onClose, category, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "expense",
    color: "#3b82f6",
    isDefault: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.Name || category.name_c || category.name || "",
        type: category.type || "expense",
        color: category.color || "#3b82f6",
        isDefault: category.isDefault || false
      });
    } else {
      setFormData({
        name: "",
        type: "expense",
        color: "#3b82f6",
        isDefault: false
      });
    }
  }, [category, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    setLoading(true);
    try {
      if (category) {
        await categoryService.update(category.Id, formData);
        toast.success("Category updated successfully");
      } else {
        await categoryService.create(formData);
        toast.success("Category created successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(category ? "Failed to update category" : "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  const typeOptions = [
    { value: "income", label: "Income" },
    { value: "expense", label: "Expense" }
  ];

  const predefinedColors = [
    "#3b82f6", // blue
    "#10b981", // green
    "#ef4444", // red
    "#f59e0b", // orange
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#84cc16", // lime
    "#f97316", // orange
    "#6366f1"  // indigo
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {category ? "Edit Category" : "Add Category"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ApperIcon name="X" size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter category name"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <Select
                value={formData.type}
                onChange={(e) => handleChange("type", e.target.value)}
                options={typeOptions}
                required
              />
            </div>

            {/* Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="grid grid-cols-5 gap-2">
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleChange("color", color)}
                    className={`w-full h-10 rounded-lg transition-all ${
                      formData.color === color
                        ? "ring-2 ring-offset-2 ring-gray-400"
                        : "hover:ring-2 hover:ring-offset-2 hover:ring-gray-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-gray-600">Custom:</span>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleChange("color", e.target.value)}
                  className="h-10 w-20 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Is Default */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => handleChange("isDefault", e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                Set as default category
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <ApperIcon name="Loader2" size={18} className="mr-2 animate-spin" />
                    {category ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  category ? "Update Category" : "Create Category"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;