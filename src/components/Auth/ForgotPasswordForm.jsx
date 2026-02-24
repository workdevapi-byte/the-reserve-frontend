import { useState, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import styles from '../../pages/AuthPage.module.css';

function ForgotPasswordForm({ onCodeSent, onBack }) {
    const { forgotPassword } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await forgotPassword(email);
            onCodeSent(email);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send reset code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className={styles.error}>{error}</div>}
            <p style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#ccc' }}>
                Enter your email address to receive a password reset code.
            </p>
            <div className={styles.formGroup}>
                <input
                    type="email"
                    placeholder="Your Email"
                    className={styles.input}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                />
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Sending Code...' : 'Send Reset Code'}
            </button>
            <div className={styles.toggle}>
                <span className={styles.link} onClick={onBack}>
                    Back to Login
                </span>
            </div>
        </form>
    );
}

export default ForgotPasswordForm;
