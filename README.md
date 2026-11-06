# 银行智能体超市 · 培训演示版

在银行员工 AI 培训现场演示“选智能体 → 输入 → 拿结果”的完整流程。全部使用虚构数据，不接行内系统、不做登录、不保存对话内容。

## 功能

- 货架：凭证式卡片，按岗位筛选，敏感度印章
- 脱敏助手：本机识别证件号、手机号、卡号、人名、企业名、地址并替换为占位符，发给模型写摘要后一键还原
- 制度问答：只依据知识库作答并附条款出处，库外问题回答“未找到依据”
- 话术助手：生成两版话术，本机检查“保本”“稳赚”等违规用语
- 纪要公文：会议转写整理成纪要和待办表
- 授信辅助：本机核对材料缺项、报表平衡与财务比率，模型起草调查报告初稿，不给审批结论
- 知识库与管理端：演示文档增删、岗位开通、本次演示的审计日志

## 运行

```sh
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
