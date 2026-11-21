const $ = (id) => document.getElementById(id);
const send = $("send");

async function checkHealth() {
  try {
    const response = await fetch("/api/health");
    const data = await response.json();
    $("modelName").textContent = data.model;
    if (data.configured) {
      $("dot").className = "dot ok";
      $("statusText").textContent = "服务正常 · API Key 已配置";
    } else {
      $("dot").className = "dot bad";
      $("statusText").textContent = "服务已启动 · 尚未配置 API Key";
    }
  } catch {
    $("dot").className = "dot bad";
    $("statusText").textContent = "无法连接本地服务";
  }
}

send.addEventListener("click", async () => {
  $("error").textContent = "";
  const prompt = $("prompt").value.trim();
  if (!prompt) {
    $("error").textContent = "请先输入测试内容。";
    return;
  }

  send.disabled = true;
  send.textContent = "请求中…";
  $("result").hidden = true;

  try {
    const response = await fetch("/api/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "请求失败");

    $("answer").textContent = data.output || "模型未返回文本内容。";
    $("requestId").textContent = data.id || "";
    const usage = data.usage;
    $("inputTokens").textContent = usage?.input_tokens ?? "API 未提供";
    $("outputTokens").textContent = usage?.output_tokens ?? "API 未提供";
    $("totalTokens").textContent = usage?.total_tokens ?? "API 未提供";
    $("usageNote").textContent = usage
      ? "以上数字来自本次 API 响应的 usage 字段。"
      : "本次响应未包含 usage 字段，请检查 API 返回信息。";
    $("result").hidden = false;
  } catch (error) {
    $("error").textContent = error.message;
  } finally {
    send.disabled = false;
    send.textContent = "发送 API 请求";
  }
});

checkHealth();
