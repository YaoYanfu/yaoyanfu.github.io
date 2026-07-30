import {useEffect} from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

import ChieMascot from '@site/src/components/ChieMascot';
import styles from './chie-preview.module.css';

export default function ChiePreview() {
  useEffect(() => {
    document.body.classList.add('chie-preview-active');
    return () => document.body.classList.remove('chie-preview-active');
  }, []);

  return (
    <Layout
      title="Chie CSS Prototype"
      description="千惠 CSS 分层动画看板娘预览"
      noFooter
    >
      <Head>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <main className={styles.page}>
        <div className={styles.desktopOnly}>
          <aside className={styles.brief}>
            <Link className={styles.backLink} to="/">
              <span aria-hidden="true">←</span>
              返回主页
            </Link>

            <div className={styles.identity}>
              <span className={styles.eyebrow}>CSS AVATAR PROTOTYPE / 02</span>
              <p className={styles.kicker}>AI 实体 · 主页看板娘</p>
              <h1>
                <span>千惠</span>
                <em>Chie</em>
              </h1>
              <p className={styles.intro}>
                十五六岁外观重修版，用于验证落地站姿、呼吸、真实表情和点击反馈。
                复杂换姿将在基准形象确认后，以额外素材接入。
              </p>
            </div>

            <dl className={styles.specs}>
              <div>
                <dt>RENDER</dt>
                <dd>CSS layers</dd>
              </div>
              <div>
                <dt>INPUT</dt>
                <dd>Pointer + zones</dd>
              </div>
              <div>
                <dt>STATE</dt>
                <dd>4 emotion tags</dd>
              </div>
              <div>
                <dt>MOTION</dt>
                <dd>Grounded / blink / sway</dd>
              </div>
            </dl>

            <div className={styles.instructions}>
              <span className={styles.pulse} aria-hidden="true" />
              <p>移动鼠标观察轻微姿态响应，点击头部、脸或全身触发反馈。</p>
            </div>
          </aside>

          <section className={styles.stagePanel} aria-label="千惠模型交互预览">
            <ChieMascot />
          </section>
        </div>

        <section className={styles.mobileNotice}>
          <span>CHIE / DESKTOP PREVIEW</span>
          <h1>请在桌面端查看模型</h1>
          <p>该原型需要鼠标指针和较大的显示区域，移动端暂不加载角色。</p>
          <Link to="/">返回主页</Link>
        </section>
      </main>
    </Layout>
  );
}
