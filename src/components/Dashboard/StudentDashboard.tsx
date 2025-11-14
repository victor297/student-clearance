import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  getMyRequests,
  createClearanceRequest,
} from "../../store/slices/clearanceSlice";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Upload,
  Eye,
  Paperclip,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const schema = yup.object({
  reason: yup.string().required("Reason is required"),
});

type ClearanceFormData = yup.InferType<typeof schema>;

const StudentDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { myRequests, loading } = useAppSelector((state) => state.clearance);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [showDocuments, setShowDocuments] = useState(false);
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClearanceFormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    dispatch(getMyRequests());
  }, [dispatch]);

  const onSubmit = async (data: ClearanceFormData) => {
    try {
      await dispatch(createClearanceRequest(data)).unwrap();
      reset();
      setShowCreateForm(false);
      dispatch(getMyRequests());
    } catch (error) {
      console.error("Failed to create clearance request:", error);
    }
  };

  const handleDocumentUpload = async () => {
    if (!uploadFiles || !selectedRequest || !selectedDepartment) return;

    setUploading(true);
    const formData = new FormData();

    Array.from(uploadFiles).forEach((file) => {
      formData.append("documents", file);
    });

    formData.append("request_id", selectedRequest._id);
    formData.append("department", selectedDepartment);

    try {
      const response = await fetch(
        " https://student-clearance-i1lk.onrender.com/api/upload/documents",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        setShowUploadModal(false);
        setUploadFiles(null);
        setSelectedDepartment("");
        const message =
          selectedRequest.overall_status === "rejected"
            ? "Documents re-uploaded successfully! Your request has been resubmitted for review."
            : "Documents uploaded successfully!";
        alert(message);
        // Refresh the requests to show updated status
        dispatch(getMyRequests());
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.message}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const fetchDocuments = async (requestId: string) => {
    try {
      const response = await fetch(
        ` https://student-clearance-i1lk.onrender.com/api/upload/documents/${requestId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const docs = await response.json();
        setDocuments(docs);
        setShowDocuments(true);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDepartmentProgress = (request: any) => {
    const departments = [
      "hod",
      "bursary",
      "medical",
      "library",
      "faculty",
      "hostel",
      "alumni",
      "registrar",
    ];
    const progress = departments.map((dept) => ({
      name: dept.toUpperCase(),
      shortName: dept.charAt(0).toUpperCase() + dept.slice(1, 3),
      status: request.departments[dept]?.status || "pending",
      comments: request.departments[dept]?.comments,
    }));

    return progress;
  };

  const toggleRequestExpansion = (requestId: string) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };

  const getDepartmentDisplayName = (dept: string) => {
    const names: { [key: string]: string } = {
      hod: "HOD",
      bursary: "Bursary",
      medical: "Medical",
      library: "Library",
      faculty: "Faculty",
      hostel: "Hostel",
      alumni: "Alumni",
      registrar: "Registrar",
    };
    return names[dept] || dept.toUpperCase();
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Student Dashboard
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              Welcome back, {user?.firstname}! Track your clearance requests
              here.
            </p>
          </div>
          <div className="text-right">
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                user?.is_eligible
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {user?.is_eligible ? "Eligible" : "Not Eligible"}
            </div>
          </div>
        </div>
      </div>

      {/* Eligibility Notice */}
      {!user?.is_eligible && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-yellow-800 text-sm sm:text-base">
              You are currently not eligible for clearance. Please contact your
              academic advisor.
            </p>
          </div>
        </div>
      )}

      {/* Create New Request */}
      {user?.is_eligible && (
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Clearance Requests
            </h2>
            {!myRequests.some((req) => req.overall_status === "pending") && (
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm sm:text-base w-full sm:w-auto"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                New Request
              </button>
            )}
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <div className="border border-gray-200 rounded-lg p-4 sm:p-6 mb-6 bg-gray-50">
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4">
                  <label
                    htmlFor="reason"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Reason for Clearance
                  </label>
                  <textarea
                    {...register("reason")}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    placeholder="Please specify the reason for your clearance request (e.g., Graduation, Transfer, etc.)"
                  />
                  {errors.reason && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.reason.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors duration-200 text-sm sm:text-base order-2 sm:order-1"
                  >
                    {loading ? "Submitting..." : "Submit Request"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200 text-sm sm:text-base order-1 sm:order-2"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Requests List */}
          <div className="space-y-4 sm:space-y-6">
            {myRequests.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
                  No clearance requests yet
                </h3>
                <p className="text-gray-500 text-sm sm:text-base">
                  {user?.is_eligible
                    ? "Create your first clearance request to get started."
                    : "You need to be eligible to create a clearance request."}
                </p>
              </div>
            ) : (
              myRequests.map((request) => (
                <div
                  key={request._id}
                  className="border border-gray-200 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow duration-200"
                >
                  {/* Request Header - Mobile Collapsible */}
                  <div
                    className="flex items-start justify-between mb-4 cursor-pointer sm:cursor-auto"
                    onClick={() => toggleRequestExpansion(request._id)}
                  >
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      {getStatusIcon(request.overall_status)}
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                          Request #{request._id.slice(-6)}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          Submitted on {formatDate(request.submitted_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1 ml-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          request.overall_status
                        )}`}
                      >
                        {request.overall_status.toUpperCase()}
                      </span>
                      {request.overall_status === "pending" && (
                        <span className="text-xs text-gray-600 hidden sm:block">
                          Current: {request.current_stage?.toUpperCase()}
                        </span>
                      )}
                      <button className="sm:hidden text-gray-400 mt-1">
                        {expandedRequest === request._id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Content for Mobile */}
                  <div
                    className={`${
                      expandedRequest === request._id ? "block" : "hidden"
                    } sm:block`}
                  >
                    {/* Current Stage for Mobile */}
                    {request.overall_status === "pending" && (
                      <div className="sm:hidden mb-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <span className="font-medium">Current Stage:</span>{" "}
                          {getDepartmentDisplayName(request.current_stage)}
                        </p>
                      </div>
                    )}

                    {/* Department Progress */}
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
                      {getDepartmentProgress(request).map((dept, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 p-2 sm:p-3 bg-gray-50 rounded-lg"
                        >
                          {getStatusIcon(dept.status)}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                              <span className="hidden sm:inline">
                                {dept.name}
                              </span>
                              <span className="sm:hidden">
                                {dept.shortName}
                              </span>
                            </p>
                            <p
                              className={`text-xs ${getStatusColor(
                                dept.status
                              )}`}
                            >
                              {dept.status.toUpperCase()}
                            </p>
                            {dept.comments && (
                              <p className="text-xs text-gray-600 mt-1 truncate">
                                {dept.comments}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mt-4 sm:mt-6 pt-4 border-t border-gray-200 gap-3">
                      <div className="flex-1">
                        {request.reason && (
                          <p className="text-sm text-gray-600 mb-3 sm:mb-0">
                            <span className="font-medium">Reason:</span>{" "}
                            {request.reason}
                          </p>
                        )}
                        {request.overall_status === "rejected" && (
                          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800 font-medium">
                              Request Rejected
                            </p>
                            <p className="text-xs text-red-600 mt-1">
                              You can upload additional documents or create a
                              new request
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                        <button
                          onClick={() => fetchDocuments(request._id)}
                          className="inline-flex items-center justify-center px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors duration-200 text-sm order-2 sm:order-1"
                        >
                          <Paperclip className="h-4 w-4 mr-1" />
                          Documents
                        </button>
                        {(request.overall_status === "pending" ||
                          request.overall_status === "rejected") && (
                          <button
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowUploadModal(true);
                            }}
                            className="inline-flex items-center justify-center px-3 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-sm order-1 sm:order-2"
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            {request.overall_status === "rejected"
                              ? "Re-upload"
                              : "Upload"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Upload Documents Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
          <div className="relative top-10 sm:top-20 mx-auto p-4 sm:p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedRequest?.overall_status === "rejected"
                  ? "Re-upload Documents"
                  : "Upload Documents"}
              </h3>
              {selectedRequest?.overall_status === "rejected" && (
                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Your clearance was rejected. Upload additional or corrected
                    documents to support your request.
                  </p>
                </div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  >
                    <option value="">Select Department</option>
                    <option value="hod">Head of Department (HOD)</option>
                    <option value="medical">Medical</option>
                    <option value="library">Library</option>
                    <option value="faculty">Faculty</option>
                    <option value="bursary">Bursary</option>
                    <option value="hostel">Hostel</option>
                    <option value="alumni">Alumni</option>
                    <option value="registrar">Registrar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Select Files
                  </label>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => setUploadFiles(e.target.files)}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Supported: PDF, JPG, PNG, DOC, DOCX (Max 10 files)
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadFiles(null);
                    setSelectedDepartment("");
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm sm:text-base order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDocumentUpload}
                  disabled={!uploadFiles || !selectedDepartment || uploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base order-1 sm:order-2"
                >
                  {uploading
                    ? "Uploading..."
                    : selectedRequest?.overall_status === "rejected"
                    ? "Re-upload"
                    : "Upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Documents Modal */}
      {showDocuments && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
          <div className="relative top-4 sm:top-10 mx-auto p-4 sm:p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Uploaded Documents
                </h3>
                <button
                  onClick={() => setShowDocuments(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {documents.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No documents uploaded yet
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {documents.map((doc) => (
                      <div
                        key={doc._id}
                        className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {doc.original_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {doc.department.toUpperCase()} •{" "}
                              {(doc.file_size / 1024).toFixed(1)} KB
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(doc.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3">
                          <a
                            href={` https://student-clearance-i1lk.onrender.com${doc.file_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-xs sm:text-sm w-full sm:w-auto"
                          >
                            <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Download
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
