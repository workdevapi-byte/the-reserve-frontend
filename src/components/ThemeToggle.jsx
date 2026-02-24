import { useTheme } from '../context/ThemeContext';
import styles from './ThemeToggle.module.css';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div
            className={`${styles.toggleContainer} ${theme === 'light' ? styles.light : styles.dark}`}
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            <div className={styles.slider}>
                <div className={styles.iconContainer}>
                    {theme === 'dark' ? (
                        <span className={styles.icon}>🌙</span>
                    ) : (
                        <span className={styles.icon}>☀️</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ThemeToggle;
