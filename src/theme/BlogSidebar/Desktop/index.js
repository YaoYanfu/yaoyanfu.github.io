/**
 * 博客侧边栏（桌面）
 *
 * 只保留框架原有的一栏布局（col col--3），分组与展开逻辑都在
 * @theme/BlogSidebar/Content，和手机端共用同一套。
 */

import React, {memo} from 'react';
import BlogSidebarContent from '@theme/BlogSidebar/Content';

function BlogSidebarDesktop() {
  return (
    <aside className="col col--3">
      <BlogSidebarContent />
    </aside>
  );
}

export default memo(BlogSidebarDesktop);
