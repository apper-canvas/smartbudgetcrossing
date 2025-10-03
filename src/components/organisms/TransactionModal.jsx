import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import ApperIcon from "@/components/ApperIcon";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { transactionService } from "@/services/api/transactionService";
import { categoryService } from "@/services/api/categoryService";
import profileService from "@/services/api/profileService";
const TransactionModal = ({ isOpen, onClose, transaction = null, onSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
const [formData, setFormData] = useState({
    title_c: "",
    amount_c: "",
    type_c: "expense",
    category_c: "",
    description_c: "",
    date_c: format(new Date(), "yyyy-MM-dd")
  });

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (transaction) {
      const amount = transaction.amount_c || transaction.amount;
      const type = transaction.type_c || transaction.type;
      const categoryId = transaction.category_c?.Id || transaction.category_c || transaction.category;
      const description = transaction.description_c || transaction.description;
      const date = transaction.date_c || transaction.date;
      
setFormData({
        title_c: transaction.title_c || "",
        amount_c: amount.toString(),
        type_c: type,
        category_c: categoryId,
        description_c: description,
        date_c: format(new Date(date), "yyyy-MM-dd")
      });
    } else {
      setFormData({
title_c: "",
        amount_c: "",
        type_c: "expense",
        category_c: "",
        description_c: "",
        date_c: format(new Date(), "yyyy-MM-dd")
      });
    }
  }, [transaction, isOpen]);
  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };

const handleSubmit = async (e) => {
    e.preventDefault();
if (!formData.title_c || !formData.amount_c || !formData.category_c || !formData.description_c) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
const transactionData = {
        title_c: formData.title_c,
        amount_c: parseFloat(formData.amount_c),
        type_c: formData.type_c,
category_c: parseInt(formData.category_c?.Id || formData.category_c),
        description_c: formData.description_c,
        date_c: new Date(formData.date_c).toISOString(),
        created_at_c: new Date().toISOString()
      };

      if (transaction) {
        await transactionService.update(transaction.Id, transactionData);
        toast.success("Transaction updated successfully");
      } else {
        const createdTransaction = await transactionService.create(transactionData);
        toast.success("Transaction added successfully");

        // Send email notification for new transactions
        try {
const profiles = await profileService.getAll();
          if (profiles && profiles.length > 0) {
            const userProfile = profiles[0];
            const userEmail = userProfile.email_id_c;

            if (userEmail) {
              const { ApperClient } = window.ApperSDK;
              const apperClient = new ApperClient({
                apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
                apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
              });

              const emailResult = await apperClient.functions.invoke(
                import.meta.env.VITE_SEND_TRANSACTION_EMAIL,
                {
                  body: JSON.stringify({
                    recipientEmail: userEmail,
transaction: {
                      ...transactionData,
                      title_c: formData.title_c,
                      category_c: categories.find(cat => cat.Id === parseInt(formData.category_c))
                    }
                  }),
                  headers: {
                    'Content-Type': 'application/json'
                  }
                }
              );

              if (emailResult.success === false) {
                console.info(`apper_info: An error was received in this function: ${import.meta.env.VITE_SEND_TRANSACTION_EMAIL}. The response body is: ${JSON.stringify(emailResult)}.`);
                toast.warning("Transaction saved, but email notification failed");
              } else {
                toast.success("Email notification sent!");
              }
            } else {
              toast.warning("Transaction saved, but no email address found in profile");
            }
          }
        } catch (emailError) {
          console.info(`apper_info: An error was received in this function: ${import.meta.env.VITE_SEND_TRANSACTION_EMAIL}. The error is: ${emailError.message}`);
          toast.warning("Transaction saved, but email notification failed");
        }
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to save transaction");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

const getFilteredCategories = () => {
    return categories
      .filter(cat => (cat.type_c || cat.type) === formData.type_c)
      .map(cat => ({ 
        value: cat.Id.toString(), 
        label: cat.Name || cat.name_c || cat.name 
      }));
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
                    {transaction ? "Edit Transaction" : "Add Transaction"}
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
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    type="input"
                    inputType="number"
                    label="Amount"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
value={formData.amount_c}
                    onChange={(e) => handleChange("amount_c", e.target.value)}
                    required
                  />
                  <FormField
                    type="select"
                    label="Type"
                    value={formData.type_c}
                    onChange={(e) => {
                      handleChange("type_c", e.target.value);
                      handleChange("category_c", "");
                    }}
                    options={[
                      { value: "expense", label: "Expense" },
                      { value: "income", label: "Income" }
                    ]}
                    required
                  />
                </div>

<FormField
                  type="input"
                  label="Title"
                  placeholder="Enter transaction title"
                  value={formData.title_c}
                  onChange={(e) => handleChange("title_c", e.target.value)}
                  required
                />

<FormField
                  type="select"
                  label="Category"
                  value={formData.category_c}
                  onChange={(e) => handleChange("category_c", e.target.value)}
                  options={getFilteredCategories()}
                  placeholder="Select a category"
                  required
                />

<FormField
                  type="input"
                  label="Description"
                  placeholder="Enter description"
                  value={formData.description_c}
                  onChange={(e) => handleChange("description_c", e.target.value)}
                  required
                />

<FormField
                  type="input"
                  inputType="date"
                  label="Date"
                  value={formData.date_c}
                  onChange={(e) => handleChange("date_c", e.target.value)}
                  required
                />

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
                      transaction ? "Update Transaction" : "Add Transaction"
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

export default TransactionModal;