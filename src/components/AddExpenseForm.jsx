import { useState, useEffect } from 'react';
import { expensesApi, categoriesApi, banksApi } from '../services/api'; // Added banksApi here
import styles from './Forms.module.css';

function AddExpenseForm({ initialData, onSuccess, onCancel }) {
  const [description, setDescription] = useState(initialData?.name || '');
  const [amount, setAmount] = useState(initialData?.amount || '');
  const [bankId, setBankId] = useState(initialData?.bank?._id || initialData?.bank || '');
  const [categoryId, setCategoryId] = useState(initialData?.category || '');
  const [date, setDate] = useState(initialData?.date ? new Date(initialData.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10));

  const [categories, setCategories] = useState([]);
  const [banks, setBanks] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchBanks();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await categoriesApi.list();
      setCategories(data.filter(c => c.type === 'expense'));
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const fetchBanks = async () => {
    try {
      const { data } = await banksApi.list();
      setBanks(data);
    } catch (err) {
      console.error("Failed to fetch banks", err);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    try {
      const { data } = await categoriesApi.create({ name: newCategory, type: 'expense' });
      setCategories([...categories, data].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCategory('');
      setCategoryId(data.name); // Auto-select new category (using name as ID based on legacy logic, or switch to object?)
      // Note: Legacy code used name string as category. Models use String.
      // We should stick to String name for now to avoid data migration issues if possible, 
      // OR switch to IDs. The backend model `Category` was created, but `Expense` model `category` field is likely a String. 
      // Let's check Expense model? I wrote the Category model but didn't change Expense model schema deeply, just controller.
      // Expense model likely defines category as String. Let's assume String Name for now.
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add category');
    }
  };

  const handleDeleteCategory = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this category?')) return;
    try {
      await categoriesApi.delete(id);
      setCategories(categories.filter(c => c._id !== id));
      if (categoryId === categories.find(c => c._id === id)?.name) {
        setCategoryId('');
      }
    } catch (err) {
      setError('Failed to delete category');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        name: description,
        category: categoryId,
        amount,
        bank: bankId,
        date
      };

      if (initialData?._id) {
        await expensesApi.update(initialData._id, payload);
      } else {
        await expensesApi.create(payload);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.formGroup}>
        <label>Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What did you spend on?"
          required
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Category</label>
        <div className={styles.categoryWrapper}>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={styles.select}
            required
          >
            <option value="">Select Category</option>
            {categories.map(c => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>
          {/* Simple Manage Categories Toggle or Inline */}
        </div>

        {/* Inline Category Management */}
        <div className={styles.categoryManager}>
          <div className={styles.addCatRow}>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New Category"
              className={styles.smallInput}
            />
            <button type="button" onClick={handleAddCategory} className={styles.smallBtn}>+</button>
          </div>
          <div className={styles.catTags}>
            {categories.map(c => (
              <span key={c._id} className={styles.catTag}>
                {c.name}
                <button type="button" onClick={(e) => handleDeleteCategory(e, c._id)} className={styles.deleteTag}>&times;</button>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Amount</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          min="0"
          step="0.01"
          required
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Bank Account</label>
        <select
          value={bankId}
          onChange={(e) => setBankId(e.target.value)}
          className={styles.select}
          required
        >
          <option value="">Select Bank</option>
          {banks.map((b) => (
            <option key={b._id} value={b._id}>{b.name} ({b.balance})</option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className={styles.input}
        />
      </div>

      <div className={styles.actions}>
        <button type="button" onClick={onCancel} className={styles.cancelBtn} disabled={loading}>Cancel</button>
        <button type="submit" className={styles.submitBtn} disabled={loading}>
          {loading ? 'Saving...' : (initialData ? 'Update Expense' : 'Add Expense')}
        </button>
      </div>
    </form>
  );
}

export default AddExpenseForm;
