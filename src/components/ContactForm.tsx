import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  User,
  Phone,
  FileText,
  AlertTriangle,
  CircleDashed,
} from "lucide-react";
import Dropdown from "./Dropdown";
import { apiFunctions } from "../services/api";
import Toast from "./Toast";
import type { Contact } from "../types";

interface ContactFormProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedContact: Contact) => void;
  selectedTrip: string;
  isTripExpired: boolean;
}

const ContactForm: React.FC<ContactFormProps> = ({
  contact,
  isOpen,
  onClose,
  onSave,
  selectedTrip,
  isTripExpired,
}) => {
  const [formData, setFormData] = useState<Contact>({
    _id: "",
    name: "",
    phone: "",
    status: "new",
    note: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error" | "warning";
    isVisible: boolean;
  }>({
    message: "",
    type: "error",
    isVisible: false,
  });

  // Update form data when lead prop changes
  useEffect(() => {
    if (contact) {
      setFormData({
        _id: contact._id || "",
        name: contact.name || "",
        phone: contact.phone || "",
        status: contact.status || "new",
        note: contact.note || "",
      });
    } else {
      // Reset form for new lead with default status
      setFormData({
        _id: "",
        name: "",
        phone: "",
        status: "new",
        note: "",
      });
    }
  }, [contact]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleInputChange = (field: keyof Contact, value: string) => {
    // Don't allow changes if trip is expired
    if (isTripExpired) return;

    // Special handling for phone number validation
    if (field === "phone") {
      // Only allow numeric characters and limit to 10 digits
      const numericValue = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({
        ...prev,
        [field]: numericValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const showToast = (
    message: string,
    type: "success" | "error" | "warning" = "error"
  ) => {
    setToast({
      message,
      type,
      isVisible: true,
    });
    // Auto-hide toast after 3 seconds
    setTimeout(() => {
      setToast((prev) => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Don't allow submission if trip is expired
    if (isTripExpired) {
      showToast("Cannot modify leads for expired trips", "error");
      return;
    }

    if (!selectedTrip) {
      showToast("Please select a trip first", "error");
      return;
    }

    // Validate phone number format
    if (formData.phone.length !== 10) {
      showToast("Phone number must be exactly 10 digits", "error");
      return;
    }

    setIsLoading(true);
    try {
      if (contact) {
        // Editing existing lead
        const response = await apiFunctions.updateLead({
          id: contact._id,
          name: formData.name,
          phone: formData.phone,
          note: formData.note || "",
          status: formData.status,
        });

        // Update the lead with the response data
        const updatedContact: Contact = {
          _id: response.data._id || contact._id,
          name: response.data.name,
          phone: response.data.phone,
          status: response.data.status || formData.status,
          assignedTo: response.data.assignedTo,
          note: response.data.note,
        };

        onSave(updatedContact);
        showToast("Lead updated successfully!", "success");
        onClose();
      } else {
        // Adding new lead
        const response = await apiFunctions.createLead({
          name: formData.name,
          phone: formData.phone,
          camp: selectedTrip,
          note: formData.note || "",
        });

        // Create the new lead with the response data
        const newContact: Contact = {
          _id: response.data._id,
          name: response.data.name,
          phone: response.data.phone,
          status: response.data.status || "new",
          assignedTo: response.data.assignedTo,
          note: response.data.note,
        };

        onSave(newContact);
        showToast("Lead added successfully!", "success");
        onClose();
      }
    } catch (error: unknown) {
      console.error("Error saving contact:", error);
      const errorMessage =
        (error as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Failed to save lead. Please try again.";
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = [
    { value: "new", label: "New" },
    { value: "pending", label: "Pending" },
    { value: "waiting for payment", label: "Waiting for payment" },
    { value: "cancelled", label: "Cancelled" },
    { value: "confirmed", label: "Confirmed" },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-t-xl sm:rounded-xl shadow-2xl w-full h-[90vh] sm:h-auto sm:max-w-md sm:max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 sm:bg-white sm:dark:bg-gray-800">
            <div className="flex items-center">
              <div className="h-8 w-8 sm:h-10 sm:w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {contact
                    ? isTripExpired
                      ? "View Lead"
                      : "Edit Lead"
                    : "Add Lead"}
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  {contact
                    ? isTripExpired
                      ? "View lead information (read-only)"
                      : "Update lead information"
                    : "Add new lead information"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 touch-manipulation disabled:opacity-50"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Trip Expired Warning */}
          {isTripExpired && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 mx-4 sm:mx-6 mt-4">
              <div className="flex">
                <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    <strong>Trip Expired:</strong> Read-only mode
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6"
          >
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="h-4 w-4 inline mr-2 text-gray-400 dark:text-gray-500" />
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full px-4 h-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 disabled:bg-gray-100 dark:disabled:bg-gray-800 [&:disabled]:!text-gray-900 dark:[&:disabled]:!text-gray-100"
                placeholder="Enter full name"
                required
                disabled={isLoading || isTripExpired}
              />
            </div>

            {/* Phone Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Phone className="h-4 w-4 inline mr-2 text-gray-400 dark:text-gray-500" />
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="w-full px-4 h-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 disabled:bg-gray-100 dark:disabled:bg-gray-800 [&:disabled]:!text-gray-900 dark:[&:disabled]:!text-gray-100"
                placeholder="Enter 10-digit phone number"
                pattern="[0-9]{10}"
                inputMode="numeric"
                maxLength={10}
                required
                disabled={isLoading || isTripExpired}
              />
              {formData.phone.length > 0 && formData.phone.length < 10 && (
                <p className="text-xs text-red-500 mt-1">
                  Phone number must be exactly 10 digits
                </p>
              )}
            </div>

            {/* Status Field - Only show when editing existing lead */}
            {contact && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <CircleDashed className="h-4 w-4 inline mr-2 text-gray-400 dark:text-gray-500" />
                  Status
                </label>
                <Dropdown
                  options={statusOptions}
                  value={formData.status}
                  onChange={(value) => handleInputChange("status", value)}
                  disabled={isLoading || isTripExpired}
                  className="w-full"
                  placeholder="Select status"
                />
              </div>
            )}

            {/* Note Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FileText className="h-4 w-4 inline mr-2 text-gray-400 dark:text-gray-500" />
                Note
              </label>
              <textarea
                value={formData.note || ""}
                onChange={(e) => handleInputChange("note", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none disabled:bg-gray-100 dark:disabled:bg-gray-800 [&:disabled]:!text-gray-900 dark:[&:disabled]:!text-gray-100"
                placeholder="Enter any additional notes..."
                rows={4}
                disabled={isLoading || isTripExpired}
              />
            </div>
          </form>

          {/* Action Buttons - Fixed at bottom on mobile */}
          <div className="p-4 sm:p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 sm:bg-white sm:dark:bg-gray-800">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-3 sm:py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 font-medium text-base touch-manipulation disabled:opacity-50"
              >
                Cancel
              </button>
              {isTripExpired ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-3 sm:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium flex items-center justify-center gap-2 text-base touch-manipulation"
                >
                  Close
                </button>
              ) : (
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center justify-center gap-2 text-base touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-400 dark:disabled:bg-gray-600"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </>
  );
};

export default ContactForm;
