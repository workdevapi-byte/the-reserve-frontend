import { useState, useEffect } from 'react';
import { transfersApi, banksApi } from '../services/api';
import Modal from './Modal';
import styles from './Forms.module.css';


function TransferModal({ isOpen, onClose, onSuccess }) {
    const [banks, setBanks] = useState([]);
    const [formData, setFormData] = useState({
        fromBank: '',
        toBank: '',
        amount: '',
        notes: '',
        date: new Date().toISOString().slice(0, 10)
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchBanks();
        }
    }, [isOpen]);

    const fetchBanks = async () => {
        try {
            const { data } = await banksApi.list();
            setBanks(data);
        } catch (e) {
            setError('Failed to load banks');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.fromBank || !formData.toBank || !formData.amount || !formData.date) {
            setError('Please fill all required fields');
            return;
        }

        if (formData.fromBank === formData.toBank) {
            setError('Cannot transfer to the same account');
            return;
        }

        setLoading(true);
        try {
            await transfersApi.create(formData);
            setFormData({
                fromBank: '',
                toBank: '',
                amount: '',
                notes: '',
                date: new Date().toISOString().slice(0, 10)
            });
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create transfer');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Self Transfer">
            <form onSubmit={handleSubmit} className={styles.form}>
                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.formGroup}>
                    <label>From Account *</label>
                    <select
                        name="fromBank"
                        value={formData.fromBank}
                        onChange={handleChange}
                        className={styles.input}
                        required
                    >
                        <option value="">Select source account</option>
                        {banks.map(bank => (
                            <option key={bank._id} value={bank._id}>
                                {bank.name} (₹{bank.balance.toFixed(2)})
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label>To Account *</label>
                    <select
                        name="toBank"
                        value={formData.toBank}
                        onChange={handleChange}
                        className={styles.input}
                        required
                    >
                        <option value="">Select destination account</option>
                        {banks.map(bank => (
                            <option key={bank._id} value={bank._id}>
                                {bank.name} (₹{bank.balance.toFixed(2)})
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.formGroup}>
                    <label>Amount *</label>
                    <input
                        type="number"
                        name="amount"
                        value={formData.amount}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="Enter amount"
                        min="0"
                        step="0.01"
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Date *</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className={styles.input}
                        required
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Notes</label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="Optional notes"
                        rows="3"
                    />
                </div>

                <div className={styles.actions}>
                    <button type="button" onClick={onClose} className={styles.cancelBtn} disabled={loading}>
                        Cancel
                    </button>
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Processing...' : 'Transfer'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default TransferModal;
