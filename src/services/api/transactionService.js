import { toast } from "react-toastify";
import React from "react";
import Error from "@/components/ui/Error";
import profileService from "@/services/api/profileService";

const { ApperClient } = window.ApperSDK;
class TransactionService {
constructor() {
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = "transaction_c";
  }

async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
{ field: { Name: "Name" } },
          { field: { Name: "title_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "created_at_c" } }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching transactions:", error?.response?.data?.message || error);
      throw error;
    }
  }

async getById(id) {
    try {
      const params = {
        RecordIds: [id],
fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "title_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "created_at_c" } }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data?.[0] || null;
    } catch (error) {
      console.error(`Error fetching transaction ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  }
async create(transactionData) {
    try {
      const params = {
        records: [
          {
Name: transactionData.title_c || transactionData.title || transactionData.description_c || transactionData.description || "Transaction",
            title_c: transactionData.title_c || transactionData.title,
            amount_c: parseFloat(transactionData.amount_c || transactionData.amount),
            type_c: transactionData.type_c || transactionData.type,
            category_c: transactionData.category_c?.Id || transactionData.category_c || transactionData.category,
            description_c: transactionData.description_c || transactionData.description,
            date_c: transactionData.date_c || transactionData.date,
            created_at_c: transactionData.created_at_c || transactionData.createdAt || new Date().toISOString()
          }
        ]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create transaction: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          throw new Error(failed[0]?.message || "Failed to create transaction");
        }

        if (successful.length > 0) {
          const createdTransaction = successful[0].data;
          toast.success('Transaction created successfully');

          // Send email notification
          try {
            // Fetch user profile to get email address
const profile = await profileService.getProfile();
            
            if (profile && profile.email_id_c) {
              // Initialize ApperClient for edge function
              const emailClient = new ApperClient({
                apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
                apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
              });
// Invoke edge function to send email
              const emailResult = await emailClient.functions.invoke(
                import.meta.env.VITE_SEND_TRANSACTION_EMAIL,
                {
                  body: JSON.stringify({
                    recipientEmail: profile.email_id_c,
                    transaction: createdTransaction
                  }),
                  headers: {
                    'Content-Type': 'application/json'
                  }
                }
              );
              // Check for response errors
              if (emailResult.success === false) {
                console.info(`apper_info: An error was received in this function: ${import.meta.env.VITE_SEND_TRANSACTION_EMAIL}. The response body is: ${JSON.stringify(emailResult)}.`);
                toast.warning('Transaction created but email notification failed');
              } else {
                toast.success('Email notification sent successfully');
              }
            } else {
              console.info('apper_info: Profile email not found, skipping email notification');
              toast.info('Transaction created (email not configured in profile)');
            }
          } catch (emailError) {
            // Log edge function invocation errors
            console.info(`apper_info: An error was received in this function: ${import.meta.env.VITE_SEND_TRANSACTION_EMAIL}. The error is: ${emailError.message}`);
            toast.warning('Transaction created but email notification failed');
          }

          return createdTransaction;
        }
      }

      return response.data;
    } catch (error) {
      console.error("Error creating transaction:", error?.response?.data?.message || error);
      throw error;
    }
  }
  async update(id, updateData) {
    try {
      const payload = {
Id: id,
        title_c: updateData.title_c || updateData.title,
        amount_c: parseFloat(updateData.amount_c || updateData.amount),
        type_c: updateData.type_c || updateData.type,
        category_c: updateData.category_c?.Id || updateData.category_c || updateData.category,
        description_c: updateData.description_c || updateData.description,
        date_c: updateData.date_c || updateData.date
      };

      if (updateData.Name) payload.Name = updateData.Name;

      const params = {
        records: [payload]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to update transaction:`, failed);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        return response.results.find(r => r.success)?.data;
      }

      return response.data;
    } catch (error) {
      console.error("Error updating transaction:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [id]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to delete transaction:`, failed);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
      }

      return true;
    } catch (error) {
      console.error("Error deleting transaction:", error?.response?.data?.message || error);
      throw error;
    }
  }
}

export const transactionService = new TransactionService();