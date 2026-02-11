import { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import styles from './AuthPage.module.css';

function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { validateResetToken, resetPassword } = useContext(AuthContext);

    const [token, setToken] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [tokenValid, setTokenValid] = useState(false);

    // Password criteria check
    const criteria = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password),
    };

    const isPasswordStrong = Object.values(criteria).every(Boolean);
    const passwordsMatch = password === confirmPassword && confirmPassword !== '';

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (!tokenFromUrl) {
            setError('Invalid reset link');
            setLoading(false);
            return;
        }

        setToken(tokenFromUrl);

        // Validate token on mount
        const checkToken = async () => {
            try {
                const data = await validateResetToken(tokenFromUrl);
                setEmail(data.email);
                setTokenValid(true);
            } catch (err) {
                setError(err.response?.data?.error || 'Invalid or expired reset link');
            } finally {
                setLoading(false);
            }
        };

        checkToken();
    }, [searchParams, validateResetToken]);

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

        setSubmitting(true);
        try {
            await resetPassword(email, null, password, token);
            navigate('/auth?success=reset');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password');
        } finally {
            setSubmitting(false);
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

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.rightPanel} style={{ width: '100%' }}>
                    <div className={styles.authBox}>
                        <p style={{ textAlign: 'center', color: '#ccc' }}>Validating reset link...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className={styles.container}>
                <div className={styles.rightPanel} style={{ width: '100%' }}>
                    <div className={styles.authBox}>
                        <div className={styles.header}>
                            <div className={styles.title}>Invalid Link</div>
                        </div>
                        <div className={styles.error}>{error}</div>
                        <button
                            className={styles.submitBtn}
                            onClick={() => navigate('/auth')}
                            style={{ marginTop: '1rem' }}
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.rightPanel} style={{ width: '100%' }}>
                <div className={styles.authBox}>
                    <div className={styles.header}>
                        <div className={styles.title}>Set New Password</div>
                        <div className={styles.subtitle}>Reset password for {email}</div>
                    </div>

                    <form onSubmit={handleReset}>
                        {error && <div className={styles.error}>{error}</div>}

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

                        <button type="submit" className={styles.submitBtn} disabled={submitting || !isPasswordStrong || !passwordsMatch}>
                            {submitting ? 'Resetting Password...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ResetPasswordPage;
