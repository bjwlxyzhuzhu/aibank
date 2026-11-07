/* 银行智能体超市 · 前端（React 18 + htm，无需打包） */
import htm from "htm";
const { useState, useEffect, useRef, useMemo, useSyncExternalStore } = React;
const html = htm.bind(React.createElement);
const now = () => new Date().toTimeString().slice(0, 8);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const LS = { get(k, d) { try { const v = localStorage.getItem("aibank2:" + k); return v ? JSON.parse(v) : d; } catch { return d; } }, set(k, v) { try { localStorage.setItem("aibank2:" + k, JSON.stringify(v)); return true; } catch { return false; } } };
const vendor = p => new URL("./vendor/" + p, import.meta.url).href;

/* ---------------- 图标 ---------------- */
const P = {
  mask: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M7 10h5M7 14h3"/><path d="M15.5 13.5v-1.2a1.5 1.5 0 0 1 3 0v1.2"/><rect x="14.5" y="13.5" width="5" height="3.5" rx="1"/>',
  qa: '<path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19"/><path d="M10 8.2a2.2 2.2 0 1 1 3 2c-.6.3-1 .8-1 1.4v.4M12 14.8v.1"/>',
  script: '<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 4v-4h0A1.5 1.5 0 0 1 4 14.5z"/><path d="M8 8.5h8M8 11.5h5"/>',
  minutes: '<path d="M6 3h8.5L19 7.5V21H6z"/><path d="M14 3v5h5M9 12h7M9 15.5h7M9 19h4"/>',
  credit: '<path d="M3 21h18M5 21V11M10 21V6M15 21v-7M20 21V9"/><path d="M5 8l5-4 5 6 5-4"/>',
  contract: '<path d="M5 3h9l5 5v13H5z"/><path d="M14 3v5h5"/><path d="M8.5 17l1.6-.4 5-5-1.2-1.2-5 5z"/>',
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  kb: '<ellipse cx="12" cy="5.5" rx="8" ry="2.8"/><path d="M4 5.5v6.5c0 1.5 3.6 2.8 8 2.8s8-1.3 8-2.8V5.5M4 12v6.5c0 1.5 3.6 2.8 8 2.8s8-1.3 8-2.8V12"/>',
  admin: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
  upload: '<path d="M7 18a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.4 1.6A3.8 3.8 0 0 1 17.5 18"/><path d="M12 12v8M9 15l3-3 3 3"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  doc: '<path d="M6 3h8.5L19 7.5V21H6z"/><path d="M14 3v5h5"/>',
  play: '<path d="M7 4.5v15l12-7.5z"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  send: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  left: '<path d="M15 5l-7 7 7 7"/>', right: '<path d="M9 5l7 7-7 7"/>',
  spark: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/>',
  pulse: '<path d="M3 12h4l2-6 4 12 2-6h6"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',
  wealth: '<circle cx="12" cy="12" r="9"/><path d="M12 3v9l6.4 6.4"/><path d="M12 12H3.5"/>',
  branch: '<path d="M3 9l1.6-5h14.8L21 9M4 9v11h16V9M3 9h18"/><path d="M9.5 20v-5.5h5V20"/>',
  prompt: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M7 9.5l3 2.5-3 2.5M12.5 15H17"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8-4.3-4.1 5.9-.9z"/>'
};
const Icon = ({ n, ...p }) => html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ...${p} dangerouslySetInnerHTML=${{ __html: P[n] || "" }}></svg>`;

/* ---------------- 数据 ---------------- */
const ROLES = ["全部", "客户经理", "理财经理", "柜员", "大堂经理", "授信岗", "综合岗"];
const AGENTS = [
  { id: "mask", name: "脱敏助手", short: "敏感信息不出行", color: "#3b82f6", lvl: "高", where: "本机处理", roles: ["客户经理", "理财经理", "柜员", "大堂经理", "授信岗", "综合岗"], tags: ["上传文件脱敏", "导出 Word/TXT", "一键还原", "对照表不出本机"], saves: "每份材料约省 5 分钟", intro: "粘贴材料或上传 Word、PDF、TXT 文件，把姓名、证件号、卡号、手机号、企业名、地址替换成编号占位符，可导出已脱敏的 Word 或 TXT；只把占位符版本交给大模型，拿回结果后用本机对照表一键还原。" },
  { id: "qa", name: "制度问答助手", short: "有据可依 · 附条款出处", color: "#06b6d4", lvl: "低", where: "知识库检索", roles: ["柜员", "大堂经理", "客户经理", "理财经理", "综合岗"], tags: ["知识库检索", "条款出处", "按标签限定范围"], saves: "每次约省 10 分钟", intro: "先在本行知识库里检索相关条款，再让大模型只依据命中的片段作答，每个回答都附出处；库里没有就直说“未找到依据”。" },
  { id: "script", name: "话术助手", short: "合规话术 · 违规词拦截", color: "#f59e0b", lvl: "低", where: "行内模型", roles: ["柜员", "大堂经理", "客户经理", "理财经理"], tags: ["两版话术", "违规用语检查", "参考本行制度"], saves: "每次约省 15 分钟", intro: "按产品、场景和客户类型写两版应答话术，自动拦截“保本”“稳赚”等违规用语，老年客户自动提示适当性要求。" },
  { id: "minutes", name: "纪要公文助手", short: "转写 → 规范纪要", color: "#a855f7", lvl: "中", where: "行内模型", roles: ["综合岗", "客户经理"], tags: ["会议纪要", "工作通知", "待办表"], saves: "每次约省 30 分钟", intro: "把录音转写整理成规范的纪要、通知或总结，单列待办事项、责任人和完成时限。" },
  { id: "credit", name: "授信辅助", short: "材料核对 · 报告初稿", color: "#10b981", lvl: "高", where: "本机核对 + 模型", roles: ["客户经理", "授信岗"], tags: ["材料缺项", "报表勾稽", "调查报告初稿"], saves: "每户约省 2 小时", intro: "本机核对材料清单、检查报表平衡与财务比率，再由大模型起草调查报告框架。不给出任何审批结论。" },
  { id: "wealth", name: "财富配置助手", short: "一户一策 · 配置与挽留", color: "#f5b800", lvl: "中", where: "行内模型", roles: ["理财经理", "客户经理"], tags: ["新客户配置", "回撤安抚挽留", "资产提升冲私行"], saves: "每户约省 1 小时", intro: "录入客户画像和本行在售产品，生成资产配置方案、回撤安抚话术或资产提升路径；超出客户风险等级的产品明确标注“不建议”。" },
  { id: "branch", name: "厅堂营销助手", short: "低成本 · 场景化营销", color: "#fb7185", lvl: "低", where: "行内模型", roles: ["大堂经理", "理财经理", "客户经理"], tags: ["场景清单", "微宣讲稿", "4周落地计划"], saves: "每份方案约省 3 小时", intro: "输入网点位置、客群、客流、同业和预算，生成场景清单、5 分钟微宣讲稿、外拓与老带新方案、4 周落地计划和考核指标。" },
  { id: "prompt", name: "提示词助手", short: "说清问题，就有好提示词", color: "#6366f1", lvl: "低", where: "行内模型", roles: ["客户经理", "理财经理", "柜员", "大堂经理", "授信岗", "综合岗"], tags: ["自动归类", "追问缺失信息", "提示词库"], saves: "每次约省 15 分钟", intro: "遇到其他智能体覆盖不了的问题，用大白话描述，生成结构化提示词（角色、背景、任务、合规、输出结构、自检），复制到 DeepSeek 即可出方案。" },
  { id: "contract", name: "合同审查辅助", short: "即将上架", color: "#ec4899", lvl: "中", where: "行内模型", roles: ["授信岗"], tags: ["范本比对"], saves: "每份约省 40 分钟", intro: "比对合同条款与本行范本，列出缺项和改动，供法务复核。", soon: true }
];
const LIVE = AGENTS.filter(a => !a.soon);
const AG = Object.fromEntries(AGENTS.map(a => [a.id, a]));
const day = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const DEFAULT_DOCS = [
  { id: "d1", title: "个人存款业务操作规程（示例）", category: "操作规程", tags: ["存款", "柜面服务"], summary: "大额存单起存金额、部分提前支取计息与身份核验要求。", source: "内置示例", origin: "", at: "2026-11-01", tagSource: "rule",
    body: "第三条 大额存单起存金额为人民币20万元，期限分为1个月、3个月、6个月、1年、2年、3年。\n第四条 大额存单可在到期前办理部分提前支取，提前支取部分按支取日活期利率计息，剩余部分不低于起存金额的，按原利率继续计息。\n第五条 办理个人存款业务须核验客户本人有效身份证件；代理他人办理的，须同时核验代理人和被代理人有效身份证件。" },
  { id: "d2", title: "理财产品销售管理办法（示例）", category: "制度办法", tags: ["理财", "合规", "消费者保护"], summary: "禁止承诺保本收益，老年客户须风险评估与录音录像。", source: "内置示例", origin: "", at: "2026-11-01", tagSource: "rule",
    body: "第十条 销售人员不得向客户承诺保本或者承诺最低收益，不得使用“稳赚”“无风险”“收益最高”等误导性用语。\n第十一条 向65周岁及以上客户销售理财产品，应当进行风险承受能力评估，并在销售过程中录音录像。\n第十二条 客户风险承受能力评估结果有效期为一年，过期须重新评估。" },
  { id: "d3", title: "柜面服务规范（示例）", category: "制度办法", tags: ["柜面服务", "消费者保护", "信息安全"], summary: "等候超时致歉引导、投诉登记答复时限、离柜锁屏。", source: "内置示例", origin: "", at: "2026-11-01", tagSource: "rule",
    body: "第六条 客户等候时间超过15分钟的，大堂经理应主动致歉并引导至自助设备或预约服务。\n第七条 客户投诉应当在24小时内登记，5个工作日内答复。\n第八条 柜员离开柜台须退出业务系统并锁屏。" }
];

/* ---------------- 全局状态 ---------------- */
const store = {
  s: { docs: LS.get("docs", null) || DEFAULT_DOCS, enabled: { ...Object.fromEntries(LIVE.map(a => [a.id, true])), ...LS.get("enabled", {}) }, log: [], runs: {}, ai: null, toast: "", kbFilter: null },
  subs: new Set(),
  set(p) { const prev = this.s; this.s = { ...prev, ...(typeof p === "function" ? p(prev) : p) }; if (this.s.docs !== prev.docs && !LS.set("docs", this.s.docs)) toast("浏览器存储空间不足，部分文档可能无法保存"); if (this.s.enabled !== prev.enabled) LS.set("enabled", this.s.enabled); this.subs.forEach(f => f()); }
};
const useStore = () => useSyncExternalStore(cb => { store.subs.add(cb); return () => store.subs.delete(cb); }, () => store.s);
let toastT; function toast(t) { store.set({ toast: t }); clearTimeout(toastT); toastT = setTimeout(() => store.set({ toast: "" }), 2200); }
const audit = (agent, action, detail = "") => store.set(s => ({ log: [{ t: now(), agent, action, detail: String(detail).slice(0, 48) }, ...s.log].slice(0, 300) }));
fetch("api/status").then(r => r.json()).then(j => store.set({ ai: !!j.ready, model: j.model })).catch(() => store.set({ ai: false }));

/* ---------------- 本机规则 ---------------- */
function maskText(src) {
  const map = [], seen = new Map(), cnt = {};
  const put = (k, v) => { const key = k + "|" + v; if (seen.has(key)) return seen.get(key); cnt[k] = (cnt[k] || 0) + 1; const ph = `[${k}${cnt[k]}]`; seen.set(key, ph); map.push({ ph, kind: k, val: v }); return ph; };
  let t = src;
  t = t.replace(/(?<!\d)\d{17}[\dXx](?!\d)/g, m => put("证件", m));
  t = t.replace(/(?<!\d)1[3-9]\d{9}(?!\d)/g, m => put("手机", m));
  t = t.replace(/(?<!\d)0\d{2,3}-\d{7,8}(?!\d)/g, m => put("电话", m));
  t = t.replace(/(?<!\d)(?:\d[ -]?){15,18}\d(?!\d)/g, m => put("卡号", m));
  const nameRe = /(?:客户|借款人|法定代表人|联系人|担保人|配偶|申请人|客户经理|姓名[:：]?)\s*([一-龥]{2,3})(?=[，,。；;、\s（(先女的任在]|$)/g;
  const names = new Set(); let m; while ((m = nameRe.exec(t))) names.add(m[1]);
  [...names].sort((a, b) => b.length - a.length).forEach(n => { t = t.split(n).join(put("客户", n)); });
  t = t.replace(/[一-龥（）()]{2,24}?(?:股份有限公司|有限责任公司|有限公司)/g, m => { const lead = m.match(/^[任在为是由与和向的及系于即]*/)[0]; return lead + put("企业", m.slice(lead.length)); });
  t = t.replace(/(?:北京|天津|上海|重庆|河北|山西|辽宁|吉林|黑龙江|江苏|浙江|安徽|福建|江西|山东|河南|湖北|湖南|广东|海南|四川|贵州|云南|陕西|甘肃|青海|内蒙古|广西|西藏|宁夏|新疆)(?:省|市|自治区)?[一-龥\d]{2,30}?(?:号院|号楼|号|室|栋)/g, m => put("地址", m));
  return { masked: t, map };
}
const restore = (text, map) => [...map].sort((a, b) => b.ph.length - a.ph.length).reduce((t, r) => t.split(r.ph).join(r.val), text);
const BANNED = ["保本", "保证收益", "稳赚", "无风险", "零风险", "收益最高", "最高收益", "绝对安全", "肯定赚", "包赚", "刚性兑付", "保息"];
const banned = t => BANNED.filter(w => t.includes(w));
const VERDICT = ["同意授信", "建议授信", "建议额度", "授信额度建议", "评级为", "建议同意", "予以批准", "准予授信"];
const PII = [/(?<!\d)\d{17}[\dXx](?!\d)/, /(?<!\d)1[3-9]\d{9}(?!\d)/, /(?<!\d)(?:\d[ -]?){15,18}\d(?!\d)/];

/* 知识库检索：按段切块，用字符二元组重合度打分 */
function grams(s) { s = s.replace(/[\s\p{P}\p{S}]/gu, ""); const g = new Set(); for (let i = 0; i < s.length - 1; i++) g.add(s.slice(i, i + 2)); return g; }
function retrieve(q, docs, k = 8, max = 7000) {
  const qg = grams(q); if (!qg.size) return [];
  const out = [];
  for (const d of docs) {
    let buf = ""; const parts = [];
    for (const line of d.body.split(/\n+/)) { if (buf && (buf + line).length > 360) { parts.push(buf); buf = ""; } buf += (buf ? "\n" : "") + line; }
    if (buf) parts.push(buf);
    const tg = grams(d.title + d.tags.join(""));
    parts.forEach(p => { const pg = grams(p); let s = 0; qg.forEach(x => { if (pg.has(x)) s += 1; if (tg.has(x)) s += 0.3; }); if (s >= 2) out.push({ doc: d, text: p, score: s / Math.sqrt(1 + p.length / 200) }); });
  }
  out.sort((a, b) => b.score - a.score);
  const pick = []; let n = 0; for (const h of out) { if (pick.length >= k || n + h.text.length > max) break; pick.push(h); n += h.text.length; }
  return pick;
}
const asDocs = hits => { const m = new Map(); hits.forEach(h => m.set(h.doc.title, (m.get(h.doc.title) || []).concat(h.text))); return [...m].map(([title, parts]) => ({ title, body: parts.join("\n") })); };

function md(t) {
  const lines = esc(t).split("\n"); let h = "", list = false, table = false;
  for (let l of lines) {
    l = l.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    if (/^\s*\|.*\|\s*$/.test(l)) {
      if (/^\s*\|[\s:|-]+\|\s*$/.test(l)) continue;
      if (!table) { if (list) { h += "</ul>"; list = false; } h += "<div class='scroll'><table>"; table = true; }
      h += "<tr>" + l.trim().slice(1, -1).split("|").map(c => `<td>${c.trim()}</td>`).join("") + "</tr>"; continue;
    }
    if (table) { h += "</table></div>"; table = false; }
    const hd = l.match(/^#{1,4}\s+(.*)/), li = l.match(/^\s*(?:[-*•]|\d+[.、])\s+(.*)/);
    if (li) { if (!list) { h += "<ul>"; list = true; } h += `<li>${li[1]}</li>`; continue; }
    if (list) { h += "</ul>"; list = false; }
    if (hd) h += `<h4>${hd[1]}</h4>`; else if (l.trim()) h += `<p>${l}</p>`;
  }
  if (list) h += "</ul>"; if (table) h += "</table></div>"; return h;
}
const Md = ({ text, live, empty }) => text ? html`<div className=${"out" + (live ? " cursor" : "")} dangerouslySetInnerHTML=${{ __html: md(text) }}></div>` : html`<div className="out empty">${empty}</div>`;
function download(name, text, word) {
  const body = word ? `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${esc(name)}</title></head><body style="font-family:SimSun,serif;font-size:12pt;line-height:1.8">${esc(text).split("\n").map(l => `<p style="margin:0 0 6pt">${l || "&nbsp;"}</p>`).join("")}</body></html>` : "\ufeff" + text;
  const url = URL.createObjectURL(new Blob([body], { type: word ? "application/msword" : "text/plain;charset=utf-8" }));
  const a = document.createElement("a"); a.href = url; a.download = name + (word ? ".doc" : ".txt"); document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000);
}
async function copyText(t) { try { await navigator.clipboard.writeText(t); toast("已复制"); } catch { toast("复制失败，请手动选择"); } }

/* ---------------- 路由 ---------------- */
const useHash = () => { const [h, setH] = useState(location.hash.slice(1) || "home"); useEffect(() => { const f = () => { setH(location.hash.slice(1) || "home"); scrollTo(0, 0); }; addEventListener("hashchange", f); return () => removeEventListener("hashchange", f); }, []); return h; };
const go = h => { location.hash = h; };

/* ---------------- 大模型调用 ---------------- */
const ERR = { 503: "演示服务器还没有配置大模型 API Key，请管理员在后台填写。", 429: "调用太频繁，请稍等一分钟再试。" };
function useRun(agent) {
  const [ev, setEv] = useState([]); const [st, setSt] = useState("idle");
  const [stats, setStats] = useState({ n: 0, ms: 0, chars: 0, hits: 0 });
  const ctl = useRef(null);
  const log = (text) => setEv(e => [{ t: now(), text, k: Math.random() }, ...e].slice(0, 40));
  const mark = (status, extra = {}) => store.set(s => ({ runs: { ...s.runs, [agent.id]: { ...(s.runs[agent.id] || { n: 0 }), status, at: now(), ...extra } } }));
  async function run(input, onText, label) {
    ctl.current?.abort(); const ac = new AbortController(); ctl.current = ac;
    setSt("run"); mark("run"); log("发起请求：" + label); const t0 = performance.now(); let text = "", first = true;
    try {
      const r = await fetch("api/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ agent: agent.id, input }), signal: ac.signal });
      if (!r.ok || !r.body) { let m = ERR[r.status]; try { m = (await r.json()).error || m; } catch {} throw new Error(m || "生成失败，请再试一次。"); }
      const rd = r.body.getReader(), dec = new TextDecoder(); let buf = "";
      for (;;) {
        const { value, done } = await rd.read(); if (done) break;
        buf += dec.decode(value, { stream: true }); let i;
        while ((i = buf.indexOf("\n\n")) >= 0) {
          const line = buf.slice(0, i).trim(); buf = buf.slice(i + 2); if (!line.startsWith("data:")) continue;
          let j; try { j = JSON.parse(line.slice(5)); } catch { continue; }
          if (j.error) throw new Error(j.error);
          if (j.t) { if (first) { first = false; log(`模型开始生成（首字 ${((performance.now() - t0) / 1000).toFixed(1)}s）`); } text += j.t; onText(text, true); }
        }
      }
      if (!text) throw new Error("模型没有返回内容，请再试一次。");
      const ms = performance.now() - t0; onText(text, false);
      log(`生成完成 · ${text.length} 字 · ${(ms / 1000).toFixed(1)}s`); setSt("done");
      setStats(s => ({ ...s, n: s.n + 1, ms: s.ms + ms, chars: s.chars + text.length }));
      store.set(s => { const o = s.runs[agent.id] || { n: 0 }; return { runs: { ...s.runs, [agent.id]: { ...o, status: "done", at: now(), n: (o.n || 0) + 1, ms: Math.round(ms), chars: text.length } } }; });
      return text;
    } catch (e) {
      onText(text, false, e.name === "AbortError" ? "已停止。" : e.message);
      log(e.name === "AbortError" ? "已手动停止" : "失败：" + e.message); setSt("idle"); mark("idle"); return text || null;
    }
  }
  return { ev, st, stats, setStats, log, run, stop: () => ctl.current?.abort() };
}

/* ---------------- three.js 挂载 ---------------- */
function useScene(kind, arg) {
  const ref = useRef(null), api = useRef(null);
  useEffect(() => {
    let alive = true; let inst;
    const mount = () => { if (!alive || !ref.current || !window.AIScene) return; try { inst = window.AIScene[kind](ref.current, arg); api.current = inst; } catch (e) { console.warn("3D 场景未启动：", e); } };
    if (window.AIScene) mount(); else addEventListener("aiscene", mount, { once: true });
    return () => { alive = false; removeEventListener("aiscene", mount); inst && inst.dispose(); api.current = null; };
  }, [kind, arg]);
  return [ref, api];
}

/* ---------------- 顶栏 ---------------- */
function Top({ route }) {
  const s = useStore();
  const on = k => (k === "home" ? (route === "home" || AG[route]) : route.startsWith(k)) ? "on" : "";
  return html`<header className="top"><div className="wrap">
    <a className="logo" href="#home"><svg width="34" height="34" viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#67e8f9"/><stop offset="1" stop-color="#2f7bff"/></linearGradient></defs><path d="M20 3l17 17-17 17L3 20z" fill="none" stroke="url(#lg)" stroke-width="4" stroke-linejoin="round"/><path d="M20 13l7 7-7 7-7-7z" fill="url(#lg)" opacity=".85"/></svg><span><b>智能体超市</b><small>AI AGENT MARKET</small></span></a>
    <nav className="nav" aria-label="主导航">
      <a className=${on("home")} href="#home"><${Icon} n="home"/>智能体超市</a>
      <a className=${on("kb")} href="#kb"><${Icon} n="kb"/>本行知识库</a>
      <a className=${on("manage")} href="#manage"><${Icon} n="admin"/>管理端</a>
    </nav>
    <span className="status"><i className=${"dot" + (s.ai ? "" : " warn")}></i>${s.ai == null ? "连接中…" : s.ai ? "AI 已接入" : "AI 未配置 · 本机功能可用"}</span>
  </div></header>`;
}

/* ---------------- 首页 ---------------- */
function Home() {
  const s = useStore();
  const [role, setRole] = useState("全部");
  const list = AGENTS.filter(a => role === "全部" || a.roles.includes(role));
  const [act, setAct] = useState(1);
  const [hover, setHover] = useState(false);
  const [ref, api] = useScene("stage");
  const n = list.length, cur = ((act % n) + n) % n;
  useEffect(() => { setAct(Math.min(1, list.length - 1)); }, [role]);
  useEffect(() => { if (list[cur]) api.current?.setAccent(list[cur].color); }, [cur, role]);
  useEffect(() => { if (hover || matchMedia("(prefers-reduced-motion: reduce)").matches) return; const t = setInterval(() => setAct(a => a + 1), 4200); return () => clearInterval(t); }, [hover, n]);
  const mobile = matchMedia("(max-width: 720px)").matches;
  const tags = new Set(s.docs.flatMap(d => d.tags));
  const open = (a) => { if (a.soon) return toast("该智能体即将上架"); if (!s.enabled[a.id]) return toast("需要管理员为你的岗位开通"); go(a.id); };
  return html`<${React.Fragment}>
  <section className="hero" onMouseEnter=${() => setHover(true)} onMouseLeave=${() => setHover(false)}>
    <canvas className="stage" ref=${ref} aria-hidden="true"></canvas>
    <div className="wrap copy">
      <h1>银行智能体<em>超市</em></h1>
      <div className="sub">一站发现 · 一键启动 · 合规可控</div>
      <div className="kpi"><span className="chip c">${LIVE.length} 个智能体在架</span><span className="chip">知识库 ${s.docs.length} 份文档 · ${tags.size} 个标签</span><span className="chip g">敏感信息本机脱敏</span></div>
    </div>
    <div className="carousel" role="list" aria-label="智能体货架">
      ${list.map((a, i) => {
        let d = i - cur; if (d > n / 2) d -= n; if (d < -n / 2) d += n;
        const ad = Math.abs(d), gap = mobile ? 128 : 236;
        const style = { "--ac": a.color, transform: `translateX(${d * gap}px) translateZ(${-ad * 170}px) rotateY(${-d * 14}deg) scale(${d === 0 ? 1.08 : 1})`, opacity: ad > (mobile ? 1.5 : 2.5) ? 0 : 1 - ad * 0.12, zIndex: 10 - ad, pointerEvents: ad > 2.5 ? "none" : "auto" };
        const off = a.soon || !s.enabled[a.id];
        return html`<article key=${a.id} role="listitem" className=${"card3d" + (d === 0 ? " active" : "") + (off ? " off" : "")} style=${style} onClick=${() => d === 0 ? open(a) : setAct(act + d)}>
          <div className="ic"><${Icon} n=${a.id}/></div>
          <h3>${a.name}</h3><p>${a.short}</p>
          <span className="lv">敏感度 ${a.lvl} · ${a.where}</span>
          <button className="go" type="button" onClick=${e => { e.stopPropagation(); open(a); }}>${a.soon ? "即将上架" : off ? "需开通" : "立即体验 ▸"}</button>
        </article>`;
      })}
    </div>
    <button className="cnav l" type="button" aria-label="上一个" onClick=${() => setAct(act - 1)}><${Icon} n="left" width="20"/></button>
    <button className="cnav r" type="button" aria-label="下一个" onClick=${() => setAct(act + 1)}><${Icon} n="right" width="20"/></button>
    <div className="roles" role="tablist" aria-label="按岗位筛选">${ROLES.map(r => html`<button key=${r} type="button" role="tab" aria-selected=${r === role} className=${r === role ? "on" : ""} onClick=${() => setRole(r)}>${r}</button>`)}</div>
  </section>
  <div className="wrap" style=${{ marginTop: 22 }}>
    <section className="panel" key=${role} onMouseEnter=${() => setHover(true)} onMouseLeave=${() => setHover(false)}>
      <div className="ph"><h2><i><${Icon} n="spark"/></i>${role === "全部" ? "全部智能体" : role + "可用的智能体"}<span className="small" style=${{ fontWeight: 400 }}>${list.length} 个</span></h2><span className="small">点上方岗位切换 · 点模块进入工作台</span></div>
      <div className="mods">${list.map((a, i) => { const r = s.runs[a.id], live = r && r.status === "run", off = a.soon || !s.enabled[a.id];
        return html`<article key=${a.id} className=${"mod" + (i === cur ? " on" : "") + (off ? " off" : "")} style=${{ "--ac": a.color, animationDelay: i * 60 + "ms" }} role="button" tabIndex="0" onMouseEnter=${() => setAct(i)} onFocus=${() => setAct(i)} onClick=${() => open(a)} onKeyDown=${e => e.key === "Enter" && open(a)}>
          <div className="mh"><div className="ic"><${Icon} n=${a.id}/></div><div><h3>${a.name}</h3><span className="small">${a.short}</span></div><span className=${"chip " + (a.lvl === "高" ? "r" : a.lvl === "中" ? "a" : "g")}>敏感度 ${a.lvl}</span></div>
          <p>${a.intro}</p>
          <div className="mt">${a.tags.map(t => html`<span key=${t} className="chip c">${t}</span>`)}</div>
          <div className="mf"><span className="small">${r ? (live ? "● 运行中" : `✓ 已用 ${r.n || 0} 次 · ${r.at}`) : a.saves}</span><span className="go2">${a.soon ? "即将上架" : off ? "需管理员开通" : "进入工作台 ›"}</span></div>
          ${r ? html`<div className=${"bar" + (live ? " live" : "")}><i style=${{ width: live ? "70%" : "100%" }}></i></div>` : null}
        </article>`; })}</div>
    </section>
  </div></${React.Fragment}>`;
}

/* ---------------- 智能体工作台外壳 ---------------- */
function Shell({ a, R, extra, children }) {
  const [ref, api] = useScene("core", a.color);
  useEffect(() => { api.current?.setState(R.st); }, [R.st]);
  const avg = R.stats.n ? (R.stats.ms / R.stats.n / 1000).toFixed(1) + "s" : "—";
  return html`<div className="wrap enter" style=${{ "--ac": a.color }}>
    <div className="crumb"><a href="#home">智能体超市</a><span>›</span><span style=${{ color: "#fff" }}>${a.name}</span></div>
    <div className="ahead">
      <section className="panel ainfo">
        <div className="top2"><div className="big"><${Icon} n=${a.id}/></div><div><h1>${a.name}</h1><div className="small">${a.short}</div></div></div>
        <div className="tags">${a.tags.map(t => html`<span key=${t} className="chip c">${t}</span>`)}<span className=${"chip " + (a.lvl === "高" ? "r" : a.lvl === "中" ? "a" : "g")}>敏感度 ${a.lvl}</span></div>
        <p><b style=${{ color: "#cfe3ff" }}>能力介绍\u3000</b>${a.intro}</p>
        <div className="acts">${extra}<span className="small">${a.saves}</span></div>
      </section>
      <section className="panel core glow" aria-label="智能核心状态">
        <canvas ref=${ref} aria-hidden="true"></canvas>
        <div className=${"pill" + (R.st === "run" ? " run" : "")}><i className="dot"></i>${R.st === "run" ? "运行中" : R.st === "done" ? "已完成" : "就绪"}</div>
      </section>
      <section className="panel">
        <div className="ph"><h2><i><${Icon} n="pulse"/></i>运行动态</h2>${R.st === "run" ? html`<button className="btn sm danger" type="button" onClick=${R.stop}><${Icon} n="stop"/>停止</button>` : null}</div>
        <ul className="timeline">${R.ev.length ? R.ev.map(e => html`<li key=${e.k}><time>${e.t}</time><span>${e.text}</span></li>`) : html`<li><span className="empty">还没有运行记录。在下方输入材料后开始。</span></li>`}</ul>
      </section>
    </div>
    <div className="stats">
      <div className="stat"><span>本次调用</span><b>${R.stats.n}</b></div>
      <div className="stat"><span>平均用时</span><b>${avg}</b></div>
      <div className="stat"><span>累计输出字数</span><b>${R.stats.chars}</b></div>
      <div className="stat"><span>${a.id === "mask" ? "识别敏感信息" : a.id === "qa" ? "命中知识片段" : a.id === "credit" ? "本机核对项" : a.id === "prompt" ? "已生成提示词" : "合规检查"}</span><b>${R.stats.hits}</b></div>
    </div>
    ${children}
  </div>`;
}
function useOut() { const [o, setO] = useState({ text: "", live: false, err: "" }); return [o, (text, live, err = "") => setO({ text, live, err })]; }
const OutBox = ({ o, empty }) => html`<${React.Fragment}><${Md} text=${o.text} live=${o.live} empty=${empty}/>${o.err ? html`<div className="alert bad" style=${{ marginTop: 8 }}>${o.err}</div>` : null}</${React.Fragment}>`;

/* --- 脱敏助手 --- */
const MASK_SAMPLE = "客户张建国，身份证号610302198305124417，手机13891723456，在本行开立一类账户，卡号6217 8530 1234 5678 901。其配偶王丽娟，手机15029381122。张建国任宝鸡示例钛材有限公司法定代表人，公司地址为陕西省宝鸡市高新区示例大道88号。该公司拟申请流动资金贷款500万元，用于采购原材料。";
function Mask() {
  const a = AG.mask, R = useRun(a);
  const [src, setSrc] = useState(""); const [res, setRes] = useState(null); const [o, setO] = useOut(); const [back, setBack] = useState(""); const [step, setStep] = useState(0);
  const [fname, setFname] = useState(""); const [busy, setBusy] = useState(false); const inp = useRef(null);
  const base = (fname || "材料").replace(/\.[^.]+$/, "");
  const load = async f => { if (!f) return; setBusy(true); try { const t = clean(await parseFile(f)); setSrc(t); setFname(f.name); setRes(null); setStep(0); setBack(""); R.log(`本机读取文件：${f.name}（${t.length} 字），文件不上传`); audit(a.name, "本机读取文件", f.name); } catch (e) { toast(e.message); } finally { setBusy(false); } };
  const exp = (text, suffix, word) => { download(`${base}_${suffix}`, text, word); R.log(`导出${suffix}（${word ? "Word" : "TXT"}）`); audit(a.name, "导出" + suffix, word ? "Word" : "TXT"); };
  const doMask = () => { if (!src.trim()) return toast("请先粘贴材料或点“填入示例”"); const r = maskText(src); setRes(r); setStep(1); setBack(""); R.log(`本机脱敏完成，识别 ${r.map.length} 处`); R.setStats(s => ({ ...s, hits: s.hits + r.map.length })); audit(a.name, "本机脱敏", `识别${r.map.length}处`); };
  const send = async () => { audit(a.name, "脱敏文本发送模型", "仅占位符版本"); R.log("只发送占位符版本，原文留在本机"); const t = await R.run({ text: res.masked }, setO, "要点摘要"); if (t) setStep(2); };
  const doBack = () => { setBack(restore(o.text, res.map)); setStep(3); R.log("用本机对照表还原完成"); audit(a.name, "本机还原"); };
  const clear = () => { setRes(r => r && { ...r, map: [] }); toast("对照表已清除，占位符无法再还原"); R.log("对照表已清除"); };
  return html`<${Shell} a=${a} R=${R} extra=${html`<button className="btn pri" type="button" onClick=${() => { setSrc(MASK_SAMPLE); toast("已填入虚构示例"); }}><${Icon} n="play"/>填入示例</button>`}>
    <div className="steps">${["识别替换|本机完成", "交给模型处理|只发占位符版本", "还原并核对|用对照表换回原文"].map((x, i) => { const [b, s2] = x.split("|"); return html`<span key=${i} className=${step > i ? "done" : ""}><b>${i + 1} ${b}</b>${s2}</span>`; })}</div>
    <div className="grid2" style=${{ gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))" }}>
      <section className="panel"><div className="ph"><h2><i><${Icon} n="doc"/></i>原始材料</h2><button className="btn sm" type="button" disabled=${busy} onClick=${() => inp.current.click()}>${busy ? html`<span className="spinner"></span>` : html`<${Icon} n="upload"/>`}上传文件</button>
          <input ref=${inp} type="file" hidden accept=".pdf,.docx,.txt,.md,.html,.htm,.csv" onChange=${e => { load(e.target.files[0]); e.target.value = ""; }}/></div>
        ${fname ? html`<div className="small" style=${{ marginBottom: 6 }}>已读取：${fname}（在本机解析，未上传）</div>` : null}
        <textarea value=${src} onInput=${e => setSrc(e.target.value)} aria-label="原始材料" placeholder="粘贴含敏感信息的材料，或上传 Word、PDF、TXT 文件（演示请用虚构内容）"></textarea>
        <div className="acts" style=${{ marginTop: 10 }}><button className="btn pri" type="button" onClick=${doMask}>本机脱敏</button><span className="small">原文不上传</span></div></section>
      <section className="panel"><div className="ph"><h2><i><${Icon} n="mask"/></i>可外发版本</h2><div className="acts"><button className="btn sm" type="button" disabled=${!res} onClick=${() => copyText(res.masked)}><${Icon} n="copy"/>复制</button><button className="btn sm" type="button" disabled=${!res} onClick=${() => exp(res.masked, "已脱敏", true)}>导出 Word</button><button className="btn sm" type="button" disabled=${!res} onClick=${() => exp(res.masked, "已脱敏", false)}>导出 TXT</button></div></div>
        ${res ? html`<div className="out" dangerouslySetInnerHTML=${{ __html: esc(res.masked).replace(/\[[一-龥]+\d+\]/g, x => `<span class="ph-tag">${x}</span>`) }}></div>` : html`<div className="out empty">点“本机脱敏”后，可以外发的版本显示在这里。</div>`}
        <div className="ph" style=${{ marginTop: 14 }}><h2>模型返回的摘要</h2><button className="btn pri sm" type="button" disabled=${!res || R.st === "run"} onClick=${send}>${R.st === "run" ? html`<span className="spinner"></span>` : null}发给模型</button></div>
        <${OutBox} o=${o} empty="模型只会看到占位符版本。"/></section>
      <section className="panel"><div className="ph"><h2><i><${Icon} n="eye"/></i>对照表</h2><span className="chip r">不出本机</span></div>
        <div className="scroll"><table className="t"><thead><tr><th>占位符</th><th>原文</th></tr></thead><tbody>
          ${res && res.map.length ? res.map.map(r => html`<tr key=${r.ph}><td style=${{ color: "#67e8f9", whiteSpace: "nowrap" }}>${r.ph}</td><td>${r.val}</td></tr>`) : html`<tr><td colSpan="2" className="small">${res ? "对照表为空。" : "脱敏后显示。"}</td></tr>`}
        </tbody></table></div>
        <div className="acts" style=${{ margin: "12px 0" }}><button className="btn pri" type="button" disabled=${!o.text || !res || !res.map.length} onClick=${doBack}>还原摘要</button><button className="btn danger" type="button" onClick=${clear}>用完清除对照表</button></div>
        <${Md} text=${back} empty="还原后的结果显示在这里。"/>
        ${back ? html`<div className="acts" style=${{ marginTop: 10 }}><button className="btn sm" type="button" onClick=${() => exp(back, "还原结果", true)}>导出 Word</button><button className="btn sm" type="button" onClick=${() => exp(back, "还原结果", false)}>导出 TXT</button><span className="small">含真实信息，仅在本机保存</span></div>` : null}
        <p className="small" style=${{ marginTop: 10 }}>对照表只在本机内存中，不提供导出，关闭页面即消失。</p></section>
    </div></${Shell}>`;
}

/* --- 制度问答 --- */
function QA() {
  const a = AG.qa, R = useRun(a), s = useStore();
  const [chat, setChat] = useState([]); const [q, setQ] = useState(""); const [scope, setScope] = useState([]); const [hits, setHits] = useState([]);
  const box = useRef(null);
  useEffect(() => { box.current && (box.current.scrollTop = box.current.scrollHeight); }, [chat]);
  const allTags = [...new Set(s.docs.flatMap(d => d.tags))];
  const pool = scope.length ? s.docs.filter(d => d.tags.some(t => scope.includes(t))) : s.docs;
  const send = async (text) => {
    text = (text || "").trim(); if (!text || R.st === "run") return; setQ("");
    const h = retrieve(text, pool); setHits(h); R.setStats(x => ({ ...x, hits: x.hits + h.length }));
    R.log(h.length ? `检索知识库：命中 ${h.length} 段，来自 ${new Set(h.map(x => x.doc.title)).size} 份文档` : "检索知识库：没有命中相关条款");
    audit(a.name, "提问", text);
    const history = chat.slice(-6).map(m => ({ role: m.role, content: m.content }));
    setChat(c => [...c, { role: "user", content: text }, { role: "assistant", content: "", live: true }]);
    const docs = h.length ? asDocs(h) : [{ title: "检索结果", body: "知识库中没有与该问题相关的内容。" }];
    const upd = (t, live, err) => setChat(c => { const n = c.slice(); n[n.length - 1] = { role: "assistant", content: t || (err ? "（" + err + "）" : ""), live }; return n; });
    await R.run({ question: text, history, docs }, upd, "制度问答");
  };
  const render = t => { if (/^未找到依据/.test(t)) return md(t); const p = t.split(/\n?依据[:：]/); return md(p[0]) + (p[1] ? `<div class="cite"><b>依据</b>\u3000${esc(p[1].trim())}</div>` : ""); };
  return html`<${Shell} a=${a} R=${R} extra=${html`<a className="btn" href="#kb">管理知识库</a>`}>
    <div className="grid2" style=${{ gridTemplateColumns: "minmax(0,2fr) minmax(280px,1fr)" }}>
      <section className="panel"><div className="ph"><h2><i><${Icon} n="qa"/></i>提问</h2><span className="small">检索范围：${pool.length} 份文档</span></div>
        <div className="chat" ref=${box} aria-live="polite">${chat.length ? chat.map((m, i) => m.role === "user" ? html`<div key=${i} className="msg me">${m.content}</div>` : html`<div key=${i} className=${"msg ai" + (/^未找到依据/.test(m.content) ? " none" : "") + (m.live ? " cursor" : "")} dangerouslySetInnerHTML=${{ __html: m.content ? render(m.content) : '<span class="small">正在检索并生成…</span>' }}></div>`) : html`<p className="small">还没有提问。点下面的示例问题试试；回答只依据知识库里命中的条款。</p>`}</div>
        <div className="sugg">${["大额存单能不能部分提前支取？", "给70岁的客户卖理财要注意什么？", "信用卡年费怎么减免？"].map(x => html`<button key=${x} type="button" onClick=${() => send(x)}>${x}</button>`)}</div>
        <div className="composer"><textarea value=${q} onInput=${e => setQ(e.target.value)} onKeyDown=${e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(q); } }} placeholder="问一个制度问题，回车发送" aria-label="输入问题"></textarea>
          <button className="send" type="button" aria-label="发送" onClick=${() => send(q)}><${Icon} n="send" width="20"/></button></div></section>
      <section className="panel"><div className="ph"><h2><i><${Icon} n="tag"/></i>检索范围</h2>${scope.length ? html`<button className="btn sm ghost" type="button" onClick=${() => setScope([])}>全部</button>` : null}</div>
        <div className="tagcloud" style=${{ marginBottom: 14 }}>${allTags.map(t => html`<button key=${t} type="button" className=${scope.includes(t) ? "on" : ""} onClick=${() => setScope(x => x.includes(t) ? x.filter(y => y !== t) : [...x, t])}>${t}</button>`)}</div>
        <div className="ph"><h2>命中的知识片段</h2></div>
        <div className="hits">${hits.length ? hits.map((h, i) => html`<div key=${i} className="hit" style=${{ animationDelay: i * 60 + "ms" }}><b>《${h.doc.title}》</b><p>${h.text}</p></div>`) : html`<p className="small">提问后显示检索到的条款片段，模型只能依据这些片段作答。</p>`}</div></section>
    </div></${Shell}>`;
}

/* --- 话术 --- */
function Script() {
  const a = AG.script, R = useRun(a), s = useStore();
  const [f, setF] = useState({ product: "大额存单", scene: "柜面咨询", customer: "老年客户", tone: "亲切耐心", extra: "" });
  const [o, setO] = useOut(); const [chk, setChk] = useState(null);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const sel = (k, opts, label) => html`<label className="field">${label}<select value=${f[k]} onChange=${set(k)}>${opts.map(x => html`<option key=${x}>${x}</option>`)}</select></label>`;
  const bad = banned(f.extra);
  const gen = async () => {
    if (bad.length) R.log("补充要求含违规用语：" + bad.join("、") + "，已要求模型改写");
    const h = retrieve(`${f.product} ${f.customer} ${f.scene} 销售 规定`, s.docs, 6, 4000); R.log(`参考本行制度 ${h.length} 段`);
    audit(a.name, "生成话术", `${f.product}·${f.customer}`);
    const t = await R.run({ ...f, docs: h.length ? asDocs(h) : undefined }, setO, `${f.product}话术`);
    if (t) { const hb = banned(t); setChk(hb); R.setStats(x => ({ ...x, hits: x.hits + 1 })); R.log(hb.length ? "合规检查：话术中仍有 " + hb.join("、") : "合规检查通过"); }
  };
  return html`<${Shell} a=${a} R=${R} extra=${html`<button className="btn pri" type="button" onClick=${() => setF({ ...f, product: "理财产品", customer: "老年客户", extra: "跟客户强调这款产品保本，收益最高，稳赚不赔" })}><${Icon} n="play"/>填入违规示例</button>`}>
    <div className="grid2">
      <section className="panel"><div className="ph"><h2><i><${Icon} n="script"/></i>场景设置</h2></div>
        <div className="fields">${sel("product", ["大额存单", "理财产品", "信用卡", "手机银行", "个人消费贷款"], "产品")}${sel("scene", ["柜面咨询", "电话回访", "厅堂营销", "客户投诉安抚", "净值回撤安抚", "朋友圈文案"], "场景")}${sel("customer", ["老年客户", "年轻上班族", "小微企业主", "新客户"], "客户类型")}${sel("tone", ["亲切耐心", "专业简洁"], "语气")}</div>
        <label className="field" style=${{ marginTop: 10 }}>补充要求<textarea style=${{ minHeight: 100 }} value=${f.extra} onInput=${set("extra")} placeholder="例如：重点介绍起存金额和提前支取规则"></textarea></label>
        ${bad.length ? html`<div className="alert bad" style=${{ marginTop: 10 }}>补充要求中有违规用语：${bad.map(w => html`<mark key=${w} className="bad">${w}</mark> `)}生成时会按规定改写。</div>` : null}
        <div className="acts" style=${{ marginTop: 12 }}><button className="btn pri" type="button" disabled=${R.st === "run"} onClick=${gen}>${R.st === "run" ? html`<span className="spinner"></span>` : null}生成话术</button></div></section>
      <section className="panel"><div className="ph"><h2>话术</h2><button className="btn sm" type="button" disabled=${!o.text} onClick=${() => copyText(o.text)}><${Icon} n="copy"/>复制</button></div>
        <${OutBox} o=${o} empty="生成两版话术，并自动检查违规用语。"/>
        ${chk ? html`<div className=${"alert " + (chk.length ? "bad" : "good")} style=${{ marginTop: 10 }}>${chk.length ? "话术中仍含：" + chk.join("、") + "，请修改后再用。" : "合规用语检查通过：没有发现承诺收益、保本等用语。"}</div>` : null}</section>
    </div></${Shell}>`;
}

/* --- 纪要公文 --- */
const MIN_SAMPLE = "王行长：今天说两件事。一是四季度存款，目前完成全年任务的百分之八十二。各网点把到期客户名单再过一遍，下周三前报上来。\n李经理：渭滨支行到期客户大概一百二十户，这周开始电话回访。\n王行长：好。二是反诈宣传，上级要求本月每个网点至少两场进社区活动。小刘你牵头，月底前把照片和总结交到综合部。\n刘明：收到，我先排时间表，周五前发群里。\n王行长：还有，厅堂排队时间长，大堂经理要主动引导用自助设备。散会。";
function Minutes() {
  const a = AG.minutes, R = useRun(a);
  const [src, setSrc] = useState(""); const [kind, setKind] = useState("会议纪要"); const [title, setTitle] = useState("四季度重点工作推进会"); const [o, setO] = useOut();
  const gen = async () => { if (!src.trim()) return toast("请先粘贴转写文字或点“填入示例”"); R.log(`读取转写 ${src.length} 字`); audit(a.name, "生成" + kind, title); const t = await R.run({ kind, title, text: src }, setO, kind); if (t) { const n = (t.match(/\n\|/g) || []).length; R.setStats(x => ({ ...x, hits: x.hits + 1 })); n && R.log(`提取待办约 ${Math.max(0, n - 1)} 项`); } };
  return html`<${Shell} a=${a} R=${R} extra=${html`<button className="btn pri" type="button" onClick=${() => setSrc(MIN_SAMPLE)}><${Icon} n="play"/>填入示例</button>`}>
    <div className="grid2">
      <section className="panel"><div className="ph"><h2><i><${Icon} n="minutes"/></i>会议转写或要点</h2></div>
        <textarea style=${{ minHeight: 230 }} value=${src} onInput=${e => setSrc(e.target.value)} aria-label="会议转写" placeholder="粘贴千问等工具录音转写的文字"></textarea>
        <div className="fields" style=${{ marginTop: 10 }}><label className="field">文种<select value=${kind} onChange=${e => setKind(e.target.value)}>${["会议纪要", "工作通知", "工作总结"].map(x => html`<option key=${x}>${x}</option>`)}</select></label><label className="field">会议名称<input type="text" value=${title} onInput=${e => setTitle(e.target.value)}/></label></div>
        <div className="acts" style=${{ marginTop: 12 }}><button className="btn pri" type="button" disabled=${R.st === "run"} onClick=${gen}>${R.st === "run" ? html`<span className="spinner"></span>` : null}生成</button></div></section>
      <section className="panel"><div className="ph"><h2>初稿</h2><button className="btn sm" type="button" disabled=${!o.text} onClick=${() => copyText(o.text)}><${Icon} n="copy"/>复制</button></div>
        <${OutBox} o=${o} empty="生成规范格式的初稿，并列出待办（事项、责任人、时限）。"/></section>
    </div></${Shell}>`;
}

/* --- 授信辅助 --- */
const REQ = { "流动资金贷款": ["营业执照", "法定代表人身份证明", "公司章程", "近三年财务报表", "近期纳税证明", "贷款用途证明（购销合同）", "征信查询授权书"], "固定资产贷款": ["营业执照", "法定代表人身份证明", "公司章程", "近三年财务报表", "项目批文或备案", "项目可行性报告", "征信查询授权书"], "抵押贷款": ["营业执照", "法定代表人身份证明", "近三年财务报表", "抵押物权属证明", "抵押物评估报告", "征信查询授权书"] };
const ALLDOCS = [...new Set(Object.values(REQ).flat())];
const FIN = [["ta", "总资产"], ["tl", "总负债"], ["eq", "所有者权益"], ["ca", "流动资产"], ["cl", "流动负债"], ["rev", "营业收入"], ["np", "净利润"]];
const CS = { name: "示例企业A（虚构）", ind: "钛材加工", type: "流动资金贷款", amt: "500", ta: "8600", tl: "5200", eq: "3400", ca: "4100", cl: "3300", rev: "12500", np: "680", have: ["营业执照", "法定代表人身份证明", "公司章程", "近三年财务报表", "征信查询授权书"] };
function Credit() {
  const a = AG.credit, R = useRun(a);
  const [f, setF] = useState({ name: "", ind: "", type: "流动资金贷款", amt: "", have: [], ...Object.fromEntries(FIN.map(([k]) => [k, ""])) });
  const [res, setRes] = useState(null); const [o, setO] = useOut(); const [verdict, setVerdict] = useState([]);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const check = () => {
    const need = REQ[f.type], miss = need.filter(d => !f.have.includes(d)); const v = k => parseFloat(f[k]);
    const [ta, tl, eq, ca, cl, rev, np] = FIN.map(([k]) => v(k)), amt = parseFloat(f.amt); const items = [], ratios = [];
    if ([ta, tl, eq].every(Number.isFinite)) { const d = ta - tl - eq, ok = Math.abs(d) <= Math.max(1, ta * 0.001); items.push(ok ? ["good", `资产负债表平衡：总资产 ${ta} = 总负债 ${tl} + 所有者权益 ${eq}`] : ["bad", `资产负债表不平衡：差额 ${d.toFixed(2)} 万元，请核对报表`]); }
    else items.push(["warn", "总资产、总负债、所有者权益未填全，无法检查平衡关系"]);
    if (ta > 0 && Number.isFinite(tl)) { const r = tl / ta * 100; ratios.push(["资产负债率", r.toFixed(1) + "%", r > 70 ? "偏高，说明偿债来源" : r > 55 ? "中等" : "较低"]); }
    if (cl > 0 && Number.isFinite(ca)) { const r = ca / cl; ratios.push(["流动比率", r.toFixed(2), r < 1 ? "低于1，短期偿债需关注" : "大于1"]); }
    if (rev > 0 && Number.isFinite(np)) ratios.push(["销售净利率", (np / rev * 100).toFixed(1) + "%", "同行业对比待补充"]);
    if (rev > 0 && Number.isFinite(amt)) ratios.push(["申请金额/营业收入", (amt / rev * 100).toFixed(1) + "%", "核实采购周期与回款"]);
    if (Number.isFinite(ca) && Number.isFinite(ta) && ca > ta) items.push(["bad", "流动资产大于总资产，数据有误"]);
    const facts = `企业：${f.name || "未填"}；行业：${f.ind || "未填"}；品种：${f.type}；申请金额：${f.amt || "未填"}万元。\n已收材料：${f.have.join("、") || "无"}；缺项：${miss.join("、") || "无"}。\n财务数据（万元）：总资产${ta}，总负债${tl}，所有者权益${eq}，流动资产${ca}，流动负债${cl}，营业收入${rev}，净利润${np}。\n检查结果：${items.map(x => x[1]).join("；")}。比率：${ratios.map(r => r[0] + " " + r[1]).join("；")}。`;
    setRes({ miss, items, ratios, facts }); R.setStats(x => ({ ...x, hits: x.hits + need.length + items.length + ratios.length }));
    R.log(`本机核对：缺 ${miss.length} 项材料，计算 ${ratios.length} 个比率`); audit(a.name, "本机核对", `缺${miss.length}项`);
  };
  const gen = async () => { audit(a.name, "生成报告初稿", f.name); setVerdict([]); const t = await R.run({ facts: res.facts }, setO, "调查报告初稿"); if (t) { const hit = VERDICT.filter(w => t.includes(w)); setVerdict(hit); R.log(hit.length ? "检测到结论性表述：" + hit.join("、") : "结论性表述检查通过"); } };
  return html`<${Shell} a=${a} R=${R} extra=${html`<button className="btn pri" type="button" onClick=${() => setF({ ...CS })}><${Icon} n="play"/>填入示例企业</button>`}>
    <div className="grid2">
      <section className="panel"><div className="ph"><h2><i><${Icon} n="credit"/></i>授信信息</h2><div className="stamp"><b>仅供参考</b>不构成审批意见</div></div>
        <div className="fields"><label className="field">企业名称<input type="text" value=${f.name} onInput=${set("name")}/></label><label className="field">所属行业<input type="text" value=${f.ind} onInput=${set("ind")}/></label>
          <label className="field">授信品种<select value=${f.type} onChange=${set("type")}>${Object.keys(REQ).map(k => html`<option key=${k}>${k}</option>`)}</select></label><label className="field">申请金额（万元）<input type="number" inputMode="decimal" value=${f.amt} onInput=${set("amt")}/></label></div>
        <h3 style=${{ fontSize: 15, margin: "16px 0 8px" }}>已收材料</h3>
        <div className="checks">${ALLDOCS.map(d => html`<label key=${d}><input type="checkbox" checked=${f.have.includes(d)} onChange=${e => setF({ ...f, have: e.target.checked ? [...f.have, d] : f.have.filter(x => x !== d) })}/>${d}</label>`)}</div>
        <h3 style=${{ fontSize: 15, margin: "16px 0 8px" }}>主要财务数据（万元）</h3>
        <div className="fields">${FIN.map(([k, l]) => html`<label key=${k} className="field">${l}<input type="number" inputMode="decimal" value=${f[k]} onInput=${set(k)}/></label>`)}</div>
        <div className="acts" style=${{ marginTop: 14 }}><button className="btn pri" type="button" onClick=${check}>本机核对</button><button className="btn" type="button" disabled=${!res || R.st === "run"} onClick=${gen}>${R.st === "run" ? html`<span className="spinner"></span>` : null}生成调查报告初稿</button></div></section>
      <section className="panel"><div className="ph"><h2>核对结果</h2><span className="chip g">本机计算 · 不调用模型</span></div>
        ${res ? html`<div className="out"><h4>材料清单（${f.type}）</h4>${res.miss.length ? html`<div className="alert bad">缺 ${res.miss.length} 项：${res.miss.join("、")}</div>` : html`<div className="alert good">材料齐全。</div>`}
          <h4>勾稽与比率</h4>${res.items.map(([c, t], i) => html`<div key=${i} className=${"alert " + c} style=${{ marginTop: 6 }}>${t}</div>`)}
          ${res.ratios.length ? html`<div className="scroll"><table className="t" style=${{ marginTop: 8 }}><thead><tr><th>指标</th><th>数值</th><th>提示</th></tr></thead><tbody>${res.ratios.map(r => html`<tr key=${r[0]}><td>${r[0]}</td><td style=${{ fontFamily: "var(--mono)" }}>${r[1]}</td><td className="small">${r[2]}</td></tr>`)}</tbody></table></div>` : null}</div>` : html`<div className="out empty">材料缺项和财务勾稽在本机计算。</div>`}
        <div className="ph" style=${{ marginTop: 16 }}><h2>调查报告初稿</h2><button className="btn sm" type="button" disabled=${!o.text} onClick=${() => copyText(o.text)}><${Icon} n="copy"/>复制</button></div>
        <${OutBox} o=${o} empty="核对后可生成初稿。"/>
        ${verdict.length ? html`<div className="alert bad" style=${{ marginTop: 8 }}>检测到结论性表述：${verdict.join("、")}。请删除后再使用。</div>` : null}
        <p className="small" style=${{ borderTop: "1px dashed rgba(251,113,133,.4)", paddingTop: 8, color: "#fecdd3" }}>本智能体只整理材料、起草初稿，不给出是否同意授信、评级或额度建议。结论由客户经理和审查岗作出。</p></section>
    </div></${Shell}>`;
}

/* 输出里的承诺性表述检查：否定语境（不得、不能、并非……）中出现的不算 */
const STRONG = ["保本保息", "保证收益", "稳赚", "包赚", "肯定赚", "零风险", "无风险", "绝对安全", "刚性兑付", "保本高收益"];
const riskyClaims = t => { const hit = new Set(); String(t).split(/[。！？\n]/).forEach(sn => STRONG.forEach(w => { const i = sn.indexOf(w); if (i >= 0 && !/不|没有|并非|禁止|切勿|勿|别|严禁|避免|非|谈|说成|误/.test(sn.slice(Math.max(0, i - 14), i))) hit.add(w); })); return [...hit]; };
const Seg = ({ items, value, set }) => html`<div className="seg" role="tablist">${items.map(([k, l]) => html`<button key=${k} type="button" role="tab" aria-selected=${value === k} className=${value === k ? "on" : ""} onClick=${() => set(k)}>${l}</button>`)}</div>`;
const PiiBtn = ({ text, set }) => PII.some(r => r.test(text)) ? html`<button className="btn sm danger" type="button" onClick=${() => { const m = maskText(text); set(m.masked); toast(`已脱敏 ${m.map.length} 处`); }}>发现敏感信息 · 自动脱敏</button>` : html`<span className="chip g">未发现证件号/手机号/卡号</span>`;

/* --- 财富配置助手 --- */
const WEALTH_MODES = [["配置", "新客户资产配置"], ["挽留", "回撤安抚挽留"], ["提升", "资产提升冲私行"]];
const PRODUCTS = "1. 现金管理类理财（R1，随存随取）\n2. 定期存款（1/2/3年，利率高于国有大行挂牌）\n3. 大额存单（20万元起，1个月至3年）\n4. 结构性存款（保本浮动收益，3—12个月）\n5. 二级风险（R2）固收理财（1万元起）\n6. 偏债基金 / 固收+基金（R2—R3）\n7. 年金险、增额终身寿（保险，不是存款）\n8. 贵金属（积存金、实物金）\n9. 信托（仅限合格投资者，R3及以上）\n利率与业绩比较基准以本行当期公告为准。";
const W_SAMPLES = {
  配置: "零售客户，男，55岁，已婚，企业高管，孩子在上学。在我行金融资产300万元，他行另有部分资金（金额待了解）。对银行资产风险厌恶，但希望收益高、风险低。风险测评：稳健型。",
  挽留: "中老年普通储蓄理财客户，风险等级R2稳健型。持有的固收理财近期小幅连续亏损（示例：本金50万元，买入以来累计收益+0.8万元，近一个月浮亏0.6万元）。只看账面盈亏，一亏钱就焦虑；情绪烦躁、不信任，扬言全部取走、不再买理财，只想去四大行存定期。认为银行理财稳赚不赔，亏钱就是被忽悠。账户另有活期约30万元长期闲置。厅堂没有礼品支持。",
  提升: "R2稳健型中老年客户，情绪已经稳住。本行资产约80万元（理财50万元、活期30万元）。配偶在他行有定期约60万元，明年3月到期；子女已工作。希望逐步把家庭资产归集到我行，达到私行客户标准（以本行私行门槛为准）。没有礼品支持，可以用服务权益。"
};
function Wealth() {
  const a = AG.wealth, R = useRun(a), s = useStore();
  const [mode, setMode] = useState("配置"); const [profile, setProfile] = useState(""); const [products, setProducts] = useState(PRODUCTS); const [o, setO] = useOut(); const [chk, setChk] = useState(null);
  const gen = async () => {
    if (!profile.trim()) return toast("请先填写客户情况或点“填入示例”");
    if (PII.some(r => r.test(profile))) return toast("客户情况里有疑似证件号、手机号或卡号，请先自动脱敏");
    const h = retrieve(`理财 风险 适当性 销售 存款 ${profile.slice(0, 300)}`, s.docs, 6, 4000); R.log(`参考本行制度 ${h.length} 段`);
    audit(a.name, "生成方案", WEALTH_MODES.find(m => m[0] === mode)[1]); setChk(null);
    const t = await R.run({ mode, profile, products, docs: h.length ? asDocs(h) : undefined }, setO, WEALTH_MODES.find(m => m[0] === mode)[1]);
    if (t) { const hb = riskyClaims(t); setChk(hb); R.setStats(x => ({ ...x, hits: x.hits + 1 })); R.log(hb.length ? "合规检查：出现 " + hb.join("、") : "合规检查通过"); }
  };
  return html`<${Shell} a=${a} R=${R} extra=${html`<button className="btn pri" type="button" onClick=${() => { setProfile(W_SAMPLES[mode]); toast("已填入示例：" + WEALTH_MODES.find(m => m[0] === mode)[1]); }}><${Icon} n="play"/>填入示例</button>`}>
    <${Seg} items=${WEALTH_MODES} value=${mode} set=${k => { setMode(k); setO("", false); setChk(null); }}/>
    <div className="grid2">
      <section className="panel"><div className="ph"><h2><i><${Icon} n="wealth"/></i>客户情况</h2><${PiiBtn} text=${profile} set=${setProfile}/></div>
        <textarea style=${{ minHeight: 180 }} value=${profile} onInput=${e => setProfile(e.target.value)} placeholder="年龄、职业、家庭、在本行和他行的资产、风险等级、持仓与盈亏、诉求和情绪（请用虚构或已脱敏的信息）" aria-label="客户情况"></textarea>
        <label className="field" style=${{ marginTop: 10 }}>本行可用产品（按当期在售修改）<textarea style=${{ minHeight: 160 }} value=${products} onInput=${e => setProducts(e.target.value)}></textarea></label>
        <div className="acts" style=${{ marginTop: 12 }}><button className="btn pri" type="button" disabled=${R.st === "run"} onClick=${gen}>${R.st === "run" ? html`<span className="spinner"></span>` : null}生成方案</button><span className="small">方案供理财经理参考，须经风险测评与适当性匹配</span></div></section>
      <section className="panel"><div className="ph"><h2>${WEALTH_MODES.find(m => m[0] === mode)[1]}方案</h2><button className="btn sm" type="button" disabled=${!o.text} onClick=${() => copyText(o.text)}><${Icon} n="copy"/>复制</button></div>
        <${OutBox} o=${o} empty="选择场景、填写客户情况后生成。"/>
        ${chk ? html`<div className=${"alert " + (chk.length ? "bad" : "good")} style=${{ marginTop: 10 }}>${chk.length ? "方案中出现承诺性表述：" + chk.join("、") + "，请修改后再用。" : "合规检查通过：没有发现承诺保本、保证收益等表述。"}</div>` : null}
        <p className="small" style=${{ borderTop: "1px dashed rgba(245,184,0,.4)", paddingTop: 8, color: "#fde68a" }}>本方案不构成投资建议。理财不保本，产品须与客户风险等级匹配，销售理财须按规定录音录像；利率与收益以本行当期公告为准。</p></section>
    </div></${Shell}>`;
}

/* --- 厅堂营销助手 --- */
const GOALS = ["长期化场景营销", "拓宽客源、沉淀稳定客群", "提升存款与理财", "代发与公职客群经营", "老客户维护与转介绍"];
const B_SAMPLES = [
  ["政务网点：人难约、预算少", "网点紧邻法院、政务单位，客群以公职人员、单位办事人员为主，周边居民小区稀缺，自然客流小。日均客流约30人，多为对公业务、还款、代发工资开卡，主动存款理财意识不强。组织主题活动到场常为固定的5—6人，集中邀约难。公职人员时间紧，坐不住长时间宣讲。机会：政务、公职客群稳定、信誉好。", "拓宽客源、沉淀稳定客群", "礼品预算紧张，优先用服务权益、专属咨询、线上工具替代；希望以厅堂微宣讲、老带新、政务单位外拓为抓手"],
  ["远离居民区：同业密集", "网点距周边居民区较远（大于3公里），附近有中行、建行、工行、长安银行、西安银行、招商银行、恒丰银行等同业。存款利率高于国有大行，低于本地城商行。", "长期化场景营销", "以厅堂为阵地，要求实用、接地气、费用少、效果好"]
];
function Branch() {
  const a = AG.branch, R = useRun(a);
  const [site, setSite] = useState(""); const [goal, setGoal] = useState(GOALS[0]); const [limits, setLimits] = useState(""); const [o, setO] = useOut(); const [chk, setChk] = useState(null);
  const gen = async () => {
    if (!site.trim()) return toast("请先填写网点情况或点示例");
    audit(a.name, "生成营销方案", goal); setChk(null); R.log("目标：" + goal);
    const t = await R.run({ site, goal, limits }, setO, "厅堂营销方案");
    if (t) { const hb = riskyClaims(t).concat(/返现|贴息|赠送.{0,8}利息|送.{0,6}换存款/.test(t) ? ["疑似变相揽存"] : []); setChk(hb); R.setStats(x => ({ ...x, hits: x.hits + 1 })); R.log(hb.length ? "合规检查：" + hb.join("、") : "合规检查通过"); }
  };
  return html`<${Shell} a=${a} R=${R} extra=${B_SAMPLES.map(([l, s1, g, lim]) => html`<button key=${l} className="btn pri" type="button" onClick=${() => { setSite(s1); setGoal(g); setLimits(lim); toast("已填入示例：" + l); }}><${Icon} n="play"/>${l}</button>`)}>
    <div className="grid2">
      <section className="panel"><div className="ph"><h2><i><${Icon} n="branch"/></i>网点情况</h2></div>
        <textarea style=${{ minHeight: 200 }} value=${site} onInput=${e => setSite(e.target.value)} placeholder="位置与周边、主要客群、日均客流与业务、同业竞争、利率优劣势、以往活动效果" aria-label="网点情况"></textarea>
        <div className="fields" style=${{ marginTop: 10 }}><label className="field">主要目标<select value=${goal} onChange=${e => setGoal(e.target.value)}>${GOALS.map(x => html`<option key=${x}>${x}</option>`)}</select></label></div>
        <label className="field" style=${{ marginTop: 10 }}>限制条件（预算、人手、要求）<textarea style=${{ minHeight: 80 }} value=${limits} onInput=${e => setLimits(e.target.value)} placeholder="例如：礼品预算紧张；只有2名员工能做活动"></textarea></label>
        <div className="acts" style=${{ marginTop: 12 }}><button className="btn pri" type="button" disabled=${R.st === "run"} onClick=${gen}>${R.st === "run" ? html`<span className="spinner"></span>` : null}生成营销方案</button></div></section>
      <section className="panel"><div className="ph"><h2>营销方案</h2><button className="btn sm" type="button" disabled=${!o.text} onClick=${() => copyText(o.text)}><${Icon} n="copy"/>复制</button></div>
        <${OutBox} o=${o} empty="生成场景清单、微宣讲稿、外拓与老带新方案、4 周计划和考核指标。"/>
        ${chk ? html`<div className=${"alert " + (chk.length ? "bad" : "good")} style=${{ marginTop: 10 }}>${chk.length ? "请注意：" + chk.join("、") + "。礼品不能变相提高利率揽存。" : "合规检查通过：没有发现承诺收益或变相揽存的表述。"}</div>` : null}</section>
    </div></${Shell}>`;
}

/* --- 提示词助手 --- */
const KINDS = ["自动判断", "客户沟通与挽留", "资产配置", "营销活动", "公文写作", "数据分析", "培训课件", "其他"];
const ROUTES = [["mask", /脱敏|身份证号|敏感信息|隐私/g], ["qa", /制度|规定|能不能|是否可以|条款|管理办法/g], ["script", /话术|怎么说|怎么回答|应答/g], ["minutes", /纪要|会议|通知|公文|工作总结|转写/g], ["credit", /授信|调查报告|财务报表|贷款材料|勾稽/g], ["wealth", /资产配置|配置方案|亏损|回撤|净值|赎回|私行|闲置|他行/g], ["branch", /厅堂|网点|营销活动|获客|邀约|外拓|微宣讲|客流|老带新/g]];
const routeOf = t => ROUTES.map(([id, re]) => [id, (t.match(re) || []).length]).filter(x => x[1] >= 2).sort((a, b) => b[1] - a[1]);
const TPL = [
  { id: "t1", title: "客户挽留与资产配置（模板）", text: "你是银行理财经理的沟通教练，要求合规：不得承诺保本或收益，不贬低同业，产品须匹配客户风险等级。\n客户情况：【客户类型、年龄、风险等级、持有产品及盈亏、情绪和诉求、活期余额、他行资金】\n本行可用产品：【产品名称、风险等级、期限、起购金额、当期利率或业绩比较基准】\n请输出：\n1. 前 5 分钟的安抚话术（先共情，不辩解）\n2. 用大白话解释亏损原因（一个比喻）\n3. 给客户的 2—3 个选择及对应话术（含“转本行定期”的承接方案）\n4. 分账户配置建议（存款打底、理财增值、灵活备用，各放多少）\n5. 吸纳闲置活期和他行到期资金的建议\n6. 后续 3 个月的回访计划", at: "内置" },
  { id: "t2", title: "厅堂营销方案（模板）", text: "你是银行网点营销顾问，要求：费用低、能长期坚持；不用礼品变相揽存，不贬低同业。\n网点情况：【位置、周边客群、日均客流、主要业务、同业竞争、利率优劣势、营销预算、限制条件】\n请输出：\n1. 适合本网点的 8—10 个场景（做法、目标客群、费用）\n2. 10 个“5 分钟微宣讲”题目，并写出其中 2 个的完整讲稿\n3. 外拓方案（去哪些单位、怎么联系、讲什么）\n4. 老带新机制（不用现金奖励）\n5. 用服务权益代替礼品的清单\n6. 4 周落地计划和考核指标", at: "内置" }
];
const splitPrompt = t => { const m = String(t).match(/```[^\n]*\n([\s\S]*?)(```|$)/); if (!m) return { before: t, code: "", after: "" }; const i = t.indexOf(m[0]); return { before: t.slice(0, i), code: m[1].trim(), after: t.slice(i + m[0].length) }; };
function PromptGen() {
  const a = AG.prompt, R = useRun(a);
  const [q, setQ] = useState(""); const [kind, setKind] = useState(KINDS[0]); const [o, setO] = useOut(); const [lib, setLib] = useState(() => LS.get("prompts", null) || TPL);
  const saveLib = l => { setLib(l); LS.set("prompts", l); };
  const hits = routeOf(q).filter(([id]) => AG[id] && !AG[id].soon);
  const parts = splitPrompt(o.text);
  const gen = async () => {
    if (!q.trim()) return toast("请先描述你的问题");
    if (PII.some(r => r.test(q))) return toast("问题里有疑似证件号、手机号或卡号，请先自动脱敏");
    R.log(hits.length ? "归类参考：可用 " + hits.map(([id]) => AG[id].name).join("、") : "没有对应的专用智能体，生成通用提示词");
    audit(a.name, "生成提示词", q.slice(0, 30));
    const t = await R.run({ problem: q, kind }, setO, "结构化提示词");
    if (t) { const p = splitPrompt(t); const n = (p.code.match(/【待补充/g) || []).length; R.setStats(x => ({ ...x, hits: x.hits + 1 })); R.log(p.code ? `提示词已生成，含 ${n} 处待补充` : "未识别到提示词代码块，请重试"); }
  };
  const save = () => { if (!parts.code) return; saveLib([{ id: "p" + Date.now(), title: q.replace(/\s+/g, " ").slice(0, 24) || "未命名提示词", text: parts.code, at: day() }, ...lib].slice(0, 50)); toast("已收藏到提示词库"); audit(a.name, "收藏提示词"); };
  return html`<${Shell} a=${a} R=${R} extra=${html`<button className="btn pri" type="button" onClick=${() => { setQ("我是网点理财经理。一位客户买的固收理财最近小幅亏损，情绪很大，要把钱全部取走去四大行存定期。厅堂没有礼品支持。我想稳住他的资金，最好还能把他的闲置活期也留下来。帮我出一份应对方案。"); toast("已填入示例"); }}><${Icon} n="play"/>填入示例</button>`}>
    <div className="grid2" style=${{ gridTemplateColumns: "minmax(0,1.6fr) minmax(280px,1fr)" }}>
      <section className="panel"><div className="ph"><h2><i><${Icon} n="prompt"/></i>用大白话描述你的问题</h2><${PiiBtn} text=${q} set=${setQ}/></div>
        <textarea style=${{ minHeight: 150 }} value=${q} onInput=${e => setQ(e.target.value)} placeholder="例如：领导让我准备一场面向退休教师的反诈讲座，30 分钟，要互动，帮我写方案" aria-label="问题描述"></textarea>
        ${hits.length ? html`<div className="alert warn" style=${{ marginTop: 10 }}>这个问题有现成的智能体：${hits.map(([id]) => html`<a key=${id} href=${"#" + id} style=${{ marginLeft: 6, color: "#fde68a", fontWeight: 600 }}>${AG[id].name} ›</a>`)}　用专用智能体更稳定；也可以继续生成提示词。</div>` : null}
        <div className="acts" style=${{ marginTop: 12 }}><label className="field" style=${{ flex: "0 0 180px" }}>方向<select value=${kind} onChange=${e => setKind(e.target.value)}>${KINDS.map(x => html`<option key=${x}>${x}</option>`)}</select></label>
          <button className="btn pri" type="button" style=${{ alignSelf: "flex-end" }} disabled=${R.st === "run"} onClick=${gen}>${R.st === "run" ? html`<span className="spinner"></span>` : null}生成提示词</button></div>
        <div className="ph" style=${{ marginTop: 16 }}><h2>生成结果</h2><div className="acts"><button className="btn sm" type="button" disabled=${!parts.code} onClick=${() => copyText(parts.code)}><${Icon} n="copy"/>复制提示词</button><button className="btn sm" type="button" disabled=${!parts.code || o.live} onClick=${save}><${Icon} n="star"/>收藏</button></div></div>
        ${o.text ? html`<div className=${"out" + (o.live ? " cursor" : "")}><div dangerouslySetInnerHTML=${{ __html: md(parts.before) }}></div>${parts.code ? html`<pre className="ptext">${parts.code}</pre>` : null}<div dangerouslySetInnerHTML=${{ __html: md(parts.after) }}></div></div>` : html`<div className="out empty">生成后：先看“需要补充的信息”，把提示词里的【待补充】换成实际情况，再复制到 DeepSeek。</div>`}
        ${o.err ? html`<div className="alert bad" style=${{ marginTop: 8 }}>${o.err}</div>` : null}</section>
      <section className="panel"><div className="ph"><h2><i><${Icon} n="star"/></i>提示词库</h2><span className="small">${lib.length} 条</span></div>
        <p className="small" style=${{ marginTop: -4 }}>好用的提示词收藏在这里。同一类问题反复出现，就值得开发成专用智能体。</p>
        <div className="hits">${lib.map((p, i) => html`<div key=${p.id} className="hit" style=${{ animationDelay: i * 40 + "ms" }}><div style=${{ display: "flex", justifyContent: "space-between", gap: 6, alignItems: "center" }}><b>${p.title}</b><span style=${{ whiteSpace: "nowrap" }}><button className="btn sm ghost" type="button" title="复制" onClick=${() => copyText(p.text)}><${Icon} n="copy"/></button><button className="btn sm ghost" type="button" title="删除" onClick=${() => saveLib(lib.filter(x => x.id !== p.id))}><${Icon} n="trash"/></button></span></div><p>${p.text}</p><span className="small">${p.at}</span></div>`)}</div>
        <div className="acts" style=${{ marginTop: 10 }}><button className="btn ghost sm" type="button" onClick=${() => { saveLib(TPL.concat(lib.filter(x => !x.id.startsWith("t")))); toast("已恢复内置模板"); }}>恢复内置模板</button></div></section>
    </div></${Shell}>`;
}

/* ---------------- 知识库 ---------------- */
const loadScript = src => new Promise((ok, no) => { if (document.querySelector(`script[src="${src}"]`)) return ok(); const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = () => no(new Error("组件加载失败")); document.head.appendChild(s); });
async function parseFile(f) {
  const ext = (f.name.split(".").pop() || "").toLowerCase();
  if (f.size > 15e6) throw new Error("文件超过 15MB");
  if (["txt", "md", "csv", "json", "log"].includes(ext)) return await f.text();
  if (["html", "htm"].includes(ext)) { const d = new DOMParser().parseFromString(await f.text(), "text/html"); d.querySelectorAll("script,style,noscript").forEach(e => e.remove()); return d.body ? d.body.textContent : ""; }
  if (ext === "docx") { await loadScript(vendor("mammoth.js")); const r = await window.mammoth.extractRawText({ arrayBuffer: await f.arrayBuffer() }); return r.value; }
  if (ext === "pdf") {
    const pdfjs = await import(vendor("pdf.mjs")); pdfjs.GlobalWorkerOptions.workerSrc = vendor("pdf.worker.mjs");
    const doc = await pdfjs.getDocument({ data: new Uint8Array(await f.arrayBuffer()) }).promise; let out = "";
    for (let i = 1; i <= Math.min(doc.numPages, 200); i++) { const c = await (await doc.getPage(i)).getTextContent(); out += c.items.map(x => x.str + (x.hasEOL ? "\n" : "")).join("") + "\n"; }
    if (out.replace(/\s/g, "").length < 20) throw new Error("PDF 里没有可提取的文字（可能是扫描件，需要先做文字识别）");
    return out;
  }
  if (ext === "doc") throw new Error("旧版 .doc 请另存为 .docx 后上传");
  throw new Error(`暂不支持 .${ext}（支持 PDF、Word .docx、TXT、Markdown、HTML、CSV）`);
}
const clean = t => String(t || "").replace(/\r/g, "").replace(/[ \t\u00a0\u3000]+/g, " ").replace(/\n\s*\n\s*\n+/g, "\n\n").trim();
async function autoTag(title, text) {
  try { const r = await fetch("api/kb/tag", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, text: text.slice(0, 6000) }) }); if (r.ok) return await r.json(); } catch {}
  return { category: "其他资料", tags: [], summary: "", source: "rule" };
}
/* 入库流水线：脱敏检查 → 自动打标签 → 保存 */
async function ingest({ title, body, source, origin }, opt, step) {
  body = clean(body).slice(0, 40000); if (body.length < 20) throw new Error("正文太短，未入库");
  step("脱敏检查"); let masked = 0;
  if (PII.some(r => r.test(body))) { if (!opt.mask) throw new Error("含疑似证件号、手机号或卡号，已拦截（可开启“入库前自动脱敏”）"); const m = maskText(body); body = m.masked; masked = m.map.length; }
  step("自动打标签"); const tg = await autoTag(title, body);
  step("入库");
  const doc = { id: "u" + Date.now() + Math.random().toString(36).slice(2, 6), title: title.slice(0, 80), body, category: tg.category || "其他资料", tags: (tg.tags || []).slice(0, 6), summary: tg.summary || body.slice(0, 50).replace(/\n/g, " "), source, origin, at: day(), tagSource: tg.source || "rule", masked };
  store.set(s => ({ docs: [doc, ...s.docs] })); audit("知识库", "入库", doc.title);
  return doc;
}
const PIPE = ["解析", "脱敏检查", "自动打标签", "入库"];
function Pipe({ at, err }) { const k = PIPE.indexOf(at); return html`<div className="pipe">${PIPE.map((p, i) => html`<span key=${p} className=${err && i === k ? "err" : at === "完成" || i < k ? "ok" : i === k ? "on" : ""}>${at === "完成" || i < k ? "✓ " : ""}${p}</span>`)}</div>`; }

function KB() {
  const s = useStore();
  const [tab, setTab] = useState("docs");
  const [view, setView] = useState(null);
  const [filter, setFilter] = useState({ q: "", tag: s.kbFilter || "", cat: "" });
  const tags = useMemo(() => { const m = new Map(); s.docs.forEach(d => d.tags.forEach(t => m.set(t, (m.get(t) || 0) + 1))); return [...m].sort((a, b) => b[1] - a[1]); }, [s.docs]);
  const cats = [...new Set(s.docs.map(d => d.category))];
  const tabs = [["docs", "kb", "文档库", s.docs.length], ["upload", "upload", "上传文件"], ["url", "link", "网址抓取"], ["tags", "tag", "标签", tags.length]];
  return html`<div className="wrap enter">
    <div className="crumb"><a href="#home">智能体超市</a><span>›</span><span style=${{ color: "#fff" }}>本行知识库</span></div>
    <div className="kb">
      <nav className="side" aria-label="知识库">${tabs.map(([k, ic, l, n]) => html`<button key=${k} type="button" className=${tab === k ? "on" : ""} onClick=${() => setTab(k)}><${Icon} n=${ic}/>${l}${n != null ? html`<span className="n">${n}</span>` : null}</button>`)}
        <p className="small" style=${{ padding: "8px 4px" }}>演示版文档保存在你的浏览器里；正式版保存在行内服务器，并按部门、岗位设置可见范围。</p></nav>
      <div style=${{ minWidth: 0 }}>
        ${tab === "docs" ? html`<${Docs} docs=${s.docs} tags=${tags} cats=${cats} filter=${filter} setFilter=${setFilter} onView=${setView}/>` : null}
        ${tab === "upload" ? html`<${Upload} done=${() => setTab("docs")}/>` : null}
        ${tab === "url" ? html`<${Crawl} done=${() => setTab("docs")}/>` : null}
        ${tab === "tags" ? html`<${Tags} tags=${tags} docs=${s.docs} pick=${t => { setFilter({ q: "", cat: "", tag: t }); setTab("docs"); }}/>` : null}
      </div>
    </div>
    ${view ? html`<${DocDrawer} id=${view} close=${() => setView(null)}/>` : null}
  </div>`;
}
function Docs({ docs, tags, cats, filter, setFilter, onView }) {
  const list = docs.filter(d => (!filter.tag || d.tags.includes(filter.tag)) && (!filter.cat || d.category === filter.cat) && (!filter.q || (d.title + d.summary + d.body).includes(filter.q)));
  const del = d => { store.set(s => ({ docs: s.docs.filter(x => x.id !== d.id) })); audit("知识库", "下线文档", d.title); toast("已下线：" + d.title); };
  const retag = async d => { toast("正在重新打标签…"); const t = await autoTag(d.title, d.body); store.set(s => ({ docs: s.docs.map(x => x.id === d.id ? { ...x, tags: t.tags.length ? t.tags : x.tags, category: t.category || x.category, summary: t.summary || x.summary, tagSource: t.source } : x) })); toast(t.source === "ai" ? "已用大模型重新打标签" : "已按规则重新打标签"); };
  return html`<section className="panel">
    <div className="ph"><h2><i><${Icon} n="kb"/></i>文档库</h2><span className="small">共 ${list.length} / ${docs.length} 份</span></div>
    <div className="fields" style=${{ marginBottom: 12 }}>
      <label className="field">搜索<input type="search" value=${filter.q} onInput=${e => setFilter({ ...filter, q: e.target.value })} placeholder="标题、摘要或正文"/></label>
      <label className="field">标签<select value=${filter.tag} onChange=${e => setFilter({ ...filter, tag: e.target.value })}><option value="">全部标签</option>${tags.map(([t, n]) => html`<option key=${t} value=${t}>${t}（${n}）</option>`)}</select></label>
      <label className="field">分类<select value=${filter.cat} onChange=${e => setFilter({ ...filter, cat: e.target.value })}><option value="">全部分类</option>${cats.map(c => html`<option key=${c}>${c}</option>`)}</select></label>
    </div>
    <div className="scroll"><table className="t" style=${{ minWidth: 760 }}><thead><tr><th>文档</th><th>分类</th><th>标签</th><th>来源</th><th>字数</th><th>操作</th></tr></thead><tbody>
      ${list.length ? list.map((d, i) => html`<tr key=${d.id} style=${{ animation: `fadeUp .35s ${i * 30}ms both` }}>
        <td style=${{ maxWidth: 320 }}><b style=${{ display: "block" }}>${d.title}</b><span className="small">${d.summary}</span>${d.masked ? html` <span className="chip g">已脱敏 ${d.masked} 处</span>` : null}</td>
        <td><span className="chip v">${d.category}</span></td>
        <td><div style=${{ display: "flex", gap: 4, flexWrap: "wrap", maxWidth: 220 }}>${d.tags.map(t => html`<span key=${t} className="chip c">${t}</span>`)}${d.tagSource === "ai" ? html`<span className="chip a" title="由大模型自动标注">AI</span>` : null}</div></td>
        <td className="small" style=${{ whiteSpace: "nowrap" }}>${d.source}<br/>${d.at}</td>
        <td className="small">${d.body.length}</td>
        <td style=${{ whiteSpace: "nowrap" }}><button className="btn sm ghost" type="button" title="查看与编辑" onClick=${() => onView(d.id)}><${Icon} n="eye"/></button><button className="btn sm ghost" type="button" title="重新打标签" onClick=${() => retag(d)}><${Icon} n="refresh"/></button><button className="btn sm ghost" type="button" title="下线" onClick=${() => del(d)}><${Icon} n="trash"/></button></td></tr>`)
      : html`<tr><td colSpan="6" className="small">没有符合条件的文档。</td></tr>`}
    </tbody></table></div>
    <div className="acts" style=${{ marginTop: 12 }}><button className="btn ghost sm" type="button" onClick=${() => { store.set({ docs: DEFAULT_DOCS }); toast("已恢复示例文档"); }}>恢复示例文档</button></div>
  </section>`;
}
function DocDrawer({ id, close }) {
  const s = useStore(); const d = s.docs.find(x => x.id === id); const [nt, setNt] = useState("");
  useEffect(() => { const f = e => e.key === "Escape" && close(); addEventListener("keydown", f); return () => removeEventListener("keydown", f); }, []);
  if (!d) return null;
  const upd = p => store.set(st => ({ docs: st.docs.map(x => x.id === id ? { ...x, ...p, tagSource: "manual" } : x) }));
  const addTag = () => { const t = nt.trim().slice(0, 10); if (t && !d.tags.includes(t)) upd({ tags: [...d.tags, t] }); setNt(""); };
  return html`<div className="drawer" onClick=${e => e.target === e.currentTarget && close()}><div className="in" role="dialog" aria-modal="true" aria-label=${d.title}>
    <div className="ph"><h2>${d.title}</h2><button className="btn sm" type="button" onClick=${close}>关闭</button></div>
    <p className="small">${d.source}${d.origin ? " · " + d.origin : ""} · ${d.at} · ${d.body.length} 字</p>
    <label className="field" style=${{ marginBottom: 10 }}>分类<select value=${d.category} onChange=${e => upd({ category: e.target.value })}>${["制度办法", "操作规程", "产品说明", "通知公告", "培训材料", "问答FAQ", "其他资料"].concat(d.category).filter((x, i, a) => a.indexOf(x) === i).map(c => html`<option key=${c}>${c}</option>`)}</select></label>
    <div className="field">标签（${d.tagSource === "ai" ? "大模型自动标注" : d.tagSource === "manual" ? "已人工调整" : "规则自动标注"}）</div>
    <div style=${{ display: "flex", gap: 6, flexWrap: "wrap", margin: "6px 0 10px" }}>${d.tags.map(t => html`<span key=${t} className="chip c">${t}<button type="button" aria-label=${"删除标签" + t} onClick=${() => upd({ tags: d.tags.filter(x => x !== t) })}>×</button></span>`)}</div>
    <div className="acts" style=${{ marginBottom: 14 }}><input type="text" style=${{ flex: 1, minWidth: 140 }} value=${nt} onInput=${e => setNt(e.target.value)} onKeyDown=${e => e.key === "Enter" && addTag()} placeholder="添加标签，回车确认"/><button className="btn sm" type="button" onClick=${addTag}>添加</button></div>
    <pre>${d.body}</pre>
  </div></div>`;
}
function Upload({ done }) {
  const [q, setQ] = useState([]); const [over, setOver] = useState(false); const [mask, setMask] = useState(true); const inp = useRef(null);
  const upd = (id, p) => setQ(x => x.map(i => i.id === id ? { ...i, ...p } : i));
  const handle = async files => {
    const items = [...files].slice(0, 20).map(f => ({ id: Math.random().toString(36).slice(2), f, name: f.name, size: f.size, at: "解析", msg: "" }));
    setQ(x => [...items, ...x]);
    for (const it of items) {
      try {
        const text = await parseFile(it.f);
        const doc = await ingest({ title: it.name.replace(/\.[^.]+$/, ""), body: text, source: "上传文件", origin: it.name }, { mask }, at => upd(it.id, { at }));
        upd(it.id, { at: "完成", doc, msg: `${doc.body.length} 字${doc.masked ? ` · 已脱敏 ${doc.masked} 处` : ""}` });
      } catch (e) { upd(it.id, { err: true, msg: e.message }); }
    }
  };
  return html`<section className="panel glow">
    <div className="ph"><h2><i><${Icon} n="upload"/></i>上传知识库文件</h2><label className="small" style=${{ display: "flex", gap: 6, alignItems: "center" }}><input type="checkbox" checked=${mask} onChange=${e => setMask(e.target.checked)} style=${{ accentColor: "var(--cyan)" }}/>入库前自动脱敏</label></div>
    <div className=${"drop" + (over ? " over" : "")} onDragOver=${e => { e.preventDefault(); setOver(true); }} onDragLeave=${() => setOver(false)} onDrop=${e => { e.preventDefault(); setOver(false); handle(e.dataTransfer.files); }}>
      <div className="folder"><svg viewBox="0 0 120 90" aria-hidden="true"><defs><linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7dd3fc"/><stop offset="1" stop-color="#2563eb"/></linearGradient></defs><path d="M6 14a6 6 0 0 1 6-6h30l8 9h58a6 6 0 0 1 6 6v55a6 6 0 0 1-6 6H12a6 6 0 0 1-6-6z" fill="url(#fg)" opacity=".9"/><path d="M60 66V36M48 47l12-12 12 12" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <h3>点击或拖拽文件到这里</h3>
      <p className="small">支持 PDF、Word（.docx）、TXT、Markdown、HTML、CSV，单个文件不超过 15MB。文件在浏览器本机解析。</p>
      <button className="btn pri" type="button" onClick=${() => inp.current.click()}><${Icon} n="upload"/>选择文件</button>
      <input ref=${inp} type="file" multiple hidden accept=".pdf,.docx,.txt,.md,.html,.htm,.csv,.json" onChange=${e => { handle(e.target.files); e.target.value = ""; }}/>
    </div>
    <div className="queue">${q.map(it => html`<div key=${it.id} className="qi"><div className="row"><b>${it.name}</b><span className="small">${(it.size / 1024).toFixed(0)} KB</span></div>
      <${Pipe} at=${it.at} err=${it.err}/>
      ${it.msg ? html`<div className=${"small"} style=${{ marginTop: 6, color: it.err ? "#fecdd3" : "#bbf7d0" }}>${it.msg}</div>` : null}
      ${it.doc ? html`<div style=${{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}><span className="chip v">${it.doc.category}</span>${it.doc.tags.map(t => html`<span key=${t} className="chip c">${t}</span>`)}</div>` : null}</div>`)}</div>
    ${q.some(x => x.doc) ? html`<div className="acts" style=${{ marginTop: 12 }}><button className="btn" type="button" onClick=${done}>去文档库查看</button></div>` : null}
  </section>`;
}
function Crawl({ done }) {
  const [url, setUrl] = useState(""); const [n, setN] = useState("0"); const [busy, setBusy] = useState(false); const [err, setErr] = useState(""); const [pages, setPages] = useState([]); const [pick, setPick] = useState({}); const [mask, setMask] = useState(true); const [prog, setProg] = useState({});
  const go2 = async () => {
    if (!url.trim()) return; setBusy(true); setErr(""); setPages([]); setProg({});
    try { const r = await fetch("api/kb/fetch", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, pages: +n }) }); const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || "抓取失败"); setPages(j.pages); setPick(Object.fromEntries(j.pages.map((p, i) => [i, true]))); audit("知识库", "抓取网址", url); }
    catch (e) { setErr(e.message); } finally { setBusy(false); }
  };
  const save = async () => {
    for (const [i, p] of pages.entries()) { if (!pick[i] || prog[i]?.at === "完成") continue;
      try { const d = await ingest({ title: p.title, body: p.text, source: "网址抓取", origin: p.url }, { mask }, at => setProg(x => ({ ...x, [i]: { at } }))); setProg(x => ({ ...x, [i]: { at: "完成", doc: d } })); }
      catch (e) { setProg(x => ({ ...x, [i]: { at: x[i]?.at || "脱敏检查", err: e.message } })); } }
  };
  return html`<section className="panel glow">
    <div className="ph"><h2><i><${Icon} n="link"/></i>链接网址，自动抓取</h2><label className="small" style=${{ display: "flex", gap: 6, alignItems: "center" }}><input type="checkbox" checked=${mask} onChange=${e => setMask(e.target.checked)} style=${{ accentColor: "var(--cyan)" }}/>入库前自动脱敏</label></div>
    <p className="small" style=${{ marginTop: -4 }}>适合监管机构公开的制度原文、本行官网的产品说明页等。只能抓取公开网页，不能抓取内网地址；需要登录的页面请下载后上传。</p>
    <div className="acts"><input type="url" style=${{ flex: "1 1 320px" }} value=${url} onInput=${e => setUrl(e.target.value)} onKeyDown=${e => e.key === "Enter" && go2()} placeholder="https://www.example.com/policy/xxx.html" aria-label="网址"/>
      <select style=${{ width: "auto" }} value=${n} onChange=${e => setN(e.target.value)} aria-label="同站子页面"><option value="0">只抓这一页</option><option value="3">+ 同站 3 个子页面</option><option value="5">+ 同站 5 个子页面</option><option value="8">+ 同站 8 个子页面</option></select>
      <button className="btn pri" type="button" disabled=${busy} onClick=${go2}>${busy ? html`<span className="spinner"></span>正在抓取` : "抓取"}</button></div>
    ${err ? html`<div className="alert bad" style=${{ marginTop: 12 }}>${err}</div>` : null}
    ${pages.length ? html`<div className="queue">${pages.map((p, i) => html`<div key=${i} className="qi"><div className="row"><label style=${{ display: "flex", gap: 8, alignItems: "center", minWidth: 0 }}><input type="checkbox" checked=${!!pick[i]} onChange=${e => setPick({ ...pick, [i]: e.target.checked })} style=${{ accentColor: "var(--cyan)" }}/><b style=${{ overflow: "hidden", textOverflow: "ellipsis" }}>${p.title}</b></label><span className="small">${p.text.length} 字</span></div>
        <div className="small" style=${{ overflowWrap: "anywhere" }}>${p.url}</div>
        <p className="small" style=${{ margin: "6px 0 0", color: "var(--ink2)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>${p.text.slice(0, 200)}</p>
        ${prog[i] ? html`<${Pipe} at=${prog[i].at} err=${!!prog[i].err}/>` : null}${prog[i]?.err ? html`<div className="small" style=${{ color: "#fecdd3" }}>${prog[i].err}</div>` : null}
        ${prog[i]?.doc ? html`<div style=${{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 6 }}><span className="chip v">${prog[i].doc.category}</span>${prog[i].doc.tags.map(t => html`<span key=${t} className="chip c">${t}</span>`)}</div>` : null}</div>`)}</div>
      <div className="acts" style=${{ marginTop: 12 }}><button className="btn pri" type="button" onClick=${save}>入库所选（${Object.values(pick).filter(Boolean).length}）</button><button className="btn" type="button" onClick=${done}>去文档库查看</button></div>` : null}
  </section>`;
}
function Tags({ tags, docs, pick }) {
  const [busy, setBusy] = useState(0);
  const all = async () => { setBusy(1); let k = 0; for (const d of docs) { const t = await autoTag(d.title, d.body); store.set(s => ({ docs: s.docs.map(x => x.id === d.id && x.tagSource !== "manual" ? { ...x, tags: t.tags.length ? t.tags : x.tags, category: t.category || x.category, tagSource: t.source } : x) })); setBusy(1 + ++k); } setBusy(0); toast("全部文档已重新打标签（人工调整过的保留）"); };
  const max = Math.max(1, ...tags.map(t => t[1]));
  const cats = docs.reduce((m, d) => (m[d.category] = (m[d.category] || 0) + 1, m), {});
  return html`<section className="panel">
    <div className="ph"><h2><i><${Icon} n="tag"/></i>标签</h2><button className="btn" type="button" disabled=${!!busy} onClick=${all}>${busy ? html`<span className="spinner"></span>${busy - 1}/${docs.length}` : html`<${Icon} n="spark"/>全部重新打标签`}</button></div>
    <p className="small" style=${{ marginTop: -4 }}>文档入库时自动打标签：已接入大模型时由模型按本行标签体系标注，否则按关键词规则标注；可在文档详情里手工调整。点标签查看对应文档，制度问答也可以按标签限定检索范围。</p>
    <div className="tagcloud" style=${{ margin: "12px 0 20px" }}>${tags.map(([t, n], i) => html`<button key=${t} type="button" onClick=${() => pick(t)} style=${{ fontSize: 13 + (n / max) * 7, animation: `fadeUp .4s ${i * 25}ms both` }}>${t}<small>${n}</small></button>`)}</div>
    <div className="ph"><h2>按分类</h2></div>
    <div className="stats" style=${{ marginTop: 0 }}>${Object.entries(cats).map(([c, n]) => html`<div key=${c} className="stat"><span>${c}</span><b>${n}</b></div>`)}</div>
  </section>`;
}

/* ---------------- 管理端 ---------------- */
const POS = [["客户经理", "32 人"], ["理财经理", "12 人"], ["柜员", "28 人"], ["大堂经理", "14 人"], ["授信岗", "9 人"], ["综合岗", "21 人"]];
function Manage() {
  const s = useStore();
  const calls = Object.values(s.runs).reduce((n, r) => n + (r.n || 0), 0);
  const masked = s.log.filter(l => /脱敏|拦截/.test(l.action + l.detail)).length;
  return html`<div className="wrap enter">
    <div className="crumb"><a href="#home">智能体超市</a><span>›</span><span style=${{ color: "#fff" }}>管理端</span></div>
    <div className="stats" style=${{ marginTop: 0 }}>
      <div className="stat"><span>本次演示调用</span><b>${calls}</b></div><div className="stat"><span>知识库文档</span><b>${s.docs.length}</b></div>
      <div className="stat"><span>标签数</span><b>${new Set(s.docs.flatMap(d => d.tags)).size}</b></div><div className="stat"><span>脱敏 / 拦截操作</span><b>${masked}</b></div></div>
    <section className="panel" style=${{ marginBottom: 18 }}><div className="ph"><h2><i><${Icon} n="admin"/></i>按岗位开通</h2><a className="btn sm" href="admin">模型与 API Key 设置 ›</a></div>
      <p className="small" style=${{ marginTop: -4 }}>点单元格开通或关闭；关闭后货架上显示“需开通”。正式版中高敏感智能体需科技部与合规部双人审批。</p>
      <div className="scroll"><table className="t" style=${{ minWidth: 720 }}><thead><tr><th>岗位</th>${LIVE.map(a => html`<th key=${a.id} style=${{ textAlign: "center" }}>${a.name}<span style=${{ display: "block", fontSize: 11, color: a.lvl === "高" ? "#fda4af" : a.lvl === "中" ? "#fde68a" : "#a7f3d0" }}>敏感度${a.lvl}</span></th>`)}</tr></thead>
      <tbody>${POS.map(([p, n]) => html`<tr key=${p}><th scope="row" style=${{ color: "var(--ink)", fontSize: 14, background: "none" }}>${p}<span className="small" style=${{ display: "block" }}>${n}</span></th>${LIVE.map(a => html`<td key=${a.id} style=${{ textAlign: "center" }}>${a.roles.includes(p) ? html`<button type="button" className=${"cell " + (s.enabled[a.id] ? "on" : "off")} onClick=${() => { store.set(st => ({ enabled: { ...st.enabled, [a.id]: !st.enabled[a.id] } })); audit("管理端", s.enabled[a.id] ? "关闭" : "开通", a.name); }}>${s.enabled[a.id] ? "已开通" : "未开通"}</button>` : html`<span className="cell off" style=${{ cursor: "default" }}>不适用</span>`}</td>`)}</tr>`)}</tbody></table></div></section>
    <section className="panel"><div className="ph"><h2><i><${Icon} n="doc"/></i>审计日志（本次演示）</h2><span className="small">只可追加，不可修改</span></div>
      <div className="scroll"><table className="t" style=${{ minWidth: 640 }}><thead><tr><th>时间</th><th>员工</th><th>智能体 / 模块</th><th>操作</th><th>摘要</th></tr></thead><tbody>
      ${s.log.length ? s.log.map((l, i) => html`<tr key=${i}><td style=${{ fontFamily: "var(--mono)" }}>${l.t}</td><td>演示员工</td><td>${l.agent}</td><td>${l.action}</td><td className="small">${l.detail}</td></tr>`) : html`<tr><td colSpan="5" className="small">还没有操作记录。去货架试用任一智能体，记录会出现在这里。</td></tr>`}
      </tbody></table></div></section>
  </div>`;
}

/* ---------------- 根组件 ---------------- */
function App() {
  const route = useHash(); const s = useStore();
  const Page = route === "kb" ? KB : route === "manage" ? Manage : { mask: Mask, qa: QA, script: Script, minutes: Minutes, credit: Credit, wealth: Wealth, branch: Branch, prompt: PromptGen }[route] || Home;
  useEffect(() => { if (AG[route] && !s.enabled[route]) { toast("需要管理员为你的岗位开通"); go("home"); } }, [route]);
  return html`<${React.Fragment}>
    <${Top} route=${route}/>
    <div className="notice"><div className="wrap">培训演示：请只输入虚构内容，不要输入真实客户信息或行内资料。正式版部署在银行内网，数据不出行。</div></div>
    <main key=${route}><${Page}/></main>
    <footer><div className="wrap">银行智能体超市 · 培训演示版\u3000|\u3000脱敏、材料核对、财务勾稽、违规用语检查在浏览器本机完成；问答与写作调用服务器配置的大模型，不保存对话内容。</div></footer>
    ${s.toast ? html`<div className="toast" role="status">${s.toast}</div>` : null}
  </${React.Fragment}>`;
}
ReactDOM.createRoot(document.getElementById("root")).render(html`<${App}/>`);
