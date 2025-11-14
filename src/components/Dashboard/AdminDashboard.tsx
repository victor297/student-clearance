import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  getAllUsers,
  updateUserRole,
  updateUserEligibility,
  deleteUser,
} from "../../store/slices/userSlice";
import { getAllRequests } from "../../store/slices/clearanceSlice";
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Settings,
  Upload,
  Download,
  Plus,
  CreditCard as Edit,
  Trash2,
  Shield,
  UserCheck,
  AlertTriangle,
} from "lucide-react";

const AdminDashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { users, loading: usersLoading } = useAppSelector(
    (state) => state.user
  );
  const { requests, loading: requestsLoading } = useAppSelector(
    (state) => state.clearance
  );
  const [activeTab, setActiveTab] = useState("overview");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(getAllRequests());
  }, [dispatch]);

  const getStats = () => {
    const totalUsers = users.length;
    const students = users.filter((u) => u.role === "student");
    const officers = users.filter((u) => u.role === "officer");
    const admins = users.filter((u) => u.role === "admin");

    const totalRequests = requests.length;
    const pendingRequests = requests.filter(
      (r) => r.overall_status === "pending"
    );
    const approvedRequests = requests.filter(
      (r) => r.overall_status === "approved"
    );
    const rejectedRequests = requests.filter(
      (r) => r.overall_status === "rejected"
    );

    return {
      totalUsers,
      students: students.length,
      officers: officers.length,
      admins: admins.length,
      eligibleStudents: students.filter((s) => s.is_eligible).length,
      totalRequests,
      pendingRequests: pendingRequests.length,
      approvedRequests: approvedRequests.length,
      rejectedRequests: rejectedRequests.length,
    };
  };

  const stats = getStats();

  const handleFileUpload = async (type: "students" | "eligible") => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("excel", selectedFile);

    try {
      const endpoint =
        type === "students" ? "/api/upload/students" : "/api/upload/eligible";
      const response = await fetch(
        ` https://student-clearance-i1lk.onrender.com${endpoint}`,
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

      // Refresh data
      dispatch(getAllUsers());
      setShowUploadModal(false);
      setSelectedFile(null);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleRoleUpdate = async (
    userId: string,
    role: string,
    officerDepartment?: string
  ) => {
    try {
      await dispatch(
        updateUserRole({ userId, role, officer_department: officerDepartment })
      ).unwrap();
      dispatch(getAllUsers());
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const handleEligibilityToggle = async (
    userId: string,
    currentEligibility: boolean
  ) => {
    try {
      await dispatch(
        updateUserEligibility({
          userId,
          is_eligible: !currentEligibility,
        })
      ).unwrap();
      dispatch(getAllUsers());
    } catch (error) {
      console.error("Failed to update eligibility:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await dispatch(deleteUser(userId)).unwrap();
        dispatch(getAllUsers());
      } catch (error) {
        console.error("Failed to delete user:", error);
      }
    }
  };

  const [showCreateOfficerModal, setShowCreateOfficerModal] = useState(false);
  const [createOfficerData, setCreateOfficerData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    department: "",
    officer_department: "",
  });

  const handleCreateOfficer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(
        " https://student-clearance-i1lk.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            ...createOfficerData,
            role: "officer",
            password: createOfficerData.lastname.toLowerCase(),
          }),
        }
      );

      if (response.ok) {
        setShowCreateOfficerModal(false);
        setCreateOfficerData({
          firstname: "",
          lastname: "",
          email: "",
          department: "",
          officer_department: "",
        });
        dispatch(getAllUsers());
        alert("Officer created successfully!");
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Failed to create officer:", error);
      alert("Failed to create officer");
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalUsers}
              </p>
            </div>
            <Users className="h-12 w-12 text-blue-500" />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {stats.students} students, {stats.officers} officers, {stats.admins}{" "}
            admins
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Requests
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalRequests}
              </p>
            </div>
            <FileText className="h-12 w-12 text-green-500" />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {stats.pendingRequests} pending, {stats.approvedRequests} approved
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Pending Reviews
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.pendingRequests}
              </p>
            </div>
            <Clock className="h-12 w-12 text-yellow-500" />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Awaiting officer approval
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Eligible Students
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.eligibleStudents}
              </p>
            </div>
            <UserCheck className="h-12 w-12 text-purple-500" />
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Out of {stats.students} total students
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors duration-200"
          >
            <div className="text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">
                Upload Students
              </p>
              <p className="text-xs text-gray-500">Bulk import via Excel</p>
            </div>
          </button>

          <button
            onClick={() => setShowCreateOfficerModal(true)}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors duration-200"
          >
            <div className="text-center">
              <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">
                Create Officer
              </p>
              <p className="text-xs text-gray-500">Add new officer</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab("users")}
            className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors duration-200"
          >
            <div className="text-center">
              <Settings className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Manage Users</p>
              <p className="text-xs text-gray-500">Roles & permissions</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Requests
        </h3>
        <div className="space-y-4">
          {requests.slice(0, 5).map((request) => (
            <div
              key={request._id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {request.overall_status === "pending" ? (
                  <Clock className="h-5 w-5 text-yellow-500" />
                ) : request.overall_status === "approved" ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {request.student_id?.firstname}{" "}
                    {request.student_id?.lastname}
                  </p>
                  <p className="text-xs text-gray-500">
                    {request.student_id?.department} •{" "}
                    {new Date(request.submitted_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  request.overall_status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : request.overall_status === "approved"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {request.overall_status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            User Management
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Users
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Eligibility
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {user.firstname[0]}
                          {user.lastname[0]}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.firstname} {user.lastname}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-red-100 text-red-800"
                        : user.role === "officer"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {user.role.toUpperCase()}
                  </span>
                  {user.officer_department && (
                    <div className="text-xs text-gray-500 mt-1">
                      {user.officer_department.toUpperCase()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.role === "student" ? (
                    <button
                      onClick={() =>
                        handleEligibilityToggle(user._id, user.is_eligible)
                      }
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                        user.is_eligible
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-red-100 text-red-800 hover:bg-red-200"
                      }`}
                    >
                      {user.is_eligible ? "ELIGIBLE" : "NOT ELIGIBLE"}
                    </button>
                  ) : (
                    <span className="text-sm text-gray-500">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Edit user"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete user"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRequests = () => (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          All Clearance Requests
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Stage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submitted
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.map((request) => (
              <tr key={request._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {request.student_id?.firstname}{" "}
                    {request.student_id?.lastname}
                  </div>
                  <div className="text-sm text-gray-500">
                    {request.student_id?.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {request.student_id?.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      request.overall_status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : request.overall_status === "approved"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {request.overall_status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {request.current_stage?.toUpperCase() || "COMPLETED"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(request.submitted_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Manage users, oversee clearance requests, and system
              administration
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-red-500" />
            <span className="text-sm font-medium text-red-600">
              ADMINISTRATOR
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "users"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "requests"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Requests
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && renderOverview()}
      {activeTab === "users" && renderUsers()}
      {activeTab === "requests" && renderRequests()}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900">
                Upload Excel File
              </h3>
              <div className="mt-4">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Excel format: StudentID, FirstName, LastName, Email,
                  Department, CGPA
                </p>
              </div>
              <div className="mt-6 flex justify-center space-x-3">
                <button
                  onClick={() => handleFileUpload("students")}
                  disabled={!selectedFile}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Upload Students
                </button>
                <button
                  onClick={() => handleFileUpload("eligible")}
                  disabled={!selectedFile}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Eligibility
                </button>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Officer Modal */}
      {showCreateOfficerModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Create New Officer
              </h3>
              <form onSubmit={handleCreateOfficer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    required
                    value={createOfficerData.firstname}
                    onChange={(e) =>
                      setCreateOfficerData({
                        ...createOfficerData,
                        firstname: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    required
                    value={createOfficerData.lastname}
                    onChange={(e) =>
                      setCreateOfficerData({
                        ...createOfficerData,
                        lastname: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={createOfficerData.email}
                    onChange={(e) =>
                      setCreateOfficerData({
                        ...createOfficerData,
                        email: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Academic Department
                  </label>
                  <input
                    type="text"
                    required
                    value={createOfficerData.department}
                    onChange={(e) =>
                      setCreateOfficerData({
                        ...createOfficerData,
                        department: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Computer Science, Engineering"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Officer Department
                  </label>
                  <select
                    required
                    value={createOfficerData.officer_department}
                    onChange={(e) =>
                      setCreateOfficerData({
                        ...createOfficerData,
                        officer_department: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Officer Department</option>
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
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateOfficerModal(false);
                      setCreateOfficerData({
                        firstname: "",
                        lastname: "",
                        email: "",
                        department: "",
                        officer_department: "",
                      });
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Create Officer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
