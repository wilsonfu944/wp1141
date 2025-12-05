# AI 功能故障排查指南

## 🔍 问题诊断步骤

### 1. 检查环境变量是否设置

#### 本地开发环境
检查 `backend/.env` 文件是否包含：
```env
LLM_API_KEY=你的Groq_API_Key
LLM_API_BASE=https://api.groq.com/openai/v1
```

#### Vercel 部署环境
1. 登录 Vercel Dashboard
2. 进入项目设置 → Environment Variables
3. 确认以下变量已设置：
   - `LLM_API_KEY` - 你的 Groq API Key
   - `LLM_API_BASE` - `https://api.groq.com/openai/v1`（可选，有默认值）

### 2. 验证 API Key 是否有效

#### 方法一：使用 curl 测试
```bash
curl https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer 你的API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-70b-versatile",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 100
  }'
```

如果返回 JSON 响应（包含 `choices` 字段），说明 API Key 有效。

如果返回 `401 Unauthorized`，说明 API Key 无效或已过期。

#### 方法二：检查 Groq 控制台
1. 访问 [Groq Console](https://console.groq.com/)
2. 登录你的账户
3. 检查 API Keys 页面
4. 确认 API Key 状态为 "Active"
5. 检查是否有使用限制或配额

### 3. 检查后端日志

#### 本地开发
查看终端输出，应该看到：
```
🤖 AI Chat Request - User: xxx, Message: ...
📤 調用 Groq API: https://api.groq.com/openai/v1/chat/completions
🔑 API Key 前綴: gsk_xxxxx...
✅ Groq API 響應狀態: 200
✅ AI 響應成功，長度: xxx 字符
```

#### Vercel 部署
1. 进入 Vercel Dashboard
2. 选择项目 → Functions → 查看日志
3. 查找包含 "AI chat" 或 "Groq API" 的日志

### 4. 常见错误及解决方案

#### ❌ 错误：`LLM_API_KEY 未設置`
**原因**：环境变量未设置或未正确加载

**解决方案**：
1. 确认 `.env` 文件存在且格式正确
2. 确认变量名是 `LLM_API_KEY`（不是 `LLM_API` 或其他）
3. 重启服务器（环境变量更改后需要重启）
4. 在 Vercel 中，确认环境变量已添加到正确的环境（Production/Preview/Development）

#### ❌ 错误：`401 Unauthorized` 或 `Invalid API Key`
**原因**：API Key 无效、过期或被撤销

**解决方案**：
1. 在 [Groq Console](https://console.groq.com/) 生成新的 API Key
2. 更新环境变量中的 `LLM_API_KEY`
3. 重启服务器或重新部署

#### ❌ 错误：`429 Rate limit exceeded`
**原因**：API 调用频率超过限制

**解决方案**：
1. 等待一段时间后重试
2. 检查 Groq 账户的配额限制
3. 考虑升级 Groq 账户计划

#### ❌ 错误：`Network Error` 或 `Timeout`
**原因**：网络连接问题或 API 服务不可用

**解决方案**：
1. 检查网络连接
2. 确认 Groq API 服务状态
3. 检查防火墙或代理设置
4. 在 Vercel 中，检查函数超时设置（默认 10 秒，可能需要增加）

#### ❌ 错误：`AI returned empty response`
**原因**：API 返回了响应，但内容为空

**解决方案**：
1. 检查请求的消息格式是否正确
2. 尝试不同的消息内容
3. 检查 Groq API 的响应格式是否有变化

### 5. 测试 API 端点

#### 使用 curl 测试后端 API
```bash
# 先登录获取 token
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"你的邮箱","password":"你的密码"}' | jq -r '.token')

# 测试 AI 聊天
curl -X POST http://localhost:3001/api/ai/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "你好",
    "conversationHistory": []
  }'
```

#### 使用 Postman 或 Thunder Client
1. 设置请求方法：`POST`
2. URL：`http://localhost:3001/api/ai/chat`（本地）或 `https://你的域名.vercel.app/api/ai/chat`（Vercel）
3. Headers：
   - `Authorization: Bearer 你的token`
   - `Content-Type: application/json`
4. Body (JSON)：
```json
{
  "message": "你好",
  "conversationHistory": []
}
```

### 6. 检查前端调用

#### 检查 API 基础 URL
确认 `frontend/.env` 或环境变量中设置了正确的 API URL：
```env
VITE_API_URL=http://localhost:3001/api  # 本地开发
# 或
VITE_API_URL=https://你的后端域名.vercel.app/api  # Vercel 部署
```

#### 检查浏览器控制台
1. 打开浏览器开发者工具（F12）
2. 切换到 Network 标签
3. 尝试发送 AI 消息
4. 查看 `/api/ai/chat` 请求：
   - 状态码（应该是 200）
   - 响应内容
   - 错误信息

### 7. 获取 Groq API Key

如果还没有 API Key：

1. 访问 [Groq Console](https://console.groq.com/)
2. 注册/登录账户
3. 进入 API Keys 页面
4. 点击 "Create API Key"
5. 复制生成的 API Key（格式：`gsk_xxxxx...`）
6. 将 API Key 添加到环境变量中

**注意**：
- API Key 只显示一次，请妥善保存
- 不要将 API Key 提交到 Git 仓库
- 定期轮换 API Key 以提高安全性

---

## ✅ 检查清单

在报告问题前，请确认：

- [ ] `LLM_API_KEY` 环境变量已设置
- [ ] API Key 格式正确（以 `gsk_` 开头）
- [ ] API Key 在 Groq Console 中显示为 "Active"
- [ ] 使用 curl 测试 API Key 可以成功调用 Groq API
- [ ] 后端服务器已重启（环境变量更改后）
- [ ] 后端日志显示 API Key 已正确读取
- [ ] 前端 API URL 配置正确
- [ ] 用户已登录（AI 功能需要认证）
- [ ] 浏览器控制台没有 CORS 或其他错误

---

## 🆘 仍然无法解决？

如果按照以上步骤仍无法解决问题，请提供以下信息：

1. **错误信息**：完整的错误消息
2. **后端日志**：包含错误堆栈的日志
3. **API Key 状态**：在 Groq Console 中的状态
4. **环境信息**：
   - 本地开发还是 Vercel 部署？
   - Node.js 版本
   - 操作系统
5. **测试结果**：curl 测试的结果

---

## 📚 相关资源

- [Groq API 文档](https://console.groq.com/docs)
- [Groq Console](https://console.groq.com/)
- [Vercel 环境变量文档](https://vercel.com/docs/concepts/projects/environment-variables)



