# NyaSubConverter Front

独立的 SubConverter Web Client。

完整文档见 [docs/README.md](docs/README.md)。

## 开发

```powershell
npm install
npm run dev
```

打开 `http://localhost:3000`。所有 Provider、Profile、历史与设置默认保存在浏览器 `localStorage` 中。

## Provider Endpoint

添加后端时填写完整的 SubConverter `/sub` 地址，例如：

```text
http://127.0.0.1:25500/sub
https://sub.example.com/sub
```

公共服务列表支持 JSON 数组或 `{ "providers": [...] }` 格式。每项至少包含 `name` 与 `endpoint`，可选字段为 `id`、`enabled` 和 `privacy_level`。

在 `npm run dev` 开发模式下，转换后端页会显示“导出公共列表”。它将当前已启用的后端下载为：

```json
{
  "version": 1,
  "updatedAt": "2026-08-11T00:00:00.000Z",
  "providers": [
    {
      "id": "provider-id",
      "name": "公开服务名称",
      "type": "public",
      "endpoint": "https://sub.example.com/sub",
      "enabled": true,
      "privacy_level": "high"
    }
  ]
}
```

将文件发布到可跨域访问的 HTTPS 地址后，其他实例可通过“设置 → 公共服务列表”加载。生产构建不会显示该导出入口。

## 扩展服务

短链与远程配置托管并非 SubConverter 标准接口，可以在“设置 → 扩展服务”中按需配置：

- 短链 API：未配置 Token 时接收兼容 sub-web-api 的 `longUrl` 和可选 `shortKey` 表单字段，返回 `ShortUrl`；配置 Token 后使用 `Authorization: Bearer <token>`，以 JSON 发送 `longUrl` 和可选 `customSlug`，兼容 Shlink / shlink-client-deck API。
- 配置托管 API：接收 `config` 表单字段，返回 `{ "code": 0, "data": "https://..." }`。

设置中可以为默认短链 API 添加可选 Token，也可以继续添加多个短链服务。新增服务按添加顺序显示在订阅转换页的短链 API 下拉框顶部；Token 默认以密码形式隐藏，仅保存在当前浏览器本地数据中。

这些服务会接触订阅地址或配置正文，默认不配置、不调用。
