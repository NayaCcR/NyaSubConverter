# 生产编译前配置

生产编译前如果需要更换默认转换后端、预置短链服务或调整品牌部署地址，可以直接修改源码中的默认数据。配置入口主要集中在：

```text
src/lib/app-data.ts
```

## 默认转换后端

默认 Provider 位于 `defaultProviders`，当前本机后端是：

```ts
{
  id: "local-subconverter",
  name: "本机 SubConverter",
  type: "self_hosted",
  endpoint: "http://127.0.0.1:25500/sub",
  enabled: true,
  status: "unknown",
  privacy_level: "low",
  isDefault: true,
}
```

生产环境通常需要把 `endpoint` 改成实际可访问的 HTTPS 地址，并保留完整的 `/sub` 路径，例如：

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

这里的 `shortUrlEndpoint` 默认留空，表示应用不会自动调用短链服务。需要编译时预置一个服务时，可以修改为：

```ts
shortUrlEndpoint: "https://link.example.com/api/hosted/shlink/server-id/short-urls",
shortUrlToken: "",
```

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
    endpoint: "https://link.example.com/api/hosted/shlink/server-id/short-urls",
    token: "",
  },
],
```

运行后也可以在“设置 → 扩展服务”中添加服务。运行时新增的服务会按添加顺序排在内置短链服务的前面。

内置的无 Token 短链服务列表位于 `shortUrlServices` 常量，当前包括 `v1.mk`、`d1.mk`、`dlj.tf`、`suo.yt` 和 `sub.cm`。它们与 `defaultSettings.shortUrlEndpoint` 是两套配置：前者是下拉框中的内置选项，后者是编译时预置的默认服务。

## Token 安全提示

Token 会随前端 JavaScript 发送给浏览器，写入源码或 `defaultSettings` 后也会进入生产构建产物，任何能访问网站的人都可能通过浏览器开发者工具看到它。除非 Token 权限受限、可撤销且风险可接受，否则建议：

1. 编译时只填写 API URL，Token 保持为空。
2. 部署后在“设置 → 扩展服务”中由使用者填写 Token。
3. 使用最小权限、可单独撤销和设置有效期的 Token。

## 编译与验证

修改完成后执行：

```powershell
npm ci
npm run typecheck
npm run lint
npm run build
npm start
```

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
