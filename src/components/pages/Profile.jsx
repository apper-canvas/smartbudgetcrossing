import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import FormField from "@/components/molecules/FormField";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import profileService from "@/services/api/profileService";

const Profile = () => {
  const { user } = useSelector((state) => state.user);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
const [formData, setFormData] = useState({
    name_c: "",
    avatar_c: "",
    website_c: "",
    bio_c: "",
    email_id_c: ""
  });

  useEffect(() => {
    if (user?.userId) {
      loadProfile();
    }
  }, [user]);

const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await profileService.getById(user.userId);
      
      // If profile doesn't exist, create it
      if (!data) {
        toast.info("Creating your profile...");
        const newProfile = await profileService.create({
          Name: user.firstName || user.emailAddress || "User",
          name_c: user.firstName || user.emailAddress || "User",
          avatar_c: "",
          website_c: "",
          bio_c: "",
          email_id_c: user.emailAddress || ""
        });
        // Reload the profile after creation
        await loadProfile();
        return;
      }
      
      setProfile(data);
      setFormData({
        name_c: data.name_c || "",
        avatar_c: data.avatar_c || "",
        website_c: data.website_c || "",
        bio_c: data.bio_c || "",
        email_id_c: data.email_id_c || ""
      });
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const updatedProfile = await profileService.update(profile.Id, {
        name_c: formData.name_c,
        avatar_c: formData.avatar_c,
        website_c: formData.website_c,
        bio_c: formData.bio_c,
        email_id_c: formData.email_id_c
      });
      toast.success("Profile updated successfully");
      setIsEditing(false);
      await loadProfile();
    } catch (err) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

const handleCancel = () => {
    setFormData({
      name_c: profile?.name_c || "",
      avatar_c: profile?.avatar_c || "",
      website_c: profile?.website_c || "",
      bio_c: profile?.bio_c || "",
      email_id_c: profile?.email_id_c || ""
    });
    setIsEditing(false);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadProfile} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information</p>
        </div>
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Edit" size={16} />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={updating}
              className="flex items-center gap-2"
            >
              {updating ? (
                <>
                  <div className="animate-spin">
                    <ApperIcon name="Loader2" size={16} />
                  </div>
                  Saving...
                </>
              ) : (
                <>
                  <ApperIcon name="Save" size={16} />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Profile Header Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden">
            {profile?.avatar_c ? (
              <img
                src={profile.avatar_c}
                alt={profile.name_c || user?.firstName}
                className="w-full h-full object-cover"
              />
            ) : (
              getInitials(profile?.name_c || user?.firstName)
            )}
          </div>
<div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-bold text-gray-900">
              {profile?.name_c || user?.firstName || "User"}
            </h2>
            <p className="text-gray-600 mt-1">{user?.emailAddress}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Email Id</label>
            <p className="text-gray-900 mt-1">{profile?.email_id_c || "Not provided"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Website</label>
            {profile?.website_c ? (
              <a
                href={profile.website_c}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 mt-2 inline-flex items-center gap-1"
              >
                <ApperIcon name="Globe" size={16} />
                {profile.website_c}
              </a>
            ) : (
              <p className="text-gray-900 mt-1">Not provided</p>
            )}
          </div>
        </div>
      </Card>

      {/* Profile Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="primary" className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="User" size={24} className="text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Member Since</p>
              <p className="text-lg font-semibold text-gray-900">
                {profile?.CreatedOn ? new Date(profile.CreatedOn).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="success" className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="Calendar" size={24} className="text-success-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="text-lg font-semibold text-gray-900">
                {profile?.ModifiedOn ? new Date(profile.ModifiedOn).toLocaleDateString() : "Never"}
              </p>
            </div>
          </div>
        </Card>

        <Card variant="gradient" className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <ApperIcon name="Shield" size={24} className="text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Account Status</p>
              <p className="text-lg font-semibold text-gray-900">Active</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Profile Details */}
      {!isEditing ? (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Full Name</label>
              <p className="text-gray-900 mt-1">
                {profile?.name_c || "Not provided"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Avatar URL</label>
              <p className="text-gray-900 mt-1">
                {profile?.avatar_c || "Not provided"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Website</label>
              <p className="text-gray-900 mt-1">
                {profile?.website_c ? (
                  <a
                    href={profile.website_c}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:text-primary-700"
                  >
                    {profile.website_c}
                  </a>
                ) : (
                  "Not provided"
                )}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Bio</label>
              <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                {profile?.bio_c || "Not provided"}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile Information</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              label="Full Name"
              name="name_c"
              value={formData.name_c}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />
            <FormField
              label="Avatar URL"
              name="avatar_c"
              type="url"
              value={formData.avatar_c}
              onChange={handleInputChange}
              placeholder="https://example.com/avatar.jpg"
            />
<FormField
              label="Website"
              name="website_c"
              type="url"
              value={formData.website_c}
              onChange={handleInputChange}
              placeholder="https://yourwebsite.com"
            />
            <FormField
              label="Email Id"
              name="email_id_c"
              type="email"
              value={formData.email_id_c}
              onChange={handleInputChange}
              placeholder="your.email@example.com"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                name="bio_c"
                value={formData.bio_c}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="Tell us about yourself..."
              />
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};

export default Profile;