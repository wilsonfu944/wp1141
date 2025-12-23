# AI 小助手设置说明

## 环境变量设置

在 Vercel 或本地开发环境中，需要添加以下环境变量：

### 必需的环境变量

```
GROQ_API_KEY=your_groq_api_key_here
```

### 设置步骤

1. **本地开发**：
   - 在项目根目录创建或编辑 `.env.local` 文件
   - 添加：`GROQ_API_KEY=your_groq_api_key_here`

2. **Vercel 部署**：
   - 进入 Vercel 项目设置
   - 选择 "Environment Variables"
   - 添加新的环境变量：
     - Key: `GROQ_API_KEY`
     - Value: 你的 Groq API Key
     - 选择所有环境（Production, Preview, Development）

### API Key

你的 Groq API Key 应该以 `gsk_` 开头。

**注意**：请勿将 API Key 提交到 Git 仓库中！

## 功能说明

- AI 小助手会出现在聊天室对话列表的最上方
- 点击 AI 小助手可以开始对话
- AI 会记住最近 10 条对话历史，提供上下文相关的回复
- AI 专门用于解答关于动漫、景点和行程规划的问题

## 故障排除

如果遇到问题，请检查：

1. **环境变量是否正确设置**
   - 确认 `GROQ_API_KEY` 已添加到环境变量中
   - 确认 API Key 格式正确（以 `gsk_` 开头）

2. **API 限制**
   - Groq 有速率限制，如果请求太频繁可能会返回 429 错误
   - 等待一段时间后重试

3. **网络连接**
   - 确认服务器可以访问 `https://api.groq.com`

4. **查看日志**
   - 在 Vercel 的 Logs 中查看错误信息
   - 或在本地开发时查看终端输出

