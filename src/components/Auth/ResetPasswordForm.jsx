import { useState, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import styles from '../../pages/AuthPage.module.css';

function ResetPasswordForm({ email, onSuccess, onBack }) {
    const { resetPassword } = useContext(AuthContext);
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Password criteria check (Shared with RegisterForm)
    const criteria = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
    };

    const isPasswordStrong = Object.values(criteria).every(Boolean);
    const passwordsMatch = password === confirmPassword && confirmPassword !== '';

    const handleReset = async (e) => {
        e.preventDefault();
        setError('');

        if (!isPasswordStrong) {
            setError('Please meet all password strength criteria');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await resetPassword(email, otp, password, null);
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    const renderCriteriaItem = (text, isValid) => (
        <li className={`${styles.criteriaItem} ${isValid ? styles.valid : ''}`}>
            <span className={styles.criteriaIcon}>
                {isValid ? '✓' : '•'}
            </span>
            {text}
        </li>
    );

    return (
        <form onSubmit={handleReset}>
            {error && <div className={styles.error}>{error}</div>}
            <p style={{ textAlign: 'center', marginBottom: '1rem', color: '#ccc' }}>
                Enter the code sent to <b>{email}</b> and your new password.
            </p>

            <div className={styles.formGroup}>
                <input
                    type="text"
                    placeholder="6-Digit OTP"
                    className={styles.input}
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    required
                />
            </div>

            <div className={styles.formGroup}>
                <input
                    type="password"
                    placeholder="New Password"
                    className={styles.input}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
            </div>

            {password.length > 0 && (
                <ul className={styles.passwordCriteria}>
                    {renderCriteriaItem('Must be at least 8 characters long', criteria.length)}
                    {renderCriteriaItem('Must include at least one uppercase letter', criteria.uppercase)}
                    {renderCriteriaItem('Must include at least one lowercase letter', criteria.lowercase)}
                    {renderCriteriaItem('Must include at least one number', criteria.number)}
                </ul>
            )}

            <div className={styles.formGroup}>
                <input
                    type="password"
                    placeholder="Confirm New Password"
                    className={styles.input}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                />
                {confirmPassword && !passwordsMatch && password.length > 0 && (
                    <div style={{ color: '#ff8a80', fontSize: '0.8rem', marginTop: '4px' }}>
                        Passwords do not match
                    </div>
                )}
            </div>

            <button type="submit" className={styles.submitBtn} disabled={loading || !isPasswordStrong || !passwordsMatch}>
                {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>

            <div className={styles.toggle}>
                <span className={styles.link} onClick={onBack}>
                    Cancel
                </span>
            </div>
        </form>
    );
}

export default ResetPasswordForm;
