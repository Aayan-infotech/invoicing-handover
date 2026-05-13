import React from "react";
import { useState } from "react";
import { images } from "../../contstants";
import { useOutletContext } from "react-router-dom";
import Loading from "../../components/Loading/Loading";
import axiosInstance from "../../components/axiosInstance";

export default function UpdateProfile() {
  const { user, snackbar, getProfileData } = useOutletContext();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    mobile: user?.mobile || "",
    address: user?.address || "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mobile") {
      // Remove any non-digit characters and limit to 10 digits
      const numbersOnly = value.replace(/\D/g, "").slice(0, 10);
      setFormData({
        ...formData,
        [name]: numbersOnly,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Function to handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if the file is an image
      if (!file.type.startsWith("image/")) {
        snackbar.error("Please select a valid image file");
        return;
      }

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        snackbar.error("Image size should be less than 5MB");
        return;
      }

      setSelectedFile(file);

      // Create preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        profile_image: previewUrl,
      }));
    }
  };

  // Function to trigger file input click
  const triggerFileInput = () => {
    document.getElementById("profileImage").click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Create FormData object
      const submitData = new FormData();

      // Append text fields
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("mobile", formData.mobile);
      submitData.append("address", formData.address);

      // Append image file if selected
      if (selectedFile) {
        submitData.append("profile_image", selectedFile);
      }

      const response = await axiosInstance.put(
        "users/update-profile",
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response) {
        // First update the profile data in parent component
        await getProfileData();
        // Show success message
        snackbar.success(response?.data?.message || "Profile updated successfully");
        // Clear the selected file after successful upload
        setSelectedFile(null);
      }
    } catch (error) {
      snackbar.error(
        error?.response?.data?.message || "Error updating profile"
      );
    } finally {
      setLoading(false);
    }
  };

  // Get the image source for display
  const getImageSrc = () => {
    if (selectedFile) {
      return formData.profile_image; // This is the preview URL
    }
    return user?.profile_image || images.placeholder;
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="d-flex flex-column gap-2 align-items-center">
        <img
          src={getImageSrc()}
          alt="Profile"
          className="profile-update-icon rounded-5"
          width={60}
          height={60}
        />
        <button
          type="button"
          className="fs-6 btn btn-secondary rounded-4 px-5 py-2"
          onClick={triggerFileInput}
        >
          Edit
        </button>
        {/* Hidden file input */}
        <input
          type="file"
          id="profileImage"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImageUpload}
        />
      </div>
      {/* Name Field */}
      <div className="mb-3 mt-3">
        <div className="input-group">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="form-control px-3 py-2 border-0 "
            placeholder="Name"
          />
        </div>
      </div>

      {/* Email Field */}
      <div className="mb-3">
        <div className="input-group">
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="form-control px-3 py-2 border-0 "
            placeholder="Email"
          />
        </div>
      </div>

      {/* Phone Number Field */}
      <div className="mb-3">
        <div className="input-group">
          <input
            type="tel"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            className="form-control px-3 py-2 border-0 "
            placeholder="Phone Number"
            maxLength={10}
          />
        </div>
        {formData.mobile.length === 10 && (
          <div className="text-success small mt-1">✓ Valid phone number</div>
        )}
      </div>

      {/* Address Field */}
      <div className="mb-3">
        <div className="input-group">
          <input
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="form-control px-3 py-2 border-0 "
            placeholder="Address"
          />
        </div>
      </div>

      {/* Update Button */}
      <div className="text-center w-100 px-5">
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update"}
        </button>
      </div>
    </form>
  );
}
