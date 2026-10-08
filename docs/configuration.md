# 生产编译前配置

## NyaStack 共享依赖

本产品从 GitHub Packages 消费 `@nayaccr/theme`、`@nayaccr/ui` 和 `@nayaccr/utils`。
本地首次安装前需要先完成 GitHub Packages 认证，任选一种方式：

```powershell
# 方式一：交互式登录。GitHub Packages 只支持 legacy 认证，而 `pnpm login` 没有 `--auth-type` 选项，
# 因此这里刻意保留 npm login —— 它只负责把凭据写进 ~/.npmrc，pnpm 读取的是同一份文件，安装本身仍用 pnpm。
# 用户名填写小写 `nayaccr`，密码填写具有 `read:packages` 权限的 classic PAT（不是 GitHub 登录密码）。
npm login --scope=@nayaccr --registry=https://npm.pkg.github.com --auth-type=legacy
```

```powershell
# 方式二：直接写入全局 token，适合服务器与 CI 等无交互环境。token 只落在 ~/.npmrc，不要写进仓库。
pnpm config set -g //npm.pkg.github.com/:_authToken=<classic PAT>
```

认证完成后安装依赖：

```powershell
pnpm install --frozen-lockfile
```

Actions 和 Dependabot 是独立的 secret 存储；本仓库两处均需配置 `GH_PACKAGES_TOKEN`。
只提交 scope registry 映射，不提交任何 token。Dependabot 每周生成共享依赖升级 PR，必须人工审查，不自动合并。

主题 CSS 顺序：tokens → UI styles → globals → effects。保留产品字体、危险色与旧圆角别名；公共颜色、焦点和辉光由共享包维护。
`src/components/ui` 保留 Button/Input 的尺寸适配和 Card/Dialog re-export，`src/lib/utils.ts` 保留 `cn` re-export。
`FormDialog` 为四个产品编辑器提供可本地化关闭按钮、焦点锁定、焦点恢复、遮罩/Escape 关闭及小屏滚动。

完成构建后执行 `pnpm exec playwright install chromium` 和 `pnpm test`，验证桌面/移动端的布局、语言、主题与弹窗。

## 产品默认配置

生产编译前如果需要更换默认转换后端、预置短链服务或调整品牌部署地址，可以直接修改源码中的默认数据。配置入口主要集中在：

```text
src/lib/app-data.ts
```

## 默认转换后端

默认 Provider 位于 `defaultProviders`，当前内置的自建后端是：

```ts
{
  id: "local-subconverter",
  name: "本机 SubConverter",
  type: "self_hosted",
  endpoint: "https://sub.31n.cc/sub",
  enabled: true,
  status: "unknown",
  privacy_level: "low",
  isDefault: true,
}
```

这个默认值指向本部署自己的同域后端（前端与 SubConverter 由同一个域名分流：`/` 走前端，`/sub` 与 `/version` 走 SubConverter）。
如果把前端部署到别处，需要把 `endpoint` 改成实际可访问的 HTTPS 地址，并保留完整的 `/sub` 路径，例如：

```ts
endpoint: "https://sub.example.com/sub",
```

如果只使用自己的后端，可以删除或设置 `enabled: false` 禁用其他默认 Provider。`isDefault: true` 决定转换页首次选择的后端；建议只保留一个默认后端。

### 本机地址的含义

`127.0.0.1` 指的是打开网页的那台设备，而不是部署 NyaSubConverter 的服务器：

- 每个用户都在自己的电脑上运行 SubConverter：可以保留 `http://127.0.0.1:25500/sub`。
- SubConverter 运行在服务器上：应改成服务器的 HTTPS 域名，不能让浏览器访问用户自己的 `127.0.0.1`。
- 生产页面使用 HTTPS 时，浏览器可能阻止请求 HTTP 后端；优先使用 HTTPS，并为 `/sub` 和 `/version` 配置正确的 CORS 响应头。

## 默认短链 API

默认短链 API 的预置配置位于同一个文件的 `defaultSettings`：

```ts
export const defaultSettings: AppSettings = {
  publicListUrl: "",
  shortUrlEndpoint: "",
  shortUrlToken: "",
  shortUrlServices: [],
  // 其他设置...
};
```

这里的 `shortUrlEndpoint` 默认指向公开的 link.31n.cc：

```ts
shortUrlEndpoint: "https://link.31n.cc/api/default/short-urls",
shortUrlToken: "",
```

`shortUrlToken` 默认留空，也就是开箱可用但不会带上任何人的凭证；使用者在“设置 → 扩展服务”里填入自己的 Token 后，才会切换成 Shlink 的 JSON 协议。要换成自己的服务时改这个地址即可，例如自建 Hosted 实例的 `https://link.example.com/api/default/short-urls`（`/api/default` 由 Token 绑定决定后端，不再需要写 serverId）。

`shortUrlToken` 配置后，前端会使用：

```http
Authorization: Bearer <token>
Content-Type: application/json
```

并发送 Shlink 兼容的 `longUrl` 和可选 `customSlug` 字段，适用于 shlink-client-deck 的 Hosted API。未配置 Token 时仍使用旧的 sub-web-api 表单协议。

### 预置多个短链服务

可以通过 `shortUrlServices` 在编译时加入多个服务，数组顺序就是转换页下拉框中服务的顺序：

```ts
shortUrlServices: [
  {
    id: "link-console",
    name: "Link Console",
    endpoint: "https://link.example.com/api/default/short-urls",
    token: "",
  },
],
```

运行后也可以在“设置 → 扩展服务”中添加服务。运行时新增的服务会按添加顺序排在内置短链服务的前面。

内置的无 Token 短链服务列表位于 `shortUrlServices` 常量，当前包括 `link.31n.cc`、`v1.mk`、`d1.mk`、`dlj.tf`、`suo.yt` 和 `sub.cm`。它们与 `defaultSettings.shortUrlEndpoint` 是两套配置：前者是下拉框中的内置选项，后者是编译时预置的默认服务。

两者地址相同时不会出现重复条目：下拉框会沿用内置服务的名称，并继承它的 `tip` 和 `registerUrl`。这两个可选字段用来在下拉框下方显示一句说明和一条下划线注册链接——内置的 link.31n.cc 会显示「可以记录点击数据和使用记录的短链服务，快试试。」并附上注册入口。

## Token 安全提示

Token 会随前端 JavaScript 发送给浏览器，写入源码或 `defaultSettings` 后也会进入生产构建产物，任何能访问网站的人都可能通过浏览器开发者工具看到它。除非 Token 权限受限、可撤销且风险可接受，否则建议：

1. 编译时只填写 API URL，Token 保持为空。
2. 部署后在“设置 → 扩展服务”中由使用者填写 Token。
3. 使用最小权限、可单独撤销和设置有效期的 Token。

## 编译与验证

修改完成后执行：

```powershell
pnpm install --frozen-lockfile
pnpm typecheck
pnpm lint
pnpm build
pnpm start
```

使用 `.node-version` 指定的 Node.js 24，最低要求为 Node.js 22.13；pnpm 版本由 `package.json` 中的 `packageManager` 固定。CI 必须先安装 Node.js，再安装 pnpm。

生产构建启动后，打开“转换后端”检查默认 Provider，再打开“订阅转换”检查短链 API 下拉框。

## 已有浏览器配置不会自动覆盖

Provider、Profile、历史和设置保存于浏览器 `localStorage`，键名为：

```text
nya-subconverter.data.v1
```

因此，修改 `defaultProviders` 或 `defaultSettings` 后：

- 新浏览器或清空站点数据后会使用新的默认值。
- 已经使用过该站点的浏览器会继续使用旧配置。
- 可以在“设置 → 恢复默认”应用新的源码默认值，或导入新的备份。

如果生产站点更换了域名，浏览器通常会产生新的站点存储；同域名升级则不会自动重置用户已有配置。
