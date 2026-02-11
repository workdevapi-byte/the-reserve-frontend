import { useState } from 'react';
import { transfersApi } from '../services/api';
import styles from './Tables.module.css';


function TransferHistory({ transfers, onRefresh }) {
    const [deleting, setDeleting] = useState(null);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this transfer? This will reverse the transaction.')) {
            return;
        }

        setDeleting(id);
        try {
            await transfersApi.delete(id);
            onRefresh();
        } catch (err) {
            alert('Failed to delete transfer');
        } finally {
            setDeleting(null);
        }
    };

    if (!transfers || transfers.length === 0) {
        return <p style={{ textAlign: 'center', color: '#888', padding: '2rem' }}>No transfers yet</p>;
    }

    return (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>From Account</th>
                        <th>To Account</th>
                        <th>Amount</th>
                        <th>Notes</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {transfers.map(transfer => (
                        <tr key={transfer._id}>
                            <td>{new Date(transfer.date).toLocaleDateString()}</td>
                            <td>{transfer.fromBank?.name || 'N/A'}</td>
                            <td>{transfer.toBank?.name || 'N/A'}</td>
                            <td>₹{transfer.amount.toFixed(2)}</td>
                            <td>{transfer.notes || '-'}</td>
                            <td>
                                <button
                                    onClick={() => handleDelete(transfer._id)}
                                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                    disabled={deleting === transfer._id}
                                >
                                    {deleting === transfer._id ? '...' : '×'}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TransferHistory;
