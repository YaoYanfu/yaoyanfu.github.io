import { useMemo } from 'react';
import Layout from '@theme/Layout';
import { useLanguage } from '@site/src/context/LanguageContext';
import TR from '@site/src/data/translations';
import projects from '../data/projects';
import styles from './project.module.css';

export default function Project() {
  const { lang } = useLanguage();

  const t = useMemo(() => {
    const dict = TR[lang] || TR.en;
    return (key) => dict[key] || key;
  }, [lang]);

  const statusLabel = useMemo(() => ({
    Active: t('project.status.active'),
    WIP: t('project.status.wip'),
    Archived: t('project.status.archived'),
  }), [t]);

  return (
    <Layout title={t('project.title')} description={t('project.subtitle')}>
      <main className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>{t('project.title')}</h1>
          <p className={styles.subtitle}>{t('project.subtitle')}</p>
        </header>
        <div className={styles.grid}>
          {projects.map((p) => (
            <div key={p.id} className={styles.card}>
              <div className={styles.status}>
                <span
                  className={`${styles.statusDot} ${
                    p.status === 'Active' ? styles.statusActive :
                    p.status === 'Archived' ? styles.statusArchived :
                    styles.statusWip
                  }`}
                />
                {statusLabel[p.status] || p.status}
              </div>
              <h3 className={styles.cardTitle}>{p.title}</h3>
              <p className={styles.cardDesc}>{p.description}</p>
              <div className={styles.tags}>
                {p.tags.map((tag) => (
                  <span key={tag} className={tag === 'WIP' ? styles.tagWip : styles.tag}>
                    {tag}
                  </span>
                ))}
              </div>
              <div className={styles.links}>
                {p.github && (
                  <a className={styles.link} href={p.github} target="_blank" rel="noopener noreferrer">
                    GitHub ↗
                  </a>
                )}
                {p.demo && (
                  <a className={styles.link} href={p.demo} target="_blank" rel="noopener noreferrer">
                    Demo ↗
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </Layout>
  );
}
