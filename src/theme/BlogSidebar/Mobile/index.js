/**
 * 博客侧边栏（手机）
 *
 * 复用框架的导航栏二级菜单机制：把侧边栏内容注册为二级菜单的填充组件，
 * 点击文章后关闭整个移动端菜单。
 */

import React, {memo, useCallback} from 'react';
import {NavbarSecondaryMenuFiller} from '@docusaurus/theme-common';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import BlogSidebarContent from '@theme/BlogSidebar/Content';

function BlogSidebarMobileSecondaryMenu() {
  const mobileSidebar = useNavbarMobileSidebar();

  const closeMobileSidebar = useCallback(() => {
    if (mobileSidebar.shown) {
      mobileSidebar.toggle();
    }
  }, [mobileSidebar]);

  return <BlogSidebarContent mobile onNavigate={closeMobileSidebar} />;
}

function BlogSidebarMobile(props) {
  return (
    <NavbarSecondaryMenuFiller
      component={BlogSidebarMobileSecondaryMenu}
      props={props}
    />
  );
}

export default memo(BlogSidebarMobile);
