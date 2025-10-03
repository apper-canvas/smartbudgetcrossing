import { toast } from 'react-toastify';

class CategoryService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = "category_c";
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "name_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "color_c" } },
          { field: { Name: "is_default_c" } }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return (response.data || []).map(cat => ({
        ...cat,
        name: cat.Name || cat.name_c,
        type: cat.type_c,
        color: cat.color_c,
        isDefault: cat.is_default_c
      }));
    } catch (error) {
      console.error("Error fetching categories:", error?.response?.data?.message || error);
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
          { field: { Name: "type_c" } },
          { field: { Name: "color_c" } },
          { field: { Name: "is_default_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      const cat = response.data;
      return {
        ...cat,
        name: cat.Name || cat.name_c,
        type: cat.type_c,
        color: cat.color_c,
        isDefault: cat.is_default_c
      };
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  }

  async create(categoryData) {
    try {
      const params = {
        records: [
          {
            Name: categoryData.name,
            name_c: categoryData.name,
            type_c: categoryData.type,
            color_c: categoryData.color,
            is_default_c: categoryData.isDefault || false
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
          console.error(`Failed to create category:`, failed);
          // Show specific field errors to user
          failed.forEach(record => {
            record.errors?.forEach(error => {
              const fieldLabel = error.fieldLabel || 'Field';
              const errorMsg = error.message || error;
              toast.error(`${fieldLabel}: ${errorMsg}`);
            });
            if (record.message) {
              throw new Error(record.message);
            }
          });
        }
        return response.results.find(r => r.success)?.data;
      }

      return response.data;
    } catch (error) {
      console.error("Error creating category:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      const params = {
        records: [
          {
            Id: id,
            Name: updateData.name,
            name_c: updateData.name,
            type_c: updateData.type,
            color_c: updateData.color,
            is_default_c: updateData.isDefault
          }
        ]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to update category:`, failed);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        return response.results.find(r => r.success)?.data;
      }

      return response.data;
    } catch (error) {
      console.error("Error updating category:", error?.response?.data?.message || error);
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
          console.error(`Failed to delete category:`, failed);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
      }

      return true;
    } catch (error) {
      console.error("Error deleting category:", error?.response?.data?.message || error);
      throw error;
    }
  }
}

export const categoryService = new CategoryService();