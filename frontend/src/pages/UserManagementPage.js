import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const { currentUser } = useAuth();

  const fetchUsers = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    setError(null);
    setSuccessMessage('');

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch('http://localhost:5000/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch users.');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    if (!currentUser) return;
    setError(null);
    setSuccessMessage('');

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(`http://localhost:5000/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update role.');
      }

      const result = await response.json();
      setSuccessMessage(result.message);
      // Refresh the user list to show the updated role
      fetchUsers();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div>
      <h2>User Management</h2>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid black' }}>
            <th style={{ textAlign: 'left', padding: '8px' }}>Name</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Email</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Current Role</th>
            <th style={{ textAlign: 'left', padding: '8px' }}>Change Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '8px' }}>{user.name}</td>
              <td style={{ padding: '8px' }}>{user.email}</td>
              <td style={{ padding: '8px' }}>{user.role}</td>
              <td style={{ padding: '8px' }}>
                <select 
                  defaultValue={user.role} 
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={user.id === currentUser.uid} // Prevent admin from changing their own role
                >
                  <option value="admin">Admin</option>
                  <option value="purchaseManager">Purchase Manager</option>
                  <option value="kitchenStaff">Kitchen Staff</option>
                </select>
                {user.id === currentUser.uid && <em style={{fontSize: '0.8em', marginLeft: '5px'}}>(Cannot change own role)</em>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserManagementPage;
