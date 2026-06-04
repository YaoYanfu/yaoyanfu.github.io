import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import styles from './index.module.css';

function ArrowUpRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="7 7 17 7 17 17" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

const statusItems = [
  ['Now Building', 'Personal site redesign'],
  ['Current Focus', 'Frontend, AI agents, UI polish'],
  ['Latest Post', '我的大一'],
  ['Project Pulse', 'XDWe, PicoGK packaging, math modeling'],
];

const featuredProjects = [
  {
    name: 'XDWe / shallowseek',
    description: 'A teacher-augmented AI learning system for Xidian University, built around RAG, course resources, and reviewed knowledge flow.',
    meta: 'AI Learning System',
  },
  {
    name: 'PicoGK Packaging Design',
    description: 'A 3D packaging design project based on PicoGK and computational geometry ideas.',
    meta: 'Computational Design',
  },
  {
    name: 'Math Modeling Record',
    description: 'A compact record of my first mathematical modeling competition: scripts, data, visualization, outputs, and approach notes.',
    meta: 'Python / Modeling',
  },
];

const updates = [
  '将这个网站打造成一个更平静、更易读的个人中心。',
  '从AI agent、前端和建模实验中收集项目笔记。',
  '在连接真实后端之前，确保留言板用户界面（UI）已准备就绪。',
];

function StatusPanel() {
  return (
    <section className={styles.statusPanel} aria-label="Current status">
      <div className={styles.panelHeader}>
        <span className={styles.statusDot} />
        <span>Live Snapshot</span>
      </div>
      <div className={styles.statusList}>
        {statusItems.map(([label, value]) => (
          <div className={styles.statusRow} key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

function HomePage() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <main className={styles.pageShell}>
        <section className={styles.introGrid}>
          <div className={styles.introCopy}>
            <p className={styles.eyebrow}>Personal Blog / Portfolio / Message Board</p>
            <h1 className={styles.title}>
              <span>Hi, I'm Yves.</span>
              <span className={styles.titleGradient}>I build web things and curious little systems.</span>
            </h1>
            <p className={styles.subtitle}>
              你好，我是 Yves。喜欢折腾 Web、AI Agent 和一些工程小项目，也会把学习过程、生活复盘和突然冒出来的想法写下来。
            </p>
            <div className={styles.actions}>
              <Link className={styles.primaryBtn} to="/project">
                View Projects
                <ArrowUpRight />
              </Link>
              <Link className={styles.secondaryBtn} to="/blog">
                Read Blog
                <ArrowRight />
              </Link>
            </div>
          </div>
          <StatusPanel />
        </section>

        <section className={styles.sectionGrid}>
          <div className={styles.aboutBlock}>
            <p className={styles.sectionLabel}>About</p>
            <h2>记录、试错、然后把有趣的东西做出来。</h2>
            <p>
            这个网站是我网络上的小基地：既是笔记本，又是项目存档，还是一个留下痕迹的地方。
            </p>
          </div>
          <div className={styles.updatePanel}>
            <p className={styles.sectionLabel}>Now</p>
            <ul>
              {updates.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className={styles.projectsSection}>
          <div className={styles.sectionHeading}>
            <p className={styles.sectionLabel}>Featured Projects</p>
            <Link to="/project">All projects <ArrowRight /></Link>
          </div>
          <div className={styles.projectGrid}>
            {featuredProjects.map((project) => (
              <article className={styles.projectCard} key={project.name}>
                <span>{project.meta}</span>
                <h3>{project.name}</h3>
                <p>{project.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.bottomLinks}>
          <Link to="/blog" className={styles.linkPanel}>
            <span>Latest Blog</span>
            <strong>我的大一</strong>
            <p>一些关于记录、反思、生活和成长的随笔。</p>
          </Link>
          <Link to="/dashboard" className={styles.linkPanel}>
            <span>Message Board</span>
            <strong>Dashboard is open</strong>
            <p>留言板先以静态 UI 呈现，后续再接真实数据源。</p>
          </Link>
        </section>
      </main>
    </Layout>
  );
}

export default HomePage;
