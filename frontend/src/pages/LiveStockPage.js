import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './LiveStockPage.css';

function LiveStockPage() {
  const { currentUser } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch('http://localhost:5000/api/inventory', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to fetch inventory.');
      }

      const data = await response.json();
      setInventory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const getStockLevelClass = (quantity) => {
    if (quantity <= 5) return 'stock-low';
    if (quantity <= 20) return 'stock-medium';
    return 'stock-high';
  };

  return (
    <div className="livestock-container">
      <div className="livestock-header">
        <h2>Live Inventory Stock</h2>
        <button onClick={fetchInventory} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'
        }</button>
      </div>

      {error && <p className="error-message">{error}</p>}
      
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Current Quantity</th>
              <th>Unit</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {loading && inventory.length === 0 ? (
              <tr><td colSpan="4">Loading stock data...</td></tr>
            ) : inventory.length > 0 ? (
              inventory.map(item => (
                <tr key={item.id}>
                  <td>{item.itemName}</td>
                  <td>
                    <span className={`stock-indicator ${getStockLevelClass(item.quantity)}`}>
                      {item.quantity.toFixed(2)} 
                    </span>
                  </td>
                  <td>{item.unit}</td>
                                    <td>
                    {item.lastUpdatedAt && item.lastUpdatedAt._seconds 
                      ? new Date(item.lastUpdatedAt._seconds * 1000).toLocaleString()
                      : 'N/A'}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4">No inventory items found. Start by recording a purchase.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LiveStockPage;
