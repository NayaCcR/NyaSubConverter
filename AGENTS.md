# NyaSubConverter 开发约定

- 这是独立的订阅转换前端。保留业务参数、Provider、Profile、本地存储和外部 API 协议；不要复制 NyaStack 的示例页面或引入账户系统。
- 使用 Node.js 24（`.node-version`）与 `packageManager` 固定的 pnpm 11；最低 Node.js 版本为 22.13。不要重新引入 npm 锁文件。
- 共享能力从 GitHub Packages 安装 `@nayaccr/theme`、`@nayaccr/ui`、`@nayaccr/utils`，不使用本地路径、软链接或复制 `dist`。保留本地组件兼容入口。
- CSS 顺序为 theme tokens → UI styles → 产品 globals → theme effects。后置 effects 保证焦点和 reduced-motion 不被 Tailwind hover 工具类覆盖。
- 产品 CSS 仅保留布局、字体、旧危险色和圆角兼容值；公共 token、辉光不要再复制回来。
- Button/Input 兼容层维持 40px 控件尺寸；checkbox、file input、业务 switch 和原生 select 不强制替换成文本 Input。
- FormDialog 是产品级适配器：本地化 closeLabel、限制移动端高度并允许滚动、关闭后恢复触发按钮焦点。鉴权和语言 Provider 不进入共享 UI。
- sidebar 默认不渲染桌面 topbar；两种模式右上角控件外框应同位置，包含边框后的桌面操作行总高度均为 64px。
- 没有账户登录功能，不渲染右上角账户占位或伪装成账户入口的设置按钮。保留侧栏设置入口。
- 侧栏收起图标约 20px，自定义语言菜单保留 Escape/外部点击关闭，保留按钮辉光和 reduced-motion。
- 验证：`pnpm install --frozen-lockfile`、`pnpm typecheck`、`pnpm lint`、`pnpm build`、`pnpm test`。测试使用隔离浏览器，不调用真实转换后端。
- Actions 和 Dependabot 分别配置 `GH_PACKAGES_TOKEN`（classic PAT，read:packages）。不能将 token 提交到仓库、写进前端环境变量或日志。
- Dependabot 每周为 `@nayaccr/*` 创建分组 PR；需要检查变更和 CI，不自动合并。
