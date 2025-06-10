import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './UsageEntryPage.css'; // Reusing similar styles

function UsageEntryPage() {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: '',
    unit: 'kg',
    usageDate: new Date().toISOString().split('T')[0], // Default to today
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [fetchError, setFetchError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const token = await currentUser.getIdToken();
      const body = {
        ...formData,
        quantity: parseFloat(formData.quantity),
      };

      const response = await fetch('http://localhost:5000/api/usage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit usage.');
      }

      setSuccess(`Success! Usage recorded with ID: ${result.usageId}`);
      // Reset form
      setFormData({
        itemName: '',
        quantity: '',
        unit: 'kg',
        usageDate: new Date().toISOString().split('T')[0],
        notes: '',
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchInventoryItems = useCallback(async () => {
    setFetchError(null);
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch('http://localhost:5000/api/inventory', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Could not fetch inventory items.');
      }
      const data = await response.json();
      setInventoryItems(data);
      // Set default item if list is not empty
      if (data.length > 0) {
        setFormData(prev => ({ ...prev, itemName: data[0].itemName, unit: data[0].unit }));
      }
    } catch (err) {
      setFetchError(err.message);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchInventoryItems();
  }, [fetchInventoryItems]);

  // Update unit when item selection changes
  const handleItemChange = (e) => {
    const selectedItemName = e.target.value;
    const selectedItem = inventoryItems.find(item => item.itemName === selectedItemName);
    if (selectedItem) {
      setFormData(prev => ({ ...prev, itemName: selectedItem.itemName, unit: selectedItem.unit }));
    }
  };

  return (
    <div className="usage-entry-container">
      <form onSubmit={handleSubmit} className="usage-form">
        <h2>Record Daily Usage</h2>
        
        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}

                <div className="form-group">
          <label htmlFor="itemName">Item Name</label>
          {fetchError ? (
            <p className='form-error'>{fetchError}</p>
          ) : inventoryItems.length > 0 ? (
            <select id="itemName" name="itemName" value={formData.itemName} onChange={handleItemChange} required>
              {inventoryItems.map(item => (
                <option key={item.id} value={item.itemName}>{item.itemName}</option>
              ))}
            </select>
          ) : (
            <p>No items in inventory. Please add a purchase first.</p>
          )}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="quantity">Quantity Used</label>
            <input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleChange} required min="0" step="any" />
          </div>
          <div className="form-group">
            <label htmlFor="unit">Unit</label>
                        <select id="unit" name="unit" value={formData.unit} onChange={handleChange} disabled> {/* Disable unit as it's set by item */}
              <option value="kg">Kilogram (kg)</option>
              <option value="g">Gram (g)</option>
              <option value="piece">Piece</option>
              <option value="dozen">Dozen</option>
              <option value="litre">Litre (L)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="usageDate">Usage Date</label>
          <input type="date" id="usageDate" name="usageDate" value={formData.usageDate} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label htmlFor="notes">Notes (Optional)</label>
          <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows="3"></textarea>
        </div>

        <button type="submit" disabled={isSubmitting} className="submit-btn">
          {isSubmitting ? 'Submitting...' : 'Record Usage'}
        </button>
      </form>
    </div>
  );
}

export default UsageEntryPage;
