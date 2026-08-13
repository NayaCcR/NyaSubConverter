# NyaSubConverter 文档

NyaSubConverter 是不绑定单一后端的订阅转换 Web Client。浏览器根据用户选择的 Provider 直接生成并打开 SubConverter 请求，应用本身不转发订阅地址。

- [快速开始](quick-start.md)：本地运行、基础转换和本地数据说明。
- [Provider 接入](providers.md)：连接自建或第三方 SubConverter 服务。
- [公共 Provider 列表](public-provider-list.md)：导出、发布和远程更新 Provider 清单。
- [生产编译前配置](configuration.md)：修改默认转换后端、短链服务、本机地址和 Token 的注意事项。
- [生产部署](deployment.md)：构建、反向代理和安全要求。

## 数据边界

Provider、Profile、历史记录和用户设置默认保存于浏览器 `localStorage`，键为 `nya-subconverter.data.v1`。数据不会自动同步到服务端、其他浏览器或其他设备。

转换时，订阅来源会被直接发送至所选 Provider；短链与配置托管等扩展服务只有在用户显式配置后才会被调用。
