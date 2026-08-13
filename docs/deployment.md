# 生产部署

生产编译前需要修改默认 Provider、本机 SubConverter 地址或预置短链服务时，请先阅读[生产编译前配置](configuration.md)。

## 构建与运行

在 `Front` 目录执行：

```powershell
npm ci
npm run build
npm start
```

`npm start` 默认监听 3000 端口。可通过反向代理公开 HTTPS 服务。

## Nginx 示例

```nginx
server {
    listen 443 ssl http2;
    server_name nya.example.com;

    ssl_certificate     /etc/letsencrypt/live/nya.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/nya.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## HTTPS 和跨域

- HTTPS 页面应使用 HTTPS Provider。浏览器会阻止页面脚本请求不安全的 HTTP 后端。
- Provider 的 `/version` 测试和远程 Provider 列表需要正确的 CORS 响应头。
- 直接在新标签页打开转换链接与浏览器 `fetch` 的跨域规则不同；生产环境仍建议将前端与 Provider 放在同一受控域名体系中。

## 安全建议

- 不要把 SubConverter 管理接口裸露在公网。
- 为公共 Provider 配置访问控制、限流、日志脱敏和监控。
- 审核公共列表中的每一个 Endpoint 与隐私等级。
- 扩展服务的短链和配置托管端点默认留空；只有在确认数据处理方式后才填写。
- 生产环境没有“导出公共列表”按钮。若需更新清单，请在受控开发环境导出并单独发布 JSON。
