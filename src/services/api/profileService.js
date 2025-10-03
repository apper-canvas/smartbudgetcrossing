class ProfileService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = "profiles_c";
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { name: "Owner" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "CreatedOn" } },
          { field: { name: "CreatedBy" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "ModifiedOn" } },
          { field: { name: "ModifiedBy" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "name_c" } },
{ field: { Name: "website_c" } },
          { field: { Name: "avatar_c" } },
          { field: { Name: "bio_c" } },
{ field: { Name: "email_id_c" } }
        ],
        pagingInfo: { limit: 20, offset: 0 }
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching profiles:", error?.response?.data?.message || error);
      throw error;
    }
  }

async getById(id) {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
{ field: { name: "Owner" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "CreatedOn" } },
          { field: { name: "CreatedBy" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "ModifiedOn" } },
          { field: { name: "ModifiedBy" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "name_c" } },
          { field: { Name: "avatar_c" } },
          { field: { Name: "website_c" } },
          { field: { Name: "bio_c" } },
          { field: { Name: "email_id_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, id, params);

      if (!response.success) {
        // If record doesn't exist, return null instead of throwing
        if (response.message === "Record does not exist") {
          console.info(`Profile ${id} does not exist`);
          return null;
        }
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching profile ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  }

  async create(profileData) {
    try {
      const params = {
records: [
          {
            Name: profileData.Name || profileData.name_c,
            name_c: profileData.name_c,
            avatar_c: profileData.avatar_c,
            website_c: profileData.website_c,
            bio_c: profileData.bio_c,
            email_id_c: profileData.email_id_c
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
          console.error(`Failed to create profile:`, failed);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        return response.results.find(r => r.success)?.data;
      }

      return response.data;
    } catch (error) {
      console.error("Error creating profile:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async update(id, updateData) {
    try {
      const payload = {
        Id: id
      };

if (updateData.Name !== undefined) payload.Name = updateData.Name;
      if (updateData.name_c !== undefined) payload.name_c = updateData.name_c;
      if (updateData.avatar_c !== undefined) payload.avatar_c = updateData.avatar_c;
      if (updateData.website_c !== undefined) payload.website_c = updateData.website_c;
      if (updateData.bio_c !== undefined) payload.bio_c = updateData.bio_c;
      if (updateData.email_id_c !== undefined) payload.email_id_c = updateData.email_id_c;
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
          console.error(`Failed to update profile:`, failed);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        return response.results.find(r => r.success)?.data;
      }

      return response.data;
    } catch (error) {
      console.error("Error updating profile:", error?.response?.data?.message || error);
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
          console.error(`Failed to delete profile:`, failed);
          failed.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
      }

return true;
    } catch (error) {
      console.error("Error deleting profile:", error?.response?.data?.message || error);
      throw error;
    }
  }

  async getProfile() {
    try {
      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { name: "Owner" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "CreatedOn" } },
          { field: { name: "CreatedBy" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "ModifiedOn" } },
          { field: { name: "ModifiedBy" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "name_c" } },
          { field: { Name: "avatar_c" } },
          { field: { Name: "website_c" } },
          { field: { Name: "bio_c" } },
          { field: { Name: "email_id_c" } }
        ],
        pagingInfo: { limit: 1, offset: 0 }
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      if (!response.data || response.data.length === 0) {
        return null;
      }

      return response.data[0];
    } catch (error) {
      console.error("Error fetching current user profile:", error?.response?.data?.message || error);
      return null;
    }
  }
}

const profileService = new ProfileService();
export default profileService;