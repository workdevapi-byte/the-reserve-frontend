import styles from './Tables.module.css';

function InvestmentHistory({ history }) {
    const formatMoney = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Investment Name</th>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.length === 0 ? (
                            <tr>
                                <td colSpan="5" className={styles.empty}>No investment history found.</td>
                            </tr>
                        ) : (
                            history.map((item) => (
                                <tr key={item._id}>
                                    <td>{formatDate(item.date)}</td>
                                    <td className={styles.nameCell}>{item.name}</td>
                                    <td>
                                        <span className={styles.categoryBadge}>
                                            {item.investment?.category?.name || 'Unknown'}
                                        </span>
                                    </td>
                                    <td className={styles.amountPlus}>
                                        {formatMoney(item.amount)}
                                    </td>
                                    <td className={styles.notesCell}>{item.notes || '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default InvestmentHistory;
