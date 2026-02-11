import { useState, useEffect } from 'react';
import Modal from './Modal';
import api, { investmentsApi } from '../services/api';
import styles from './Forms.module.css';

function InvestmentModal({ isOpen, onClose, onSuccess, initialData = null }) {
    const [categories, setCategories] = useState([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
    const [amount, setAmount] = useState('');
    const [name, setName] = useState('');
    const [notes, setNotes] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [banks, setBanks] = useState([]);
    const [selectedBankId, setSelectedBankId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchCategories();
        }
    }, [isOpen]);

    const fetchCategories = async () => {
        try {
            const [catRes, bankRes] = await Promise.all([
                investmentsApi.listCategories(),
                api.get('/banks')
            ]);
            setCategories(catRes.data);
            setBanks(bankRes.data);
        } catch (err) {
            console.error('Failed to fetch modal data:', err);
        }
    };

    useEffect(() => {
        if (initialData) {
            setSelectedCategoryId(initialData.category?._id || '');
            setAmount(initialData.amount || '');
            setDate(initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
            setIsAddingNewCategory(false);
            setNewCategoryName('');
            setName('');
            setNotes('');
        } else {
            setSelectedCategoryId('');
            setAmount('');
            setSelectedBankId('');
            setDate(new Date().toISOString().split('T')[0]);
            setIsAddingNewCategory(false);
            setNewCategoryName('');
            setName('');
            setNotes('');
        }
    }, [initialData, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = {
                amount: Number(amount),
                date,
                name,
                notes
            };

            if (isAddingNewCategory) {
                data.newCategoryName = newCategoryName;
            } else {
                data.categoryId = selectedCategoryId;
            }

            if (!initialData) {
                data.bankId = selectedBankId;
            }

            if (initialData) {
                // When editing, we usually just update the aggregate amount record
                await investmentsApi.update(initialData._id, { amount: Number(amount), date });
            } else {
                await investmentsApi.create(data);
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save investment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Investment' : 'Add Investment'}>
            <form onSubmit={handleSubmit} className={styles.form}>
                {error && <div className={styles.error} style={{ marginBottom: '1rem' }}>{error}</div>}

                {!initialData && (
                    <div className={styles.formGroup}>
                        <label>Bank Account</label>
                        <select
                            value={selectedBankId}
                            onChange={(e) => setSelectedBankId(e.target.value)}
                            className={styles.input}
                            required
                        >
                            <option value="">Select Bank to Debit</option>
                            {banks.map(bank => (
                                <option key={bank._id} value={bank._id}>{bank.name} (Balance: ₹{bank.balance})</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className={styles.formGroup}>
                    <label>Category</label>
                    {!initialData && !isAddingNewCategory ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <select
                                value={selectedCategoryId}
                                onChange={(e) => setSelectedCategoryId(e.target.value)}
                                className={styles.input}
                                required
                                style={{ flex: 1 }}
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                                ))}
                            </select>
                            <button
                                type="button"
                                onClick={() => setIsAddingNewCategory(true)}
                                className={styles.iconBtn}
                                title="Add New Category"
                                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #444', height: '42px', width: '42px' }}
                            >
                                +
                            </button>
                        </div>
                    ) : !initialData && isAddingNewCategory ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className={styles.input}
                                placeholder="Enter new category"
                                required
                                style={{ flex: 1 }}
                                autoFocus
                            />
                            <button
                                type="button"
                                onClick={() => { setIsAddingNewCategory(false); setNewCategoryName(''); }}
                                className={styles.iconBtn}
                                title="Back to List"
                                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid #444', height: '42px', width: '42px' }}
                            >
                                &larr;
                            </button>
                        </div>
                    ) : (
                        <input
                            type="text"
                            value={initialData?.category?.name || ''}
                            className={styles.input}
                            disabled
                        />
                    )}
                </div>

                {!initialData && (
                    <>
                        <div className={styles.formGroup}>
                            <label>Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={styles.input}
                                placeholder="e.g. Monthly SIP, Q3 Bonus Invest"
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label>Notes</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className={styles.input}
                                placeholder="Add any details..."
                                rows="2"
                            />
                        </div>
                    </>
                )}

                <div className={styles.formGroup}>
                    <label>{initialData ? 'Correct Total Amount' : 'Amount to Add'}</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className={styles.input}
                        placeholder="Enter amount"
                        required
                        min="0"
                        step="0.01"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label>Date</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={styles.input}
                    />
                </div>

                <div className={styles.actions}>
                    <button type="button" onClick={onClose} className={styles.cancelBtn} disabled={loading}>
                        Cancel
                    </button>
                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Saving...' : (initialData ? 'Update' : 'Add')}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default InvestmentModal;
