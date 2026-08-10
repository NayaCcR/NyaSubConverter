# 公共 Provider 列表

公共 Provider 列表用于向多个 NyaSubConverter 实例分发可选转换后端。

## 导出

在开发模式运行：

```powershell
npm run dev
```

打开“转换后端”，点击“导出公共列表”。应用会下载 `nya-subconverter-providers.json`，仅包含当前已启用的后端。

导出格式：

```json
{
  "version": 1,
  "updatedAt": "2026-08-11T00:00:00.000Z",
  "providers": [
    {
      "id": "subconverter-primary",
      "name": "Primary SubConverter",
      "type": "public",
      "endpoint": "https://sub.example.com/sub",
      "enabled": true,
      "privacy_level": "high"
    }
  ]
}
```

应用也接受直接以数组作为根节点的 JSON。每个 Provider 至少需要 `name` 和 `endpoint`；省略的 `privacy_level` 会按 `high` 处理。

## 发布

把 JSON 上传到静态托管、对象存储或 Git 仓库 Raw 地址。发布地址需要满足：

- 使用 HTTPS。
- 允许浏览器跨域读取，例如响应头 `Access-Control-Allow-Origin: *` 或指定站点域名。
- 返回 `application/json`。
- Provider Endpoint 是可直接访问的完整 `/sub` URL。

不要把本机地址、内网地址、管理令牌或未经确认的第三方服务发布到公共列表。

## 消费列表

1. 打开“设置”。
2. 在“公共服务列表”填写 JSON 的公开 URL。
3. 打开“转换后端”，点击“更新公共列表”。

远程条目会以公共服务类型写入本地 Provider 列表。更新时会替换之前从远程列表加载的条目，不会删除用户创建的自建或自定义 Provider。
