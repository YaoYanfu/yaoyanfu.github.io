import { useMemo } from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import { useTranslation } from '@site/src/context/LanguageContext';

import styles from './index.module.css';

/* ── icons ── */

function IconEmail() { return (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 4-10 8L2 4"/></svg>); }
function IconGitHub() { return (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.73.083-.73 1.205.085 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.604-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.895-.015 3.285 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12 24 5.37 18.63 0 12 0z"/></svg>); }
function IconBilibili() { return (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373z"/></svg>); }
function IconZhihu() { return (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.44 12.275h-1.802v-1.275h1.802v1.275zm0 3.45h-1.802v-1.275h1.802v1.275zm5.91-12.87L17.52 2.09a.29.29 0 0 0-.375.048l-5.67 7.062h3.06l5.67-7.062a.285.285 0 0 0-.048-.38l-.808-.903zm-6.093 4.348h3.526L13.7 2.805H7.073l-.521.602 5.003 8.27c.483.606.968 1.23 1.43 1.857.474.647.858 1.252 1.178 1.836h2.046l-4.62-7.64H14.2l.631-1.274h-3.556l-.343.697h1.325v.587zm-3.17 8.916l-1.258.033v5.604h-2.4V14.5l-1.524-.033.034-1.251h5.21l.034 1.251-1.258.033v5.604h-2.4v-5.605h1.291l.033 1.252h-1.291v3.88l3.529-3.88zm.754-8.916l-.838.925-1.094 1.172 1.906 2.434-.738.916L13.7 13.05h3.66l-1.14 1.35.486.616.965-1.12 1.13-1.397-1.7-1.642z"/></svg>); }
function IconX() { return (<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>); }

const contacts = [
  { label: 'Email',   href: 'yvesyao0209@foxmail.com',                    Icon: IconEmail },
  { label: 'GitHub',  href: 'https://github.com/YaoYanfu',                Icon: IconGitHub },
  { label: 'B站',     href: 'https://space.bilibili.com/286154288',       Icon: IconBilibili },
  { label: '知乎',    href: 'https://www.zhihu.com/people/bxel8l',         Icon: IconZhihu },
  { label: 'X',       href: 'https://x.com/yao_yves15717',                Icon: IconX },
];

/* ── Sidebar ── */

function Sidebar({ t }) {
  const nav = [
    { key: 'nav.about',      href: '#about' },
    { key: 'nav.experience', href: '#experience' },
    { key: 'nav.projects',   href: '#projects' },
  ];

  const linkItems = [
    { key: 'nav.blog',      href: '/blog' },
    { key: 'nav.dashboard', href: '/dashboard' },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarInner}>
        <img className={styles.avatar} src="/img/avatar.jpg" alt="Yves Yao" />
        <h1 className={styles.sidebarName}>Yves Yao</h1>
        <p className={styles.sidebarTagline}>{t('sidebar.tagline')}</p>
        <nav className={styles.sidebarNav}>
          {nav.map(({ key, href }) => (
            <a key={key} className={styles.navItem} href={href}>{t(key)}</a>
          ))}
          {linkItems.map(({ key, href }) => (
            <Link key={key} className={styles.navItem} to={href}>{t(key)}</Link>
          ))}
          <span className={styles.navDivider} />
          {contacts.map(({ label, href, Icon }) => (
            <a key={label} className={styles.navItem} href={href} target="_blank" rel="noopener noreferrer">
              <span className={styles.navIcon}><Icon /></span>
              {label}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}

/* ── Status Panel ── */

function StatusPanel({ t }) {
  const statusKeys = [
    ['home.status.nowBuilding',  'home.status.nowBuildingVal'],
    ['home.status.currentFocus', 'home.status.currentFocusVal'],
    ['home.status.latestPost',   'home.status.latestPostVal'],
    ['home.status.projectPulse', 'home.status.projectPulseVal'],
  ];

  return (
    <div className={styles.statusPanel}>
      <div className={styles.panelHeader}><span className={styles.statusDot}/><span>{t('home.status.header')}</span></div>
      <div className={styles.statusList}>
        {statusKeys.map(([lk, vk]) => (
          <div className={styles.statusRow} key={lk}><span>{t(lk)}</span><strong>{t(vk)}</strong></div>
        ))}
      </div>
    </div>
  );
}

/* ── Page ── */

export default function Home() {
  const t = useTranslation();

  const experience= useMemo(() => {
    const items = [];
    for (let i = 0; t(`home.experience.${i}.heading`) !== `home.experience.${i}.heading`; i++) {
      items.push({
        icon:    t(`home.experience.${i}.icon`),
        heading: t(`home.experience.${i}.heading`),
        sub:     t(`home.experience.${i}.sub`),
        desc:    t(`home.experience.${i}.desc`),
        time:    t(`home.experience.${i}.time`),
      });
    }
    return items;
  }, [t]);

  const projects = useMemo(() => [0, 1, 2].map(i => ({
    meta: t(`home.projects.${i}.meta`),
    name: t(`home.projects.${i}.name`),
    desc: t(`home.projects.${i}.desc`),
  })), [t]);

  return (
    <Layout title="Yves Yao" description={t('sidebar.tagline')}>
      <div className={styles.wrapper}>
        <Sidebar t={t} />

        <main className={styles.main}>

          {/* 1. About */}
          <section className={styles.section} id="about">
            <h2 className={styles.sectionTitle}>{t('home.about.title')}</h2>
            <p className={styles.bodyText}>{t('home.about.body')}</p>
            <div className={styles.statusWrap}><StatusPanel t={t} /></div>
          </section>

          {/* 2. Experience */}
          <section className={styles.section} id="experience">
            <h2 className={`${styles.sectionTitle} anim-fade-up`}>{t('home.experience.title')}</h2>
            <div className={styles.experienceList}>
              {experience.map((e, i) => (
                <div className={`${styles.expItem} anim-fade-up anim-d${i + 1}`} key={e.heading}>
                  <div className={styles.expIconBox}>
                    <img className={styles.expIcon} src={e.icon} alt="" />
                  </div>
                  <div className={styles.expContent}>
                    <div className={styles.expHeadRow}>
                      <span className={styles.expHeading}>{e.heading}</span>
                      <span className={styles.expTime}>{e.time}</span>
                    </div>
                    <span className={styles.expSub}>{e.sub}</span>
                    <p className={styles.expDesc}>{e.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 3. Projects */}
          <section className={styles.section} id="projects">
            <h2 className={`${styles.sectionTitle} anim-fade-up`}>{t('home.projects.title')}</h2>
            <div className={styles.projectList}>
              {projects.map((p, i) => (
                <article className={`${styles.projectCard} anim-fade-up anim-d${i + 1}`} key={p.name}>
                  <span className={styles.projectMeta}>{p.meta}</span>
                  <h3 className={styles.projectName}>{p.name}</h3>
                  <p className={styles.projectDesc}>{p.desc}</p>
                </article>
              ))}
            </div>
            <Link className={styles.viewAll} to="/project">{t('home.projects.viewAll')}</Link>
          </section>

          {/* 4. Recent */}
          <section className={styles.section}>
            <h2 className={`${styles.sectionTitle} anim-fade-up`}>{t('home.recent.title')}</h2>
            <div className={styles.recentGrid}>
              <Link to="/blog" className={`${styles.linkCard} anim-fade-up anim-d1`}>
                <span className={styles.linkCardLabel}>{t('home.recent.blog.label')}</span>
                <strong className={styles.linkCardTitle}>{t('home.recent.blog.title')}</strong>
                <p className={styles.linkCardDesc}>{t('home.recent.blog.desc')}</p>
              </Link>
              <Link to="/dashboard" className={`${styles.linkCard} anim-fade-up anim-d2`}>
                <span className={styles.linkCardLabel}>{t('home.recent.dashboard.label')}</span>
                <strong className={styles.linkCardTitle}>{t('home.recent.dashboard.title')}</strong>
                <p className={styles.linkCardDesc}>{t('home.recent.dashboard.desc')}</p>
              </Link>
            </div>
          </section>

        </main>
      </div>
    </Layout>
  );
}
