import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './HistoryPage.css'; // Shared styles for history pages

const PurchaseHistoryPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  const fetchPurchaseHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch('http://localhost:5000/api/purchases/history', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch purchase history.');
      }

      const data = await response.json();
      setPurchases(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchPurchaseHistory();
  }, [fetchPurchaseHistory]);

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp._seconds) return 'N/A';
    return new Date(timestamp._seconds * 1000).toLocaleString();
  };

  return (
    <div className="history-container">
      <h1 className="history-header">Purchase History</h1>
      {loading && <p>Loading history...</p>}
      {error && <p className="form-error">{error}</p>}
      {!loading && !error && (
        <div className="history-table-container">
          <table className="history-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Price (Total)</th>
                <th>Purchase Date</th>
                <th>Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {purchases.length > 0 ? (
                purchases.map(purchase => (
                  <tr key={purchase.id}>
                    <td>{purchase.itemName}</td>
                    <td>{purchase.quantity}</td>
                    <td>{purchase.unit}</td>
                    <td>₹{purchase.price.toFixed(2)}</td>
                    <td>{formatDate(purchase.purchaseDate)}</td>
                    <td>{purchase.recordedByEmail}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No purchase records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PurchaseHistoryPage;
