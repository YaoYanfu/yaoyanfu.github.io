import { useLanguage } from '@site/src/context/LanguageContext';
import styles from './styles.module.css';

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className={styles.toggle}>
      <button
        className={`${styles.option} ${lang === 'en' ? styles.active : ''}`}
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
      >
        EN
      </button>
      <button
        className={`${styles.option} ${lang === 'zh' ? styles.active : ''}`}
        onClick={() => setLang('zh')}
        aria-pressed={lang === 'zh'}
      >
        中文
      </button>
    </div>
  );
}
