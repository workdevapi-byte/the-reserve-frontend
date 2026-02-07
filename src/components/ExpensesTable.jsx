import styles from './Tables.module.css';

function ExpensesTable({ expenses, onEdit, onDelete }) {
  if (!expenses.length) {
    return <div className={styles.empty}>No expenses recorded yet.</div>;
  }

  const formatMoney = (n) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(n);
  };

  const formatDate = (d) => {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Name</th>
            <th>Category</th>
            <th>Bank</th>
            <th className={styles.amountCol}>Amount</th>
            <th className={styles.actionsCol}></th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e._id}>
              <td className={styles.dateCell}>{formatDate(e.date)}</td>
              <td>{e.name}</td>
              <td><span className={styles.badge}>{e.category}</span></td>
              <td className={styles.bankCell}>{e.bank?.name}</td>
              <td className={styles.amountCol}>{formatMoney(e.amount)}</td>
              <td className={styles.actionsCol}>
                <button onClick={() => onEdit(e)} className={styles.actionBtn}>Edit</button>
                <button onClick={() => onDelete(e._id)} className={`${styles.actionBtn} ${styles.deleteBtn}`}>&times;</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExpensesTable;
