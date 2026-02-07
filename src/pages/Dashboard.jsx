import { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { banksApi, expensesApi, incomeApi } from '../services/api';
import AuthContext from '../context/AuthContext';
import BankCards from '../components/BankCards';
import ExpensesTable from '../components/ExpensesTable';
import IncomeTable from '../components/IncomeTable';
import TransactionModal from '../components/TransactionModal';
import styles from './Dashboard.module.css';

function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [banks, setBanks] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('expense');
  const [editingItem, setEditingItem] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const fetchBanks = useCallback(async () => {
    try {
      const { data } = await banksApi.list();
      setBanks(data);
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.error || e.message);
    }
  }, []);

  const fetchExpenses = useCallback(async () => {
    try {
      const { data } = await expensesApi.list();
      setExpenses(data);
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.error || e.message);
    }
  }, []);

  const fetchIncome = useCallback(async () => {
    try {
      const { data } = await incomeApi.list();
      setIncome(data);
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.error || e.message);
    }
  }, []);

  const refreshAll = useCallback(() => {
    fetchBanks();
    fetchExpenses();
    fetchIncome();
  }, [fetchBanks, fetchExpenses, fetchIncome]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      await Promise.all([fetchBanks(), fetchExpenses(), fetchIncome()]);
      setLoading(false);
    })();
  }, [fetchBanks, fetchExpenses, fetchIncome]);

  const openAddModal = (type) => {
    setModalType(type);
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item, type) => {
    setModalType(type);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await expensesApi.delete(id);
      refreshAll();
    } catch (e) {
      setError("Failed to delete expense");
    }
  };

  const handleDeleteIncome = async (id) => {
    if (!window.confirm("Are you sure you want to delete this income?")) return;
    try {
      await incomeApi.delete(id);
      refreshAll();
    } catch (e) {
      setError("Failed to delete income");
    }
  };

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.headerText}>
          <h1>Money Manager</h1>
          <p className={styles.subtitle}>Track expenses and income, maintain bank balances</p>
        </div>
        <div className={styles.headerActions}>
          <button onClick={() => openAddModal('income')} className={`${styles.addBtn} ${styles.addIncomeBtn}`}>+ Income</button>
          <button onClick={() => openAddModal('expense')} className={`${styles.addBtn} ${styles.addExpenseBtn}`}>+ Expense</button>

          {/* Profile Dropdown */}
          <div className={styles.profileContainer}>
            <button
              className={styles.profileBtn}
              onClick={() => setShowProfile(!showProfile)}
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </button>
            {showProfile && (
              <div className={styles.profileDropdown}>
                <div className={styles.profileInfo}>
                  <strong>{user?.name || 'User'}</strong>
                  <small>{user?.email || ''}</small>
                </div>
                <hr />
                <button className={styles.logoutBtn} onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {error && (
        <div className={styles.errorBanner} role="alert">
          {error}
          <button onClick={() => setError(null)} className={styles.closeErr}>&times;</button>
        </div>
      )}

      <section className={styles.section}>
        <h2>Banks</h2>
        <BankCards banks={banks} onRefresh={refreshAll} />
      </section>

      <div className={styles.tablesGrid}>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Expenses</h2>
          </div>
          <ExpensesTable
            expenses={expenses}
            onEdit={(item) => openEditModal(item, 'expense')}
            onDelete={handleDeleteExpense}
          />
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Income</h2>
          </div>
          <IncomeTable
            income={income}
            onEdit={(item) => openEditModal(item, 'income')}
            onDelete={handleDeleteIncome}
          />
        </section>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={modalType}
        initialData={editingItem}
        onSuccess={refreshAll}
      />
    </div>
  );
}

export default Dashboard;
