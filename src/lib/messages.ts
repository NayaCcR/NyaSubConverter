/**
 * Minimal message catalog for the shell. Replace with your own i18n layer —
 * `useI18n().t(key, params)` is the only contract the layout components rely on.
 */

export type MessageTree = { [key: string]: string | MessageTree };

export const DEFAULT_LOCALE = "zh-CN";

export const dictionaries: Record<string, MessageTree> = {
  "zh-CN": {
    common: { close: "关闭", loading: "加载中...", switchLanguage: "切换语言" },
    nav: {
      home: "订阅转换",
      providers: "转换后端",
      profiles: "配置 Profile",
      history: "历史记录",
      settings: "设置",
    },
    layout: {
      groups: { convert: "转换", records: "管理" },
      header: { console: "订阅转换工作台", workspace: "独立 Web Client" },
      nav: { open: "打开导航" },
      style: {
        label: "界面布局",
        sidebar: "侧边栏",
        topbar: "顶部栏",
        switchToSidebar: "切换到侧边栏布局",
        switchToTopbar: "切换到顶部栏布局",
      },
      sidebar: { collapse: "收起侧边栏", expand: "展开侧边栏" },
      footer: { credit: "{app} by {author}", repoLabel: "打开仓库" },
    },
    theme: { light: "浅色", dark: "深色", system: "跟随系统" },
  },
  "en-US": {
    common: { close: "Close", loading: "Loading...", switchLanguage: "Switch language" },
    nav: {
      home: "Convert",
      providers: "Providers",
      profiles: "Profiles",
      history: "History",
      settings: "Settings",
    },
    layout: {
      groups: { convert: "Convert", records: "Manage" },
      header: { console: "Subscription workspace", workspace: "Independent Web Client" },
      nav: { open: "Open navigation" },
      style: {
        label: "Layout",
        sidebar: "Sidebar",
        topbar: "Top bar",
        switchToSidebar: "Switch to sidebar layout",
        switchToTopbar: "Switch to topbar layout",
      },
      sidebar: { collapse: "Collapse sidebar", expand: "Expand sidebar" },
      footer: { credit: "{app} by {author}", repoLabel: "Open repository" },
    },
    theme: { light: "Light", dark: "Dark", system: "System" },
  },
};

export function isLocaleCode(value: string): boolean {
  return Object.prototype.hasOwnProperty.call(dictionaries, value);
}
