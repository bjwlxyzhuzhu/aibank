# 银行智能体超市 · 培训演示版

在银行员工 AI 培训现场演示“选智能体 → 输入 → 拿结果”的完整流程。全部使用虚构数据，不接行内系统、不做登录、不保存对话内容。

## 功能

- **3D 货架首页**：three.js 全息展台 + React 3D 卡片轮播，按岗位筛选
- **智能体工作台**：每个智能体有 3D 智能核心（随运行状态变化）、运行动态时间线、本次调用统计
  - 脱敏助手：粘贴或上传 Word、PDF、TXT 文件，本机识别证件号、手机号、卡号、人名、企业名、地址并替换为占位符，可导出已脱敏的 Word/TXT；发给模型后一键还原（对照表不导出）
  - 制度问答：先检索知识库（可按标签限定范围），模型只依据命中片段作答并附出处；库外问题回答“未找到依据”
  - 话术助手：两版话术（含“净值回撤安抚”场景），本机拦截“保本”“稳赚”等违规用语
  - 纪要公文：会议转写整理成纪要和待办表
  - 授信辅助：本机核对材料缺项、报表平衡与财务比率，模型起草调查报告初稿，不给审批结论
  - 财富配置助手：新客户资产配置、净值回撤安抚挽留、资产提升冲私行三种模式，超出客户风险等级的产品标注“不建议”，本机检查承诺性表述
  - 厅堂营销助手：按网点位置、客群、客流、同业与预算生成场景清单、5 分钟微宣讲稿、外拓与老带新方案、4 周落地计划
  - 消保审查助手：新产品、新服务/新业务、新制度、新协议、宣传素材上线前的事前消保审查。本机初筛保本承诺、最终解释权、单方变更与免责、默认勾选、捆绑搭售、个人信息共享、催收触及第三人、限制投诉、非年化利率展示、缺少风险提示与投诉渠道等；模型按八项消费者权利出具问题清单、修改示范和上线前须补齐事项，可导出审查意见书（Word/TXT），本机留审查台账
  - 提示词助手：其他智能体覆盖不了的问题，生成结构化提示词（角色、背景、任务、合规、输出结构、自检）复制到 DeepSeek 使用；自动推荐现成智能体，带提示词库
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
