# 银行智能体超市 · 培训演示版

在银行员工 AI 培训现场演示“选智能体 → 输入 → 拿结果”的完整流程。全部使用虚构数据，不接行内系统、不做登录、不保存对话内容。

## 功能

- **3D 货架首页**：three.js 全息展台 + React 3D 卡片轮播，按岗位筛选
- **智能体工作台**：每个智能体有 3D 智能核心（随运行状态变化）、运行动态时间线、本次调用统计
  - 脱敏助手：本机识别证件号、手机号、卡号、人名、企业名、地址并替换为占位符，发给模型后一键还原
  - 制度问答：先检索知识库（可按标签限定范围），模型只依据命中片段作答并附出处；库外问题回答“未找到依据”
  - 话术助手：两版话术，本机拦截“保本”“稳赚”等违规用语
  - 纪要公文：会议转写整理成纪要和待办表
  - 授信辅助：本机核对材料缺项、报表平衡与财务比率，模型起草调查报告初稿，不给审批结论
- **企业知识库**
  - 上传文件：PDF、Word（.docx）、TXT、Markdown、HTML、CSV，在浏览器本机解析
  - 网址抓取：服务器抓取公开网页正文，可带同站子页面（最多 8 个）；禁止抓取内网与保留地址
  - 入库前自动脱敏（可关闭）
  - 自动打标签：已接入大模型时由模型按本行标签体系标注分类、标签和摘要，否则按关键词规则标注；可人工调整
- **管理端**：按岗位开通智能体、本次演示的审计日志；`/admin` 设置模型通道与 API Key

## 目录

| 文件 | 说明 |
|---|---|
| `server.js` | 零依赖 Node 服务：静态文件、`/api/run` 流式调用、`/api/kb/*`、管理接口 |
| `agents.js` | 各智能体的提示词（服务器端拼装） |
| `kb.js` | 网址抓取、正文提取、自动打标签 |
| `index.html` `app.js` `scene.js` | 前端（React 18 + htm，无需打包；three.js 场景） |
| `admin.html` | 模型与 API Key 设置 |

前端依赖（react、three、pdfjs-dist、mammoth、htm）由 `npm install` 安装，服务器从 `node_modules` 提供，不依赖外网 CDN。

## 运行

```sh
npm install --omit=dev
node server.js            # 默认端口 8080，数据目录 ./data
```

Docker：

```sh
docker run -d --name aibank --restart unless-stopped -p 8090:80 -v /opt/aibank:/data ghcr.io/bjwlxyzhuzhu/aibank:latest
```

Portainer：Stacks → Add stack，粘贴 `docker-compose.portainer.yml`，再把域名（如 `aibank.app.tokenone.work`）反代到宿主机 8090 端口。

推送到 `main` 后，GitHub Actions 自动构建并发布镜像 `ghcr.io/bjwlxyzhuzhu/aibank:latest`。

## 接入大模型

打开 `/admin`，用管理员密码登录（首次启动随机生成，见容器日志或 `/data/admin-initial-password.txt`；也可设置环境变量 `ADMIN_PASSWORD`）。

- **TokenOne 中转站**：接口地址 `https://token.agentone.work`（自动补 `/v1`），可直接粘贴 `newapi_channel_conn` 连接串
- **DeepSeek 官方**：接口地址 `https://api.deepseek.com`

API Key 默认留空，在后台填写后保存在服务器 `/data/config.json`，页面和接口都不会返回完整 Key。
