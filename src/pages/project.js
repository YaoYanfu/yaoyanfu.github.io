import Layout from '@theme/Layout';
import projects from '../data/projects';
import styles from './project.module.css';

function statusLabel(status) {
  switch (status) {
    case 'Active': return '活跃';
    case 'Archived': return '已归档';
    case 'WIP': return '开发中';
    default: return status;
  }
}

export default function Project() {
  return (
    <Layout title="Project" description="个人项目展示">
      <main className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>Project</h1>
          <p className={styles.subtitle}>个人项目展示</p>
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
                {statusLabel(p.status)}
              </div>
              <h3 className={styles.cardTitle}>{p.title}</h3>
              <p className={styles.cardDesc}>{p.description}</p>
              <div className={styles.tags}>
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className={t === 'WIP' ? styles.tagWip : styles.tag}
                  >
                    {t}
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
