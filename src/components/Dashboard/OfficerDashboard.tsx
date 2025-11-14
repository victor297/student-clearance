import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  getPendingRequests,
  updateRequestStatus,
} from "../../store/slices/clearanceSlice";
import { useForm } from "react-hook-form";
import {
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  User,
  Calendar,
  MessageSquare,
  Filter,
  Download,
  Upload,
  Eye,
  Paperclip,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface ReviewFormData {
  status: "approved" | "rejected";
  comments: string;
}

const OfficerDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { pendingRequests, loading } = useAppSelector(
    (state) => state.clearance
  );
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [showDocuments, setShowDocuments] = useState(false);
  const [selectedRequestForDocs, setSelectedRequestForDocs] = useState<
    string | null
  >(null);
  const [submitting, setSubmitting] = useState(false);

  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);

  const { register, handleSubmit, reset, watch } = useForm<ReviewFormData>();
  const watchStatus = watch("status");

  useEffect(() => {
    dispatch(getPendingRequests());
  }, [dispatch]);

  const onSubmit = async (data: ReviewFormData) => {
    if (!selectedRequest) return;
    setSubmitting(true); // Start loading

    try {
      await dispatch(
        updateRequestStatus({
          requestId: selectedRequest,
          status: data.status,
          comments: data.comments,
        })
      ).unwrap();

      reset();
      setSelectedRequest(null);
      dispatch(getPendingRequests());
    } catch (error) {
      console.error("Failed to update request status:", error);
    } finally {
      setSubmitting(false); // Stop loading
    }
  };
  const handleEligibleListUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("excel", selectedFile);

    try {
      const response = await fetch(
        "https://student-clearance-i1lk.onrender.com/api/upload/eligible",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      const result = await response.json();
      console.log("Upload result:", result);

      setShowUploadModal(false);
      setSelectedFile(null);
      alert(`Upload completed! ${result.results.success} students updated.`);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed");
    }
  };

  const fetchDocuments = async (requestId: string) => {
    try {
      const response = await fetch(
        ` https://student-clearance-i1lk.onrender.com/api/upload/documents/${requestId}?department=${user?.officer_department}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.ok) {
        const docs = await response.json();
        setDocuments(docs);
        setSelectedRequestForDocs(requestId);
        setShowDocuments(true);
      }
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDepartmentDisplayName = (dept: string) => {
    const names: { [key: string]: string } = {
      hod: "Head of Department",
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

  const getProgressSteps = () => {
    const allSteps = [
      "hod",
      "bursary",
      "medical",
      "library",
      "faculty",
      "hostel",
      "alumni",
      "registrar",
    ];
    const currentIndex = allSteps.indexOf(user?.officer_department || "");
    return allSteps.map((step, index) => ({
      name: getDepartmentDisplayName(step),
      shortName: step.charAt(0).toUpperCase() + step.slice(1, 3),
      status:
        index < currentIndex
          ? "completed"
          : index === currentIndex
          ? "current"
          : "upcoming",
    }));
  };

  const filteredRequests = pendingRequests.filter((request) => {
    if (filterStatus === "all") return true;
    return request.current_stage === filterStatus;
  });

  const toggleRequestExpansion = (requestId: string) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Officer Dashboard
            </h1>
            <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
              {getDepartmentDisplayName(user?.officer_department || "")}{" "}
              Department
            </p>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-4">
            <div className="text-center sm:text-right">
              <p className="text-xs sm:text-sm text-gray-500">Pending</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">
                {pendingRequests.length}
              </p>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm"
            >
              <Upload className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Upload Eligible List</span>
              <span className="sm:hidden">Upload</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
          Clearance Process
        </h2>
        <div className="hidden sm:flex items-center justify-between">
          {getProgressSteps().map((step, index) => (
            <div key={index} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full ${
                  step.status === "completed"
                    ? "bg-green-500 text-white"
                    : step.status === "current"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {step.status === "completed" ? (
                  <CheckCircle className="h-6 w-6" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              <div className="ml-3">
                <p
                  className={`text-sm font-medium ${
                    step.status === "current"
                      ? "text-blue-600"
                      : "text-gray-600"
                  }`}
                >
                  {step.name}
                </p>
              </div>
              {index < getProgressSteps().length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    step.status === "completed" ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Mobile Progress Steps */}
        <div className="sm:hidden">
          <div className="flex justify-between items-center mb-4">
            {getProgressSteps().map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    step.status === "completed"
                      ? "bg-green-500 text-white"
                      : step.status === "current"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step.status === "completed" ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
                <span className="text-xs mt-1 text-center font-medium">
                  {step.shortName}
                </span>
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-blue-600 font-medium">
            {getDepartmentDisplayName(user?.officer_department || "")}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Pending Requests
          </h2>
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value={user?.officer_department}>My Department</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4 sm:space-y-6">
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-3 sm:mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">
              Loading requests...
            </p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
            <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
              No pending requests
            </h3>
            <p className="text-gray-500 text-sm sm:text-base">
              All clearance requests for your department have been processed.
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-4 sm:p-6">
                {/* Request Header - Mobile Collapsible */}
                <div
                  className="flex items-start justify-between mb-4 cursor-pointer sm:cursor-auto"
                  onClick={() => toggleRequestExpansion(request._id)}
                >
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex-shrink-0">
                      <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        {request.student_id?.firstname}{" "}
                        {request.student_id?.lastname}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-xs sm:text-sm text-gray-500 mt-1 space-y-1 sm:space-y-0">
                        <span className="truncate">
                          {request.student_id?.email}
                        </span>
                        <span className="hidden sm:inline">•</span>
                        <span>{request.student_id?.department}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>ID: {request.student_id?.student_id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1 ml-2">
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">
                        {formatDate(request.submitted_at)}
                      </span>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      <Clock className="h-3 w-3 mr-1" />
                      PENDING
                    </span>
                    <button className="sm:hidden text-gray-400">
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
                  {/* Student Details for Mobile */}
                  <div className="sm:hidden grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
                    <div>
                      <span className="font-medium">Student ID:</span>{" "}
                      {request.student_id?.student_id}
                    </div>
                    <div>
                      <span className="font-medium">Department:</span>{" "}
                      {request.student_id?.department}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium">Submitted:</span>{" "}
                      {formatDate(request.submitted_at)}
                    </div>
                  </div>

                  {/* Request Details */}
                  {request.reason && (
                    <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-900">
                          Reason:
                        </span>{" "}
                        {request.reason}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-gray-200 gap-3">
                    <div className="flex space-x-2 order-2 sm:order-1">
                      <button
                        onClick={() => fetchDocuments(request._id)}
                        className="inline-flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-200 text-sm flex-1 sm:flex-none"
                      >
                        <Paperclip className="h-4 w-4 mr-1" />
                        Documents
                      </button>
                    </div>
                    <div className="flex space-x-2 order-1 sm:order-2">
                      <button
                        onClick={() =>
                          setSelectedRequest(
                            selectedRequest === request._id ? null : request._id
                          )
                        }
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm flex-1 sm:flex-none"
                      >
                        {selectedRequest === request._id ? "Cancel" : "Review"}
                      </button>
                    </div>
                  </div>

                  {/* Review Form */}
                  {selectedRequest === request._id && (
                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200">
                      <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-4"
                      >
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Decision
                          </label>
                          <div className="flex space-x-4">
                            <label className="flex items-center flex-1">
                              <input
                                {...register("status", { required: true })}
                                type="radio"
                                value="approved"
                                className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                              />
                              <span className="ml-2 text-sm text-gray-700 flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                                Approve
                              </span>
                            </label>
                            <label className="flex items-center flex-1">
                              <input
                                {...register("status", { required: true })}
                                type="radio"
                                value="rejected"
                                className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                              />
                              <span className="ml-2 text-sm text-gray-700 flex items-center">
                                <XCircle className="h-4 w-4 text-red-500 mr-1" />
                                Reject
                              </span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label
                            htmlFor="comments"
                            className="block text-sm font-medium text-gray-700 mb-2"
                          >
                            Comments{" "}
                            {watchStatus === "rejected" && (
                              <span className="text-red-500">*</span>
                            )}
                          </label>
                          <div className="relative">
                            <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <textarea
                              {...register("comments", {
                                required: watchStatus === "rejected",
                              })}
                              rows={3}
                              className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder={
                                watchStatus === "rejected"
                                  ? "Please provide a reason for rejection..."
                                  : "Add any comments or notes (optional)..."
                              }
                            />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedRequest(null);
                              reset();
                            }}
                            disabled={submitting}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition disabled:opacity-50"
                          >
                            Cancel
                          </button>

                          <button
                            type="submit"
                            disabled={submitting || !watchStatus}
                            className={`px-6 py-2 text-white rounded-md transition duration-200 flex items-center justify-center
                ${
                  watchStatus === "approved"
                    ? "bg-green-600 hover:bg-green-700"
                    : watchStatus === "rejected"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-gray-400 cursor-not-allowed"
                }
                ${submitting ? "opacity-75 cursor-wait" : ""}
              `}
                          >
                            {submitting ? (
                              <>
                                <svg
                                  className="animate-spin h-4 w-4 mr-2 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                  ></path>
                                </svg>
                                Processing...
                              </>
                            ) : (
                              "Submit Review"
                            )}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Eligible List Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
          <div className="relative top-10 sm:top-20 mx-auto p-4 sm:p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Upload Eligible Students
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Excel File
                  </label>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) =>
                      setSelectedFile(e.target.files?.[0] || null)
                    }
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Excel format: StudentID, Email (one per row)
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 text-sm sm:text-base order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEligibleListUpload}
                  disabled={!selectedFile}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base order-1 sm:order-2"
                >
                  Upload
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
                  Documents ({user?.officer_department?.toUpperCase()})
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
                    No documents uploaded for{" "}
                    {user?.officer_department?.toUpperCase()} department yet
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
                            {doc.student_id && (
                              <p className="text-xs text-gray-600 truncate">
                                By: {doc.student_id.firstname}{" "}
                                {doc.student_id.lastname}
                              </p>
                            )}
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
                            View/Download
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

export default OfficerDashboard;
