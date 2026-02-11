import { useState, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import styles from '../../pages/AuthPage.module.css';

function LoginForm({ onForgotPassword }) {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            // AuthContext sets user, redirect handled by wrapper
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className={styles.error}>{error}</div>}
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
            <div className={styles.formGroup}>
                <input
                    type="password"
                    placeholder="Your Password"
                    className={styles.input}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                />
            </div>
            <div style={{ textAlign: 'right', marginTop: '-0.5rem', marginBottom: '1rem' }}>
                <span className={styles.link} style={{ fontSize: '0.85rem' }} onClick={onForgotPassword}>
                    Forgot Password?
                </span>
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
            </button>
        </form>
    );
}

export default LoginForm;
