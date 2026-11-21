# codex-test

一个最小化的 OpenAI API 用量测试 Demo。网页通过本地 Node.js 服务端调用 OpenAI Responses API，并显示 API 返回的 token 用量。

## 1. 环境要求

- Node.js 18+
- 一个可用的 OpenAI API Key（API Platform 的密钥，不是 ChatGPT 登录密码）

## 2. 配置并启动

```bash
npm install
# macOS / Linux
export OPENAI_API_KEY="你的_API_Key"
# Windows PowerShell
$env:OPENAI_API_KEY="你的_API_Key"

npm start
```

打开 http://localhost:3000

可选环境变量：
- `OPENAI_MODEL`：模型名称，默认 `gpt-4.1-mini`
- `PORT`：服务端口，默认 `3000`

## 3. 测试 API 用量

1. 先打开 [OpenAI API Usage](https://platform.openai.com/usage)，记下当前用量。
2. 在本地网页输入一段测试文本，点击“发送 API 请求”。
3. 页面会显示模型、响应内容、input/output/total tokens（以 API 实际返回为准）。
4. 刷新 Usage 页面查看变化。Usage 数据可能有延迟；极短请求的费用也可能非常小。

## 安全说明

- API Key 只从服务端环境变量读取，不会发送到浏览器。
- 不要把 API Key 写进代码、网页或提交到 GitHub。
- 这个仓库不包含密钥，也不会自动替你发起 API 请求。
- GitHub 仓库只用于存放代码；上传/浏览/克隆代码本身不会消耗 OpenAI API token。
- Codex/ChatGPT 订阅用量与 OpenAI API Platform 用量是不同的计费/额度体系。这个 Demo 测试的是 API Platform 用量。
