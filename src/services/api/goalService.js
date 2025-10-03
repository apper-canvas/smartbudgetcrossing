class GoalService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = "goal_c";
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "name_c" } },
          { field: { Name: "target_amount_c" } },
          { field: { Name: "current_amount_c" } },
          { field: { Name: "target_date_c" } },
          { field: { Name: "created_at_c" } }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return (response.data || []).map(g => ({
        ...g,
        name: g.Name || g.name_c,
        targetAmount: g.target_amount_c,
        currentAmount: g.current_amount_c,
        targetDate: g.target_date_c,
        createdAt: g.created_at_c
      }));
    } catch (error) {
      console.error("Error fetching goals:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "name_c" } },
          { field: { Name: "target_amount_c" } },
          { field: { Name: "current_amount_c" } },
          { field: { Name: "target_date_c" } },
          { field: { Name: "created_at_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const g = response.data;
      return {
        ...g,
        name: g.Name || g.name_c,
        targetAmount: g.target_amount_c,
        currentAmount: g.current_amount_c,
        targetDate: g.target_date_c,
        createdAt: g.created_at_c
      };
    } catch (error) {
      console.error(`Error fetching goal ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  }

  async create(goalData) {
    try {
      const params = {
        records: [
          {
            Name: goalData.name_c || goalData.name,
            name_c: goalData.name_c || goalData.name,
            target_amount_c: parseFloat(goalData.target_amount_c || goalData.targetAmount),
            current_amount_c: parseFloat(goalData.current_amount_c || goalData.currentAmount || 0),
            target_date_c: goalData.target_date_c || goalData.targetDate,
            created_at_c: goalData.created_at_c || goalData.createdAt || new Date().toISOString()
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
          console.error(`Failed to create goal:`, failed);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        return response.results.find(r => r.success)?.data;
      }

      return response.data;
    } catch (error) {
      console.error("Error creating goal:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      const payload = {
        Id: id,
        Name: updateData.name_c || updateData.name,
        name_c: updateData.name_c || updateData.name,
        target_amount_c: parseFloat(updateData.target_amount_c || updateData.targetAmount),
        current_amount_c: parseFloat(updateData.current_amount_c || updateData.currentAmount),
        target_date_c: updateData.target_date_c || updateData.targetDate
      };

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
          console.error(`Failed to update goal:`, failed);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        return response.results.find(r => r.success)?.data;
      }

      return response.data;
    } catch (error) {
      console.error("Error updating goal:", error?.response?.data?.message || error);
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
          console.error(`Failed to delete goal:`, failed);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
      }

      return true;
    } catch (error) {
      console.error("Error deleting goal:", error?.response?.data?.message || error);
      throw error;
    }
  }
}

export const goalService = new GoalService();