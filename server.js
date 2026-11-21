const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT || 3000);
const MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";
const ROOT = path.join(__dirname, "public");

const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8"
};

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 20_000) throw new Error("请求内容过大");
  }
  return JSON.parse(raw || "{}");
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (req.method === "GET" && url.pathname === "/api/health") {
    return sendJson(res, 200, {
      ok: true,
      configured: Boolean(process.env.OPENAI_API_KEY),
      model: MODEL
    });
  }

  if (req.method === "POST" && url.pathname === "/api/test") {
    if (!process.env.OPENAI_API_KEY) {
      return sendJson(res, 400, { error: "服务端尚未配置 OPENAI_API_KEY。" });
    }

    try {
      const body = await readBody(req);
      const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
      if (!prompt) return sendJson(res, 400, { error: "请先输入测试内容。" });
      if (prompt.length > 8000) return sendJson(res, 400, { error: "测试内容不能超过 8000 个字符。" });

      const apiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: MODEL,
          input: prompt,
          max_output_tokens: 300
        })
      });

      const data = await apiResponse.json();
      if (!apiResponse.ok) {
        return sendJson(res, apiResponse.status, {
          error: data.error?.message || "OpenAI API 请求失败。"
        });
      }

      const output = (data.output || [])
        .flatMap(item => item.content || [])
        .filter(item => item.type === "output_text")
        .map(item => item.text)
        .join("\n");

      return sendJson(res, 200, {
        id: data.id,
        model: data.model || MODEL,
        output,
        usage: data.usage || null
      });
    } catch (error) {
      return sendJson(res, 500, { error: error.message || "服务器内部错误。" });
    }
  }

  if (req.method === "GET") {
    const requested = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
    const filePath = path.resolve(ROOT, "." + requested);
    if (!filePath.startsWith(ROOT + path.sep) && filePath !== path.join(ROOT, "index.html")) {
      res.writeHead(403);
      return res.end("Forbidden");
    }
    fs.readFile(filePath, (error, content) => {
      if (error) {
        res.writeHead(404);
        return res.end("Not found");
      }
      res.writeHead(200, { "Content-Type": mime[path.extname(filePath)] || "application/octet-stream" });
      res.end(content);
    });
    return;
  }

  res.writeHead(405);
  res.end("Method not allowed");
});

server.listen(PORT, () => {
  console.log(`codex-test running at http://localhost:${PORT}`);
  console.log(`Model: ${MODEL}`);
});
