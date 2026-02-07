import { useState, useContext, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import styles from './AuthPage.module.css';
import LoginForm from '../components/Auth/LoginForm';
import RegisterForm from '../components/Auth/RegisterForm';
import AuthContext from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import loginIllustration from '../assets/login-illustration.jpg';

function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
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
                        <div className={styles.title}>
                            {isLogin ? 'Welcome Back' : 'Get Started'}
                        </div>
                        <div className={styles.subtitle}>
                            {isLogin ? 'Please login to continue' : 'Create an account to continue'}
                        </div>
                    </div>

                    {isLogin ? <LoginForm /> : <RegisterForm />}

                    <div className={styles.googleBtn}>
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => console.log('Login Failed')}
                        />
                    </div>

                    <div className={styles.toggle}>
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                        <span className={styles.link} onClick={() => setIsLogin(!isLogin)}>
                            {isLogin ? 'Sign Up' : 'Login'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AuthPage;
