import React from 'react';
import Modal from './Modal';
import AddExpenseForm from './AddExpenseForm';
import AddIncomeForm from './AddIncomeForm';

const TransactionModal = ({ isOpen, onClose, type, initialData, onSuccess }) => {
    const isExpense = type === 'expense';
    const title = initialData ? `Edit ${isExpense ? 'Expense' : 'Income'}` : `Add ${isExpense ? 'Expense' : 'Income'}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            {isExpense ? (
                <AddExpenseForm
                    initialData={initialData}
                    onSuccess={() => { onSuccess(); onClose(); }}
                    onCancel={onClose}
                />
            ) : (
                <AddIncomeForm
                    initialData={initialData}
                    onSuccess={() => { onSuccess(); onClose(); }}
                    onCancel={onClose}
                />
            )}
        </Modal>
    );
};

export default TransactionModal;
