# 在线规则库

侧栏「规则库」会拉取目录并展示规则数量、策略组、来源和兼容提示。「用于转换」只填入远程 `config` 参数；「保存为 Profile」新增一份个人配置。原有 ACL4SSR、特殊用途和自定义 URL 入口继续保留。

默认目录为 `/rules/catalog.json`，随源码的 `public/rules/` 部署，包含 NyaSub 固化的模板及公开方案链接。在设置的「在线规则目录」中，可以改为 NyaSub 部署的 `https://你的域名/rules/catalog.json`，或兼容的静态 JSON 地址。目录请求需允许浏览器 CORS。两个项目的公开 `/rules/*` 资源允许匿名跨域读取，不开放管理接口。

目录在首次加载或地址变更时自动拉取，也可以点击「在线更新」。成功结果按目录 URL 缓存在当前浏览器，最多保留最近 3 个目录。请求超时为 15 秒，目录上限为 2 MiB / 200 个模板。刷新失败继续使用同一地址的上次成功缓存；切换目录不会把旧目录当成新目录的结果。缓存不可写时，本次结果仍可使用。

```json
{
  "version": 1,
  "updated_at": "2026-09-11T00:00:00Z",
  "templates": [{
    "id": "balanced-starter",
    "name": "均衡分流",
    "description": "日常直连与代理分流",
    "config_url": "configs/balanced-starter.ini",
    "payload_url": "payloads/balanced-starter.json",
    "rule_count": 23,
    "group_count": 4,
    "source": { "name": "NyaSub", "url": "https://github.com/NayaCcR/NyaSub" },
    "warnings": []
  }]
}
```

`config_url` 必填，指向 SubConverter 的 INI 配置。`payload_url` 可选，指向供 NyaSub 可视化编辑器导入的 JSON；本转换前端不会把 JSON 当成 INI。计数、来源和 warnings 均可选；source 可以补充 revision、retrieved_at、license。相对链接以目录请求最终跳转后的 URL 为基准解析。链接仅接受不含用户名、密码的 HTTP(S) URL。

目录刷新不会改写已保存 Profile。Profile 保存绝对 INI 链接；转换后端按自身缓存与刷新策略读取该链接，因此同一链接下的规则可以在线更新。刷新目录不等于强制刷新后端缓存中的规则正文。要固定特定版本，请使用带版本号或提交 SHA 的目录及 INI 链接。

**配置地址必须能从转换后端访问。** 本机部署的 `http://localhost:3000/rules/configs/...` 仅适用于能访问该地址的本机后端；公共转换后端不能读取你的 localhost。部署到公开域名后可使用同站目录，或在设置中改为 NyaSub 的公开目录地址。容器后端同样需要可达的主机地址。

目录请求不携带订阅链接、节点、浏览器 Cookie、Authorization 或 Referer。INI 内容与来源规则由所选后端读取，协议、规则类型与分组支持由该后端决定。Mihomo 的 MRS 文件不是 SubConverter INI，不能直接放入 config_url。

仓库中的 `public/rules/` 是 NyaSub 源模板的生成镜像。更新原始规则和生成方式见该目录的来源说明；请同步整个目录，保留来源与许可证文件。
