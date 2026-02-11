import { useState, useEffect } from 'react';
import { allocationsApi, categoriesApi } from '../services/api';
import Modal from './Modal';
import styles from './Forms.module.css';

function AllocationModal({ isOpen, onClose, bank, onRefresh }) {
    const [categories, setCategories] = useState([]);
    const [allocations, setAllocations] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [addingCategory, setAddingCategory] = useState(false);
    const [activeCategoryIds, setActiveCategoryIds] = useState(new Set());
    const [editingCategoryId, setEditingCategoryId] = useState(null);
    const [tempCategoryName, setTempCategoryName] = useState('');
    const [updatingCategory, setUpdatingCategory] = useState(false);

    useEffect(() => {
        if (isOpen && bank) {
            fetchData();
        }
    }, [isOpen, bank]);

    const fetchData = async () => {
        setLoading(true);
        setError('');
        try {
            const [catRes, allocRes] = await Promise.all([
                categoriesApi.list(),
                allocationsApi.get(bank._id)
            ]);

            setCategories(catRes.data.filter(c => c.type === 'expense'));

            const initialAllocations = {};
            const activeIds = new Set();
            allocRes.data.forEach(a => {
                const catId = a.category._id || a.category;
                initialAllocations[catId] = a.amount;
                if (a.amount > 0) activeIds.add(catId);
            });
            setAllocations(initialAllocations);
            setActiveCategoryIds(activeIds);
        } catch (e) {
            setError('Failed to load allocation data');
        } finally {
            setLoading(false);
        }
    };

    const handleAmountChange = (categoryId, value) => {
        const numValue = value === '' ? 0 : Number(value);
        if (isNaN(numValue)) return;

        setAllocations(prev => ({
            ...prev,
            [categoryId]: numValue
        }));
    };

    const handleAddCategory = async () => {
        const name = newCategoryName.trim();
        if (!name) return;

        setError('');

        // 1. Check if category already exists in master list
        let category = categories.find(c => c.name.toLowerCase() === name.toLowerCase());

        try {
            if (!category) {
                // 2. Create if doesn't exist
                setAddingCategory(true);
                const { data } = await categoriesApi.create({ name, type: 'expense' });
                category = data;
                setCategories(prev => [...prev, data]);
            }

            // 3. Add to active list
            setActiveCategoryIds(prev => new Set(prev).add(category._id));
            setAllocations(prev => ({ ...prev, [category._id]: prev[category._id] || 0 }));

            setNewCategoryName('');
            setShowAddCategory(false);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add category');
        } finally {
            setAddingCategory(false);
        }
    };

    const handleRenameCategory = async (categoryId) => {
        const name = tempCategoryName.trim();
        if (!name) return;
        setUpdatingCategory(true);
        try {
            const { data } = await categoriesApi.update(categoryId, { name });
            setCategories(prev => prev.map(c => c._id === categoryId ? data : c));
            setEditingCategoryId(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to rename category');
        } finally {
            setUpdatingCategory(false);
        }
    };

    const totalAllocated = Object.values(allocations).reduce((sum, val) => sum + (val || 0), 0);
    const remainingBalance = (bank?.balance || 0) - totalAllocated;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (totalAllocated > bank.balance) {
            setError('Total allocated amount exceeds available balance');
            return;
        }

        const payload = Object.entries(allocations)
            .filter(([_, amount]) => amount > 0)
            .map(([categoryId, amount]) => ({ categoryId, amount }));

        setSubmitting(true);
        try {
            await allocationsApi.update(bank._id, payload);
            onRefresh?.();
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save allocations');
        } finally {
            setSubmitting(false);
        }
    };

    const formatMoney = (n) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Allocate Balance: ${bank?.name}`}>
            <div className={styles.form} style={{ maxWidth: '600px' }}>
                <div style={{
                    background: 'linear-gradient(135deg, #1e1e1e, #2a2a2a)',
                    border: '1px solid #333',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '1rem',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                        <div>
                            <span style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem', display: 'block' }}>TOTAL BANK BALANCE</span>
                            <strong style={{ color: '#fff', fontSize: '1.8rem' }}>{formatMoney(bank?.balance)}</strong>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <span style={{ color: '#888', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem', display: 'block' }}>REMAINING</span>
                            <strong style={{
                                color: remainingBalance < 0 ? '#ff4444' : '#00cc00',
                                fontSize: '1.8rem'
                            }}>
                                {formatMoney(remainingBalance)}
                            </strong>
                        </div>
                    </div>

                    {/* NEW: Inline Allocations List */}
                    <div style={{
                        maxHeight: '300px',
                        overflowY: 'auto',
                        paddingRight: '8px',
                        marginBottom: '1rem'
                    }}>
                        {activeCategoryIds.size === 0 ? (
                            <div style={{ textAlign: 'center', padding: '1.5rem', color: '#555', border: '1px dashed #333', borderRadius: '8px', fontSize: '0.9rem' }}>
                                No active allocations.
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem'
                            }}>
                                {categories.filter(cat => activeCategoryIds.has(cat._id)).map(cat => {
                                    const isEditing = editingCategoryId === cat._id;

                                    return (
                                        <div key={cat._id} style={{
                                            background: 'linear-gradient(135deg, #1e1e1e, #252525)',
                                            padding: '1.2rem',
                                            borderRadius: '12px',
                                            border: '1px solid #333',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.8rem',
                                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
                                            position: 'relative',
                                            transition: 'transform 0.2s'
                                        }}>
                                            {/* cardActions */}
                                            <div style={{ position: 'absolute', top: '8px', right: '8px', display: 'flex', gap: '4px' }}>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setEditingCategoryId(cat._id);
                                                        setTempCategoryName(cat.name);
                                                    }}
                                                    style={{ background: 'rgba(0,0,0,0.3)', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.8rem', padding: '2px 6px', borderRadius: '4px' }}
                                                    title="Rename"
                                                >
                                                    &#9998;
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveCategoryIds(prev => {
                                                            const next = new Set(prev);
                                                            next.delete(cat._id);
                                                            return next;
                                                        });
                                                        setAllocations(prev => ({ ...prev, [cat._id]: 0 }));
                                                    }}
                                                    style={{ background: 'rgba(0,0,0,0.3)', border: 'none', color: '#ff5252', cursor: 'pointer', fontSize: '1rem', padding: '0 6px', borderRadius: '4px' }}
                                                    title="Remove"
                                                >
                                                    &times;
                                                </button>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                {isEditing ? (
                                                    <div style={{ display: 'flex', gap: '4px', width: '100%', paddingRight: '40px' }}>
                                                        <input
                                                            type="text"
                                                            value={tempCategoryName}
                                                            onChange={(e) => setTempCategoryName(e.target.value)}
                                                            className={styles.input}
                                                            style={{ fontSize: '0.85rem', padding: '2px 8px', height: '24px' }}
                                                            autoFocus
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRenameCategory(cat._id)}
                                                            disabled={updatingCategory}
                                                            style={{ background: '#4caf50', border: 'none', color: '#fff', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer' }}
                                                        >
                                                            ✓
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setEditingCategoryId(null)}
                                                            style={{ background: '#444', border: 'none', color: '#fff', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer' }}
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#aaa', fontWeight: '500', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                        {cat.name}
                                                    </span>
                                                )}
                                            </div>

                                            <div style={{ position: 'relative' }}>
                                                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666', fontSize: '0.9rem' }}>₹</span>
                                                <input
                                                    type="number"
                                                    value={allocations[cat._id] || ''}
                                                    onChange={(e) => handleAmountChange(cat._id, e.target.value)}
                                                    className={styles.input}
                                                    style={{
                                                        paddingLeft: '22px',
                                                        width: '100%',
                                                        boxSizing: 'border-box',
                                                        border: 'none',
                                                        background: 'transparent',
                                                        fontSize: '1.4rem',
                                                        fontWeight: '600',
                                                        color: '#fff',
                                                        height: '40px'
                                                    }}
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {remainingBalance < 0 && (
                        <div style={{ marginTop: '0.5rem', color: '#ff4444', fontSize: '0.85rem', textAlign: 'center', background: 'rgba(255,68,68,0.1)', padding: '0.5rem', borderRadius: '4px' }}>
                            ⚠️ Total allocated exceeds available balance
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>Allocations</h3>
                    <button
                        type="button"
                        onClick={() => setShowAddCategory(!showAddCategory)}
                        style={{
                            background: '#333',
                            border: '1px solid #444',
                            color: '#4caf50',
                            padding: '4px 12px',
                            borderRadius: '15px',
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                        }}
                    >
                        {showAddCategory ? '✕ Close' : '+ Add Category'}
                    </button>
                </div>

                {showAddCategory && (
                    <div style={{
                        background: 'rgba(76, 175, 80, 0.05)',
                        padding: '1rem',
                        borderRadius: '8px',
                        border: '1px dashed #4caf50',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'flex-end'
                    }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', color: '#888', marginBottom: '4px' }}>Category Name</label>
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                className={styles.input}
                                placeholder="e.g. Shopping"
                                autoFocus
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleAddCategory}
                            disabled={addingCategory || !newCategoryName.trim()}
                            className={styles.submitBtn}
                            style={{ padding: '8px 15px', fontSize: '0.85rem' }}
                        >
                            {addingCategory ? 'Adding...' : 'Add'}
                        </button>
                    </div>
                )}

                {error && <div className={styles.error} style={{ marginBottom: '1.5rem' }}>{error}</div>}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: '#888' }}>Loading data...</div>
                ) : (
                    <form onSubmit={handleSubmit}>


                        <div className={styles.actions} style={{ marginTop: '1.5rem', borderTop: '1px solid #333', paddingTop: '1.5rem' }}>
                            <button type="button" onClick={onClose} className={styles.cancelBtn} disabled={submitting}>
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={styles.submitBtn}
                                disabled={submitting || remainingBalance < 0}
                                style={{
                                    background: remainingBalance < 0 ? '#444' : '#4caf50',
                                    cursor: remainingBalance < 0 ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {submitting ? 'Saving...' : 'Save Allocation'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
}

export default AllocationModal;
