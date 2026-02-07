import { useState } from 'react';
import { banksApi } from '../services/api';
import styles from './BankCards.module.css';

function BankCards({ banks, onRefresh }) {
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editBalance, setEditBalance] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setSubmitting(true);
    try {
      await banksApi.create({ name: name.trim(), balance: balance ? Number(balance) : 0 });
      setName('');
      setBalance('');
      setShowAddForm(false);
      onRefresh();
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    setErr('');
    try {
      await banksApi.update(editingId, {
        name: editName.trim(),
        balance: editBalance ? Number(editBalance) : undefined
      });
      setEditingId(null);
      onRefresh();
    } catch (e) {
      setErr(e.response?.data?.error || "Failed to update bank");
    }
  };

  const handleDelete = async (id, bankName) => {
    if (!window.confirm(`Are you sure you want to delete ${bankName}? This is only allowed if no transactions are linked.`)) return;
    try {
      await banksApi.delete(id);
      onRefresh();
    } catch (e) {
      alert(e.response?.data?.error || "Failed to delete bank");
    }
  };

  const startEdit = (bank) => {
    setEditingId(bank._id);
    setEditName(bank.name);
    setEditBalance(bank.balance);
    setShowAddForm(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setErr('');
  };

  const formatMoney = (n) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <button className={styles.addBankBtn} onClick={() => { setShowAddForm(!showAddForm); setEditingId(null); }}>
          {showAddForm ? 'Cancel' : '+ Add Bank'}
        </button>
      </div>

      {showAddForm && (
        <form className={styles.addForm} onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Bank name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={styles.input}
            required
            autoFocus
          />
          <input
            type="number"
            placeholder="Initial balance"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            className={styles.input}
            min="0"
            step="0.01"
          />
          <button type="submit" className={styles.btn} disabled={submitting}>
            {submitting ? 'Adding…' : 'Save'}
          </button>

          {err && <span className={styles.err}>{err}</span>}
        </form>
      )}

      {err && !showAddForm && <div className={styles.errBanner}>{err}</div>}

      <div className={styles.cards}>
        {banks.map((b) => (
          <div key={b._id} className={styles.card}>
            {editingId === b._id ? (
              <form onSubmit={handleUpdate} className={styles.editForm}>
                <input
                  className={styles.editInput}
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  placeholder="Name"
                  required
                />
                {/* Note: Editing balance manually is risky if it gets out of sync with transactions, implies a manual "correction" */}
                <input
                  className={styles.editInput}
                  type="number"
                  value={editBalance}
                  onChange={e => setEditBalance(e.target.value)}
                  placeholder="Balance"
                  step="0.01"
                />
                <div className={styles.editActions}>
                  <button type="submit" className={styles.saveBtn}>Save</button>
                  <button type="button" onClick={cancelEdit} className={styles.cancelBtn}>Cancel</button>
                </div>
              </form>
            ) : (
              <>
                <span className={styles.bankName}>{b.name}</span>
                <span className={styles.balance}>{formatMoney(b.balance)}</span>
                <div className={styles.cardActions}>
                  <button onClick={() => startEdit(b)} className={styles.iconBtn} title="Edit">&#9998;</button>
                  <button onClick={() => handleDelete(b._id, b.name)} className={`${styles.iconBtn} ${styles.delBtn}`} title="Delete">&times;</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default BankCards;
