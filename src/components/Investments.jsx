import { useState, useEffect, useContext } from 'react';
import { investmentsApi } from '../services/api';
import InvestmentModal from './InvestmentModal';
import AuthContext from '../context/AuthContext';
import styles from './BankCards.module.css';

function Investments({ investments, onRefresh }) {
    const { user } = useContext(AuthContext);
    const [showModal, setShowModal] = useState(false);
    const [visibleInvestments, setVisibleInvestments] = useState(new Set());

    // Reset visibility on user change (logout/login)
    useEffect(() => {
        setVisibleInvestments(new Set());
    }, [user]);

    const handleDelete = async (id, categoryName) => {
        if (!window.confirm(`Are you sure you want to delete investment in ${categoryName}?`)) return;
        try {
            await investmentsApi.delete(id);
            onRefresh();
        } catch (e) {
            alert(e.response?.data?.error || "Failed to delete investment");
        }
    };

    const handleEdit = (investment) => {
        setEditingInvestment(investment);
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditingInvestment(null);
        setShowModal(true);
    };

    const formatMoney = (n) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0);
    };

    const [editingInvestment, setEditingInvestment] = useState(null);

    const handleToggleVisibility = (id) => {
        setVisibleInvestments(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    return (
        <div className={styles.wrapper}>
            {/* Header removed - use Dashboard buttons */}

            <div className={styles.cards}>
                {investments.length === 0 ? (
                    <div className={styles.emptyState}>No investments added yet.</div>
                ) : (
                    investments.map((inv) => (
                        <div key={inv._id} className={styles.card}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span className={styles.bankName}>{inv.category?.name || 'Unknown'}</span>
                                <span style={{ fontSize: '0.7rem', color: '#666', marginTop: '-4px' }}>
                                    {inv.bank?.name || 'Manual Entry'}
                                </span>
                            </div>
                            <span className={styles.balance}>
                                {visibleInvestments.has(inv._id) ? formatMoney(inv.amount) : '****'}
                            </span>
                            <div className={styles.cardActions}>
                                <button
                                    onClick={() => handleToggleVisibility(inv._id)}
                                    className={styles.iconBtn}
                                    title={visibleInvestments.has(inv._id) ? "Hide Balance" : "Show Balance"}
                                >
                                    {visibleInvestments.has(inv._id) ? '●' : '○'}
                                </button>
                                <button onClick={() => handleEdit(inv)} className={styles.iconBtn} title="Edit">&#9998;</button>
                                <button onClick={() => handleDelete(inv._id, inv.category?.name)} className={`${styles.iconBtn} ${styles.delBtn}`} title="Delete">&times;</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <InvestmentModal
                isOpen={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingInvestment(null);
                }}
                onSuccess={onRefresh}
                initialData={editingInvestment}
            />


        </div>
    );
}

export default Investments;
