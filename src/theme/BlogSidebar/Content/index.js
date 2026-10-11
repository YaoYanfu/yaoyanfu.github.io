/**
 * 博客侧边栏导航（桌面与手机共用一套分组与展开逻辑）
 *
 * 数据来自 blog-nav-plugin 通过 setGlobalData 产出的导航数据（见 plugins/blog-nav-plugin）：
 * 随笔 / 文章两个板块的文章列表，以及按登记顺序排列的专栏及其文章。
 * 具体渲染什么由 ./navViewState.js 纯函数算出。
 *
 * 交互约定：
 * - 随笔、文章默认显示各自最新的 5 篇，超过 5 篇时给出「查看全部 / 收起」
 * - 当前文章排在第 5 篇之后时默认展开该板块，阅读专栏文章时默认展开专栏入口与所属专栏；
 *   一旦用户手动展开或收起，就以用户的选择为准（同一标签页内通过 sessionStorage 保留）
 * - 收起专栏入口不会丢掉各个专栏自己的展开状态
 * - 当前文章高亮并带 aria-current="page"
 */

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import {usePluginData} from '@docusaurus/useGlobalData';
import {useLanguage, useTranslation} from '@site/src/context/LanguageContext';
import {buildNavView, columnDisplayName, isCurrentPost} from './navViewState';
import styles from './styles.module.css';

/** 展开状态在同一个浏览器标签页内保留。 */
const STORAGE_KEY = 'blog_sidebar_open_state';

const NAV_PLUGIN_NAME = 'blog-nav-plugin';

function readStoredState() {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const parsed = JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? 'null');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeStoredState(state) {
  if (typeof window === 'undefined') {
    return;
  }
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 隐私模式等场景下 sessionStorage 不可写；忽略即可，展开状态退化为只在本次渲染内有效
  }
}

function PostList({posts, currentPath, nested, onNavigate}) {
  return (
    <ul className={clsx(styles.postList, nested && styles.postListNested)}>
      {posts.map((post) => {
        const active = isCurrentPost(post, currentPath);
        return (
          <li key={post.permalink} className={styles.postItem}>
            <Link
              to={post.permalink}
              className={clsx(styles.postLink, active && styles.postLinkActive)}
              aria-current={active ? 'page' : undefined}
              onClick={onNavigate}>
              {post.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Chevron({open}) {
  return (
    <span
      className={clsx(styles.chevron, open && styles.chevronOpen)}
      aria-hidden="true">
      ›
    </span>
  );
}

export default function BlogSidebarContent({mobile = false, onNavigate}) {
  const {pathname} = useLocation();
  const navData = usePluginData(NAV_PLUGIN_NAME);
  const {lang} = useLanguage();
  const t = useTranslation();

  // 只保存「用户显式做过的选择」。初值恒为空对象，保证服务端渲染与浏览器首次渲染一致；
  // 挂载后再从 sessionStorage 恢复上一次的状态。
  const [overrides, setOverrides] = useState({});

  useEffect(() => {
    const stored = readStoredState();
    if (Object.keys(stored).length > 0) {
      setOverrides(stored);
    }
  }, []);

  const applyOverrides = useCallback((patch) => {
    setOverrides((prev) => {
      const next = {...prev, ...patch};
      writeStoredState(next);
      return next;
    });
  }, []);

  const view = useMemo(
    () => buildNavView({navData, pathname, overrides}),
    [navData, pathname, overrides],
  );

  const renderSection = (title, section, onToggle) => (
    <div className={styles.section}>
      <h3 className={styles.sectionHeading}>{title}</h3>
      <div className={styles.body}>
        {section.posts.length === 0 ? (
          <p className={styles.empty}>{t('blog.sidebar.emptyPosts')}</p>
        ) : (
          <>
            <PostList
              posts={section.visible}
              currentPath={view.currentPath}
              onNavigate={onNavigate}
            />
            {section.overflowing && (
              <button
                type="button"
                className={styles.moreButton}
                aria-expanded={section.expanded}
                onClick={onToggle}>
                {section.expanded
                  ? t('blog.sidebar.showLess')
                  : t('blog.sidebar.showAll')}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <nav
      className={clsx(
        styles.nav,
        'thin-scrollbar',
        mobile ? styles.navMobile : styles.navDesktop,
      )}
      aria-label={t('blog.sidebar.navAriaLabel')}>
      {renderSection(t('blog.sidebar.essay'), view.essay, () =>
        applyOverrides({essayExpanded: !view.essay.expanded}),
      )}
      {renderSection(t('blog.sidebar.article'), view.article, () =>
        applyOverrides({articleExpanded: !view.article.expanded}),
      )}

      <div className={styles.section}>
        <h3 className={styles.sectionHeading}>
          <button
            type="button"
            className={styles.headingButton}
            aria-expanded={view.columns.expanded}
            onClick={() => applyOverrides({columnsExpanded: !view.columns.expanded})}>
            <span className={styles.rowLabel}>{t('blog.sidebar.column')}</span>
            <Chevron open={view.columns.expanded} />
          </button>
        </h3>
        {view.columns.expanded && (
          <div className={styles.body}>
            {view.columns.empty ? (
              <p className={styles.empty}>{t('blog.sidebar.emptyColumns')}</p>
            ) : (
              <ul className={styles.columnList}>
                {view.columns.items.map((column) => (
                  <li key={column.id} className={styles.columnItem}>
                    <button
                      type="button"
                      className={styles.rowButton}
                      aria-expanded={column.expanded}
                      onClick={() =>
                        applyOverrides({
                          columnExpanded: {
                            ...(overrides.columnExpanded ?? {}),
                            [column.id]: !column.expanded,
                          },
                        })
                      }>
                      <span className={styles.rowLabel}>
                        {columnDisplayName(column, lang)}
                      </span>
                      <Chevron open={column.expanded} />
                    </button>
                    {column.expanded &&
                      (column.posts.length === 0 ? (
                        <p className={clsx(styles.empty, styles.emptyNested)}>
                          {t('blog.sidebar.emptyPosts')}
                        </p>
                      ) : (
                        <PostList
                          posts={column.posts}
                          currentPath={view.currentPath}
                          nested
                          onNavigate={onNavigate}
                        />
                      ))}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
