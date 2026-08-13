import React from 'react';
import BlogListPage from '@theme-original/BlogListPage';
import BlogHero from '@site/src/components/BlogHero';

/**
 * /blog 列表页：仅当"上一条访问不是文章页"时展示 Hero（点击导航进入时亮相，
 * 从文章页返回时直接看列表）。标记由 BlogPostPage 维护。
 * Hero 退场时列表容器挂 reveal class → 文章逐篇上浮淡入（custom.css）。
 */
const HERO_FLAG = 'chie-blog-hero-prev-post';

function shouldShowHero() {
  if (typeof window === 'undefined') return false;
  try {
    const prevWasPost = sessionStorage.getItem(HERO_FLAG) === '1';
    return !prevWasPost;
  } catch {
    return true;
  }
}

export default function BlogListPageWrapper(props) {
  const [showHero] = React.useState(shouldShowHero);
  const [revealed, setRevealed] = React.useState(false);

  React.useEffect(() => {
    // 从列表页出发的下一次导航，来源不再是文章页
    try {
      sessionStorage.setItem(HERO_FLAG, '0');
    } catch {
      // ignore
    }
  }, []);

  return (
    <>
      <div className={revealed ? 'blog-hero-reveal' : undefined}>
        <BlogListPage {...props} />
      </div>
      {showHero && (
        <BlogHero items={props.items} onEnter={() => setRevealed(true)} />
      )}
    </>
  );
}
