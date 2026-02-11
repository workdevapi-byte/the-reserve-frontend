import styles from './Tables.module.css';

function IncomeTable({ income, onEdit, onDelete }) {
  if (!income.length) {
    return <div className={styles.empty}>No income recorded yet.</div>;
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
            <th>Source</th>
            <th>Bank</th>
            <th className={styles.amountCol}>Amount</th>
            <th className={styles.actionsCol}></th>
          </tr>
        </thead>
        <tbody>
          {income.map((i) => (
            <tr key={i._id}>
              <td className={styles.dateCell}>{formatDate(i.date)}</td>
              <td>{i.name}</td>
              <td><span className={`${styles.badge} ${styles.incomeBadge}`}>{i.source}</span></td>
              <td className={styles.bankCell}>{i.bank?.name}</td>
              <td className={`${styles.amountCol} ${styles.incomeAmount}`}>+{formatMoney(i.amount)}</td>
              <td className={styles.actionsCol}>
                <button onClick={() => onEdit(i)} className={styles.actionBtn}>Edit</button>
                <button onClick={() => onDelete(i._id)} className={`${styles.actionBtn} ${styles.deleteBtn}`}>&times;</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default IncomeTable;
