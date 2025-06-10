import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './HistoryPage.css'; // Shared styles for history pages

const UsageHistoryPage = () => {
  const [usage, setUsage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  const fetchUsageHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch('http://localhost:5000/api/usage/history', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch usage history.');
      }

      const data = await response.json();
      setUsage(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchUsageHistory();
  }, [fetchUsageHistory]);

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp._seconds) return 'N/A';
    return new Date(timestamp._seconds * 1000).toLocaleString();
  };

  return (
    <div className="history-container">
      <h1 className="history-header">Usage History</h1>
      {loading && <p>Loading history...</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && !error && (
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Quantity Used</th>
                <th>Unit</th>
                <th>Department</th>
                <th>Usage Date</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {usage.length > 0 ? (
                usage.map(record => (
                  <tr key={record.id}>
                    <td>{record.itemName}</td>
                    <td>{record.quantity}</td>
                    <td>{record.unit}</td>
                    <td>{record.department}</td>
                    <td>{formatDate(record.usageDate)}</td>
                    <td>{record.recordedByEmail}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No usage records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsageHistoryPage;
