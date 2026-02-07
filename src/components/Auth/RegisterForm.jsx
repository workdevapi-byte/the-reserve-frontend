import { useState, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import styles from '../../pages/AuthPage.module.css';

function RegisterForm() {
    const { register, verifyOtp } = useContext(AuthContext);
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(name, email, password);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await verifyOtp(email, otp);
            // AuthContext sets user, redirect handled by wrapper
        } catch (err) {
            setError(err.response?.data?.error || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    if (step === 2) {
        return (
            <form onSubmit={handleVerify}>
                {error && <div className={styles.error}>{error}</div>}
                <p style={{ textAlign: 'center', marginBottom: '1rem' }}>Enter the code sent to {email}</p>
                <div className={styles.formGroup}>
                    <input
                        type="text"
                        placeholder="Enter OTP"
                        className={styles.input}
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify & Login'}
                </button>
            </form>
        );
    }

    return (
        <form onSubmit={handleRegister}>
            {error && <div className={styles.error}>{error}</div>}
            <div className={styles.formGroup}>
                <input
                    type="text"
                    placeholder="Full Name"
                    className={styles.input}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                />
            </div>
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
                    minLength={6}
                />
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? 'Sending OTP...' : 'Sign Up'}
            </button>
        </form>
    );
}

export default RegisterForm;
