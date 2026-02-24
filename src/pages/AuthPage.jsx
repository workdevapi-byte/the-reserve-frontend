import { useState, useContext, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import styles from './AuthPage.module.css';
import LoginForm from '../components/Auth/LoginForm';
import RegisterForm from '../components/Auth/RegisterForm';
import ForgotPasswordForm from '../components/Auth/ForgotPasswordForm';
import ResetPasswordForm from '../components/Auth/ResetPasswordForm';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import loginIllustration from '../assets/login-illustration.jpg';

function AuthPage() {
    const [view, setView] = useState('login'); // 'login', 'register', 'forgot', 'reset'
    const [resetEmail, setResetEmail] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { googleLogin, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            await googleLogin(credentialResponse.credential);
        } catch (err) {
            console.error('Google Login Failed', err);
        }
    };

    const getHeaderText = () => {
        switch (view) {
            case 'register': return { title: 'Get Started', subtitle: 'Create an account to continue' };
            case 'forgot': return { title: 'Reset Password', subtitle: 'Recover your account access' };
            case 'reset': return { title: 'Set New Password', subtitle: 'Choose a strong new password' };
            default: return { title: 'Welcome Back', subtitle: 'Please login to continue' };
        }
    };

    const { title, subtitle } = getHeaderText();

    return (
        <div className={styles.container}>
            <div className={styles.leftPanel}>
                <img
                    src={loginIllustration}
                    alt="Money Management Illustration"
                    className={styles.illustration}
                />
            </div>

            <div className={styles.rightPanel}>
                <div className={styles.authBox}>
                    <div className={styles.header}>
                        <div className={styles.title}>{title}</div>
                        <div className={styles.subtitle}>{subtitle}</div>
                    </div>

                    {successMessage && <div className={styles.successMessage} style={{
                        color: '#4db6ac',
                        background: 'rgba(77, 182, 172, 0.1)',
                        padding: '10px',
                        borderRadius: '6px',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        textAlign: 'center'
                    }}>{successMessage}</div>}

                    {view === 'login' && (
                        <LoginForm onForgotPassword={() => setView('forgot')} />
                    )}

                    {view === 'register' && (
                        <RegisterForm />
                    )}

                    {view === 'forgot' && (
                        <ForgotPasswordForm
                            onCodeSent={(email) => {
                                setResetEmail(email);
                                setView('reset');
                                setSuccessMessage('');
                            }}
                            onBack={() => setView('login')}
                        />
                    )}

                    {view === 'reset' && (
                        <ResetPasswordForm
                            email={resetEmail}
                            onSuccess={() => {
                                setView('login');
                                setSuccessMessage('Password reset successful! Please login.');
                            }}
                            onBack={() => setView('login')}
                        />
                    )}

                    {view === 'login' && (
                        <div className={styles.googleBtn}>
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => console.log('Login Failed')}
                            />
                        </div>
                    )}

                    <div className={styles.toggle}>
                        {view === 'login' ? "Don't have an account?" : (view === 'register' ? "Already have an account?" : "")}
                        {(view === 'login' || view === 'register') && (
                            <span className={styles.link} onClick={() => {
                                setView(view === 'login' ? 'register' : 'login');
                                setSuccessMessage('');
                            }}>
                                {view === 'login' ? 'Sign Up' : 'Login'}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


export default AuthPage;
