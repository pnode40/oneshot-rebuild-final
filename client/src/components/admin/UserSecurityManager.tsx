import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaSearch, 
  FaFilter, 
  FaExclamationTriangle,
  FaCheckCircle,
  FaTimesCircle,
  FaSync,
  FaKey,
  FaLock,
  FaUnlock,
  FaEye,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  lastLogin: string | null;
  isActive: boolean;
  passwordLastChanged: string;
  securityStatus: {
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    hasWeakPassword: boolean;
    requiresPasswordReset: boolean;
    suspiciousActivity: boolean;
    mfaEnabled: boolean;
    accountLocked: boolean;
  };
  recommendations: string[];
}

interface UserSecurityManagerProps {
  onRefresh?: () => void;
}

export const UserSecurityManager: React.FC<UserSecurityManagerProps> = ({ onRefresh }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Bulk actions
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(riskFilter !== 'all' && { riskLevel: riskFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`/api/security-dashboard/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data.data.users);
      setTotalUsers(data.data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, riskFilter, statusFilter]);

  const handleRefresh = () => {
    fetchUsers();
    onRefresh?.();
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;

    try {
      setBulkActionLoading(true);
      
      const response = await fetch('/api/security-dashboard/users/bulk-action', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          action
        }),
      });

      if (!response.ok) {
        throw new Error(`Bulk action failed: ${response.status}`);
      }

      // Refresh the list
      fetchUsers();
      setSelectedUsers([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bulk action failed');
    } finally {
      setBulkActionLoading(false);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case 'critical': return <FaTimesCircle className="h-4 w-4 text-red-500" />;
      case 'high': return <FaExclamationTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <FaExclamationTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <FaCheckCircle className="h-4 w-4 text-green-500" />;
      default: return <FaCheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const totalPages = Math.ceil(totalUsers / pageSize);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSync className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg text-gray-600">Loading users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <FaTimesCircle className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error Loading Users</h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-3 text-sm bg-red-100 text-red-800 px-3 py-1 rounded hover:bg-red-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">User Security Management</h2>
        <button
          onClick={handleRefresh}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <FaSync className="h-4 w-4 mr-1" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Risk Level Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Risk Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="locked">Locked</option>
            <option value="weak-password">Weak Password</option>
            <option value="reset-required">Reset Required</option>
          </select>

          {/* Bulk Actions */}
          <div className="flex space-x-2">
            {selectedUsers.length > 0 && (
              <>
                <button
                  onClick={() => handleBulkAction('force-password-reset')}
                  disabled={bulkActionLoading}
                  className="px-3 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  Force Reset
                </button>
                <button
                  onClick={() => handleBulkAction('unlock-accounts')}
                  disabled={bulkActionLoading}
                  className="px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Unlock
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
              <span className="font-medium">{Math.min(currentPage * pageSize, totalUsers)}</span> of{' '}
              <span className="font-medium">{totalUsers}</span> users
            </p>
            
            {users.length > 0 && (
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length}
                  onChange={selectAllUsers}
                  className="mr-2"
                />
                Select All
              </label>
            )}
          </div>
        </div>

        <ul className="divide-y divide-gray-200">
          {users.map((user) => (
            <li key={user.id} className={`px-4 py-4 hover:bg-gray-50 ${selectedUsers.includes(user.id) ? 'bg-blue-50' : ''}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.id)}
                    onChange={() => toggleUserSelection(user.id)}
                    className="mr-3"
                  />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      
                      {/* Risk Level Badge */}
                      <div className="flex items-center space-x-1">
                        {getRiskLevelIcon(user.securityStatus.riskLevel)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRiskLevelColor(user.securityStatus.riskLevel)}`}>
                          {user.securityStatus.riskLevel}
                        </span>
                      </div>
                    </div>
                    
                    {/* Security Status Indicators */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {user.securityStatus.hasWeakPassword && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                          <FaKey className="h-3 w-3 mr-1" />
                          Weak Password
                        </span>
                      )}
                      
                      {user.securityStatus.requiresPasswordReset && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                          <FaExclamationTriangle className="h-3 w-3 mr-1" />
                          Reset Required
                        </span>
                      )}
                      
                      {user.securityStatus.accountLocked && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                          <FaLock className="h-3 w-3 mr-1" />
                          Locked
                        </span>
                      )}
                      
                      {!user.securityStatus.mfaEnabled && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                          <FaUnlock className="h-3 w-3 mr-1" />
                          No MFA
                        </span>
                      )}
                      
                      {user.securityStatus.suspiciousActivity && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                          <FaExclamationTriangle className="h-3 w-3 mr-1" />
                          Suspicious Activity
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-1 text-xs text-gray-500">
                      Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'} | 
                      Password changed: {new Date(user.passwordLastChanged).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    <FaEye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        
        {users.length === 0 && (
          <div className="text-center py-12">
            <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Page <span className="font-medium">{currentPage}</span> of{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <FaChevronLeft className="h-4 w-4" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === currentPage
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <FaChevronRight className="h-4 w-4" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 