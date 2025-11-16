'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface DMCAReport {
  id: string;
  reporterName: string;
  reporterEmail: string;
  copyrightOwner: string;
  workDescription: string;
  infringingUrl: string;
  contentType: string | null;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
}

export default function AdminDMCADashboard() {
  const [reports, setReports] = useState<DMCAReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const url = filter === 'ALL'
        ? '/api/legal/dmca/report'
        : `/api/legal/dmca/report?status=${filter}`;

      const response = await fetch(url);
      const data = await response.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to mark this report as ${newStatus}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/dmca/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, status: newStatus }),
      });

      if (response.ok) {
        alert('Report status updated successfully');
        fetchReports();
      } else {
        alert('Failed to update report status');
      }
    } catch (error) {
      console.error('Error updating report:', error);
      alert('An error occurred');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800';
      case 'CONTENT_REMOVED':
        return 'bg-red-100 text-red-800';
      case 'DISMISSED':
        return 'bg-gray-100 text-gray-800';
      case 'COUNTER_NOTICE_RECEIVED':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getResponseTime = (createdAt: string) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    return created.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">DMCA Reports Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage copyright infringement reports</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            {['ALL', 'PENDING', 'UNDER_REVIEW', 'CONTENT_REMOVED', 'DISMISSED', 'COUNTER_NOTICE_RECEIVED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600 text-sm">Pending Review</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">
              {reports.filter(r => r.status === 'PENDING').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600 text-sm">Under Review</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {reports.filter(r => r.status === 'UNDER_REVIEW').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600 text-sm">Content Removed</p>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {reports.filter(r => r.status === 'CONTENT_REMOVED').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p className="text-gray-600 text-sm">Dismissed</p>
            <p className="text-3xl font-bold text-gray-600 mt-2">
              {reports.filter(r => r.status === 'DISMISSED').length}
            </p>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No reports found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reporter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Infringing URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{report.reporterName}</div>
                        <div className="text-sm text-gray-500">{report.reporterEmail}</div>
                        {report.copyrightOwner !== report.reporterName && (
                          <div className="text-xs text-gray-400">On behalf of: {report.copyrightOwner}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          <a href={report.infringingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {report.infringingUrl}
                          </a>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">{report.workDescription}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600">
                          {report.contentType || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                          {report.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getResponseTime(report.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex flex-col gap-1">
                          {report.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(report.id, 'UNDER_REVIEW')}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                              >
                                Review
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(report.id, 'DISMISSED')}
                                className="text-gray-600 hover:text-gray-700 font-medium"
                              >
                                Dismiss
                              </button>
                            </>
                          )}
                          {report.status === 'UNDER_REVIEW' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(report.id, 'CONTENT_REMOVED')}
                                className="text-red-600 hover:text-red-700 font-medium"
                              >
                                Remove Content
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(report.id, 'DISMISSED')}
                                className="text-gray-600 hover:text-gray-700 font-medium"
                              >
                                Dismiss
                              </button>
                            </>
                          )}
                          <Link
                            href={`/admin/legal/dmca/${report.id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium"
                          >
                            View Details
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
