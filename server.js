/* 银行智能体超市 · 培训演示版服务
 * - 静态页面：index.html（演示前台）/ admin.html（管理后台）
 * - /api/run：按智能体拼装提示词，转发到 DeepSeek 官方或 TokenOne 中转站（OpenAI 兼容接口），流式返回
 * - /admin：管理后台，设置模型通道与 API Key（Key 只保存在服务器 DATA_DIR/config.json）
 * 零依赖，Node 18+。
 */
"use strict";
const http = require("http");
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");
const crypto = require("crypto");
const { AGENTS, KB } = require("./agents");

const PORT = Number(process.env.PORT || 8080);
const ROOT = __dirname;
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(ROOT, "data"));
const CONFIG_FILE = path.join(DATA_DIR, "config.json");
fs.mkdirSync(DATA_DIR, { recursive: true });

/* ---------- 配置 ---------- */
const PROVIDERS = {
  tokenone: { label: "TokenOne 中转站", baseUrl: "https://token.agentone.work", model: "deepseek-chat" },
  deepseek: { label: "DeepSeek 官方", baseUrl: "https://api.deepseek.com", model: "deepseek-chat" }
};
function hashPassword(pw, salt = crypto.randomBytes(16).toString("hex")) { return { salt, hash: crypto.scryptSync(String(pw), salt, 64).toString("hex") }; }
function checkPassword(pw, rec) { if (!rec || !rec.hash) return false; const h = crypto.scryptSync(String(pw), rec.salt, 64); const ref = Buffer.from(rec.hash, "hex"); return h.length === ref.length && crypto.timingSafeEqual(h, ref); }
const maskKey = k => (k ? k.slice(0, 3) + "••••••" + k.slice(-4) : "");

let config;
function loadConfig() {
  try { config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8")); } catch { config = {}; }
  config.provider = PROVIDERS[config.provider] ? config.provider : "tokenone";
  config.profiles = config.profiles || {};
  for (const k of Object.keys(PROVIDERS)) config.profiles[k] = Object.assign({ apiKey: "", baseUrl: PROVIDERS[k].baseUrl, model: PROVIDERS[k].model }, config.profiles[k] || {});
  config.dailyLimit = Number(config.dailyLimit) > 0 ? Number(config.dailyLimit) : 1000;
  if (!config.admin) {
    const pw = process.env.ADMIN_PASSWORD || crypto.randomBytes(6).toString("base64url");
    config.admin = hashPassword(pw);
    if (!process.env.ADMIN_PASSWORD) {
      fs.writeFileSync(path.join(DATA_DIR, "admin-initial-password.txt"), pw + "\n", { mode: 0o600 });
      console.log(`[aibank] 管理后台初始密码：${pw}（也保存在 ${path.join(DATA_DIR, "admin-initial-password.txt")}，登录后请修改）`);
    }
  }
  saveConfig();
}
function saveConfig() { const tmp = CONFIG_FILE + ".tmp"; fs.writeFileSync(tmp, JSON.stringify(config, null, 2), { mode: 0o600 }); fs.renameSync(tmp, CONFIG_FILE); }
loadConfig();
const active = () => config.profiles[config.provider];
function apiBase(provider, baseUrl) {
  let b = String(baseUrl || "").trim().replace(/\/+$/, "").replace(/\/chat\/completions$/, "");
  if (provider === "tokenone" && b && !/\/v\d+$/.test(b)) b += "/v1";
  return b;
}
/* 解析 TokenOne 连接串 {"_type":"newapi_channel_conn","key":"sk-…","url":"https://…"} */
function parseConn(text) {
  try { const j = JSON.parse(String(text || "").trim()); if (j && j.url) return { baseUrl: String(j.url).trim(), apiKey: String(j.key || "").trim() }; } catch {}
  return null;
}

/* ---------- 工具 ---------- */
const clientIp = req => (String(req.headers["x-forwarded-for"] || "").split(",")[0].trim()) || req.socket.remoteAddress || "?";
const hits = new Map();
function limited(key, max, ms) { const n = Date.now(); const a = (hits.get(key) || []).filter(t => n - t < ms); a.push(n); hits.set(key, a); return a.length > max; }
const sessions = new Map(); const SESSION_MS = 8 * 3600e3;
setInterval(() => { const n = Date.now(); for (const [k, a] of hits) if (!a.some(t => n - t < 3600e3)) hits.delete(k); for (const [k, v] of sessions) if (v < n) sessions.delete(k); }, 600e3).unref();
let daily = { day: "", count: 0 };
function getCookie(req, name) { const m = String(req.headers.cookie || "").match(new RegExp("(?:^|;\\s*)" + name + "=([^;]+)")); return m ? decodeURIComponent(m[1]) : ""; }
function sendJSON(res, code, obj, headers = {}) { res.writeHead(code, Object.assign({ "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }, headers)); res.end(JSON.stringify(obj)); }
function readBody(req, limit = 200e3) {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks = [];
    req.on("data", c => { size += c.length; if (size > limit) { reject(Object.assign(new Error("请求内容过大"), { code: 413 })); req.destroy(); } else chunks.push(c); });
    req.on("end", () => { try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString("utf8")) : {}); } catch { reject(Object.assign(new Error("请求格式错误"), { code: 400 })); } });
    req.on("error", reject);
  });
}
function isAdmin(req) { const t = getCookie(req, "aibank_admin"); const exp = t && sessions.get(t); if (!exp || exp < Date.now()) { if (t) sessions.delete(t); return false; } sessions.set(t, Date.now() + SESSION_MS); return true; }

/* ---------- 静态文件（白名单） ---------- */
const STATIC = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/index.html": ["index.html", "text/html; charset=utf-8"],
  "/admin": ["admin.html", "text/html; charset=utf-8"],
  "/admin.html": ["admin.html", "text/html; charset=utf-8"]
};

/* ---------- 模型调用 ---------- */
async function runAgent(req, res) {
  const ip = clientIp(req);
  if (limited("run:" + ip, 20, 60e3)) return sendJSON(res, 429, { error: "操作太频繁了，请稍等一分钟再试。" });
  const today = new Date().toISOString().slice(0, 10);
  if (daily.day !== today) daily = { day: today, count: 0 };
  if (daily.count >= config.dailyLimit) return sendJSON(res, 429, { error: "今天的演示次数已用完，请联系管理员。" });
  const p = active();
  if (!p.apiKey) return sendJSON(res, 503, { error: "模型还没有配置：请管理员在后台填写 API Key。" });
  let body; try { body = await readBody(req, 120e3); } catch (e) { return sendJSON(res, e.code || 400, { error: e.message }); }
  const agent = AGENTS[body && body.agent];
  if (!agent) return sendJSON(res, 400, { error: "没有这个智能体" });
  let built; try { built = agent.build(body.input || {}); } catch (e) { return sendJSON(res, 400, { error: e.message }); }
  daily.count++;

  res.writeHead(200, { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive", "X-Accel-Buffering": "no" });
  const send = o => res.write("data: " + JSON.stringify(o) + "\n\n");
  const ac = new AbortController(); res.on("close", () => ac.abort());
  try {
    const r = await fetch(apiBase(config.provider, p.baseUrl) + "/chat/completions", {
      method: "POST", signal: ac.signal,
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + p.apiKey },
      body: JSON.stringify({ model: p.model || "deepseek-chat", stream: true, temperature: 0.4, max_tokens: built.maxTokens || 1000, messages: [{ role: "system", content: built.system }, ...built.messages] })
    });
    if (!r.ok || !r.body) { const t = await r.text().catch(() => ""); console.error("[aibank] model", r.status, t.slice(0, 300)); send({ error: `模型服务暂时不可用（${r.status}），请管理员检查通道和 API Key。` }); return res.end(); }
    const dec = new TextDecoder(); let buf = "";
    for await (const part of r.body) {
      buf += dec.decode(part, { stream: true });
      let i; while ((i = buf.indexOf("\n")) >= 0) {
        const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
        if (!line.startsWith("data:")) continue; const d = line.slice(5).trim(); if (d === "[DONE]") continue;
        try { const j = JSON.parse(d); const t = j.choices && j.choices[0] && j.choices[0].delta && j.choices[0].delta.content; if (t) send({ t }); } catch {}
      }
    }
    send({ done: true }); res.end();
  } catch (e) { if (!ac.signal.aborted) { console.error("[aibank]", e.message); send({ error: "连接模型服务失败，请稍后再试。" }); } res.end(); }
}

/* ---------- 管理接口 ---------- */
function publicConfig() {
  return {
    provider: config.provider, dailyLimit: config.dailyLimit, todayCount: daily.day === new Date().toISOString().slice(0, 10) ? daily.count : 0,
    providers: Object.fromEntries(Object.entries(PROVIDERS).map(([k, v]) => { const p = config.profiles[k]; return [k, { label: v.label, defaultUrl: v.baseUrl, baseUrl: p.baseUrl, model: p.model, hasKey: !!p.apiKey, key: maskKey(p.apiKey) }]; }))
  };
}
async function admin(req, res, url) {
  const route = req.method + " " + url.pathname;
  if (route === "POST /api/admin/login") {
    if (limited("login:" + clientIp(req), 8, 600e3)) return sendJSON(res, 429, { error: "尝试次数过多，请10分钟后再试" });
    const b = await readBody(req, 4e3);
    if (!checkPassword(b.password || "", config.admin)) return sendJSON(res, 401, { error: "密码不正确" });
    const t = crypto.randomBytes(24).toString("base64url"); sessions.set(t, Date.now() + SESSION_MS);
    return sendJSON(res, 200, { ok: true }, { "Set-Cookie": `aibank_admin=${t}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_MS / 1000}` });
  }
  if (route === "POST /api/admin/logout") { sessions.delete(getCookie(req, "aibank_admin")); return sendJSON(res, 200, { ok: true }, { "Set-Cookie": "aibank_admin=; Path=/; Max-Age=0" }); }
  if (!isAdmin(req)) return sendJSON(res, 401, { error: "请先登录" });
  if (route === "GET /api/admin/config") return sendJSON(res, 200, publicConfig());
  if (route === "PUT /api/admin/config") {
    const b = await readBody(req, 20e3);
    const prov = PROVIDERS[b.provider] ? b.provider : config.provider; const p = config.profiles[prov];
    const conn = parseConn(b.conn || b.connection);
    if (conn) { p.baseUrl = conn.baseUrl; if (conn.apiKey) p.apiKey = conn.apiKey; }
    if (typeof b.baseUrl === "string" && b.baseUrl.trim()) p.baseUrl = b.baseUrl.trim();
    if (typeof b.model === "string" && b.model.trim()) p.model = b.model.trim();
    if (typeof b.apiKey === "string" && b.apiKey.trim()) p.apiKey = b.apiKey.trim();
    if (b.clearKey) p.apiKey = "";
    if (b.activate !== false) config.provider = prov;
    if (Number(b.dailyLimit) > 0) config.dailyLimit = Math.min(100000, Math.floor(Number(b.dailyLimit)));
    saveConfig(); return sendJSON(res, 200, publicConfig());
  }
  if (route === "POST /api/admin/test") {
    const prov = PROVIDERS[url.searchParams.get("provider")] ? url.searchParams.get("provider") : config.provider; const p = config.profiles[prov];
    if (!p.apiKey) return sendJSON(res, 400, { error: "这个通道还没有保存 API Key" });
    try {
      const r = await fetch(apiBase(prov, p.baseUrl) + "/chat/completions", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + p.apiKey }, body: JSON.stringify({ model: p.model, max_tokens: 30, messages: [{ role: "user", content: "用一句话说明你能为银行员工做什么" }] }), signal: AbortSignal.timeout(30000) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) return sendJSON(res, 502, { error: `连接失败（${r.status}）：${(j.error && (j.error.message || j.error)) || "请检查地址、模型名和 Key"}` });
      return sendJSON(res, 200, { ok: true, reply: (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || "" });
    } catch (e) { return sendJSON(res, 502, { error: "连接失败：" + e.message }); }
  }
  if (route === "POST /api/admin/password") {
    const b = await readBody(req, 4e3);
    if (!checkPassword(b.old || "", config.admin)) return sendJSON(res, 400, { error: "原密码不正确" });
    const npw = String(b.password || b.new || "");
    if (npw.length < 8) return sendJSON(res, 400, { error: "新密码至少8位" });
    config.admin = hashPassword(npw); saveConfig();
    fs.rm(path.join(DATA_DIR, "admin-initial-password.txt"), { force: true }, () => {});
    return sendJSON(res, 200, { ok: true });
  }
  return sendJSON(res, 404, { error: "接口不存在" });
}

/* ---------- 路由 ---------- */
const server = http.createServer(async (req, res) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  let url; try { url = new URL(req.url, "http://x"); } catch { res.writeHead(400); return res.end(); }
  try {
    if (url.pathname === "/healthz") { res.writeHead(200, { "Content-Type": "text/plain" }); return res.end("ok"); }
    if (url.pathname === "/api/status" && req.method === "GET") { const p = active(); return sendJSON(res, 200, { ready: !!p.apiKey, provider: PROVIDERS[config.provider].label, model: p.model }); }
    if (url.pathname === "/api/kb" && req.method === "GET") return sendJSON(res, 200, { docs: KB });
    if (url.pathname === "/api/run" && req.method === "POST") return await runAgent(req, res);
    if (url.pathname.startsWith("/api/admin/")) return await admin(req, res, url);
    if (url.pathname.startsWith("/api/")) return sendJSON(res, 404, { error: "接口不存在" });
    const hit = STATIC[url.pathname];
    if (hit && (req.method === "GET" || req.method === "HEAD")) {
      const data = await fsp.readFile(path.join(ROOT, hit[0]));
      res.writeHead(200, { "Content-Type": hit[1], "Cache-Control": hit[0].endsWith(".html") ? "no-cache" : "public, max-age=300" });
      return res.end(req.method === "HEAD" ? undefined : data);
    }
    res.writeHead(302, { Location: "/" }); res.end();
  } catch (e) {
    console.error("[aibank]", e);
    if (!res.headersSent) sendJSON(res, e.code === 413 ? 413 : 500, { error: e.code === 413 ? "请求内容过大" : "服务器错误" }); else res.end();
  }
});
server.listen(PORT, () => console.log(`[aibank] 银行智能体超市已启动：http://0.0.0.0:${PORT}  管理后台：/admin  当前通道：${PROVIDERS[config.provider].label}${active().apiKey ? "" : "（尚未填写 API Key）"}`));
