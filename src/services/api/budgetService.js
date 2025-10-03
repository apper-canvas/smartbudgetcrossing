class BudgetService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = "budget_c";
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "limit_c" } },
          { field: { Name: "spent_c" } },
          { field: { Name: "month_c" } },
          { field: { Name: "year_c" } },
          { field: { name: "category_c" }, referenceField: { field: { Name: "Name" } } }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return (response.data || []).map(b => ({
        ...b,
        category: b.category_c?.Name,
        limit: b.limit_c,
        spent: b.spent_c,
        month: b.month_c,
        year: b.year_c
      }));
    } catch (error) {
      console.error("Error fetching budgets:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "limit_c" } },
          { field: { Name: "spent_c" } },
          { field: { Name: "month_c" } },
          { field: { Name: "year_c" } },
          { field: { name: "category_c" }, referenceField: { field: { Name: "Name" } } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const b = response.data;
      return {
        ...b,
        category: b.category_c?.Name,
        limit: b.limit_c,
        spent: b.spent_c,
        month: b.month_c,
        year: b.year_c
      };
    } catch (error) {
      console.error(`Error fetching budget ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  }

  async create(budgetData) {
    try {
      const params = {
        records: [
          {
Name: `${budgetData.category || budgetData.category_c} Budget`,
            category_c: parseInt(budgetData.category_c?.Id || budgetData.category_c || budgetData.category),
            limit_c: parseFloat(budgetData.limit_c || budgetData.limit),
            spent_c: parseFloat(budgetData.spent_c || budgetData.spent || 0),
            month_c: budgetData.month_c || budgetData.month,
            year_c: parseInt(budgetData.year_c || budgetData.year)
          }
        ]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to create budget:`, failed);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        return response.results.find(r => r.success)?.data;
      }

      return response.data;
    } catch (error) {
      console.error("Error creating budget:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      const payload = {
        Id: id,
        limit_c: parseFloat(updateData.limit_c || updateData.limit),
        spent_c: parseFloat(updateData.spent_c || updateData.spent),
        month_c: updateData.month_c || updateData.month,
        year_c: parseInt(updateData.year_c || updateData.year)
      };

      if (updateData.category_c !== undefined) {
        payload.category_c = updateData.category_c?.Id || updateData.category_c || updateData.category;
      }
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
          console.error(`Failed to update budget:`, failed);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        return response.results.find(r => r.success)?.data;
      }

      return response.data;
    } catch (error) {
      console.error("Error updating budget:", error?.response?.data?.message || error);
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
          console.error(`Failed to delete budget:`, failed);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
      }

      return true;
    } catch (error) {
      console.error("Error deleting budget:", error?.response?.data?.message || error);
      throw error;
    }
  }
}

export const budgetService = new BudgetService();