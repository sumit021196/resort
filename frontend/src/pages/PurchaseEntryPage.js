import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './PurchaseEntryPage.css'; // We will create this CSS file for styling

function PurchaseEntryPage() {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    itemName: '',
    quantity: '',
    unit: 'kg', // Default unit
    rate: '',
    supplier: '',
    purchaseDate: new Date().toISOString().split('T')[0], // Default to today
    invoiceNumber: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [inventoryItems, setInventoryItems] = useState([]);

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
        rate: parseFloat(formData.rate),
      };

      const response = await fetch('http://localhost:5000/api/purchases', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit purchase.');
      }

      setSuccess(`Success! Purchase recorded with ID: ${result.purchaseId}`);
      // Reset form
      setFormData({
        itemName: '',
        quantity: '',
        unit: 'kg',
        rate: '',
        supplier: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        invoiceNumber: '',
      });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fetchInventoryItems = useCallback(async () => {
    try {
      const token = await currentUser.getIdToken();
      const response = await fetch('http://localhost:5000/api/inventory', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Could not fetch inventory items.');
      const data = await response.json();
      setInventoryItems(data.map(item => item.itemName));
    } catch (err) {
      console.error(err.message);
      // Not showing this error to user as it's not critical for the form to function
    }
  }, [currentUser]);

  useEffect(() => {
    fetchInventoryItems();
  }, [fetchInventoryItems]);

  return (
    <div className="purchase-entry-container">
      <form onSubmit={handleSubmit} className="purchase-form">
        <h2>Record New Purchase</h2>
        
        {error && <p className="form-error">{error}</p>}
        {success && <p className="form-success">{success}</p>}

                <div className="form-group">
          <label htmlFor="itemName">Item Name</label>
          <input 
            type="text" 
            id="itemName" 
            name="itemName" 
            value={formData.itemName} 
            onChange={handleChange} 
            required 
            list="inventory-items"
            autoComplete="off"
          />
          <datalist id="inventory-items">
            {inventoryItems.map(item => <option key={item} value={item} />)}
          </datalist>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="quantity">Quantity</label>
            <input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleChange} required min="0" step="any" />
          </div>
          <div className="form-group">
            <label htmlFor="unit">Unit</label>
            <select id="unit" name="unit" value={formData.unit} onChange={handleChange}>
              <option value="kg">Kilogram (kg)</option>
              <option value="g">Gram (g)</option>
              <option value="piece">Piece</option>
              <option value="dozen">Dozen</option>
              <option value="litre">Litre (L)</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="rate">Rate (per unit)</label>
          <input type="number" id="rate" name="rate" value={formData.rate} onChange={handleChange} required min="0" step="any" />
        </div>

        <div className="form-group">
          <label htmlFor="supplier">Supplier</label>
          <input type="text" id="supplier" name="supplier" value={formData.supplier} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="purchaseDate">Purchase Date</label>
            <input type="date" id="purchaseDate" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="invoiceNumber">Invoice Number (Optional)</label>
            <input type="text" id="invoiceNumber" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleChange} />
          </div>
        </div>

        <button type="submit" disabled={isSubmitting} className="submit-btn">
          {isSubmitting ? 'Submitting...' : 'Record Purchase'}
        </button>
      </form>
    </div>
  );
}

export default PurchaseEntryPage;
