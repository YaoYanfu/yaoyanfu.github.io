import React, {useEffect} from 'react';
import BlogPostPage from '@theme-original/BlogPostPage';

/**
 * 文章页：记录"当前最后访问的是文章页"标记，
 * BlogListPage 据此判断从文章页返回时跳过 Hero。
 */
const HERO_FLAG = 'chie-blog-hero-prev-post';

export default function BlogPostPageWrapper(props) {
  useEffect(() => {
    try {
      sessionStorage.setItem(HERO_FLAG, '1');
    } catch {
      // ignore
    }
  }, []);

  return (
    <>
      <BlogPostPage {...props} />
    </>
  );
}
