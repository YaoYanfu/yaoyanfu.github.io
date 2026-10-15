import Layout from '@theme/Layout';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import {useLanguage, useTranslation} from '@site/src/context/LanguageContext';
import research, {publications} from '@site/src/data/research';
import styles from './research.module.css';

function ResearchLinks({links, lang}) {
  return (
    <div className={styles.links}>
      {links.map((link) => <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">{link.label[lang]} ↗</a>)}
    </div>
  );
}

export default function Research() {
  const t = useTranslation();
  const {lang} = useLanguage();
  const {collectAnchor} = useBrokenLinks();
  research.forEach((item) => collectAnchor(item.id));

  return (
    <Layout title={t('research.title')} description={t('research.subtitle')}>
      <main className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>{t('research.title')}</h1>
          <p className={styles.subtitle}>{t('research.subtitle')}</p>
        </header>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('research.current')}</h2>
          {research.map((item) => (
            <article key={item.id} id={item.id} className={styles.researchCard}>
              <span className={styles.status}>{t(`research.status.${item.status}`)}</span>
              <h3 className={styles.researchTitle}>{item.title[lang]}</h3>
              <p className={styles.description}>{item.description[lang]}</p>
              <h4 className={styles.focusTitle}>{t('research.focus')}</h4>
              <ul className={styles.focusList}>{item.focus.map((focus, index) => <li key={index}>{focus[lang]}</li>)}</ul>
              <ul className={styles.tags}>{item.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
              {item.links.length > 0 && <ResearchLinks links={item.links} lang={lang} />}
            </article>
          ))}
        </section>
        <section className={styles.outputs}>
          <h2 className={styles.sectionTitle}>{t('research.outputs.title')}</h2>
          {publications.length > 0 ? publications.map((publication) => (
            <article key={publication.id} className={styles.publication}>
              <h3>{publication.title}</h3>
              <p>{publication.authors}</p>
              <p>{publication.venue} · {publication.year}</p>
              <ResearchLinks links={publication.links} lang={lang} />
            </article>
          )) : <p className={styles.outputNote}>{t('research.outputs.note')}</p>}
        </section>
      </main>
    </Layout>
  );
}
