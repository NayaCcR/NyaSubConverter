# Provider 接入

每个转换后端被表示为 Provider：

```text
name
type
endpoint
enabled
status
privacy_level
```

## 添加自建 SubConverter

Provider 的 `endpoint` 必须是完整的 `/sub` 地址：

```text
http://127.0.0.1:25500/sub
https://sub.example.com/sub
```

不要只填写域名。应用会通过 `endpoint` 生成请求，例如：

```text
https://sub.example.com/sub?target=clash&url=https%3A%2F%2Fexample.com%2Fsub
```

“测试连接”会请求同一服务的 `/version` 路径。该测试需要浏览器可访问后端；跨域策略、HTTPS 混合内容或网络限制都可能使检测失败。

## Docker 示例

```powershell
docker run -d --restart unless-stopped --name subconverter -p 25500:25500 tindy2013/subconverter:latest
```

启动后访问：

```text
http://127.0.0.1:25500/version
```

确认版本信息正常后，把 `http://127.0.0.1:25500/sub` 添加为自建 Provider。

## 隐私等级

- `low`：通常用于自己控制的服务。
- `medium`：受信任但非直接控制的服务。
- `high`：公共或未知运营方服务。

隐私等级仅表达风险提示，不会加密、代理或隐藏订阅地址。公共 Provider 可能看到订阅 URL 中的访问凭证；生产使用建议优先配置自建服务。

## 静态默认后端

项目自带的静态 Provider 位于 `src/lib/app-data.ts` 的 `defaultProviders`。这只在首次初始化本地数据时生效。用户一旦保存过 Provider，浏览器中的 `localStorage` 会优先于新的静态默认值。

若需要让已部署客户端统一更新后端，应发布公共 Provider 列表，而不是只修改 `defaultProviders`。
