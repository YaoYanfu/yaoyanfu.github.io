import {useEffect} from 'react';
import Layout from '@theme/Layout';
import {useLocation} from '@docusaurus/router';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import {useLanguage, useTranslation} from '@site/src/context/LanguageContext';
import projects from '../data/projects';
import styles from './project.module.css';

export default function Project() {
  const t = useTranslation();
  const {lang} = useLanguage();
  const {hash} = useLocation();
  const {collectAnchor} = useBrokenLinks();
  projects.forEach((project) => collectAnchor(project.id));

  // Homepage detail links open their target card, including on direct loads.
  useEffect(() => {
    const id = hash.slice(1);
    if (projects.some((project) => project.id === id)) {
      const card = document.getElementById(id);
      card.open = true;
      card.scrollIntoView({block: 'start', behavior: 'instant'});
    }
  }, [hash]);

  const statusLabel = {
    Active: t('project.status.active'),
    WIP: t('project.status.wip'),
    Archived: t('project.status.archived'),
  };

  return (
    <Layout title={t('project.title')} description={t('project.subtitle')}>
      <main className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>{t('project.title')}</h1>
          <p className={styles.subtitle}>{t('project.subtitle')}</p>
        </header>
        <div className={styles.grid}>
          {projects.map((p) => (
            <details key={p.id} id={p.id} className={styles.card}>
              <summary
                className={styles.cardSummary}
                aria-label={p.title[lang]}
                aria-describedby={`${p.id}-summary`}>
                <div className={styles.cardTop}>
                  <span className={styles.status}>
                    <span className={`${styles.statusDot} ${
                      p.status === 'Active' ? styles.statusActive :
                      p.status === 'Archived' ? styles.statusArchived : styles.statusWip
                    }`} />
                    {statusLabel[p.status]}
                  </span>
                  {p.closedSource && <span className={styles.closedSource}>{t('project.closedSource')}</span>}
                </div>
                <span className={styles.category}>{p.category[lang]}</span>
                <h2 id={`${p.id}-title`} className={styles.cardTitle}>{p.title[lang]}</h2>
                {p.role && <p className={styles.role}>{t('project.role')}: {p.role[lang]}</p>}
                <p id={`${p.id}-summary`} className={styles.cardDesc}>{p.description[lang]}</p>
                <div className={styles.tags}>
                  {p.tags.map((tag) => <span key={tag} className={styles.tag}>{tag}</span>)}
                </div>
                <span className={styles.toggle}>
                  <span className={styles.expandLabel}>{t('project.expand')}</span>
                  <span className={styles.collapseLabel}>{t('project.collapse')}</span>
                  <svg className={styles.chevron} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="m5 7.5 5 5 5-5" /></svg>
                </span>
              </summary>
              <div className={styles.detailsContent}>
                {p.details?.map((section) => (
                  <section key={section.id} className={styles.detailSection}>
                    <h3>{section.title[lang]}</h3>
                    {section.paragraphs?.map((paragraph, index) => <p key={index}>{paragraph[lang]}</p>)}
                    {section.items && <ul>{section.items.map((item, index) => <li key={index}>{item[lang]}</li>)}</ul>}
                  </section>
                ))}
                <div className={styles.resources}>
                  <h3>{t('project.links')}</h3>
                  {p.closedSource ? (
                    <p className={styles.closedSourceNote}>{t('project.closedSourceNote')}</p>
                  ) : (
                    <div className={styles.links}>
                      {p.github && <a className={styles.link} href={p.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a>}
                      {p.demo && <a className={styles.link} href={p.demo} target="_blank" rel="noopener noreferrer">{t('project.demo')} ↗</a>}
                      {p.resources?.map((resource) => <a key={resource.href} className={styles.link} href={resource.href} target="_blank" rel="noopener noreferrer">{resource.label[lang]} ↗</a>)}
                    </div>
                  )}
                </div>
              </div>
            </details>
          ))}
        </div>
      </main>
    </Layout>
  );
}
