window.__ModuleLoader__.load({
  id: '@local/dsh-novel-reader',
  factory: (require) => {
    const module = { exports: {} };
    const exports = module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src-client/index.jsx
var index_exports = {};
__export(index_exports, {
  App: () => App,
  apply: () => apply,
  inject: () => inject
});
module.exports = __toCommonJS(index_exports);
var import_react8 = __toESM(require("react"), 1);

// src-client/library.jsx
var import_react2 = __toESM(require("react"), 1);

// src-client/ui.jsx
var import_react = __toESM(require("react"), 1);
var API = "/novel-reader/api";
async function api(path, options = {}) {
  const headers = { ...options.headers ?? {} };
  let body = options.body;
  if (body !== void 0 && typeof body !== "string" && !(body instanceof Blob) && !(body instanceof ArrayBuffer)) {
    headers["content-type"] = "application/json";
    body = JSON.stringify(body);
  }
  const response = await fetch(`${API}${path}`, { ...options, headers, body });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.ok === false) {
    const message = payload?.error?.message ?? `\u8BF7\u6C42\u5931\u8D25\uFF08HTTP ${response.status}\uFF09`;
    const error = new Error(message);
    error.code = payload?.error?.code;
    throw error;
  }
  return payload.data;
}
function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getMonth() + 1}\u6708${date.getDate()}\u65E5 ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
function formatMinutes(minutes) {
  const value = Math.max(0, Math.round(Number(minutes) || 0));
  if (value < 60) return `${value} \u5206\u949F`;
  const hours = Math.floor(value / 60);
  const rest = value % 60;
  return rest ? `${hours} \u5C0F\u65F6 ${rest} \u5206\u949F` : `${hours} \u5C0F\u65F6`;
}
function formatDuration(ms) {
  return formatMinutes((Number(ms) || 0) / 6e4);
}
function relativeTime(value) {
  if (!value) return "\u4ECE\u672A";
  const delta = Date.now() - Date.parse(value);
  if (!Number.isFinite(delta)) return "";
  if (delta < 6e4) return "\u521A\u521A";
  if (delta < 36e5) return `${Math.floor(delta / 6e4)} \u5206\u949F\u524D`;
  if (delta < 864e5) return `${Math.floor(delta / 36e5)} \u5C0F\u65F6\u524D`;
  if (delta < 7 * 864e5) return `${Math.floor(delta / 864e5)} \u5929\u524D`;
  return formatDate(value);
}
function percent(book) {
  const total = Number(book?.chapterCount) || 0;
  const index = Number(book?.progress?.chapterIndex) || 0;
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((index + (book?.progress?.scrollRatio ?? 0)) / total * 100)));
}
var ICONS = {
  book: "M3 5.5c3-1 6-.5 9 1.5v13c-3-2-6-2.5-9-1.5v-13Zm18 0c-3-1-6-.5-9 1.5v13c3-2 6-2.5 9-1.5v-13Z",
  search: "M10.8 4a6.8 6.8 0 1 0 4.2 12.1l4.4 4.4 1.4-1.4-4.4-4.4A6.8 6.8 0 0 0 10.8 4Zm0 2a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6Z",
  plus: "M11 4h2v7h7v2h-7v7h-2v-7H4v-2h7V4Z",
  left: "M14.7 5.3 8 12l6.7 6.7 1.4-1.4L10.8 12l5.3-5.3-1.4-1.4Z",
  right: "M9.3 5.3 16 12l-6.7 6.7-1.4-1.4L13.2 12 7.9 6.7l1.4-1.4Z",
  close: "m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5Z",
  more: "M5 10.2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Zm7 0a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Zm7 0a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Z",
  trash: "M8 4h8l1 2h4v2H3V6h4l1-2Zm1 6h2v8H9v-8Zm4 0h2v8h-2v-8ZM5 8h14l-1 12H6L5 8Z",
  edit: "M15.7 3.3 20.7 8.3 8.6 20.4 3 21l.6-5.6L15.7 3.3Zm0 2.8L6 15.8l-.2 1.8 1.8-.2 9.7-9.7-1.6-1.6Z",
  download: "M11 3h2v9l3.5-3.5 1.4 1.4L12 16l-5.9-6.1 1.4-1.4L11 12V3ZM4 18h16v2H4v-2Z",
  upload: "M11 21h2v-9l3.5 3.5 1.4-1.4L12 8l-5.9 6.1 1.4 1.4L11 12v9ZM4 3h16v2H4V3Z",
  cloud: "M7 18a4 4 0 0 1-.7-7.9A5.5 5.5 0 0 1 17 8.6 3.8 3.8 0 0 1 17.5 16H17v2H7Z",
  check: "m5 12.5 4 4L19 6.7 17.6 5.3 9 13.9l-2.6-2.6L5 12.5Z",
  refresh: "M12 4a8 8 0 0 1 7.5 5.2l1.5-2.2v6h-6l2.2-1.5A6 6 0 0 0 6.2 14H4.1A8 8 0 0 1 12 4Zm0 16a8 8 0 0 1-7.5-5.2L3 17v-6h6l-2.2 1.5A6 6 0 0 0 17.8 10h2.1A8 8 0 0 1 12 20Z",
  volume: "M4 9h4l5-4v14l-5-4H4V9Zm11.5-1.6a6 6 0 0 1 0 9.2l-1.3-1.5a4 4 0 0 0 0-6.2l1.3-1.5Z",
  spark: "m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Zm7 12 .9 2.1 2.1.9-2.1.9L19 21l-.9-2.1-2.1-.9 2.1-.9L19 15Z",
  settings: "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm9 3.5-.1 1.2 2 1.6-2 3.4-2.4-.9c-.6.5-1.3.9-2 1.2l-.4 2.5h-4l-.4-2.5c-.7-.3-1.4-.7-2-1.2l-2.4.9-2-3.4 2-1.6L7.2 12l.1-1.2-2-1.6 2-3.4 2.4.9c.6-.5 1.3-.9 2-1.2L12 3h4l.4 2.5c.7.3 1.4.7 2 1.2l2.4-.9 2 3.4-2 1.6.1 1.2Z",
  arrowLeft: "M11 5 4 12l7 7 1.4-1.4L7.8 13H20v-2H7.8l4.6-4.6L11 5Z"
};
function Icon({ name, size = 16, style }) {
  const path = ICONS[name] ?? ICONS.book;
  return /* @__PURE__ */ import_react.default.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", style }, /* @__PURE__ */ import_react.default.createElement("path", { d: path }));
}
function Button({ children, variant = "", size = "", onClick, disabled, title, type = "button", className = "" }) {
  return /* @__PURE__ */ import_react.default.createElement(
    "button",
    {
      type,
      className: `nr-btn ${variant ? `is-${variant}` : ""} ${size ? `is-${size}` : ""} ${className}`,
      onClick,
      disabled,
      title
    },
    children
  );
}
function Field({ label, hint, children }) {
  return /* @__PURE__ */ import_react.default.createElement("label", { className: "nr-field" }, /* @__PURE__ */ import_react.default.createElement("span", null, label), children, hint ? /* @__PURE__ */ import_react.default.createElement("small", null, hint) : null);
}
function Toggle({ checked, onChange, label, disabled = false }) {
  return /* @__PURE__ */ import_react.default.createElement("button", { type: "button", role: "switch", "aria-checked": checked, className: `nr-switch ${checked ? "is-on" : ""}`, onClick: () => onChange(!checked), disabled }, /* @__PURE__ */ import_react.default.createElement("span", { className: "nr-switch-track" }, /* @__PURE__ */ import_react.default.createElement("i", null)), /* @__PURE__ */ import_react.default.createElement("span", null, label));
}
function Modal({ title, onClose, children, width = 460 }) {
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "nr-overlay", style: { justifyContent: "center", alignItems: "center" }, onMouseDown: (event) => {
    if (event.target === event.currentTarget) onClose();
  } }, /* @__PURE__ */ import_react.default.createElement("div", { className: "nr-card", style: { width: `min(${width}px, 94vw)`, maxHeight: "86vh", overflowY: "auto", margin: 0 }, role: "dialog", "aria-modal": "true" }, /* @__PURE__ */ import_react.default.createElement("div", { style: { display: "flex", alignItems: "center", marginBottom: 14 } }, /* @__PURE__ */ import_react.default.createElement("h3", { className: "nr-drawer-title" }, title), /* @__PURE__ */ import_react.default.createElement("button", { type: "button", className: "nr-x", onClick: onClose, "aria-label": "\u5173\u95ED" }, /* @__PURE__ */ import_react.default.createElement(Icon, { name: "close", size: 13 }))), children));
}
function Drawer({ title, onClose, children }) {
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "nr-overlay", onMouseDown: (event) => {
    if (event.target === event.currentTarget) onClose();
  } }, /* @__PURE__ */ import_react.default.createElement("aside", { className: "nr-drawer", role: "dialog", "aria-modal": "true" }, /* @__PURE__ */ import_react.default.createElement("div", { className: "nr-drawer-head" }, /* @__PURE__ */ import_react.default.createElement("h3", { className: "nr-drawer-title" }, title), /* @__PURE__ */ import_react.default.createElement("button", { type: "button", className: "nr-x", onClick: onClose, "aria-label": "\u5173\u95ED" }, /* @__PURE__ */ import_react.default.createElement(Icon, { name: "close", size: 13 }))), /* @__PURE__ */ import_react.default.createElement("div", { className: "nr-drawer-body" }, children)));
}
function Toast({ toast }) {
  if (!toast) return null;
  return /* @__PURE__ */ import_react.default.createElement("div", { className: `nr-toast ${toast.error ? "is-error" : ""}` }, toast.text);
}
function StatusChip({ status }) {
  const map = { new: "\u65B0\u8BCD", learning: "\u5B66\u4E60\u4E2D", review: "\u590D\u4E60\u4E2D", mastered: "\u5DF2\u638C\u63E1" };
  return /* @__PURE__ */ import_react.default.createElement("span", { className: `nr-chip is-${status ?? "new"}` }, map[status] ?? "\u65B0\u8BCD");
}
function Empty({ title, children, action }) {
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "nr-empty" }, /* @__PURE__ */ import_react.default.createElement("h3", null, title), children ? /* @__PURE__ */ import_react.default.createElement("p", null, children) : null, action);
}
function Spinner({ text = "\u52A0\u8F7D\u4E2D\u2026" }) {
  return /* @__PURE__ */ import_react.default.createElement("div", { className: "nr-loading" }, text);
}

// src-client/library.jsx
function BookCover({ book, className = "nr-cover" }) {
  return /* @__PURE__ */ import_react2.default.createElement("div", { className }, book.cover ? /* @__PURE__ */ import_react2.default.createElement("img", { src: `/novel-reader/${book.cover}`, alt: "", loading: "lazy" }) : /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-cover-fallback" }, book.title?.slice(0, 60) || "Untitled"));
}
function BookCard({ book, onOpen, onDetail }) {
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-book-cell" }, /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "nr-book-card", onClick: () => onOpen(book, book.progress?.chapterIndex ?? 0) }, /* @__PURE__ */ import_react2.default.createElement(BookCover, { book }), /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-book-title" }, book.title), /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-book-meta" }, book.author || "\u672A\u77E5\u4F5C\u8005", " \xB7 ", percent(book), "%"), /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-progress" }, /* @__PURE__ */ import_react2.default.createElement("i", { style: { width: `${percent(book)}%` } }))), /* @__PURE__ */ import_react2.default.createElement(
    "button",
    {
      type: "button",
      className: "nr-book-more",
      title: "\u4E66\u7C4D\u8BE6\u60C5",
      "aria-label": `\u67E5\u770B\u300A${book.title}\u300B\u7684\u8BE6\u60C5`,
      onClick: (event) => {
        event.stopPropagation();
        onDetail(book);
      }
    },
    /* @__PURE__ */ import_react2.default.createElement(Icon, { name: "more", size: 15 })
  ));
}
function BookDrawer({ bookId, onClose, onRead, onRefresh, notify }) {
  const [detail, setDetail] = (0, import_react2.useState)(null);
  const [error, setError] = (0, import_react2.useState)("");
  const [editing, setEditing] = (0, import_react2.useState)(false);
  const [form, setForm] = (0, import_react2.useState)({ title: "", author: "", description: "", tags: "" });
  const [busy, setBusy] = (0, import_react2.useState)(false);
  const [confirmDelete, setConfirmDelete] = (0, import_react2.useState)(false);
  (0, import_react2.useEffect)(() => {
    let alive = true;
    fetch(`/novel-reader/api/books/${bookId}`, { headers: { accept: "application/json" } }).then((response) => response.json()).then((payload) => {
      if (!alive || !payload?.ok) return;
      setDetail(payload.data);
      setForm({
        title: payload.data.book.title ?? "",
        author: payload.data.book.author ?? "",
        description: payload.data.book.description ?? "",
        tags: (payload.data.book.tags ?? []).join(", ")
      });
    }).catch(() => {
      if (alive) {
        setError("\u8BFB\u53D6\u4E66\u7C4D\u8BE6\u60C5\u5931\u8D25");
        notify("\u8BFB\u53D6\u4E66\u7C4D\u8BE6\u60C5\u5931\u8D25", true);
      }
    });
    return () => {
      alive = false;
    };
  }, [bookId]);
  const save = async () => {
    setBusy(true);
    try {
      await fetch(`/novel-reader/api/books/${bookId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          author: form.author,
          description: form.description,
          tags: form.tags.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean)
        })
      }).then(async (response2) => {
        const payload = await response2.json();
        if (!response2.ok || !payload.ok) throw new Error(payload?.error?.message ?? "\u4FDD\u5B58\u5931\u8D25");
      });
      notify("\u4E66\u7C4D\u4FE1\u606F\u5DF2\u4FDD\u5B58");
      setEditing(false);
      await onRefresh();
      const response = await fetch(`/novel-reader/api/books/${bookId}`).then((r) => r.json());
      if (response?.ok) setDetail(response.data);
    } catch (error2) {
      notify(error2.message, true);
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    setBusy(true);
    try {
      const response = await fetch(`/novel-reader/api/books/${bookId}`, { method: "DELETE" }).then((r) => r.json());
      if (!response?.ok) throw new Error(response?.error?.message ?? "\u5220\u9664\u5931\u8D25");
      notify("\u4E66\u7C4D\u5DF2\u79FB\u51FA\u4E66\u67B6");
      onClose();
      await onRefresh();
    } catch (error2) {
      notify(error2.message, true);
    } finally {
      setBusy(false);
      setConfirmDelete(false);
    }
  };
  const book = detail?.book;
  return /* @__PURE__ */ import_react2.default.createElement(Drawer, { title: book?.title ?? "\u4E66\u7C4D\u8BE6\u60C5", onClose }, !book ? error ? /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-empty", style: { margin: "24px 0" } }, /* @__PURE__ */ import_react2.default.createElement("h3", null, "\u8BE6\u60C5\u6CA1\u52A0\u8F7D\u51FA\u6765"), /* @__PURE__ */ import_react2.default.createElement("p", null, error), /* @__PURE__ */ import_react2.default.createElement(Button, { onClick: () => window.location.reload() }, "\u91CD\u65B0\u52A0\u8F7D\u9875\u9762")) : /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-loading" }, "\u52A0\u8F7D\u4E2D\u2026") : /* @__PURE__ */ import_react2.default.createElement(import_react2.default.Fragment, null, /* @__PURE__ */ import_react2.default.createElement("div", { style: { display: "flex", gap: 16, marginBottom: 18 } }, /* @__PURE__ */ import_react2.default.createElement("div", { style: { width: 112, flex: "none" } }, /* @__PURE__ */ import_react2.default.createElement(BookCover, { book, className: "nr-cover" })), /* @__PURE__ */ import_react2.default.createElement("div", { style: { flex: 1, minWidth: 0 } }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-book-title", style: { fontSize: 16, lineHeight: "23px" } }, book.title), /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-book-meta", style: { marginTop: 4 } }, book.author || "\u672A\u77E5\u4F5C\u8005"), /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-book-meta", style: { marginTop: 8 } }, book.chapterCount, " \u7AE0 \xB7 ", Number(book.wordCount).toLocaleString(), " \u8BCD \xB7 ", book.format?.toUpperCase()), /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-book-meta", style: { marginTop: 4 } }, "\u52A0\u5165\u4E8E ", relativeTime(book.addedAt)), /* @__PURE__ */ import_react2.default.createElement("div", { style: { display: "flex", gap: 8, marginTop: 14 } }, /* @__PURE__ */ import_react2.default.createElement(Button, { variant: "primary", onClick: () => onRead(book) }, "\u5F00\u59CB\u9605\u8BFB"), /* @__PURE__ */ import_react2.default.createElement(Button, { onClick: () => setEditing((value) => !value) }, editing ? "\u53D6\u6D88\u7F16\u8F91" : "\u7F16\u8F91\u4FE1\u606F")))), editing ? /* @__PURE__ */ import_react2.default.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 12, marginBottom: 18 } }, /* @__PURE__ */ import_react2.default.createElement(Field, { label: "\u4E66\u540D" }, /* @__PURE__ */ import_react2.default.createElement("input", { className: "nr-input", value: form.title, onChange: (event) => setForm({ ...form, title: event.target.value }) })), /* @__PURE__ */ import_react2.default.createElement(Field, { label: "\u4F5C\u8005" }, /* @__PURE__ */ import_react2.default.createElement("input", { className: "nr-input", value: form.author, onChange: (event) => setForm({ ...form, author: event.target.value }) })), /* @__PURE__ */ import_react2.default.createElement(Field, { label: "\u6807\u7B7E", hint: "\u7528\u9017\u53F7\u5206\u9694" }, /* @__PURE__ */ import_react2.default.createElement("input", { className: "nr-input", value: form.tags, onChange: (event) => setForm({ ...form, tags: event.target.value }) })), /* @__PURE__ */ import_react2.default.createElement(Field, { label: "\u7B80\u4ECB" }, /* @__PURE__ */ import_react2.default.createElement("textarea", { className: "nr-textarea", value: form.description, onChange: (event) => setForm({ ...form, description: event.target.value }) })), /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-row" }, /* @__PURE__ */ import_react2.default.createElement(Button, { variant: "primary", onClick: save, disabled: busy }, "\u4FDD\u5B58"))) : null, /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-section" }, /* @__PURE__ */ import_react2.default.createElement("h3", null, "\u9605\u8BFB\u6570\u636E"), /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-stat-row", style: { marginBottom: 0, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" } }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-stat" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-stat-value" }, Number(book.wordCount).toLocaleString()), /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-stat-label" }, "\u603B\u8BCD\u6570")), /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-stat" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-stat-value" }, book.chapterCount), /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-stat-label" }, "\u7AE0\u8282")), /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-stat" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-stat-value" }, percent(book), "%"), /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-stat-label" }, "\u5DF2\u8BFB\u8FDB\u5EA6")), /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-stat" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-stat-value" }, Math.round((Number(book.wordCount) || 0) / 220)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-stat-label" }, "\u9884\u8BA1\u5206\u949F")), /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-stat" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-stat-value" }, detail.vocabCount ?? 0), /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-stat-label" }, "\u672C\u4E66\u751F\u8BCD")), /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-stat" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-stat-value" }, ((detail.vocabCount ?? 0) / Math.max(1, Number(book.wordCount) || 1) * 1e3).toFixed(1)), /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-stat-label" }, "\u6BCF\u5343\u8BCD\u751F\u8BCD")))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-section" }, /* @__PURE__ */ import_react2.default.createElement("h3", null, "\u7AE0\u8282\u76EE\u5F55"), /* @__PURE__ */ import_react2.default.createElement("div", { style: { maxHeight: 280, overflowY: "auto" } }, (detail.chapters ?? []).map((chapter) => /* @__PURE__ */ import_react2.default.createElement(
    "button",
    {
      key: chapter.index,
      type: "button",
      className: "nr-vocab-row",
      onClick: () => onRead(book, chapter.index)
    },
    /* @__PURE__ */ import_react2.default.createElement("span", { className: "nr-vocab-word", style: { minWidth: 34, fontWeight: 500 } }, chapter.index + 1),
    /* @__PURE__ */ import_react2.default.createElement("span", { className: "nr-vocab-trans", style: { color: "var(--dsw-alias-label-primary)" } }, chapter.title),
    /* @__PURE__ */ import_react2.default.createElement("span", { className: "nr-vocab-source" }, chapter.wordCount, " \u8BCD")
  )))), /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-section" }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-row" }, /* @__PURE__ */ import_react2.default.createElement(Button, { variant: "danger", size: "small", onClick: () => setConfirmDelete(true), disabled: busy }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: "trash", size: 13 }), " \u79FB\u9664\u8FD9\u672C\u4E66")))), confirmDelete ? /* @__PURE__ */ import_react2.default.createElement(Modal, { title: "\u79FB\u9664\u4E66\u7C4D", onClose: () => setConfirmDelete(false) }, /* @__PURE__ */ import_react2.default.createElement("p", { style: { fontSize: 13, lineHeight: "21px" } }, "\u4E66\u7C4D\u4F1A\u4ECE\u4E66\u67B6\u9690\u85CF\uFF0C\u4F46\u672C\u5730\u6587\u4EF6\u4ECD\u4FDD\u7559\uFF0C\u4E0B\u6B21\u540C\u6B65\u65F6\u4F1A\u628A\u5220\u9664\u6807\u8BB0\u540C\u6B65\u5230\u5176\u4ED6\u8BBE\u5907\u3002\u786E\u5B9A\u5417\uFF1F"), /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-row", style: { justifyContent: "flex-end", marginTop: 16 } }, /* @__PURE__ */ import_react2.default.createElement(Button, { onClick: () => setConfirmDelete(false) }, "\u53D6\u6D88"), /* @__PURE__ */ import_react2.default.createElement(Button, { variant: "danger", onClick: remove, disabled: busy }, "\u79FB\u9664"))) : null);
}
function LibraryView({ books, onOpen, onRefresh, notify }) {
  const [query, setQuery] = (0, import_react2.useState)("");
  const [filter, setFilter] = (0, import_react2.useState)("all");
  const [dragging, setDragging] = (0, import_react2.useState)(false);
  const [importing, setImporting] = (0, import_react2.useState)(false);
  const [detailId, setDetailId] = (0, import_react2.useState)(null);
  const inputRef = (0, import_react2.useRef)(null);
  const filtered = books.filter((book) => !query || `${book.title} ${book.author}`.toLowerCase().includes(query.toLowerCase())).filter((book) => {
    if (filter === "reading") return book.progress && percent(book) > 0 && percent(book) < 100;
    if (filter === "finished") return percent(book) >= 100;
    if (filter === "unread") return !book.progress || percent(book) === 0;
    return true;
  }).sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  const continueBook = [...books].filter((book) => book.progress && percent(book) > 0 && percent(book) < 100).sort((a, b) => Date.parse(b.progress.updatedAt) - Date.parse(a.progress.updatedAt))[0];
  const importFiles = async (fileList) => {
    const files = [...fileList ?? []];
    if (!files.length) return;
    setImporting(true);
    let imported = 0;
    for (const file of files) {
      try {
        const response = await fetch("/novel-reader/api/books/import", {
          method: "POST",
          headers: {
            "x-file-name": encodeURIComponent(file.name),
            "x-file-type": file.type || "application/octet-stream"
          },
          body: file
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok || !payload.ok) throw new Error(payload?.error?.message ?? "\u5BFC\u5165\u5931\u8D25");
        imported += 1;
        if (payload.data?.duplicate) notify(`\u300A${payload.data.book.title}\u300B\u5DF2\u7ECF\u5728\u4E66\u67B6\u91CC\u4E86`);
        else notify(`\u5DF2\u5BFC\u5165\u300A${payload.data.book.title}\u300B`);
      } catch (error) {
        notify(`${file.name}\uFF1A${error.message}`, true);
      }
    }
    setImporting(false);
    if (imported) await onRefresh();
  };
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-page", onDragOver: (event) => {
    event.preventDefault();
    setDragging(true);
  }, onDragLeave: () => setDragging(false), onDrop: (event) => {
    event.preventDefault();
    setDragging(false);
    importFiles(event.dataTransfer.files);
  } }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-page-head" }, /* @__PURE__ */ import_react2.default.createElement("div", null, /* @__PURE__ */ import_react2.default.createElement("h1", { className: "nr-title" }, "\u6211\u7684\u4E66\u67B6"), /* @__PURE__ */ import_react2.default.createElement("p", { className: "nr-sub" }, "\u5171 ", books.length, " \u672C \xB7 \u652F\u6301 EPUB / TXT / Markdown")), /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-head-actions" }, /* @__PURE__ */ import_react2.default.createElement("input", { ref: inputRef, type: "file", accept: ".epub,.txt,.md,.markdown", multiple: true, style: { display: "none" }, onChange: (event) => {
    importFiles(event.target.files);
    event.target.value = "";
  } }), /* @__PURE__ */ import_react2.default.createElement(Button, { variant: "primary", onClick: () => inputRef.current?.click(), disabled: importing }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: "plus", size: 14 }), " ", importing ? "\u5BFC\u5165\u4E2D\u2026" : "\u5BFC\u5165\u56FE\u4E66"))), continueBook ? /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-continue" }, /* @__PURE__ */ import_react2.default.createElement(BookCover, { book: continueBook }), /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-continue-body" }, /* @__PURE__ */ import_react2.default.createElement("h2", { className: "nr-continue-title" }, continueBook.title), /* @__PURE__ */ import_react2.default.createElement("p", { className: "nr-continue-meta" }, "\u8BFB\u5230\u7B2C ", (continueBook.progress.chapterIndex ?? 0) + 1, " \u7AE0 \xB7 ", percent(continueBook), "% \xB7 ", continueBook.author || "\u672A\u77E5\u4F5C\u8005"), /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-progress", style: { maxWidth: 360, marginBottom: 14 } }, /* @__PURE__ */ import_react2.default.createElement("i", { style: { width: `${percent(continueBook)}%` } })), /* @__PURE__ */ import_react2.default.createElement(Button, { variant: "primary", onClick: () => onOpen(continueBook, continueBook.progress?.chapterIndex ?? 0) }, "\u7EE7\u7EED\u9605\u8BFB"))) : null, /* @__PURE__ */ import_react2.default.createElement("div", { className: "nr-toolbar" }, /* @__PURE__ */ import_react2.default.createElement("input", { className: "nr-input", placeholder: "\u641C\u7D22\u4E66\u540D\u6216\u4F5C\u8005", value: query, onChange: (event) => setQuery(event.target.value) }), /* @__PURE__ */ import_react2.default.createElement("select", { className: "nr-select", value: filter, onChange: (event) => setFilter(event.target.value) }, /* @__PURE__ */ import_react2.default.createElement("option", { value: "all" }, "\u5168\u90E8"), /* @__PURE__ */ import_react2.default.createElement("option", { value: "reading" }, "\u5728\u8BFB"), /* @__PURE__ */ import_react2.default.createElement("option", { value: "unread" }, "\u672A\u5F00\u59CB"), /* @__PURE__ */ import_react2.default.createElement("option", { value: "finished" }, "\u5DF2\u8BFB\u5B8C")), /* @__PURE__ */ import_react2.default.createElement("span", { className: "nr-sub", style: { marginLeft: "auto" } }, filtered.length, " \u672C")), filtered.length ? /* @__PURE__ */ import_react2.default.createElement("div", { className: `nr-grid ${dragging ? "nr-drop" : ""}` }, filtered.map((book) => /* @__PURE__ */ import_react2.default.createElement(BookCard, { key: book.id, book, onOpen, onDetail: (row) => setDetailId(row.id) }))) : /* @__PURE__ */ import_react2.default.createElement(
    Empty,
    {
      title: books.length ? "\u6CA1\u6709\u5339\u914D\u7684\u4E66" : "\u4E66\u67B6\u8FD8\u662F\u7A7A\u7684",
      action: /* @__PURE__ */ import_react2.default.createElement(Button, { variant: "primary", onClick: () => inputRef.current?.click() }, /* @__PURE__ */ import_react2.default.createElement(Icon, { name: "plus", size: 14 }), " \u9009\u62E9\u6587\u4EF6\u5BFC\u5165")
    },
    books.length ? "\u6362\u4E2A\u5173\u952E\u8BCD\u6216\u7B5B\u9009\u6761\u4EF6\u8BD5\u8BD5\u3002" : "\u628A EPUB / TXT / Markdown \u62D6\u8FDB\u8FD9\u4E2A\u9875\u9762\uFF0C\u6216\u70B9\u51FB\u4E0B\u9762\u7684\u6309\u94AE\u9009\u62E9\u6587\u4EF6\u3002"
  ), detailId ? /* @__PURE__ */ import_react2.default.createElement(
    BookDrawer,
    {
      bookId: detailId,
      onClose: () => setDetailId(null),
      onRead: (book, chapterIndex) => {
        setDetailId(null);
        onOpen(book, chapterIndex);
      },
      onRefresh,
      notify
    }
  ) : null);
}

// src-client/reader.jsx
var import_react3 = __toESM(require("react"), 1);
function sentenceAround(paragraph, selected) {
  const text = String(paragraph ?? "").replace(/\s+/g, " ").trim();
  if (!text) return selected;
  const at = Math.max(0, text.indexOf(selected));
  const before = text.slice(0, at);
  const startCandidates = [before.lastIndexOf(". "), before.lastIndexOf("! "), before.lastIndexOf("? "), before.lastIndexOf(".\u201D "), before.lastIndexOf('." ')];
  const start = Math.max(...startCandidates.map((value) => value + 1), 0);
  const after = text.slice(at + selected.length);
  const ends = [after.indexOf(". "), after.indexOf("! "), after.indexOf("? ")].filter((value) => value >= 0);
  const end = ends.length ? at + selected.length + Math.min(...ends) + 1 : text.length;
  const sentence = text.slice(start, end).trim();
  return sentence.length <= 600 ? sentence : text.slice(0, 600);
}
function wordAtPoint(x, y) {
  let range = null;
  if (document.caretRangeFromPoint) range = document.caretRangeFromPoint(x, y);
  else if (document.caretPositionFromPoint) {
    const position = document.caretPositionFromPoint(x, y);
    if (position?.offsetNode) {
      range = document.createRange();
      range.setStart(position.offsetNode, position.offset);
      range.collapse(true);
    }
  }
  if (!range || !document.querySelector(".nr-reading")?.contains(range.startContainer)) return null;
  const node = range.startContainer;
  if (!node || node.nodeType !== 3) return null;
  const data = node.data;
  const isWordChar = (character) => /[A-Za-z'-]/.test(character);
  let start = range.startOffset;
  let end = range.startOffset;
  while (start > 0 && isWordChar(data[start - 1])) start -= 1;
  while (end < data.length && isWordChar(data[end])) end += 1;
  if (end <= start) return null;
  const text = data.slice(start, end);
  const wordRange = document.createRange();
  wordRange.setStart(node, start);
  wordRange.setEnd(node, end);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(wordRange);
  const rect = wordRange.getBoundingClientRect();
  const paragraph = node.parentElement?.closest?.("p");
  return {
    text,
    kind: "word",
    sentence: paragraph ? sentenceAround(paragraph.innerText, text) : text,
    rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right }
  };
}
function SelectionMenu({ menu, selection, saving, onClose, onDictionary, onTranslate, onSave, onCopy }) {
  const ref = (0, import_react3.useRef)(null);
  (0, import_react3.useEffect)(() => {
    const closeOnOutside = (event) => {
      if (!ref.current?.contains(event.target)) onClose();
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);
  const isSentence = selection.kind === "sentence";
  const left = Math.min(menu.x, window.innerWidth - 220);
  const top = Math.min(menu.y, window.innerHeight - 190);
  return /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-context-menu", ref, style: { left, top }, onMouseDown: (event) => event.stopPropagation() }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-menu-label" }, selection.text.length > 42 ? `${selection.text.slice(0, 42)}\u2026` : selection.text), isSentence ? /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", onClick: onTranslate }, "\u7FFB\u8BD1\u6574\u53E5"), /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", onClick: onSave, disabled: saving }, saving ? "\u4FDD\u5B58\u4E2D\u2026" : "\u6536\u85CF\u8FD9\u4E2A\u53E5\u5B50")) : /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", onClick: onDictionary }, "\u67E5\u8BCD\u5178"), /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", onClick: onTranslate }, "\u7FFB\u8BD1\u8FD9\u4E2A\u8BCD"), /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", onClick: onSave, disabled: saving }, saving ? "\u4FDD\u5B58\u4E2D\u2026" : "\u52A0\u5165\u751F\u8BCD\u672C")), /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", onClick: onCopy }, "\u590D\u5236"));
}
function PopoverBackdrop({ onClose }) {
  return /* @__PURE__ */ import_react3.default.createElement(
    "div",
    {
      className: "nr-pop-backdrop",
      onMouseDown: (event) => {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    }
  );
}
function DictionaryPopover({ selection, book, chapterIndex, chapterTitle, onClose, notify }) {
  const [loading, setLoading] = (0, import_react3.useState)(true);
  const [entry, setEntry] = (0, import_react3.useState)(null);
  const [error, setError] = (0, import_react3.useState)("");
  const [saved, setSaved] = (0, import_react3.useState)(false);
  const [saving, setSaving] = (0, import_react3.useState)(false);
  (0, import_react3.useEffect)(() => {
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape, true);
    return () => document.removeEventListener("keydown", closeOnEscape, true);
  }, [onClose]);
  (0, import_react3.useEffect)(() => {
    let alive = true;
    setLoading(true);
    setError("");
    setEntry(null);
    setSaved(false);
    const query = new URLSearchParams({
      word: selection.text,
      bookId: book.id,
      chapterIndex: String(chapterIndex),
      chapterTitle
    });
    api(`/dictionary?${query.toString()}`).then((data) => {
      if (alive) {
        setEntry(data);
        setLoading(false);
      }
    }).catch((err) => {
      if (alive) {
        setError(err.message);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [selection.text, book.id, chapterIndex, chapterTitle]);
  const play = (audio) => {
    if (!audio) return;
    try {
      new Audio(audio).play().catch(() => notify("\u53D1\u97F3\u64AD\u653E\u5931\u8D25", true));
    } catch {
      notify("\u53D1\u97F3\u64AD\u653E\u5931\u8D25", true);
    }
  };
  const save = async () => {
    if (!entry?.found) return;
    setSaving(true);
    try {
      const definitions = entry.definitions.map((row) => ({
        pos: row.pos,
        text: row.meaning,
        example: entry.englishDefinitions?.[0]?.examples?.[0] ?? ""
      }));
      await api("/vocab", {
        method: "POST",
        body: {
          term: entry.word,
          kind: "word",
          translations: entry.definitions.map((row) => row.meaning).slice(0, 3),
          definitions,
          phonetic: entry.phonetics?.uk?.text || entry.phonetics?.us?.text || "",
          context: {
            bookId: book.id,
            chapterIndex,
            chapterTitle,
            sentence: selection.sentence || selection.text
          }
        }
      });
      setSaved(true);
      notify("\u5DF2\u52A0\u5165\u751F\u8BCD\u672C");
    } catch (err) {
      notify(err.message, true);
    } finally {
      setSaving(false);
    }
  };
  const width = 390;
  const left = Math.min(Math.max(12, selection.rect.left), window.innerWidth - width - 12);
  const top = Math.min(Math.max(12, selection.rect.bottom + 8), Math.max(12, window.innerHeight - 520));
  const uk = entry?.phonetics?.uk;
  const us = entry?.phonetics?.us;
  return /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement(PopoverBackdrop, { onClose }), /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-popover nr-dictionary", style: { left, top, width }, onMouseDown: (event) => event.stopPropagation() }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-pop-head" }, /* @__PURE__ */ import_react3.default.createElement("div", null, /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-pop-word" }, entry?.word ?? selection.text), /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-pop-subtitle" }, "\u8BCD\u5178\u91CA\u4E49")), /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "nr-pop-close", onClick: onClose, "aria-label": "\u5173\u95ED" }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "close", size: 12 }))), loading ? /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-loading", style: { padding: "18px 0" } }, "\u67E5\u8BCD\u5178\u4E2D\u2026") : null, error ? /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-explain", style: { color: "var(--dsw-alias-state-error-primary)" } }, error) : null, !loading && entry && !entry.found ? /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-explain" }, "\u8BCD\u5178\u6682\u672A\u6536\u5F55 \u201C", selection.text, "\u201D\uFF0C\u53EF\u4EE5\u8BD5\u8BD5\u7FFB\u8BD1\u8FD9\u4E2A\u8BCD\u3002") : null, entry?.found ? /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-dict-phonetics" }, uk?.text ? /* @__PURE__ */ import_react3.default.createElement("span", null, /* @__PURE__ */ import_react3.default.createElement("b", null, "UK"), " ", uk.text, " ", uk.audio ? /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "nr-audio-btn", onClick: () => play(uk.audio), "aria-label": "\u64AD\u653E\u82F1\u5F0F\u53D1\u97F3" }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "volume", size: 13 })) : null) : null, us?.text ? /* @__PURE__ */ import_react3.default.createElement("span", null, /* @__PURE__ */ import_react3.default.createElement("b", null, "US"), " ", us.text, " ", us.audio ? /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "nr-audio-btn", onClick: () => play(us.audio), "aria-label": "\u64AD\u653E\u7F8E\u5F0F\u53D1\u97F3" }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "volume", size: 13 })) : null) : null), entry.examTags?.length ? /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-dict-tags" }, entry.examTags.map((tag) => /* @__PURE__ */ import_react3.default.createElement("span", { key: tag, className: "nr-chip" }, tag))) : null, entry.definitions?.length ? /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-dict-section" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-dict-title" }, "\u4E2D\u6587\u91CA\u4E49"), entry.definitions.map((row, index) => /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-dict-def", key: index }, row.pos ? /* @__PURE__ */ import_react3.default.createElement("b", null, row.pos) : null, row.meaning))) : null, entry.englishDefinitions?.length ? /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-dict-section" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-dict-title" }, "\u82F1\u6587\u91CA\u4E49"), entry.englishDefinitions.slice(0, 4).map((row, index) => /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-dict-en", key: index }, /* @__PURE__ */ import_react3.default.createElement("div", null, row.pos ? /* @__PURE__ */ import_react3.default.createElement("b", null, row.pos) : null, row.definition), row.examples?.length ? /* @__PURE__ */ import_react3.default.createElement("small", null, row.examples.slice(0, 2).join(" / ")) : null))) : null, entry.examples?.length ? /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-dict-section" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-dict-title" }, "\u4F8B\u53E5"), entry.examples.slice(0, 3).map((row, index) => /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-dict-example", key: index }, /* @__PURE__ */ import_react3.default.createElement("div", null, row.source), /* @__PURE__ */ import_react3.default.createElement("small", null, row.translation)))) : null, /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-pop-actions" }, /* @__PURE__ */ import_react3.default.createElement(Button, { variant: "primary", size: "small", onClick: save, disabled: saved || saving }, saved ? "\u5DF2\u5728\u751F\u8BCD\u672C" : saving ? "\u4FDD\u5B58\u4E2D\u2026" : "\u52A0\u5165\u751F\u8BCD\u672C"), /* @__PURE__ */ import_react3.default.createElement(Button, { size: "small", onClick: () => navigator.clipboard?.writeText(entry.word).then(() => notify("\u5DF2\u590D\u5236")) }, "\u590D\u5236\u5355\u8BCD"))) : null));
}
function LookupPopover({ selection, book, chapterIndex, chapterTitle, onClose, notify }) {
  const [loading, setLoading] = (0, import_react3.useState)(true);
  const [result, setResult] = (0, import_react3.useState)(null);
  const [error, setError] = (0, import_react3.useState)("");
  const [saved, setSaved] = (0, import_react3.useState)(false);
  const [saving, setSaving] = (0, import_react3.useState)(false);
  const boxRef = (0, import_react3.useRef)(null);
  (0, import_react3.useEffect)(() => {
    const closeOnOutside = (event) => {
      if (boxRef.current && !boxRef.current.contains(event.target)) onClose();
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", closeOnOutside, true);
    document.addEventListener("keydown", closeOnEscape, true);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutside, true);
      document.removeEventListener("keydown", closeOnEscape, true);
    };
  }, [onClose]);
  (0, import_react3.useEffect)(() => {
    let alive = true;
    setLoading(true);
    setError("");
    setResult(null);
    setSaved(false);
    api("/translate", {
      method: "POST",
      body: {
        text: selection.text,
        kind: selection.kind,
        bookId: book.id,
        chapterIndex,
        chapterTitle
      }
    }).then((data) => {
      if (alive) {
        setResult(data);
        setLoading(false);
      }
    }).catch((err) => {
      if (alive) {
        setError(err.message);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [selection.text, selection.kind, book.id, chapterIndex, chapterTitle]);
  const save = async () => {
    setSaving(true);
    try {
      await api("/vocab", {
        method: "POST",
        body: {
          term: result?.text ?? selection.text,
          kind: selection.kind,
          translation: result?.translation ?? "",
          translations: result?.translation ? [result.translation] : [],
          definitions: result?.definitions ?? [],
          phonetic: result?.phonetic ?? "",
          context: {
            bookId: book.id,
            chapterIndex,
            chapterTitle,
            sentence: selection.sentence || selection.text
          }
        }
      });
      setSaved(true);
      notify("\u5DF2\u52A0\u5165\u751F\u8BCD\u672C");
    } catch (err) {
      notify(err.message, true);
    } finally {
      setSaving(false);
    }
  };
  const width = 360;
  const left = Math.min(Math.max(12, selection.rect.left), window.innerWidth - width - 12);
  const estimated = 260;
  const top = selection.rect.bottom + estimated < window.innerHeight ? selection.rect.bottom + 8 : Math.max(12, selection.rect.top - estimated - 8);
  return /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement(PopoverBackdrop, { onClose }), /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-popover", ref: boxRef, style: { left, top }, onMouseDown: (event) => event.stopPropagation() }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-pop-head" }, /* @__PURE__ */ import_react3.default.createElement("div", null, /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-pop-word" }, result?.text ?? selection.text), /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-pop-subtitle" }, selection.kind === "sentence" ? "\u6574\u53E5\u7FFB\u8BD1" : "\u5355\u8BCD\u7FFB\u8BD1"), result?.phonetic ? /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-pop-phonetic" }, result.phonetic) : null), /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "nr-pop-close", onClick: onClose, "aria-label": "\u5173\u95ED" }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "close", size: 12 }))), loading ? /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-loading", style: { padding: "18px 0" } }, "\u7FFB\u8BD1\u4E2D\u2026") : null, error ? /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-explain", style: { color: "var(--dsw-alias-state-error-primary)" } }, error) : null, result && !loading ? /* @__PURE__ */ import_react3.default.createElement(import_react3.default.Fragment, null, /* @__PURE__ */ import_react3.default.createElement("p", { className: "nr-pop-trans" }, result.translation || "\uFF08\u6CA1\u6709\u8BD1\u6587\uFF09"), selection.kind === "sentence" && selection.sentence ? /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-pop-sentence" }, selection.sentence) : null, /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-pop-actions" }, /* @__PURE__ */ import_react3.default.createElement(Button, { variant: "primary", size: "small", onClick: save, disabled: saved || saving }, saved ? "\u5DF2\u5728\u751F\u8BCD\u672C" : saving ? "\u4FDD\u5B58\u4E2D\u2026" : "\u52A0\u5165\u751F\u8BCD\u672C"), /* @__PURE__ */ import_react3.default.createElement(Button, { size: "small", onClick: () => navigator.clipboard?.writeText(selection.text).then(() => notify("\u5DF2\u590D\u5236")) }, "\u590D\u5236"), /* @__PURE__ */ import_react3.default.createElement(Button, { size: "small", onClick: () => window.open(`https://www.wordreference.com/en/definition/${encodeURIComponent(result.text ?? selection.text)}`, "_blank") }, "\u8BCD\u5178"))) : null));
}
function ReaderView({ bookId, initialChapter, onBack, onRefresh, notify }) {
  const [detail, setDetail] = (0, import_react3.useState)(null);
  const [chapter, setChapter] = (0, import_react3.useState)(null);
  const [chapterIndex, setChapterIndex] = (0, import_react3.useState)(initialChapter ?? 0);
  const [loading, setLoading] = (0, import_react3.useState)(true);
  const [error, setError] = (0, import_react3.useState)("");
  const [selection, setSelection] = (0, import_react3.useState)(null);
  const [menu, setMenu] = (0, import_react3.useState)(null);
  const [lookup, setLookup] = (0, import_react3.useState)(null);
  const [dictionary, setDictionary] = (0, import_react3.useState)(null);
  const [drawer, setDrawer] = (0, import_react3.useState)(null);
  const [savingSelection, setSavingSelection] = (0, import_react3.useState)(false);
  const [bookVocab, setBookVocab] = (0, import_react3.useState)([]);
  const [fontSize, setFontSize] = (0, import_react3.useState)(18);
  const [lineHeight, setLineHeight] = (0, import_react3.useState)(1.9);
  const [readingWidth, setReadingWidth] = (0, import_react3.useState)(720);
  const [theme, setTheme] = (0, import_react3.useState)("paper");
  const [chapterPercent, setChapterPercent] = (0, import_react3.useState)(0);
  const scrollRef = (0, import_react3.useRef)(null);
  const contentRef = (0, import_react3.useRef)(null);
  const saveTimer = (0, import_react3.useRef)(null);
  const settingsTimer = (0, import_react3.useRef)(null);
  const initialProgress = (0, import_react3.useRef)(null);
  const sessionRef = (0, import_react3.useRef)(null);
  const chapterIndexRef = (0, import_react3.useRef)(initialChapter ?? 0);
  (0, import_react3.useEffect)(() => {
    let alive = true;
    setLoading(true);
    api(`/books/${bookId}`).then((data) => {
      if (!alive) return;
      setDetail(data);
      const start = Number.isInteger(initialChapter) ? initialChapter : data.book.progress?.chapterIndex ?? 0;
      initialProgress.current = data.book.progress ?? null;
      setChapterIndex(start);
      api(`/books/${bookId}/chapters/${start}`).then((chapterData) => {
        if (!alive) return;
        setChapter(chapterData.chapter);
        setLoading(false);
      }).catch((err) => {
        if (alive) {
          setError(err.message);
          setLoading(false);
        }
      });
      api("/history/session/start", { method: "POST", body: { bookId, chapterIndex: start } }).then((result) => {
        sessionRef.current = result.session?.id ?? null;
      }).catch(() => {
      });
    }).catch((err) => {
      if (alive) {
        setError(err.message);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [bookId]);
  (0, import_react3.useEffect)(() => {
    api("/settings").then((data) => {
      setFontSize(Number(data.fontSize) || 18);
      setLineHeight(Number(data.lineHeight) || 1.9);
      setReadingWidth(Number(data.maxWidth) || 720);
      setTheme(data.theme || "paper");
    }).catch(() => {
    });
  }, []);
  (0, import_react3.useEffect)(() => {
    chapterIndexRef.current = chapterIndex;
  }, [chapterIndex]);
  (0, import_react3.useEffect)(() => {
    const timer = setInterval(() => {
      if (sessionRef.current) {
        api("/history/session/heartbeat", { method: "POST", body: { sessionId: sessionRef.current, chapterIndex: chapterIndexRef.current } }).catch(() => {
        });
      }
    }, 3e4);
    return () => {
      clearInterval(timer);
      if (sessionRef.current) {
        const body = JSON.stringify({ sessionId: sessionRef.current });
        try {
          navigator.sendBeacon("/novel-reader/api/history/session/end", new Blob([body], { type: "application/json" }));
        } catch {
          fetch("/novel-reader/api/history/session/end", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true }).catch(() => {
          });
        }
      }
    };
  }, []);
  (0, import_react3.useEffect)(() => {
    if (!chapter) return;
    requestAnimationFrame(() => {
      const scroller = scrollRef.current;
      if (!scroller) return;
      const progress = initialProgress.current;
      if (progress && progress.chapterIndex === chapterIndex) {
        const paragraphs = contentRef.current?.querySelectorAll("p") ?? [];
        const target = paragraphs[progress.paragraphIndex ?? 0];
        if (target) target.scrollIntoView({ block: "start" });
        else scroller.scrollTop = (progress.scrollRatio ?? 0) * Math.max(0, scroller.scrollHeight - scroller.clientHeight);
      } else {
        scroller.scrollTop = 0;
      }
    });
  }, [chapter, chapterIndex]);
  const currentProgress = () => {
    const scroller = scrollRef.current;
    if (!scroller) return null;
    const paragraphs = contentRef.current?.querySelectorAll("p") ?? [];
    let paragraphIndex = 0;
    const top = scroller.getBoundingClientRect().top + 80;
    paragraphs.forEach((paragraph, index) => {
      if (paragraph.getBoundingClientRect().top <= top) paragraphIndex = index;
    });
    return {
      bookId,
      chapterIndex,
      paragraphIndex,
      charOffset: 0,
      scrollRatio: scroller.scrollHeight > scroller.clientHeight ? scroller.scrollTop / (scroller.scrollHeight - scroller.clientHeight) : 0
    };
  };
  const scheduleSave = () => {
    const scroller = scrollRef.current;
    if (scroller) {
      setChapterPercent(scroller.scrollHeight > scroller.clientHeight ? Math.round(scroller.scrollTop / (scroller.scrollHeight - scroller.clientHeight) * 100) : 100);
    }
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      const progress = currentProgress();
      if (progress) api("/progress", { method: "POST", body: progress }).catch(() => {
      });
    }, 1200);
  };
  const loadChapter = async (index) => {
    if (index < 0 || index >= (detail?.book?.chapterCount ?? 0)) return;
    setLoading(true);
    setError("");
    setSelection(null);
    setMenu(null);
    setLookup(null);
    setDictionary(null);
    setDrawer(null);
    setChapterPercent(0);
    try {
      const data = await api(`/books/${bookId}/chapters/${index}`);
      initialProgress.current = null;
      setChapterIndex(index);
      setChapter(data.chapter);
      setLoading(false);
      api("/progress", { method: "POST", body: { bookId, chapterIndex: index, paragraphIndex: 0, charOffset: 0, scrollRatio: 0 } }).catch(() => {
      });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  const selectionFromRange = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const text = sel.toString().trim();
    if (!text) return null;
    if (!contentRef.current?.contains(sel.anchorNode) || !contentRef.current?.contains(sel.focusNode)) return null;
    if (text.length > 2e3) {
      notify("\u9009\u4E2D\u6587\u5B57\u592A\u957F\uFF0C\u8BF7\u5206\u6BB5\u7FFB\u8BD1", true);
      return null;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const container = range.startContainer.nodeType === 3 ? range.startContainer.parentElement : range.startContainer;
    const paragraph = container?.closest?.("p");
    const sentence = paragraph ? sentenceAround(paragraph.innerText, text) : text;
    return {
      text,
      kind: text.split(/\s+/).length > 2 ? "sentence" : "word",
      sentence,
      rect: { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right }
    };
  };
  const handleContextMenu = (event) => {
    event.preventDefault();
    const candidate = selectionFromRange() ?? wordAtPoint(event.clientX, event.clientY);
    if (!candidate) {
      setMenu(null);
      return;
    }
    setSelection(candidate);
    setLookup(null);
    setDictionary(null);
    setMenu({ x: event.clientX, y: event.clientY });
  };
  const openDictionary = () => {
    if (!selection) return;
    setDictionary(selection);
    setLookup(null);
    setMenu(null);
  };
  const openLookup = () => {
    if (!selection) return;
    setLookup(selection);
    setDictionary(null);
    setMenu(null);
  };
  const saveSelection = async () => {
    if (!selection) return;
    setSavingSelection(true);
    try {
      const payload = {
        term: selection.text,
        kind: selection.kind,
        translations: [],
        definitions: [],
        phonetic: "",
        context: {
          bookId,
          chapterIndex,
          chapterTitle: chapter?.title ?? "",
          sentence: selection.sentence || selection.text
        }
      };
      if (selection.kind === "word") {
        try {
          const query = new URLSearchParams({ word: selection.text, bookId, chapterIndex: String(chapterIndex), chapterTitle: chapter?.title ?? "" });
          const dictionary2 = await api(`/dictionary?${query.toString()}`);
          if (dictionary2.found) {
            payload.term = dictionary2.word;
            payload.translations = dictionary2.definitions.map((row) => row.meaning).slice(0, 3);
            payload.definitions = dictionary2.definitions.map((row) => ({
              pos: row.pos,
              text: row.meaning,
              example: dictionary2.englishDefinitions?.[0]?.examples?.[0] ?? ""
            }));
            payload.phonetic = dictionary2.phonetics?.uk?.text || dictionary2.phonetics?.us?.text || "";
          }
        } catch {
        }
      }
      if (!payload.translations.length) {
        const translated = await api("/translate", {
          method: "POST",
          body: {
            text: selection.text,
            kind: selection.kind,
            bookId,
            chapterIndex,
            chapterTitle: chapter?.title ?? ""
          }
        });
        payload.translations = translated.translation ? [translated.translation] : [];
        payload.phonetic = payload.phonetic || translated.phonetic || "";
        payload.definitions = payload.definitions.length ? payload.definitions : translated.definitions ?? [];
      }
      const saved = await api("/vocab", { method: "POST", body: payload });
      notify(saved.created ? "\u5DF2\u52A0\u5165\u751F\u8BCD\u672C" : "\u8FD9\u4E2A\u8BCD\u5DF2\u7ECF\u5728\u751F\u8BCD\u672C\u91CC\u4E86");
      setMenu(null);
    } catch (err) {
      notify(err.message, true);
    } finally {
      setSavingSelection(false);
    }
  };
  const copySelection = () => {
    if (!selection) return;
    navigator.clipboard?.writeText(selection.text).then(() => notify("\u5DF2\u590D\u5236")).catch(() => {
    });
    setMenu(null);
  };
  const openDrawer = async (name) => {
    const next = drawer === name ? null : name;
    setDrawer(next);
    setMenu(null);
    if (next === "vocab") {
      try {
        const data = await api(`/vocab?bookId=${bookId}`);
        setBookVocab(data.vocab ?? []);
      } catch {
      }
    }
  };
  const saveReadingSettings = (patch) => {
    clearTimeout(settingsTimer.current);
    settingsTimer.current = setTimeout(() => {
      api("/settings", { method: "PATCH", body: patch }).catch(() => {
      });
    }, 500);
  };
  const title = detail?.book?.title ?? "";
  const chapters = detail?.chapters ?? [];
  const readingStyle = (0, import_react3.useMemo)(() => ({
    "--nr-reading-size": `${fontSize}px`,
    "--nr-reading-leading": lineHeight,
    "--nr-reading-width": `${readingWidth}px`,
    "--nr-reading-font": 'Georgia, "Times New Roman", serif'
  }), [fontSize, lineHeight, readingWidth]);
  return /* @__PURE__ */ import_react3.default.createElement("div", { className: `nr-reader nr-theme-${theme}` }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-reader-top" }, /* @__PURE__ */ import_react3.default.createElement(Button, { variant: "ghost", size: "small", onClick: onBack, title: "\u8FD4\u56DE\u4E66\u67B6" }, /* @__PURE__ */ import_react3.default.createElement(Icon, { name: "arrowLeft", size: 15 }), " \u4E66\u67B6"), /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-reader-title" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-reader-book" }, title), /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-reader-chapter" }, chapter?.title ?? "\u52A0\u8F7D\u4E2D\u2026")), /* @__PURE__ */ import_react3.default.createElement(Button, { variant: "ghost", size: "small", onClick: () => openDrawer("toc") }, "\u76EE\u5F55"), /* @__PURE__ */ import_react3.default.createElement(Button, { variant: "ghost", size: "small", onClick: () => openDrawer("type") }, "Aa"), /* @__PURE__ */ import_react3.default.createElement(Button, { variant: "ghost", size: "small", onClick: () => openDrawer("vocab") }, "\u751F\u8BCD ", bookVocab.length ? `(${bookVocab.length})` : ""), /* @__PURE__ */ import_react3.default.createElement(Button, { variant: "ghost", size: "small", onClick: () => loadChapter(chapterIndex + 1), disabled: chapterIndex + 1 >= (detail?.book?.chapterCount ?? 0) }, "\u4E0B\u4E00\u7AE0")), /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-reader-main" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-reader-scroll", ref: scrollRef, onScroll: scheduleSave }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-reader-tip" }, "\u5355\u8BCD\uFF1A\u9009\u4E2D\u540E\u53F3\u952E\u67E5\u8BCD\u5178 \xB7 \u53E5\u5B50\uFF1A\u62D6\u9009\u540E\u53F3\u952E\u7FFB\u8BD1\u6574\u53E5"), error ? /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-empty", style: { maxWidth: 620, margin: "40px auto" } }, /* @__PURE__ */ import_react3.default.createElement("h3", null, "\u8FD9\u4E00\u7AE0\u6253\u4E0D\u5F00"), /* @__PURE__ */ import_react3.default.createElement("p", null, error), /* @__PURE__ */ import_react3.default.createElement(Button, { onClick: () => loadChapter(chapterIndex) }, "\u91CD\u8BD5")) : null, loading && !chapter ? /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-loading" }, "\u6B63\u5728\u6253\u5F00\u8FD9\u4E00\u7AE0\u2026") : null, chapter ? /* @__PURE__ */ import_react3.default.createElement(
    "div",
    {
      className: "nr-reading",
      ref: contentRef,
      style: readingStyle,
      onContextMenu: handleContextMenu,
      dangerouslySetInnerHTML: { __html: chapter.html }
    }
  ) : null)), /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-reader-foot" }, /* @__PURE__ */ import_react3.default.createElement(Button, { variant: "ghost", size: "small", onClick: () => loadChapter(chapterIndex - 1), disabled: chapterIndex <= 0 }, "\u4E0A\u4E00\u7AE0"), /* @__PURE__ */ import_react3.default.createElement("span", null, "\u7B2C ", chapterIndex + 1, " / ", detail?.book?.chapterCount ?? "?", " \u7AE0"), /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-progress" }, /* @__PURE__ */ import_react3.default.createElement("i", { style: { width: `${chapterPercent}%` } })), /* @__PURE__ */ import_react3.default.createElement("span", null, "\u672C\u7AE0 ", chapterPercent, "%"), /* @__PURE__ */ import_react3.default.createElement(Button, { variant: "ghost", size: "small", onClick: () => loadChapter(chapterIndex + 1), disabled: chapterIndex + 1 >= (detail?.book?.chapterCount ?? 0) }, "\u4E0B\u4E00\u7AE0")), drawer === "toc" ? /* @__PURE__ */ import_react3.default.createElement(Drawer, { title: "\u76EE\u5F55", onClose: () => setDrawer(null) }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-chapter-list" }, chapters.map((row) => /* @__PURE__ */ import_react3.default.createElement(
    "button",
    {
      key: row.index,
      type: "button",
      className: `nr-chapter-item ${row.index === chapterIndex ? "is-on" : ""}`,
      onClick: () => loadChapter(row.index)
    },
    /* @__PURE__ */ import_react3.default.createElement("span", { className: "nr-chapter-number" }, row.index + 1),
    /* @__PURE__ */ import_react3.default.createElement("span", null, row.title)
  )))) : null, drawer === "type" ? /* @__PURE__ */ import_react3.default.createElement(Drawer, { title: "\u9605\u8BFB\u6392\u7248", onClose: () => setDrawer(null) }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-type-row" }, /* @__PURE__ */ import_react3.default.createElement("span", null, "\u5B57\u53F7"), /* @__PURE__ */ import_react3.default.createElement("input", { type: "range", min: "14", max: "26", step: "1", value: fontSize, onChange: (event) => {
    const value = Number(event.target.value);
    setFontSize(value);
    saveReadingSettings({ fontSize: value });
  } }), /* @__PURE__ */ import_react3.default.createElement("output", null, fontSize)), /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-type-row" }, /* @__PURE__ */ import_react3.default.createElement("span", null, "\u884C\u9AD8"), /* @__PURE__ */ import_react3.default.createElement("input", { type: "range", min: "1.4", max: "2.4", step: "0.1", value: lineHeight, onChange: (event) => {
    const value = Number(event.target.value);
    setLineHeight(value);
    saveReadingSettings({ lineHeight: value });
  } }), /* @__PURE__ */ import_react3.default.createElement("output", null, lineHeight)), /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-type-row" }, /* @__PURE__ */ import_react3.default.createElement("span", null, "\u9875\u5BBD"), /* @__PURE__ */ import_react3.default.createElement("input", { type: "range", min: "540", max: "920", step: "20", value: readingWidth, onChange: (event) => {
    const value = Number(event.target.value);
    setReadingWidth(value);
    saveReadingSettings({ maxWidth: value });
  } }), /* @__PURE__ */ import_react3.default.createElement("output", null, readingWidth)), /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-type-row", style: { marginTop: 16 } }, /* @__PURE__ */ import_react3.default.createElement("span", null, "\u4E3B\u9898")), /* @__PURE__ */ import_react3.default.createElement("div", { className: "nr-segment" }, [["paper", "\u7EB8\u5F20"], ["sepia", "\u6696\u9EC4"], ["night", "\u591C\u95F4"]].map(([value, label]) => /* @__PURE__ */ import_react3.default.createElement("button", { key: value, type: "button", className: theme === value ? "is-on" : "", onClick: () => {
    setTheme(value);
    saveReadingSettings({ theme: value });
  } }, label))), /* @__PURE__ */ import_react3.default.createElement("p", { className: "nr-sub", style: { marginTop: 18 } }, "\u6392\u7248\u8BBE\u7F6E\u4F1A\u4FDD\u5B58\uFF0C\u4E0B\u6B21\u6253\u5F00\u9605\u8BFB\u5668\u7EE7\u7EED\u4F7F\u7528\u3002")) : null, drawer === "vocab" ? /* @__PURE__ */ import_react3.default.createElement(Drawer, { title: "\u672C\u4E66\u751F\u8BCD", onClose: () => setDrawer(null) }, /* @__PURE__ */ import_react3.default.createElement("p", { className: "nr-sub", style: { marginTop: 0 } }, bookVocab.length ? `\u5171 ${bookVocab.length} \u4E2A\u8BCD` : "\u8FD9\u672C\u4E66\u8FD8\u6CA1\u6709\u6536\u85CF\u751F\u8BCD"), bookVocab.slice(0, 200).map((entry) => /* @__PURE__ */ import_react3.default.createElement("div", { key: entry.id, className: "nr-context", style: { margin: "8px 0" } }, /* @__PURE__ */ import_react3.default.createElement("b", null, entry.term), entry.phonetic ? /* @__PURE__ */ import_react3.default.createElement("span", { className: "nr-vocab-phonetic", style: { marginLeft: 8 } }, entry.phonetic) : null, /* @__PURE__ */ import_react3.default.createElement("div", null, entry.translations?.join("\uFF1B") || entry.definitions?.[0]?.text || "")))) : null, menu && selection ? /* @__PURE__ */ import_react3.default.createElement(
    SelectionMenu,
    {
      menu,
      selection,
      saving: savingSelection,
      onClose: () => setMenu(null),
      onDictionary: openDictionary,
      onTranslate: openLookup,
      onSave: saveSelection,
      onCopy: copySelection
    }
  ) : null, dictionary && detail ? /* @__PURE__ */ import_react3.default.createElement(
    DictionaryPopover,
    {
      selection: dictionary,
      book: detail.book,
      chapterIndex,
      chapterTitle: chapter?.title ?? "",
      onClose: () => setDictionary(null),
      notify
    }
  ) : null, lookup && detail ? /* @__PURE__ */ import_react3.default.createElement(
    LookupPopover,
    {
      selection: lookup,
      book: detail.book,
      chapterIndex,
      chapterTitle: chapter?.title ?? "",
      onClose: () => setLookup(null),
      notify
    }
  ) : null);
}

// src-client/vocab.jsx
var import_react4 = __toESM(require("react"), 1);
function VocabDrawer({ entry, books, onClose, onRefresh, notify }) {
  const [notes, setNotes] = (0, import_react4.useState)(entry.notes ?? "");
  const [tags, setTags] = (0, import_react4.useState)((entry.tags ?? []).join(", "));
  const [busy, setBusy] = (0, import_react4.useState)(false);
  const bookTitle = (id) => books.find((book) => book.id === id)?.title ?? "\u672A\u77E5\u4E66\u7C4D";
  const patch = async (body, message) => {
    setBusy(true);
    try {
      await api(`/vocab/${entry.id}`, { method: "PATCH", body });
      if (message) notify(message);
      await onRefresh();
    } catch (error) {
      notify(error.message, true);
    } finally {
      setBusy(false);
    }
  };
  const review = async (rating) => {
    setBusy(true);
    try {
      await api(`/vocab/${entry.id}/review`, { method: "POST", body: { rating } });
      notify("\u590D\u4E60\u8BB0\u5F55\u5DF2\u4FDD\u5B58");
      await onRefresh();
      onClose();
    } catch (error) {
      notify(error.message, true);
    } finally {
      setBusy(false);
    }
  };
  const remove = async () => {
    setBusy(true);
    try {
      await api(`/vocab/${entry.id}`, { method: "DELETE" });
      notify("\u5DF2\u5220\u9664");
      await onRefresh();
      onClose();
    } catch (error) {
      notify(error.message, true);
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ import_react4.default.createElement(Drawer, { title: entry.term, onClose }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "nr-row", style: { marginBottom: 4 } }, /* @__PURE__ */ import_react4.default.createElement(StatusChip, { status: entry.status }), entry.phonetic ? /* @__PURE__ */ import_react4.default.createElement("span", { className: "nr-vocab-phonetic" }, entry.phonetic) : null, /* @__PURE__ */ import_react4.default.createElement("span", { className: "nr-sub", style: { marginLeft: "auto" } }, "\u4E0B\u6B21\u590D\u4E60 ", relativeTime(entry.srs?.dueAt))), /* @__PURE__ */ import_react4.default.createElement("p", { style: { fontSize: 16, lineHeight: "25px", margin: "10px 0 4px" } }, entry.translations?.join("\uFF1B") || "\u8FD8\u6CA1\u6709\u91CA\u4E49"), entry.definitions?.length ? /* @__PURE__ */ import_react4.default.createElement("ul", { className: "nr-pop-defs" }, entry.definitions.map((row, index) => /* @__PURE__ */ import_react4.default.createElement("li", { key: index }, /* @__PURE__ */ import_react4.default.createElement("b", null, row.pos || "def."), " ", row.text))) : null, /* @__PURE__ */ import_react4.default.createElement("div", { className: "nr-section" }, /* @__PURE__ */ import_react4.default.createElement("h3", null, "\u51FA\u73B0\u7684\u4E0A\u4E0B\u6587"), (entry.contexts ?? []).length ? entry.contexts.map((context, index) => /* @__PURE__ */ import_react4.default.createElement("div", { className: "nr-context", key: index }, /* @__PURE__ */ import_react4.default.createElement("b", null, bookTitle(context.bookId)), " \xB7 ", context.chapterTitle || `\u7B2C ${(context.chapterIndex ?? 0) + 1} \u7AE0`, /* @__PURE__ */ import_react4.default.createElement("div", null, context.sentence))) : /* @__PURE__ */ import_react4.default.createElement("p", { className: "nr-sub" }, "\u8FD8\u6CA1\u6709\u4E0A\u4E0B\u6587\u3002")), /* @__PURE__ */ import_react4.default.createElement("div", { className: "nr-section" }, /* @__PURE__ */ import_react4.default.createElement("h3", null, "\u7B14\u8BB0\u4E0E\u6807\u7B7E"), /* @__PURE__ */ import_react4.default.createElement("div", { style: { display: "flex", flexDirection: "column", gap: 10 } }, /* @__PURE__ */ import_react4.default.createElement(Field, { label: "\u7B14\u8BB0" }, /* @__PURE__ */ import_react4.default.createElement("textarea", { className: "nr-textarea", value: notes, onChange: (event) => setNotes(event.target.value), placeholder: "\u8BB0\u4E0B\u8FD9\u4E2A\u8BCD\u7684\u7528\u6CD5\u3001\u8054\u60F3\u6216\u6613\u6DF7\u6DC6\u70B9" })), /* @__PURE__ */ import_react4.default.createElement(Field, { label: "\u6807\u7B7E", hint: "\u7528\u9017\u53F7\u5206\u9694" }, /* @__PURE__ */ import_react4.default.createElement("input", { className: "nr-input", value: tags, onChange: (event) => setTags(event.target.value) })), /* @__PURE__ */ import_react4.default.createElement("div", { className: "nr-row" }, /* @__PURE__ */ import_react4.default.createElement(Button, { variant: "primary", size: "small", disabled: busy, onClick: () => patch({ notes, tags: tags.split(/[,，]/).map((tag) => tag.trim()).filter(Boolean) }, "\u7B14\u8BB0\u5DF2\u4FDD\u5B58") }, "\u4FDD\u5B58\u7B14\u8BB0")))), /* @__PURE__ */ import_react4.default.createElement("div", { className: "nr-section" }, /* @__PURE__ */ import_react4.default.createElement("h3", null, "\u590D\u4E60\u6253\u5206"), /* @__PURE__ */ import_react4.default.createElement("p", null, "\u6309\u4F60\u7684\u5B9E\u9645\u8BB0\u5FC6\u7A0B\u5EA6\u9009\u62E9\uFF0C\u7CFB\u7EDF\u4F1A\u8C03\u6574\u4E0B\u6B21\u51FA\u73B0\u7684\u65F6\u95F4\u3002"), /* @__PURE__ */ import_react4.default.createElement("div", { className: "nr-row" }, /* @__PURE__ */ import_react4.default.createElement(Button, { size: "small", variant: "danger", disabled: busy, onClick: () => review("again") }, "\u5FD8\u4E86"), /* @__PURE__ */ import_react4.default.createElement(Button, { size: "small", disabled: busy, onClick: () => review("hard") }, "\u6709\u70B9\u96BE"), /* @__PURE__ */ import_react4.default.createElement(Button, { size: "small", variant: "primary", disabled: busy, onClick: () => review("good") }, "\u8BB0\u5F97"), /* @__PURE__ */ import_react4.default.createElement(Button, { size: "small", disabled: busy, onClick: () => review("easy") }, "\u5F88\u7B80\u5355"))), /* @__PURE__ */ import_react4.default.createElement("div", { className: "nr-section" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "nr-row" }, /* @__PURE__ */ import_react4.default.createElement(Button, { variant: "danger", size: "small", disabled: busy, onClick: remove }, "\u5220\u9664\u8FD9\u4E2A\u8BCD"))));
}
function VocabView({ state, notify, onRefresh, onPractice }) {
  const [list, setList] = (0, import_react4.useState)([]);
  const [total, setTotal] = (0, import_react4.useState)(0);
  const [query, setQuery] = (0, import_react4.useState)("");
  const [status, setStatus] = (0, import_react4.useState)("");
  const [dueOnly, setDueOnly] = (0, import_react4.useState)(false);
  const [bookId, setBookId] = (0, import_react4.useState)("");
  const [selected, setSelected] = (0, import_react4.useState)(null);
  const [loading, setLoading] = (0, import_react4.useState)(true);
  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (status) params.set("status", status);
      if (dueOnly) params.set("due", "1");
      if (bookId) params.set("bookId", bookId);
      const data = await api(`/vocab?${params.toString()}`);
      setList(data.vocab ?? []);
      setTotal(data.total ?? 0);
    } catch (error) {
      notify(error.message, true);
    } finally {
      setLoading(false);
    }
  };
  (0, import_react4.useEffect)(() => {
    load();
  }, [query, status, dueOnly, bookId]);
  const exportCsv = () => {
    const rows = [["\u5355\u8BCD", "\u97F3\u6807", "\u91CA\u4E49", "\u72B6\u6001", "\u6765\u6E90", "\u6DFB\u52A0\u65F6\u95F4"]];
    for (const entry of list) {
      const source = entry.contexts?.[0];
      rows.push([
        entry.term,
        entry.phonetic ?? "",
        entry.translations?.join("\uFF1B") ?? "",
        entry.status,
        source ? `${state.books.find((book) => book.id === source.bookId)?.title ?? ""} ${source.chapterTitle ?? ""}` : "",
        entry.createdAt
      ]);
    }
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "novel-reader-vocab.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const canPractice = (state.vocabCount ?? 0) >= 2;
  return /* @__PURE__ */ import_react4.default.createElement("div", { className: "nr-page" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "nr-page-head" }, /* @__PURE__ */ import_react4.default.createElement("div", null, /* @__PURE__ */ import_react4.default.createElement("h1", { className: "nr-title" }, "\u751F\u8BCD\u672C"), /* @__PURE__ */ import_react4.default.createElement("p", { className: "nr-sub" }, "\u6309\u8BCD\u5143\u53BB\u91CD\uFF0C\u540C\u4E00\u4E2A\u8BCD\u7684\u591A\u4E2A\u4E0A\u4E0B\u6587\u4F1A\u5408\u5E76\u5728\u4E00\u8D77")), /* @__PURE__ */ import_react4.default.createElement("div", { className: "nr-head-actions" }, /* @__PURE__ */ import_react4.default.createElement(Button, { onClick: exportCsv, disabled: !list.length }, "\u5BFC\u51FA CSV"), /* @__PURE__ */ import_react4.default.createElement(Button, { variant: "primary", onClick: () => onPractice({ type: "due" }), disabled: !canPractice }, canPractice ? `\u5F00\u59CB\u590D\u4E60 ${state.dueCount ? `(${state.dueCount})` : ""}` : "\u518D\u6536 1 \u4E2A\u8BCD\u5C31\u80FD\u7EC3\u4E60"))), /* @__PURE__ */ import_react4.default.createElement("div", { className: "nr-stat-row" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "nr-stat" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "nr-stat-value" }, state.vocabCount ?? total), /* @__PURE__ */ import_react4.default.createElement("div", { className: "nr-stat-label" }, "\u5168\u90E8\u751F\u8BCD")), /* @__PURE__ */ import_react4.default.createElement("div", { className: "nr-stat" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "nr-stat-value" }, state.dueCount ?? 0), /* @__PURE__ */ import_react4.default.createElement("div", { className: "nr-stat-label" }, "\u4ECA\u65E5\u5230\u671F")), /* @__PURE__ */ import_react4.default.createElement("div", { className: "nr-stat" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "nr-stat-value" }, list.filter((entry) => entry.status === "mastered").length), /* @__PURE__ */ import_react4.default.createElement("div", { className: "nr-stat-label" }, "\u5F53\u524D\u5217\u8868\u5DF2\u638C\u63E1")), /* @__PURE__ */ import_react4.default.createElement("div", { className: "nr-stat" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "nr-stat-value" }, list.filter((entry) => Date.parse(entry.createdAt) > Date.now() - 7 * 864e5).length), /* @__PURE__ */ import_react4.default.createElement("div", { className: "nr-stat-label" }, "\u8FD1 7 \u5929\u65B0\u589E"))), /* @__PURE__ */ import_react4.default.createElement("div", { className: "nr-toolbar" }, /* @__PURE__ */ import_react4.default.createElement("input", { className: "nr-input", placeholder: "\u641C\u7D22\u5355\u8BCD\u6216\u91CA\u4E49", value: query, onChange: (event) => setQuery(event.target.value) }), /* @__PURE__ */ import_react4.default.createElement("select", { className: "nr-select", value: status, onChange: (event) => setStatus(event.target.value) }, /* @__PURE__ */ import_react4.default.createElement("option", { value: "" }, "\u5168\u90E8\u72B6\u6001"), /* @__PURE__ */ import_react4.default.createElement("option", { value: "new" }, "\u65B0\u8BCD"), /* @__PURE__ */ import_react4.default.createElement("option", { value: "learning" }, "\u5B66\u4E60\u4E2D"), /* @__PURE__ */ import_react4.default.createElement("option", { value: "review" }, "\u590D\u4E60\u4E2D"), /* @__PURE__ */ import_react4.default.createElement("option", { value: "mastered" }, "\u5DF2\u638C\u63E1")), /* @__PURE__ */ import_react4.default.createElement("select", { className: "nr-select", value: bookId, onChange: (event) => setBookId(event.target.value) }, /* @__PURE__ */ import_react4.default.createElement("option", { value: "" }, "\u5168\u90E8\u4E66\u7C4D"), state.books.map((book) => /* @__PURE__ */ import_react4.default.createElement("option", { key: book.id, value: book.id }, book.title))), /* @__PURE__ */ import_react4.default.createElement(Button, { variant: dueOnly ? "primary" : "", size: "small", onClick: () => setDueOnly((value) => !value) }, "\u53EA\u770B\u4ECA\u65E5\u5230\u671F"), /* @__PURE__ */ import_react4.default.createElement("span", { className: "nr-sub", style: { marginLeft: "auto" } }, loading ? "\u52A0\u8F7D\u4E2D\u2026" : `${total} \u4E2A\u8BCD`)), list.length ? /* @__PURE__ */ import_react4.default.createElement("div", { className: "nr-vocab-list" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "nr-vocab-row is-head" }, /* @__PURE__ */ import_react4.default.createElement("span", { className: "nr-vocab-word" }, "\u5355\u8BCD"), /* @__PURE__ */ import_react4.default.createElement("span", { className: "nr-vocab-phonetic" }, "\u97F3\u6807"), /* @__PURE__ */ import_react4.default.createElement("span", { className: "nr-vocab-trans" }, "\u91CA\u4E49"), /* @__PURE__ */ import_react4.default.createElement("span", { className: "nr-vocab-source" }, "\u6765\u6E90"), /* @__PURE__ */ import_react4.default.createElement("span", { className: "nr-chip" }, "\u72B6\u6001")), list.map((entry) => {
    const context = entry.contexts?.[0];
    const source = context ? state.books.find((book) => book.id === context.bookId) : null;
    return /* @__PURE__ */ import_react4.default.createElement("button", { type: "button", className: "nr-vocab-row", key: entry.id, onClick: () => setSelected(entry) }, /* @__PURE__ */ import_react4.default.createElement("span", { className: "nr-vocab-word" }, entry.term), /* @__PURE__ */ import_react4.default.createElement("span", { className: "nr-vocab-phonetic" }, entry.phonetic || ""), /* @__PURE__ */ import_react4.default.createElement("span", { className: "nr-vocab-trans" }, entry.translations?.join("\uFF1B") || entry.definitions?.[0]?.text || ""), /* @__PURE__ */ import_react4.default.createElement("span", { className: "nr-vocab-source" }, source?.title ?? ""), /* @__PURE__ */ import_react4.default.createElement(StatusChip, { status: entry.status }));
  })) : /* @__PURE__ */ import_react4.default.createElement(Empty, { title: "\u8FD8\u6CA1\u6709\u751F\u8BCD" }, "\u5728\u9605\u8BFB\u5668\u91CC\u53CC\u51FB\u5355\u8BCD\u6216\u5212\u9009\u53E5\u5B50\uFF0C\u5C31\u53EF\u4EE5\u628A\u8BCD\u548C\u539F\u53E5\u4E00\u8D77\u6536\u8FDB\u6765\u3002"), selected ? /* @__PURE__ */ import_react4.default.createElement(
    VocabDrawer,
    {
      entry: selected,
      books: state.books,
      onClose: () => setSelected(null),
      onRefresh,
      notify
    }
  ) : null);
}

// src-client/practice.jsx
var import_react5 = __toESM(require("react"), 1);
var TYPE_OPTIONS = [
  ["meaning-en-zh", "\u82F1\u8BD1\u4E2D\u9009\u62E9\u9898"],
  ["meaning-zh-en", "\u4E2D\u8BD1\u82F1\u9009\u62E9\u9898"],
  ["cloze", "\u4F8B\u53E5\u586B\u7A7A"],
  ["spelling", "\u62FC\u5199\u9898"],
  ["context", "\u8BED\u5883\u7406\u89E3"]
];
function PracticeView({ state, notify, onRefresh, initialScope }) {
  const [scopeType, setScopeType] = (0, import_react5.useState)("due");
  const [bookId, setBookId] = (0, import_react5.useState)("");
  const [tag, setTag] = (0, import_react5.useState)("");
  const [count, setCount] = (0, import_react5.useState)(10);
  const [types, setTypes] = (0, import_react5.useState)(["meaning-en-zh", "meaning-zh-en", "cloze", "spelling"]);
  const [busy, setBusy] = (0, import_react5.useState)(false);
  const [quiz, setQuiz] = (0, import_react5.useState)(null);
  const [index, setIndex] = (0, import_react5.useState)(0);
  const [answers, setAnswers] = (0, import_react5.useState)({});
  const [feedback, setFeedback] = (0, import_react5.useState)({});
  const [textAnswer, setTextAnswer] = (0, import_react5.useState)("");
  const [result, setResult] = (0, import_react5.useState)(null);
  (0, import_react5.useEffect)(() => {
    if (!initialScope) return;
    setScopeType(initialScope.type ?? "due");
    if (initialScope.bookId) setBookId(initialScope.bookId);
    if (initialScope.tag) setTag(initialScope.tag);
  }, [initialScope]);
  const scope = (0, import_react5.useMemo)(() => {
    if (scopeType === "book") return { type: "book", bookId };
    if (scopeType === "tag") return { type: "tag", tag };
    if (scopeType === "recent") return { type: "recent" };
    if (scopeType === "all") return { type: "all" };
    return { type: "due" };
  }, [scopeType, bookId, tag]);
  const generate = async () => {
    if (!types.length) return notify("\u81F3\u5C11\u9009\u62E9\u4E00\u79CD\u9898\u578B", true);
    setBusy(true);
    try {
      const data = await api("/quiz/generate", { method: "POST", body: { scope, count, types } });
      setQuiz(data.quiz);
      setIndex(0);
      setAnswers({});
      setFeedback({});
      setTextAnswer("");
      setResult(null);
    } catch (error) {
      notify(error.message, true);
    } finally {
      setBusy(false);
    }
  };
  const question = quiz?.questions?.[index];
  const currentFeedback = question ? feedback[question.id] : null;
  const answerChoice = async (choice) => {
    if (!question || currentFeedback) return;
    try {
      const data = await api(`/quiz/${quiz.id}/answer`, { method: "POST", body: { questionId: question.id, choice } });
      setAnswers((value) => ({ ...value, [question.id]: { choice } }));
      setFeedback((value) => ({ ...value, [question.id]: data }));
    } catch (error) {
      notify(error.message, true);
    }
  };
  const answerText = async () => {
    if (!question || !textAnswer.trim() || currentFeedback) return;
    try {
      const data = await api(`/quiz/${quiz.id}/answer`, { method: "POST", body: { questionId: question.id, text: textAnswer } });
      setAnswers((value) => ({ ...value, [question.id]: { text: textAnswer } }));
      setFeedback((value) => ({ ...value, [question.id]: data }));
    } catch (error) {
      notify(error.message, true);
    }
  };
  const next = async () => {
    if (index + 1 < quiz.questions.length) {
      setIndex(index + 1);
      setTextAnswer("");
      return;
    }
    setBusy(true);
    try {
      const payload = quiz.questions.map((row) => ({ questionId: row.id, ...answers[row.id] ?? {} }));
      const data = await api(`/quiz/${quiz.id}/finish`, { method: "POST", body: { answers: payload } });
      setResult(data);
      await onRefresh();
    } catch (error) {
      notify(error.message, true);
    } finally {
      setBusy(false);
    }
  };
  if (result) {
    const wrong = result.results.filter((row) => !row.correct);
    const questionMap = new Map(quiz.questions.map((row) => [row.id, row]));
    return /* @__PURE__ */ import_react5.default.createElement("div", { className: "nr-page", style: { maxWidth: 840 } }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "nr-result" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "nr-score" }, Math.round(result.score * 100), /* @__PURE__ */ import_react5.default.createElement("small", null, " \u5206")), /* @__PURE__ */ import_react5.default.createElement("p", { className: "nr-sub", style: { fontSize: 13 } }, "\u7B54\u5BF9 ", result.results.length - wrong.length, " / ", result.results.length, " \u9898"), /* @__PURE__ */ import_react5.default.createElement("div", { className: "nr-row", style: { justifyContent: "center", margin: "18px 0 26px" } }, /* @__PURE__ */ import_react5.default.createElement(Button, { variant: "primary", onClick: () => {
      setQuiz(null);
      setResult(null);
    } }, "\u518D\u7EC3\u4E00\u7EC4"), /* @__PURE__ */ import_react5.default.createElement(Button, { onClick: () => {
      setQuiz(null);
      setResult(null);
      setScopeType("due");
    } }, "\u8FD4\u56DE\u7EC3\u4E60"))), wrong.length ? /* @__PURE__ */ import_react5.default.createElement("div", { className: "nr-card" }, /* @__PURE__ */ import_react5.default.createElement("h3", { style: { marginTop: 0 } }, "\u8FD9 ", wrong.length, " \u4E2A\u8BCD\u8FD8\u9700\u8981\u518D\u770B\u770B"), wrong.map((row) => {
      const source = questionMap.get(row.questionId);
      return /* @__PURE__ */ import_react5.default.createElement("div", { className: "nr-context", key: row.questionId }, /* @__PURE__ */ import_react5.default.createElement("b", null, source?.term), /* @__PURE__ */ import_react5.default.createElement("div", null, source?.explanation));
    })) : null);
  }
  if (quiz && question) {
    return /* @__PURE__ */ import_react5.default.createElement("div", { className: "nr-page", style: { maxWidth: 840 } }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "nr-page-head" }, /* @__PURE__ */ import_react5.default.createElement("div", null, /* @__PURE__ */ import_react5.default.createElement("h1", { className: "nr-title" }, "\u7EC3\u4E60"), /* @__PURE__ */ import_react5.default.createElement("p", { className: "nr-sub" }, quiz.engine === "model" ? "\u7531\u5F53\u524D\u6A21\u578B\u51FA\u9898" : "\u672C\u5730\u9898\u5E93\u6A21\u5F0F", " \xB7 \u5171 ", quiz.questions.length, " \u9898")), /* @__PURE__ */ import_react5.default.createElement("div", { className: "nr-head-actions" }, /* @__PURE__ */ import_react5.default.createElement(Button, { onClick: () => setQuiz(null) }, "\u9000\u51FA\u7EC3\u4E60"))), /* @__PURE__ */ import_react5.default.createElement("div", { className: "nr-quiz", style: { maxWidth: "none" } }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "nr-row", style: { marginBottom: 12, width: "100%" } }, /* @__PURE__ */ import_react5.default.createElement("span", { className: "nr-sub" }, "\u7B2C ", index + 1, " / ", quiz.questions.length, " \u9898"), /* @__PURE__ */ import_react5.default.createElement("div", { className: "nr-progress", style: { flex: 1 } }, /* @__PURE__ */ import_react5.default.createElement("i", { style: { width: `${(index + 1) / quiz.questions.length * 100}%` } }))), /* @__PURE__ */ import_react5.default.createElement("div", { className: "nr-card" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "nr-question" }, question.prompt), question.type === "spelling" ? /* @__PURE__ */ import_react5.default.createElement("div", null, /* @__PURE__ */ import_react5.default.createElement("div", { className: "nr-row" }, /* @__PURE__ */ import_react5.default.createElement(
      "input",
      {
        className: "nr-input",
        style: { maxWidth: 320 },
        value: textAnswer,
        onChange: (event) => setTextAnswer(event.target.value),
        onKeyDown: (event) => {
          if (event.key === "Enter") answerText();
        },
        placeholder: "\u8F93\u5165\u5355\u8BCD",
        disabled: Boolean(currentFeedback)
      }
    ), /* @__PURE__ */ import_react5.default.createElement(Button, { variant: "primary", onClick: answerText, disabled: Boolean(currentFeedback) }, "\u68C0\u67E5")), currentFeedback ? /* @__PURE__ */ import_react5.default.createElement("div", { className: "nr-explain" }, currentFeedback.correct ? "\u62FC\u5199\u6B63\u786E\u3002" : `\u6B63\u786E\u7B54\u6848\u662F ${currentFeedback.answerText}\u3002`, " ", question.explanation) : null) : /* @__PURE__ */ import_react5.default.createElement("div", null, question.options.map((option, optionIndex) => {
      let className = "nr-option";
      if (currentFeedback) {
        if (optionIndex === currentFeedback.answer) className += " is-correct";
        else if (optionIndex === answers[question.id]?.choice) className += " is-wrong";
        else className += " is-muted";
      }
      return /* @__PURE__ */ import_react5.default.createElement("button", { key: optionIndex, type: "button", className, onClick: () => answerChoice(optionIndex), disabled: Boolean(currentFeedback) }, /* @__PURE__ */ import_react5.default.createElement("span", { className: "nr-letter" }, String.fromCharCode(65 + optionIndex)), /* @__PURE__ */ import_react5.default.createElement("span", null, option));
    }), currentFeedback ? /* @__PURE__ */ import_react5.default.createElement("div", { className: "nr-explain" }, currentFeedback.explanation) : null), /* @__PURE__ */ import_react5.default.createElement("div", { className: "nr-row", style: { justifyContent: "flex-end", marginTop: 16 } }, /* @__PURE__ */ import_react5.default.createElement(Button, { variant: "primary", onClick: next, disabled: !currentFeedback || busy }, index + 1 === quiz.questions.length ? "\u67E5\u770B\u7ED3\u679C" : "\u4E0B\u4E00\u9898")))));
  }
  return /* @__PURE__ */ import_react5.default.createElement("div", { className: "nr-page", style: { maxWidth: 840 } }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "nr-page-head" }, /* @__PURE__ */ import_react5.default.createElement("div", null, /* @__PURE__ */ import_react5.default.createElement("h1", { className: "nr-title" }, "\u7EC3\u4E60"), /* @__PURE__ */ import_react5.default.createElement("p", { className: "nr-sub" }, "\u4ECE\u751F\u8BCD\u672C\u751F\u6210\u7EC3\u4E60\uFF0C\u7B54\u9519\u7684\u8BCD\u4F1A\u81EA\u52A8\u63D0\u524D\u590D\u4E60"))), /* @__PURE__ */ import_react5.default.createElement("div", { className: "nr-card", style: { maxWidth: 840 } }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "nr-form-grid" }, /* @__PURE__ */ import_react5.default.createElement(Field, { label: "\u8303\u56F4" }, /* @__PURE__ */ import_react5.default.createElement("select", { className: "nr-select", value: scopeType, onChange: (event) => setScopeType(event.target.value) }, /* @__PURE__ */ import_react5.default.createElement("option", { value: "due" }, "\u4ECA\u65E5\u5230\u671F"), /* @__PURE__ */ import_react5.default.createElement("option", { value: "book" }, "\u67D0\u4E00\u672C\u4E66"), /* @__PURE__ */ import_react5.default.createElement("option", { value: "tag" }, "\u67D0\u4E2A\u6807\u7B7E"), /* @__PURE__ */ import_react5.default.createElement("option", { value: "recent" }, "\u6700\u8FD1\u65B0\u589E"), /* @__PURE__ */ import_react5.default.createElement("option", { value: "all" }, "\u5168\u90E8\u751F\u8BCD"))), scopeType === "book" ? /* @__PURE__ */ import_react5.default.createElement(Field, { label: "\u9009\u62E9\u4E66\u7C4D" }, /* @__PURE__ */ import_react5.default.createElement("select", { className: "nr-select", value: bookId, onChange: (event) => setBookId(event.target.value) }, /* @__PURE__ */ import_react5.default.createElement("option", { value: "" }, "\u8BF7\u9009\u62E9"), state.books.map((book) => /* @__PURE__ */ import_react5.default.createElement("option", { key: book.id, value: book.id }, book.title)))) : null, scopeType === "tag" ? /* @__PURE__ */ import_react5.default.createElement(Field, { label: "\u6807\u7B7E" }, /* @__PURE__ */ import_react5.default.createElement("input", { className: "nr-input", value: tag, onChange: (event) => setTag(event.target.value), placeholder: "\u4F8B\u5982 book:bk_xxx" })) : null, /* @__PURE__ */ import_react5.default.createElement(Field, { label: "\u9898\u91CF" }, /* @__PURE__ */ import_react5.default.createElement("select", { className: "nr-select", value: count, onChange: (event) => setCount(Number(event.target.value)) }, [5, 10, 15, 20].map((value) => /* @__PURE__ */ import_react5.default.createElement("option", { key: value, value }, value, " \u9898"))))), /* @__PURE__ */ import_react5.default.createElement("div", { className: "nr-section" }, /* @__PURE__ */ import_react5.default.createElement("h3", null, "\u9898\u578B"), /* @__PURE__ */ import_react5.default.createElement("div", { className: "nr-row", style: { gap: 14 } }, TYPE_OPTIONS.map(([value, label]) => /* @__PURE__ */ import_react5.default.createElement("label", { key: value, className: "nr-switch", style: { cursor: "pointer" } }, /* @__PURE__ */ import_react5.default.createElement(
    "input",
    {
      type: "checkbox",
      checked: types.includes(value),
      onChange: (event) => setTypes((current) => event.target.checked ? [...current, value] : current.filter((item) => item !== value))
    }
  ), /* @__PURE__ */ import_react5.default.createElement("span", null, label))))), /* @__PURE__ */ import_react5.default.createElement("div", { className: "nr-row", style: { justifyContent: "flex-end" } }, /* @__PURE__ */ import_react5.default.createElement(Button, { variant: "primary", onClick: generate, disabled: busy }, /* @__PURE__ */ import_react5.default.createElement(Icon, { name: "spark", size: 14 }), " ", busy ? "\u751F\u6210\u4E2D\u2026" : "\u751F\u6210\u7EC3\u4E60"))), /* @__PURE__ */ import_react5.default.createElement("div", { className: "nr-section" }, /* @__PURE__ */ import_react5.default.createElement("h3", null, "\u6700\u8FD1\u7EC3\u4E60"), (state.recentQuizzes ?? []).length ? state.recentQuizzes.map((row) => /* @__PURE__ */ import_react5.default.createElement("div", { className: "nr-history-row", key: row.id }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "nr-history-main" }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "nr-history-title" }, row.count, " \u9898 \xB7 ", row.engine === "model" ? "\u6A21\u578B\u51FA\u9898" : "\u672C\u5730\u9898\u5E93"), /* @__PURE__ */ import_react5.default.createElement("div", { className: "nr-history-meta" }, formatDate(row.createdAt))), /* @__PURE__ */ import_react5.default.createElement("span", { className: "nr-sub" }, row.score == null ? "\u672A\u5B8C\u6210" : `${Math.round(row.score * 100)} \u5206`))) : /* @__PURE__ */ import_react5.default.createElement("p", { className: "nr-sub" }, "\u8FD8\u6CA1\u6709\u7EC3\u4E60\u8BB0\u5F55\u3002")));
}

// src-client/history.jsx
var import_react6 = __toESM(require("react"), 1);
function Heatmap({ daily }) {
  const level = (minutes) => {
    if (!minutes) return 0;
    if (minutes < 15) return 1;
    if (minutes < 40) return 2;
    if (minutes < 90) return 3;
    return 4;
  };
  return /* @__PURE__ */ import_react6.default.createElement("div", null, /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-heatmap" }, (daily ?? []).map((row) => /* @__PURE__ */ import_react6.default.createElement("div", { key: row.day, className: "nr-heat-cell", "data-level": level(row.minutes), title: `${row.day} \xB7 ${row.minutes} \u5206\u949F` }))), /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-sub", style: { display: "flex", justifyContent: "space-between" } }, /* @__PURE__ */ import_react6.default.createElement("span", null, "\u6700\u8FD1 12 \u5468"), /* @__PURE__ */ import_react6.default.createElement("span", null, "\u5C11 \u2192 \u591A")));
}
function HistoryView({ notify }) {
  const [tab, setTab] = (0, import_react6.useState)("reading");
  const [stats, setStats] = (0, import_react6.useState)(null);
  const [rows, setRows] = (0, import_react6.useState)([]);
  const [loading, setLoading] = (0, import_react6.useState)(true);
  const load = async (nextTab = tab) => {
    setLoading(true);
    try {
      if (!stats) setStats(await api("/stats"));
      const data = await api(`/history?type=${nextTab}`);
      setRows(nextTab === "reading" ? data.sessions ?? [] : nextTab === "lookup" ? data.lookups ?? [] : data.attempts ?? []);
    } catch (error) {
      notify(error.message, true);
    } finally {
      setLoading(false);
    }
  };
  (0, import_react6.useEffect)(() => {
    load(tab);
  }, [tab]);
  return /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-page" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-page-head" }, /* @__PURE__ */ import_react6.default.createElement("div", null, /* @__PURE__ */ import_react6.default.createElement("h1", { className: "nr-title" }, "\u5386\u53F2"), /* @__PURE__ */ import_react6.default.createElement("p", { className: "nr-sub" }, "\u9605\u8BFB\u3001\u67E5\u8BCD\u548C\u7EC3\u4E60\u90FD\u8BB0\u5728\u8FD9\u91CC\uFF0C\u53EA\u4FDD\u5B58\u5728\u672C\u673A")), /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-head-actions" }, /* @__PURE__ */ import_react6.default.createElement(Button, { size: "small", onClick: () => {
    setStats(null);
    load(tab);
  } }, "\u5237\u65B0"))), stats ? /* @__PURE__ */ import_react6.default.createElement(import_react6.default.Fragment, null, /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-stat-row" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-stat" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-stat-value" }, formatMinutes(stats.todayMinutes)), /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-stat-label" }, "\u4ECA\u65E5\u9605\u8BFB")), /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-stat" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-stat-value" }, formatMinutes(stats.weekMinutes)), /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-stat-label" }, "\u672C\u5468\u9605\u8BFB")), /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-stat" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-stat-value" }, stats.streak, " \u5929"), /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-stat-label" }, "\u8FDE\u7EED\u9605\u8BFB")), /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-stat" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-stat-value" }, stats.totalLookups), /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-stat-label" }, "\u7D2F\u8BA1\u67E5\u8BCD")), /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-stat" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-stat-value" }, stats.totalQuizzes), /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-stat-label" }, "\u7EC3\u4E60\u6B21\u6570"))), /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-card", style: { marginBottom: 20 } }, /* @__PURE__ */ import_react6.default.createElement("h3", { style: { margin: "0 0 8px", fontSize: 14 } }, "\u9605\u8BFB\u70ED\u529B\u56FE"), /* @__PURE__ */ import_react6.default.createElement(Heatmap, { daily: stats.daily }))) : null, /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-toolbar" }, [["reading", "\u9605\u8BFB\u8BB0\u5F55"], ["lookup", "\u67E5\u8BCD\u8BB0\u5F55"], ["quiz", "\u7EC3\u4E60\u8BB0\u5F55"]].map(([value, label]) => /* @__PURE__ */ import_react6.default.createElement(Button, { key: value, variant: tab === value ? "primary" : "", size: "small", onClick: () => setTab(value) }, label)), /* @__PURE__ */ import_react6.default.createElement("span", { className: "nr-sub", style: { marginLeft: "auto" } }, loading ? "\u52A0\u8F7D\u4E2D\u2026" : `${rows.length} \u6761`)), /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-card" }, !rows.length && !loading ? /* @__PURE__ */ import_react6.default.createElement(Empty, { title: "\u8FD8\u6CA1\u6709\u8BB0\u5F55" }, tab === "reading" ? "\u6253\u5F00\u4E00\u672C\u4E66\u5F00\u59CB\u9605\u8BFB\uFF0C\u8FD9\u91CC\u5C31\u4F1A\u51FA\u73B0\u8BB0\u5F55\u3002" : tab === "lookup" ? "\u5728\u9605\u8BFB\u5668\u91CC\u67E5\u8BCD\u6216\u7FFB\u8BD1\u53E5\u5B50\uFF0C\u8FD9\u91CC\u5C31\u4F1A\u51FA\u73B0\u8BB0\u5F55\u3002" : "\u505A\u5B8C\u4E00\u7EC4\u7EC3\u4E60\uFF0C\u8FD9\u91CC\u5C31\u4F1A\u51FA\u73B0\u6210\u7EE9\u3002") : null, tab === "reading" && rows.map((row) => /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-history-row", key: row.id }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-history-main" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-history-title" }, row.bookTitle || "\u5DF2\u5220\u9664\u7684\u4E66"), /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-history-meta" }, formatDate(row.startedAt), " \xB7 \u7B2C ", (row.startChapter ?? 0) + 1, " \u81F3 ", (row.endChapter ?? row.startChapter ?? 0) + 1, " \u7AE0 \xB7 ", row.lookups ?? 0, " \u6B21\u67E5\u8BCD")), /* @__PURE__ */ import_react6.default.createElement("span", null, formatDuration(row.durationMs)))), tab === "lookup" && rows.map((row) => /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-history-row", key: row.id }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-history-main" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-history-title" }, row.text), /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-history-meta" }, row.translation, " \xB7 ", row.bookTitle || "\u672A\u77E5\u4E66\u7C4D", " ", row.chapterTitle ? `\xB7 ${row.chapterTitle}` : "")), /* @__PURE__ */ import_react6.default.createElement("span", { className: "nr-sub" }, formatDate(row.createdAt)))), tab === "quiz" && rows.map((row) => /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-history-row", key: row.id }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-history-main" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-history-title" }, Math.round((row.score ?? 0) * 100), " \u5206 \xB7 ", row.answers?.length ?? 0, " \u9898"), /* @__PURE__ */ import_react6.default.createElement("div", { className: "nr-history-meta" }, formatDate(row.endedAt), " \xB7 \u7B54\u5BF9 ", row.answers?.filter((answer) => answer.correct).length ?? 0, " \u9898")), /* @__PURE__ */ import_react6.default.createElement("span", { className: "nr-sub" }, row.answers?.filter((answer) => !answer.correct).length ?? 0, " \u4E2A\u9519\u9898")))));
}

// src-client/settings.jsx
var import_react7 = __toESM(require("react"), 1);
function SettingsView({ state, notify, onRefresh }) {
  const settings = state.settings;
  const [form, setForm] = (0, import_react7.useState)({ ...settings });
  const [syncForm, setSyncForm] = (0, import_react7.useState)({ ...settings.sync });
  const [password, setPassword] = (0, import_react7.useState)("");
  const [busy, setBusy] = (0, import_react7.useState)(false);
  const [syncBusy, setSyncBusy] = (0, import_react7.useState)(false);
  const [syncResult, setSyncResult] = (0, import_react7.useState)(null);
  const fileRef = (0, import_react7.useRef)(null);
  (0, import_react7.useEffect)(() => {
    setForm({ ...state.settings });
    setSyncForm({ ...state.settings.sync });
  }, [state.settings]);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const updateSync = (key, value) => setSyncForm((current) => ({ ...current, [key]: value }));
  const saveGeneral = async () => {
    setBusy(true);
    try {
      await api("/settings", {
        method: "PATCH",
        body: {
          targetLanguage: form.targetLanguage,
          theme: form.theme,
          fontSize: Number(form.fontSize),
          lineHeight: Number(form.lineHeight),
          fontFamily: form.fontFamily,
          maxWidth: Number(form.maxWidth),
          dailyNewWords: Number(form.dailyNewWords),
          dailyReviewLimit: Number(form.dailyReviewLimit),
          translationEngine: form.translationEngine,
          showEnglishDefinition: Boolean(form.showEnglishDefinition),
          autoSaveLookups: Boolean(form.autoSaveLookups)
        }
      });
      notify("\u8BBE\u7F6E\u5DF2\u4FDD\u5B58");
      await onRefresh();
    } catch (error) {
      notify(error.message, true);
    } finally {
      setBusy(false);
    }
  };
  const saveSync = async () => {
    setBusy(true);
    try {
      await api("/settings", {
        method: "PATCH",
        body: {
          sync: {
            enabled: Boolean(syncForm.enabled),
            url: syncForm.url,
            remoteDir: syncForm.remoteDir,
            username: syncForm.username,
            syncBooks: Boolean(syncForm.syncBooks),
            syncHistory: Boolean(syncForm.syncHistory),
            autoSync: syncForm.autoSync,
            conflict: syncForm.conflict
          },
          ...password ? { syncPassword: password } : {}
        }
      });
      setPassword("");
      notify("WebDAV \u8BBE\u7F6E\u5DF2\u4FDD\u5B58");
      await onRefresh();
    } catch (error) {
      notify(error.message, true);
    } finally {
      setBusy(false);
    }
  };
  const test = async () => {
    setSyncBusy(true);
    setSyncResult(null);
    try {
      await api("/settings", {
        method: "PATCH",
        body: {
          sync: {
            enabled: Boolean(syncForm.enabled),
            url: syncForm.url,
            remoteDir: syncForm.remoteDir,
            username: syncForm.username,
            syncBooks: Boolean(syncForm.syncBooks),
            syncHistory: Boolean(syncForm.syncHistory),
            autoSync: syncForm.autoSync,
            conflict: syncForm.conflict
          },
          ...password ? { syncPassword: password } : {}
        }
      });
      const data = await api("/sync/test", { method: "POST" });
      setSyncResult(data);
      notify(data.ok ? "WebDAV \u8FDE\u63A5\u6B63\u5E38" : data.message || "\u8FDE\u63A5\u5931\u8D25", !data.ok);
      await onRefresh();
    } catch (error) {
      setSyncResult({ ok: false, message: error.message });
      notify(error.message, true);
    } finally {
      setSyncBusy(false);
    }
  };
  const runSync = async () => {
    setSyncBusy(true);
    setSyncResult(null);
    try {
      const data = await api("/sync/run", { method: "POST" });
      setSyncResult({ ...data, ok: true });
      notify(`\u540C\u6B65\u5B8C\u6210\uFF1A\u4E0A\u4F20 ${data.uploaded}\uFF0C\u4E0B\u8F7D ${data.downloaded}`);
      await onRefresh();
    } catch (error) {
      setSyncResult({ ok: false, message: error.message });
      notify(error.message, true);
    } finally {
      setSyncBusy(false);
    }
  };
  const exportBackup = async () => {
    try {
      const response = await fetch("/novel-reader/api/backup/export", { method: "POST" });
      if (!response.ok) throw new Error(`\u5BFC\u51FA\u5931\u8D25\uFF08HTTP ${response.status}\uFF09`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `novel-reader-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.zip`;
      anchor.click();
      URL.revokeObjectURL(url);
      notify("\u5907\u4EFD\u5DF2\u5BFC\u51FA");
    } catch (error) {
      notify(error.message, true);
    }
  };
  const importBackup = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const response = await fetch("/novel-reader/api/backup/import", { method: "POST", body: file });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.ok) throw new Error(payload?.error?.message ?? "\u5BFC\u5165\u5931\u8D25");
      notify(`\u5DF2\u5BFC\u5165 ${payload.data.imported} \u4E2A\u6587\u4EF6`);
      await onRefresh();
    } catch (error) {
      notify(error.message, true);
    } finally {
      setBusy(false);
    }
  };
  const clearHistory = async (type) => {
    if (!window.confirm(type === "reading" ? "\u786E\u5B9A\u6E05\u7A7A\u9605\u8BFB\u8BB0\u5F55\u5417\uFF1F\u751F\u8BCD\u672C\u4E0D\u4F1A\u88AB\u5220\u9664\u3002" : "\u786E\u5B9A\u6E05\u7A7A\u67E5\u8BCD\u8BB0\u5F55\u5417\uFF1F")) return;
    setBusy(true);
    try {
      await api(`/history?type=${type}`, { method: "DELETE" });
      notify("\u5386\u53F2\u8BB0\u5F55\u5DF2\u6E05\u7A7A");
      await onRefresh();
    } catch (error) {
      notify(error.message, true);
    } finally {
      setBusy(false);
    }
  };
  return /* @__PURE__ */ import_react7.default.createElement("div", { className: "nr-page", style: { maxWidth: 900 } }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "nr-page-head" }, /* @__PURE__ */ import_react7.default.createElement("div", null, /* @__PURE__ */ import_react7.default.createElement("h1", { className: "nr-title" }, "\u8BBE\u7F6E"), /* @__PURE__ */ import_react7.default.createElement("p", { className: "nr-sub" }, "\u6570\u636E\u76EE\u5F55\uFF1A", settings.dataDir || "$DSH_HOME/novel-reader"))), /* @__PURE__ */ import_react7.default.createElement("div", { className: "nr-card" }, /* @__PURE__ */ import_react7.default.createElement("div", { className: "nr-section" }, /* @__PURE__ */ import_react7.default.createElement("h3", null, "\u9605\u8BFB"), /* @__PURE__ */ import_react7.default.createElement("p", null, "\u63A7\u5236\u9605\u8BFB\u5668\u7684\u9ED8\u8BA4\u6392\u7248\u548C\u5B66\u4E60\u8282\u594F\u3002"), /* @__PURE__ */ import_react7.default.createElement("div", { className: "nr-form-grid" }, /* @__PURE__ */ import_react7.default.createElement(Field, { label: "\u76EE\u6807\u8BED\u8A00" }, /* @__PURE__ */ import_react7.default.createElement("select", { className: "nr-select", value: form.targetLanguage, onChange: (event) => update("targetLanguage", event.target.value) }, /* @__PURE__ */ import_react7.default.createElement("option", { value: "zh-CN" }, "\u7B80\u4F53\u4E2D\u6587"), /* @__PURE__ */ import_react7.default.createElement("option", { value: "zh-TW" }, "\u7E41\u4F53\u4E2D\u6587"), /* @__PURE__ */ import_react7.default.createElement("option", { value: "en" }, "English"))), /* @__PURE__ */ import_react7.default.createElement(Field, { label: "\u9605\u8BFB\u4E3B\u9898" }, /* @__PURE__ */ import_react7.default.createElement("select", { className: "nr-select", value: form.theme, onChange: (event) => update("theme", event.target.value) }, /* @__PURE__ */ import_react7.default.createElement("option", { value: "paper" }, "\u7EB8\u5F20"), /* @__PURE__ */ import_react7.default.createElement("option", { value: "sepia" }, "\u6696\u9EC4"), /* @__PURE__ */ import_react7.default.createElement("option", { value: "night" }, "\u591C\u95F4"))), /* @__PURE__ */ import_react7.default.createElement(Field, { label: "\u5B57\u53F7" }, /* @__PURE__ */ import_react7.default.createElement("input", { className: "nr-input", type: "number", min: "14", max: "26", value: form.fontSize, onChange: (event) => update("fontSize", event.target.value) })), /* @__PURE__ */ import_react7.default.createElement(Field, { label: "\u884C\u9AD8" }, /* @__PURE__ */ import_react7.default.createElement("input", { className: "nr-input", type: "number", min: "1.4", max: "2.4", step: "0.1", value: form.lineHeight, onChange: (event) => update("lineHeight", event.target.value) })), /* @__PURE__ */ import_react7.default.createElement(Field, { label: "\u6BCF\u65E5\u65B0\u8BCD\u76EE\u6807" }, /* @__PURE__ */ import_react7.default.createElement("input", { className: "nr-input", type: "number", min: "0", max: "100", value: form.dailyNewWords, onChange: (event) => update("dailyNewWords", event.target.value) })), /* @__PURE__ */ import_react7.default.createElement(Field, { label: "\u6BCF\u65E5\u590D\u4E60\u4E0A\u9650" }, /* @__PURE__ */ import_react7.default.createElement("input", { className: "nr-input", type: "number", min: "0", max: "500", value: form.dailyReviewLimit, onChange: (event) => update("dailyReviewLimit", event.target.value) })))), /* @__PURE__ */ import_react7.default.createElement("div", { className: "nr-section" }, /* @__PURE__ */ import_react7.default.createElement("h3", null, "\u7FFB\u8BD1"), /* @__PURE__ */ import_react7.default.createElement("p", null, "\u9ED8\u8BA4\u4F7F\u7528 DSH \u81EA\u5E26\u7684\u533F\u540D\u7FFB\u8BD1\u901A\u9053\uFF0C\u5931\u8D25\u65F6\u81EA\u52A8\u6539\u7528\u5F53\u524D\u6A21\u578B\u3002"), /* @__PURE__ */ import_react7.default.createElement("div", { className: "nr-form-grid" }, /* @__PURE__ */ import_react7.default.createElement(Field, { label: "\u7FFB\u8BD1\u5F15\u64CE" }, /* @__PURE__ */ import_react7.default.createElement("select", { className: "nr-select", value: form.translationEngine, onChange: (event) => update("translationEngine", event.target.value) }, /* @__PURE__ */ import_react7.default.createElement("option", { value: "auto" }, "\u81EA\u52A8\uFF08\u533F\u540D\u4F18\u5148\uFF0C\u5931\u8D25\u7528\u6A21\u578B\uFF09"), /* @__PURE__ */ import_react7.default.createElement("option", { value: "bing" }, "Bing \u533F\u540D"), /* @__PURE__ */ import_react7.default.createElement("option", { value: "google" }, "Google \u533F\u540D"), /* @__PURE__ */ import_react7.default.createElement("option", { value: "model" }, "\u5F53\u524D DeepSeek \u6A21\u578B"))), /* @__PURE__ */ import_react7.default.createElement("div", { className: "nr-row", style: { alignItems: "flex-end", paddingBottom: 6 } }, /* @__PURE__ */ import_react7.default.createElement(Toggle, { checked: Boolean(form.autoSaveLookups), onChange: (value) => update("autoSaveLookups", value), label: "\u81EA\u52A8\u4FDD\u5B58\u67E5\u8BCD\u5386\u53F2" }))), /* @__PURE__ */ import_react7.default.createElement("div", { className: "nr-row", style: { justifyContent: "flex-end", marginTop: 14 } }, /* @__PURE__ */ import_react7.default.createElement(Button, { variant: "primary", onClick: saveGeneral, disabled: busy }, "\u4FDD\u5B58\u9605\u8BFB\u4E0E\u7FFB\u8BD1\u8BBE\u7F6E"))), /* @__PURE__ */ import_react7.default.createElement("div", { className: "nr-section" }, /* @__PURE__ */ import_react7.default.createElement("h3", null, "WebDAV \u540C\u6B65"), /* @__PURE__ */ import_react7.default.createElement("p", null, "\u628A\u5C0F\u8BF4\u6587\u4EF6\u3001\u751F\u8BCD\u3001\u9605\u8BFB\u8FDB\u5EA6\u548C\u5386\u53F2\u540C\u6B65\u5230\u652F\u6301 WebDAV \u7684\u7F51\u76D8\u3002\u5BC6\u7801\u4FDD\u5B58\u5728 DSH \u51ED\u636E\u670D\u52A1\u91CC\uFF0C\u4E0D\u4F1A\u5199\u8FDB\u6570\u636E\u6587\u4EF6\u3002"), /* @__PURE__ */ import_react7.default.createElement("div", { className: "nr-form-grid" }, /* @__PURE__ */ import_react7.default.createElement(Field, { label: "\u670D\u52A1\u5668\u5730\u5740", hint: "\u4F8B\u5982 https://dav.example.com/remote.php/dav/files/username/" }, /* @__PURE__ */ import_react7.default.createElement("input", { className: "nr-input", value: syncForm.url, onChange: (event) => updateSync("url", event.target.value), placeholder: "https://" })), /* @__PURE__ */ import_react7.default.createElement(Field, { label: "\u8FDC\u7A0B\u76EE\u5F55" }, /* @__PURE__ */ import_react7.default.createElement("input", { className: "nr-input", value: syncForm.remoteDir, onChange: (event) => updateSync("remoteDir", event.target.value), placeholder: "novel-reader" })), /* @__PURE__ */ import_react7.default.createElement(Field, { label: "\u7528\u6237\u540D" }, /* @__PURE__ */ import_react7.default.createElement("input", { className: "nr-input", value: syncForm.username, onChange: (event) => updateSync("username", event.target.value), autoComplete: "username" })), /* @__PURE__ */ import_react7.default.createElement(Field, { label: "\u5BC6\u7801 / \u5E94\u7528\u4E13\u7528\u5BC6\u7801", hint: syncForm.passwordConfigured ? "\u5DF2\u4FDD\u5B58\uFF1B\u7559\u7A7A\u8868\u793A\u4E0D\u4FEE\u6539" : "\u8FD8\u6CA1\u6709\u4FDD\u5B58\u5BC6\u7801" }, /* @__PURE__ */ import_react7.default.createElement("input", { className: "nr-input", type: "password", value: password, onChange: (event) => setPassword(event.target.value), autoComplete: "current-password", placeholder: syncForm.passwordConfigured ? "\u5DF2\u914D\u7F6E" : "" })), /* @__PURE__ */ import_react7.default.createElement(Field, { label: "\u81EA\u52A8\u540C\u6B65" }, /* @__PURE__ */ import_react7.default.createElement("select", { className: "nr-select", value: syncForm.autoSync, onChange: (event) => updateSync("autoSync", event.target.value), disabled: !syncForm.enabled }, /* @__PURE__ */ import_react7.default.createElement("option", { value: "off" }, "\u5173\u95ED"), /* @__PURE__ */ import_react7.default.createElement("option", { value: "5min" }, "\u6BCF 5 \u5206\u949F"))), /* @__PURE__ */ import_react7.default.createElement(Field, { label: "\u51B2\u7A81\u7B56\u7565" }, /* @__PURE__ */ import_react7.default.createElement("select", { className: "nr-select", value: syncForm.conflict, onChange: (event) => updateSync("conflict", event.target.value), disabled: !syncForm.enabled }, /* @__PURE__ */ import_react7.default.createElement("option", { value: "newer" }, "\u4EE5\u8F83\u65B0\u7684\u8BB0\u5F55\u4E3A\u51C6"), /* @__PURE__ */ import_react7.default.createElement("option", { value: "copy" }, "\u4FDD\u7559\u53CC\u65B9\u526F\u672C")))), /* @__PURE__ */ import_react7.default.createElement("div", { className: "nr-row", style: { marginTop: 14 } }, /* @__PURE__ */ import_react7.default.createElement(Toggle, { checked: Boolean(syncForm.enabled), onChange: (value) => updateSync("enabled", value), label: "\u542F\u7528\u540C\u6B65" }), /* @__PURE__ */ import_react7.default.createElement(Toggle, { checked: Boolean(syncForm.syncBooks), onChange: (value) => updateSync("syncBooks", value), label: "\u540C\u6B65\u5C0F\u8BF4\u6587\u4EF6", disabled: !syncForm.enabled }), /* @__PURE__ */ import_react7.default.createElement(Toggle, { checked: Boolean(syncForm.syncHistory), onChange: (value) => updateSync("syncHistory", value), label: "\u540C\u6B65\u5386\u53F2\u8BB0\u5F55", disabled: !syncForm.enabled })), /* @__PURE__ */ import_react7.default.createElement("p", { className: "nr-sub", style: { marginTop: 10 } }, "\u542F\u7528\u540E\uFF0C\u5BFC\u5165\u56FE\u4E66\u3001\u9000\u51FA\u9605\u8BFB\u5668\u3001\u4FDD\u5B58\u751F\u8BCD\u6216\u9605\u8BFB\u8FDB\u5EA6\u65F6\u4F1A\u5728\u51E0\u79D2\u540E\u81EA\u52A8\u540C\u6B65\uFF1B\u6B64\u5916\u8FD8\u53EF\u8BBE\u7F6E\u6BCF 5 \u5206\u949F\u81EA\u52A8\u540C\u6B65\u3002"), /* @__PURE__ */ import_react7.default.createElement("div", { className: "nr-row", style: { marginTop: 16 } }, /* @__PURE__ */ import_react7.default.createElement(Button, { variant: "primary", onClick: saveSync, disabled: busy }, "\u4FDD\u5B58 WebDAV \u8BBE\u7F6E"), /* @__PURE__ */ import_react7.default.createElement(Button, { onClick: test, disabled: syncBusy }, "\u4FDD\u5B58\u5E76\u6D4B\u8BD5"), /* @__PURE__ */ import_react7.default.createElement(Button, { onClick: runSync, disabled: syncBusy || !syncForm.enabled }, "\u7ACB\u5373\u540C\u6B65"), state.sync?.lastSyncAt ? /* @__PURE__ */ import_react7.default.createElement("span", { className: "nr-sub" }, "\u4E0A\u6B21\u540C\u6B65\uFF1A", formatDate(state.sync.lastSyncAt)) : null), syncResult ? /* @__PURE__ */ import_react7.default.createElement("div", { className: "nr-explain", style: { marginTop: 12, color: syncResult.ok ? void 0 : "var(--dsw-alias-state-error-primary)" } }, syncResult.ok ? `\u8FDE\u63A5\u6B63\u5E38${syncResult.uploaded !== void 0 ? `\uFF0C\u4E0A\u4F20 ${syncResult.uploaded} \u4E2A\u6587\u4EF6\uFF0C\u4E0B\u8F7D ${syncResult.downloaded} \u4E2A\u6587\u4EF6` : ""}` : syncResult.message || "\u8FDE\u63A5\u5931\u8D25") : null), /* @__PURE__ */ import_react7.default.createElement("div", { className: "nr-section" }, /* @__PURE__ */ import_react7.default.createElement("h3", null, "\u6570\u636E\u7BA1\u7406"), /* @__PURE__ */ import_react7.default.createElement("p", null, "\u5BFC\u51FA\u4E00\u4E2A\u5305\u542B\u5168\u90E8\u4E66\u7C4D\u3001\u751F\u8BCD\u548C\u5386\u53F2\u7684 zip\uFF1B\u6362\u7535\u8111\u65F6\u53EF\u4EE5\u518D\u5BFC\u5165\u3002"), /* @__PURE__ */ import_react7.default.createElement("div", { className: "nr-row" }, /* @__PURE__ */ import_react7.default.createElement(Button, { onClick: exportBackup, disabled: busy }, "\u5BFC\u51FA\u5907\u4EFD"), /* @__PURE__ */ import_react7.default.createElement("input", { ref: fileRef, type: "file", accept: ".zip", style: { display: "none" }, onChange: (event) => {
    importBackup(event.target.files?.[0]);
    event.target.value = "";
  } }), /* @__PURE__ */ import_react7.default.createElement(Button, { onClick: () => fileRef.current?.click(), disabled: busy }, "\u5BFC\u5165\u5907\u4EFD"), /* @__PURE__ */ import_react7.default.createElement(Button, { variant: "danger", size: "small", onClick: () => clearHistory("reading") }, "\u6E05\u7A7A\u9605\u8BFB\u8BB0\u5F55"), /* @__PURE__ */ import_react7.default.createElement(Button, { variant: "danger", size: "small", onClick: () => clearHistory("lookup") }, "\u6E05\u7A7A\u67E5\u8BCD\u8BB0\u5F55"))), /* @__PURE__ */ import_react7.default.createElement("div", { className: "nr-section" }, /* @__PURE__ */ import_react7.default.createElement("h3", null, "\u5173\u4E8E"), /* @__PURE__ */ import_react7.default.createElement("p", null, "Novel Reader 0.1.0 \xB7 \u6570\u636E\u9ED8\u8BA4\u4FDD\u5B58\u5728 ", settings.dataDir || "$DSH_HOME/novel-reader", "\u3002\u4E0D\u652F\u6301 DRM \u7535\u5B50\u4E66\u548C PDF \u5BFC\u5165\u3002"))));
}

// src-client/styles.js
var CSS = `
.nr-app {
  box-sizing: border-box;
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: calc(24px + var(--dsh-frame-top-clearance, 0px)) 0 0;
  background: var(--dsw-alias-bg-base, #fff);
  color: var(--dsw-alias-label-primary, #1f2328);
  font-family: var(--ds-font-family-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
}
.nr-top {
  flex: none;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 0 clamp(18px, 3.4vw, 44px) 14px;
  border-bottom: 1px solid var(--dsw-alias-border-l1, #eceef1);
}
.nr-brand { display: flex; align-items: center; gap: 9px; min-width: 0; }
.nr-brand-name { font-size: 15px; font-weight: 650; letter-spacing: .01em; white-space: nowrap; }
.nr-nav { display: flex; align-items: center; gap: 2px; margin-left: 6px; }
.nr-nav button {
  border: 0; background: transparent; color: var(--dsw-alias-label-secondary, #667085);
  font: inherit; font-size: 13px; line-height: 20px; padding: 6px 11px; border-radius: 7px; cursor: pointer;
}
.nr-nav button:hover { background: var(--dsw-alias-bg-layer-2, #f3f4f6); color: var(--dsw-alias-label-primary, #1f2328); }
.nr-nav button.is-on { background: var(--dsw-alias-bg-layer-2, #eceff3); color: var(--dsw-alias-label-primary, #1f2328); font-weight: 600; }
.nr-sync { margin-left: auto; display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: var(--dsw-alias-label-tertiary, #8b93a1); white-space: nowrap; }
.nr-dot { width: 6px; height: 6px; border-radius: 99px; background: var(--dsw-alias-state-success-primary, #22c55e); flex: none; }
.nr-dot.is-bad { background: var(--dsw-alias-state-error-primary, #dc2626); }
.nr-dot.is-idle { background: var(--dsw-alias-state-idle-primary, #9ca3af); }
.nr-content { flex: 1; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 24px clamp(18px, 3.4vw, 44px) 40px; }
.nr-page { width: 100%; max-width: 1180px; margin: 0 auto; }
.nr-page-head { display: flex; align-items: flex-end; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
.nr-title { font-size: 24px; line-height: 32px; font-weight: 680; margin: 0; letter-spacing: -.015em; }
.nr-sub { font-size: 12.5px; line-height: 20px; color: var(--dsw-alias-label-tertiary, #8b93a1); margin: 2px 0 0; }
.nr-head-actions { margin-left: auto; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.nr-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  border: 1px solid var(--dsw-alias-border-l2, #d9dde3); background: var(--dsw-alias-bg-layer-1, #fff);
  color: var(--dsw-alias-label-primary, #1f2328); font: inherit; font-size: 12.5px; line-height: 18px;
  min-height: 32px; padding: 6px 12px; border-radius: 7px; cursor: pointer; white-space: nowrap;
}
.nr-btn:hover { border-color: var(--dsw-alias-border-l1, #c8ced8); background: var(--dsw-alias-bg-layer-2, #f7f8fa); }
.nr-btn:disabled { opacity: .48; cursor: default; }
.nr-btn.is-primary { background: var(--dsw-alias-brand-primary, #3566d6); border-color: var(--dsw-alias-brand-primary, #3566d6); color: #fff; }
.nr-btn.is-primary:hover { filter: brightness(1.05); }
.nr-btn.is-ghost { border-color: transparent; background: transparent; color: var(--dsw-alias-label-secondary, #667085); }
.nr-btn.is-ghost:hover { background: var(--dsw-alias-bg-layer-2, #f3f4f6); color: var(--dsw-alias-label-primary, #1f2328); }
.nr-btn.is-danger { border-color: var(--dsw-alias-state-error-primary, #dc2626); color: var(--dsw-alias-state-error-primary, #dc2626); background: transparent; }
.nr-btn.is-small { min-height: 26px; padding: 3px 8px; font-size: 11.5px; border-radius: 6px; }
.nr-btn.is-block { width: 100%; }
.nr-input, .nr-select, .nr-textarea {
  box-sizing: border-box; width: 100%; min-height: 34px; border: 1px solid var(--dsw-alias-border-l2, #d9dde3);
  border-radius: 7px; background: var(--dsw-alias-bg-layer-1, #fff); color: var(--dsw-alias-label-primary, #1f2328);
  font: inherit; font-size: 13px; line-height: 20px; padding: 6px 9px; outline: none;
}
.nr-input:focus, .nr-select:focus, .nr-textarea:focus { border-color: var(--dsw-alias-brand-primary, #3566d6); box-shadow: 0 0 0 2px rgba(53,102,214,.12); }
.nr-textarea { resize: vertical; min-height: 78px; }
.nr-field { display: flex; flex-direction: column; gap: 5px; min-width: 0; }
.nr-field > span { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary, #5c6570); }
.nr-field small { font-size: 11px; line-height: 17px; color: var(--dsw-alias-label-tertiary, #8b93a1); }
.nr-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.nr-card {
  border: 1px solid var(--dsw-alias-border-l1, #e7e9ee); border-radius: 12px; background: var(--dsw-alias-bg-layer-1, #fff);
  padding: 18px; box-sizing: border-box;
}
.nr-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(168px, 1fr)); gap: 18px; }
.nr-book-card { border: 0; background: transparent; padding: 0; text-align: left; cursor: pointer; min-width: 0; width: 100%; display: flex; flex-direction: column; gap: 9px; }
.nr-book-cell { position: relative; min-width: 0; }
.nr-book-more { position: absolute; top: 8px; right: 8px; width: 28px; height: 28px; padding: 0; border: 1px solid rgba(255,255,255,.42); border-radius: 7px; background: rgba(18,24,32,.62); color: #fff; display: grid; place-items: center; cursor: pointer; opacity: 0; transition: opacity .15s ease, background .15s ease; backdrop-filter: blur(6px); }
.nr-book-cell:hover .nr-book-more, .nr-book-more:focus-visible { opacity: 1; }
.nr-book-more:hover { background: rgba(18,24,32,.86); }
.nr-cover {
  width: 100%; aspect-ratio: 2 / 3; border-radius: 8px; overflow: hidden;
  background: linear-gradient(145deg, #2f6f62, #173f38); color: #f7f3ea;
  display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 2px rgba(20,24,31,.12), 0 10px 22px -14px rgba(20,24,31,.35);
  position: relative;
}
.nr-cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
.nr-cover-fallback { padding: 16px; text-align: center; font-family: Georgia, "Times New Roman", serif; font-size: 17px; line-height: 1.35; font-weight: 600; overflow: hidden; }
.nr-book-title { font-size: 13px; line-height: 19px; font-weight: 620; color: var(--dsw-alias-label-primary, #1f2328); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.nr-book-meta { font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-tertiary, #8b93a1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nr-progress { height: 4px; border-radius: 99px; background: var(--dsw-alias-border-l1, #e8eaef); overflow: hidden; }
.nr-progress > i { display: block; height: 100%; border-radius: 99px; background: var(--dsw-alias-brand-primary, #3566d6); }
.nr-continue {
  display: flex; gap: 20px; align-items: center; margin-bottom: 26px; padding: 20px;
  border-radius: 14px; border: 1px solid var(--dsw-alias-border-l1, #e7e9ee);
  background: linear-gradient(120deg, var(--dsw-alias-bg-layer-2, #f7f8fa), var(--dsw-alias-bg-layer-1, #fff) 60%);
}
.nr-continue .nr-cover { width: 92px; flex: none; aspect-ratio: 2 / 3; }
.nr-continue-body { min-width: 0; flex: 1; }
.nr-continue-title { font-size: 20px; line-height: 27px; font-weight: 680; margin: 0 0 4px; }
.nr-continue-meta { font-size: 12.5px; line-height: 20px; color: var(--dsw-alias-label-secondary, #5c6570); margin: 0 0 12px; }
.nr-empty { padding: 56px 24px; text-align: center; border: 1px dashed var(--dsw-alias-border-l2, #d9dde3); border-radius: 14px; color: var(--dsw-alias-label-tertiary, #8b93a1); }
.nr-empty h3 { margin: 12px 0 5px; font-size: 16px; color: var(--dsw-alias-label-primary, #1f2328); }
.nr-empty p { margin: 0 0 18px; font-size: 12.5px; line-height: 20px; }
.nr-drop { outline: 2px dashed var(--dsw-alias-brand-primary, #3566d6); outline-offset: 8px; }
.nr-stat-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-bottom: 18px; }
.nr-stat { border: 1px solid var(--dsw-alias-border-l1, #e7e9ee); border-radius: 10px; padding: 13px 14px; background: var(--dsw-alias-bg-layer-1, #fff); }
.nr-stat-value { font-size: 22px; line-height: 28px; font-weight: 680; letter-spacing: -.02em; }
.nr-stat-label { font-size: 11.5px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #8b93a1); }
.nr-toolbar { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 14px; }
.nr-toolbar .nr-input { width: 220px; }
.nr-toolbar .nr-select { width: 150px; }
.nr-chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 7px; border-radius: 5px; font-size: 11px; line-height: 17px; background: var(--dsw-alias-bg-layer-2, #f3f4f6); color: var(--dsw-alias-label-secondary, #5c6570); }
.nr-chip.is-new { background: rgba(53,102,214,.1); color: #2f5bc2; }
.nr-chip.is-learning { background: rgba(217,164,65,.15); color: #8a5a00; }
.nr-chip.is-review { background: rgba(47,111,98,.12); color: #2f6f62; }
.nr-chip.is-mastered { background: rgba(34,197,94,.12); color: #16883e; }
.nr-vocab-list { border: 1px solid var(--dsw-alias-border-l1, #e7e9ee); border-radius: 12px; overflow: hidden; background: var(--dsw-alias-bg-layer-1, #fff); }
.nr-vocab-row { display: flex; align-items: center; gap: 14px; padding: 11px 14px; border: 0; border-bottom: 1px solid var(--dsw-alias-border-l1, #eef0f3); background: transparent; font: inherit; text-align: left; width: 100%; cursor: pointer; color: inherit; }
.nr-vocab-row:last-child { border-bottom: 0; }
.nr-vocab-row:hover { background: var(--dsw-alias-bg-layer-2, #f7f8fa); }
.nr-vocab-row.is-head { padding-top: 8px; padding-bottom: 8px; background: var(--dsw-alias-bg-layer-2, #f7f8fa); cursor: default; font-size: 11px; color: var(--dsw-alias-label-tertiary, #8b93a1); }
.nr-vocab-row.is-head .nr-vocab-word, .nr-vocab-row.is-head .nr-vocab-trans { font-weight: 500; font-size: 11px; color: var(--dsw-alias-label-tertiary, #8b93a1); }
.nr-vocab-word { font-size: 14px; line-height: 20px; font-weight: 600; min-width: 130px; }
.nr-vocab-phonetic { font-size: 11.5px; color: var(--dsw-alias-label-tertiary, #8b93a1); min-width: 120px; }
.nr-vocab-trans { flex: 1; min-width: 0; font-size: 12.5px; color: var(--dsw-alias-label-secondary, #5c6570); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nr-vocab-source { font-size: 11px; color: var(--dsw-alias-label-tertiary, #8b93a1); max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.nr-overlay { position: fixed; inset: 0; z-index: 800; background: rgba(16,20,28,.32); display: flex; justify-content: flex-end; }
.nr-drawer { width: min(520px, 94vw); height: 100%; background: var(--dsw-alias-bg-layer-1, #fff); box-shadow: -18px 0 48px rgba(16,20,28,.18); display: flex; flex-direction: column; }
.nr-drawer-head { flex: none; display: flex; align-items: center; gap: 10px; padding: 18px 20px; border-bottom: 1px solid var(--dsw-alias-border-l1, #eef0f3); }
.nr-drawer-body { flex: 1; overflow-y: auto; padding: 18px 20px 28px; }
.nr-drawer-title { font-size: 17px; line-height: 24px; font-weight: 650; margin: 0; }
.nr-x { margin-left: auto; width: 30px; height: 30px; border: 0; border-radius: 7px; background: transparent; color: var(--dsw-alias-label-secondary, #5c6570); cursor: pointer; font-size: 18px; line-height: 1; }
.nr-x:hover { background: var(--dsw-alias-bg-layer-2, #f3f4f6); }
.nr-context { border-left: 3px solid var(--dsw-alias-border-l2, #d9dde3); padding: 8px 10px; margin: 8px 0; background: var(--dsw-alias-bg-layer-2, #f7f8fa); border-radius: 0 7px 7px 0; font-size: 12.5px; line-height: 20px; color: var(--dsw-alias-label-secondary, #5c6570); }
.nr-context b { color: var(--dsw-alias-label-primary, #1f2328); }
.nr-context small { display: block; margin-top: 3px; color: var(--dsw-alias-label-tertiary, #8b93a1); font-size: 11px; }
.nr-reader { display: flex; flex-direction: column; height: 100%; min-height: 0; background: var(--nr-reader-bg, var(--dsw-alias-bg-base, #fff)); }
.nr-reader-top { flex: none; display: flex; align-items: center; gap: 8px; padding: 0 clamp(14px, 3vw, 34px) 12px; border-bottom: 1px solid var(--nr-reader-rule, var(--dsw-alias-border-l1, #eef0f3)); background: var(--nr-reader-bg, var(--dsw-alias-bg-base, #fff)); color: var(--nr-reader-ink, var(--dsw-alias-label-primary, #1f2328)); }
.nr-reader-title { min-width: 0; flex: 1; }
.nr-reader-book { font-size: 13px; line-height: 18px; font-weight: 620; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nr-reader-chapter { font-size: 11.5px; line-height: 17px; color: var(--dsw-alias-label-tertiary, #8b93a1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nr-reader-main { flex: 1; min-height: 0; display: flex; overflow: hidden; }
.nr-reader-scroll { flex: 1; min-width: 0; overflow-y: auto; overscroll-behavior: contain; padding: 34px 20px 90px; scroll-behavior: smooth; }
.nr-reading {
  max-width: var(--nr-reading-width, 720px); margin: 0 auto; color: var(--nr-reader-ink, #22252a);
  font-family: var(--nr-reading-font, Georgia, "Times New Roman", serif);
  font-size: var(--nr-reading-size, 18px); line-height: var(--nr-reading-leading, 1.9);
  letter-spacing: .003em;
}
.nr-reading p { margin: 0 0 1.05em; }
.nr-reading h1, .nr-reading h2, .nr-reading h3 { font-family: var(--ds-font-family-ui, sans-serif); line-height: 1.3; margin: 1.4em 0 .7em; }
.nr-reading h1 { font-size: 1.6em; }
.nr-reading h2 { font-size: 1.35em; }
.nr-reading blockquote { margin: 1em 0; padding-left: 1em; border-left: 3px solid var(--nr-reader-rule, #d9dde3); color: var(--nr-reader-muted, #5c6570); }
.nr-reading em { font-style: italic; }
.nr-reading strong { font-weight: 700; }
.nr-reading del { opacity: .62; }
.nr-reading a { color: var(--dsw-alias-brand-primary, #3566d6); text-decoration: underline; text-underline-offset: 2px; }
.nr-reading code { font-family: var(--ds-font-family-code, ui-monospace, Consolas, monospace); font-size: .9em; background: rgba(127,127,127,.12); border-radius: 4px; padding: 1px 4px; }
.nr-reading pre { overflow-x: auto; background: rgba(127,127,127,.1); border-radius: 8px; padding: 12px 14px; }
.nr-reading pre code { background: transparent; padding: 0; }
.nr-reading hr { border: 0; border-top: 1px solid var(--nr-reader-rule, #e2e5e9); margin: 2em auto; width: 40%; }
.nr-theme-paper { --nr-reader-bg: #fbfaf6; --nr-reader-ink: #24262a; --nr-reader-muted: #5f646d; --nr-reader-rule: #dedbd2; }
.nr-theme-sepia { --nr-reader-bg: #f4ead8; --nr-reader-ink: #3b2f22; --nr-reader-muted: #6f5c47; --nr-reader-rule: #ddccb2; }
.nr-theme-night { --nr-reader-bg: #16181c; --nr-reader-ink: #d8dbe0; --nr-reader-muted: #969ba5; --nr-reader-rule: #343841; }
.nr-theme-night .nr-reader-top .nr-btn, .nr-theme-night .nr-reader-foot .nr-btn { color: var(--nr-reader-ink); }
.nr-theme-night .nr-btn.is-ghost:hover { background: rgba(255,255,255,.08); }
.nr-theme-night .nr-type-panel { background: #1e2127; border-color: #343841; color: var(--nr-reader-ink); }
.nr-theme-night .nr-type-panel h4, .nr-theme-night .nr-type-row { color: var(--nr-reader-muted); }
.nr-theme-night .nr-segment { border-color: #3a3f48; }
.nr-theme-night .nr-segment button { color: var(--nr-reader-muted); }
.nr-theme-night .nr-segment button.is-on { background: #2c3038; color: var(--nr-reader-ink); }
.nr-reader-foot { flex: none; display: flex; align-items: center; justify-content: center; gap: 14px; padding: 9px clamp(14px, 3vw, 34px); border-top: 1px solid var(--nr-reader-rule, var(--dsw-alias-border-l1, #eef0f3)); background: var(--nr-reader-bg, var(--dsw-alias-bg-base, #fff)); color: var(--nr-reader-muted, var(--dsw-alias-label-tertiary, #8b93a1)); font-size: 11.5px; }
.nr-reader-foot .nr-progress { flex: 1; max-width: 320px; }
.nr-reader-tip { max-width: var(--nr-reading-width, 720px); margin: 0 auto 26px; font-size: 11.5px; line-height: 18px; color: var(--nr-reader-muted, var(--dsw-alias-label-tertiary, #8b93a1)); text-align: center; letter-spacing: .02em; }
.nr-type-panel { position: absolute; top: 54px; right: clamp(14px, 3vw, 34px); z-index: 30; width: 268px; border: 1px solid var(--dsw-alias-border-l2, #d9dde3); border-radius: 12px; background: var(--dsw-alias-bg-overlay, #fff); box-shadow: 0 16px 46px rgba(16,20,28,.16); padding: 15px; }
.nr-type-panel h4 { margin: 0 0 12px; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary, #5c6570); font-weight: 600; }
.nr-type-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; font-size: 12px; color: var(--dsw-alias-label-secondary, #5c6570); }
.nr-type-row input[type=range] { flex: 1; accent-color: var(--dsw-alias-brand-primary, #3566d6); }
.nr-type-row output { width: 34px; text-align: right; font-variant-numeric: tabular-nums; }
.nr-segment { display: flex; border: 1px solid var(--dsw-alias-border-l2, #d9dde3); border-radius: 7px; overflow: hidden; }
.nr-segment button { flex: 1; border: 0; background: transparent; padding: 5px 4px; font: inherit; font-size: 11.5px; color: var(--dsw-alias-label-secondary, #5c6570); cursor: pointer; }
.nr-segment button.is-on { background: var(--dsw-alias-bg-layer-2, #eef0f4); color: var(--dsw-alias-label-primary, #1f2328); font-weight: 600; }
.nr-toc { position: absolute; top: 54px; left: clamp(14px, 3vw, 34px); z-index: 30; width: 320px; max-height: 70vh; overflow-y: auto; border: 1px solid var(--dsw-alias-border-l2, #d9dde3); border-radius: 12px; background: var(--dsw-alias-bg-overlay, #fff); box-shadow: 0 16px 46px rgba(16,20,28,.16); padding: 8px; }
.nr-toc button { display: block; width: 100%; text-align: left; border: 0; background: transparent; color: var(--dsw-alias-label-primary, #1f2328); font: inherit; font-size: 12.5px; line-height: 19px; padding: 7px 9px; border-radius: 6px; cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nr-toc button:hover { background: var(--dsw-alias-bg-layer-2, #f3f4f6); }
.nr-toc button.is-on { background: var(--dsw-alias-bg-layer-2, #eceff3); font-weight: 600; }
.nr-popover {
  position: fixed; z-index: 900; width: min(360px, calc(100vw - 24px)); max-height: min(70vh, 520px); overflow-y: auto;
  border: 1px solid var(--dsw-alias-border-l2, #d9dde3); border-radius: 12px; background: var(--dsw-alias-bg-overlay, #fff);
  box-shadow: 0 18px 50px rgba(16,20,28,.2); padding: 14px;
}
.nr-pop-backdrop { position: fixed; inset: 0; z-index: 899; background: transparent; }
.nr-context-menu {
  position: fixed; z-index: 950; min-width: 196px; padding: 6px;
  border: 1px solid var(--dsw-alias-border-l2, #d9dde3); border-radius: 10px; background: var(--dsw-alias-bg-overlay, #fff);
  box-shadow: 0 16px 44px rgba(16,20,28,.22);
}
.nr-menu-label { padding: 4px 9px 6px; font-size: 11px; line-height: 16px; color: var(--dsw-alias-label-tertiary, #8b93a1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nr-context-menu button { display: flex; align-items: center; width: 100%; border: 0; border-radius: 6px; background: transparent; color: var(--dsw-alias-label-primary, #1f2328); font: inherit; font-size: 12.5px; line-height: 19px; text-align: left; padding: 7px 9px; cursor: pointer; }
.nr-context-menu button:hover { background: var(--dsw-alias-bg-layer-2, #f3f4f6); }
.nr-context-menu button:disabled { opacity: .5; cursor: default; }
.nr-chapter-list { display: flex; flex-direction: column; gap: 2px; }
.nr-chapter-item { display: flex; align-items: baseline; gap: 10px; width: 100%; border: 0; border-radius: 7px; background: transparent; color: var(--dsw-alias-label-primary, #1f2328); font: inherit; font-size: 13px; line-height: 21px; text-align: left; padding: 8px 10px; cursor: pointer; }
.nr-chapter-item:hover { background: var(--dsw-alias-bg-layer-2, #f3f4f6); }
.nr-chapter-item.is-on { background: var(--dsw-alias-bg-layer-2, #eceff3); font-weight: 600; }
.nr-chapter-number { width: 22px; flex: none; color: var(--dsw-alias-label-tertiary, #8b93a1); font-variant-numeric: tabular-nums; text-align: right; }
.nr-pop-head { display: flex; align-items: flex-start; gap: 8px; }
.nr-pop-word { font-size: 19px; line-height: 25px; font-weight: 680; }
.nr-pop-phonetic { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary, #8b93a1); margin-top: 1px; }
.nr-pop-subtitle { font-size: 10.5px; line-height: 16px; color: var(--dsw-alias-label-tertiary, #8b93a1); letter-spacing: .04em; text-transform: uppercase; margin-top: 2px; }
.nr-dict-phonetics { display: flex; flex-wrap: wrap; gap: 6px 14px; margin: 10px 0 4px; font-size: 12px; color: var(--dsw-alias-label-secondary, #5c6570); }
.nr-dict-phonetics b { font-size: 10px; color: var(--dsw-alias-label-tertiary, #8b93a1); margin-right: 4px; }
.nr-audio-btn { display: inline-grid; place-items: center; width: 21px; height: 21px; margin-left: 2px; padding: 0; border: 0; border-radius: 5px; background: var(--dsw-alias-bg-layer-2, #f3f4f6); color: var(--dsw-alias-label-secondary, #5c6570); cursor: pointer; vertical-align: middle; }
.nr-dict-tags { display: flex; flex-wrap: wrap; gap: 5px; margin: 7px 0; }
.nr-dict-section { border-top: 1px solid var(--dsw-alias-border-l1, #eef0f3); padding-top: 10px; margin-top: 10px; }
.nr-dict-title { font-size: 10.5px; line-height: 16px; color: var(--dsw-alias-label-tertiary, #8b93a1); font-weight: 600; letter-spacing: .04em; text-transform: uppercase; margin-bottom: 6px; }
.nr-dict-def { font-size: 12.5px; line-height: 20px; color: var(--dsw-alias-label-primary, #1f2328); margin-bottom: 5px; }
.nr-dict-def b, .nr-dict-en b { font-weight: 600; color: var(--dsw-alias-label-secondary, #5c6570); margin-right: 4px; }
.nr-dict-en { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary, #5c6570); margin-bottom: 7px; }
.nr-dict-en small, .nr-dict-example small { display: block; color: var(--dsw-alias-label-tertiary, #8b93a1); font-size: 11px; line-height: 17px; margin-top: 2px; }
.nr-dict-example { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-primary, #1f2328); margin-bottom: 7px; }
.nr-pop-close { margin-left: auto; width: 24px; height: 24px; border: 0; border-radius: 5px; background: transparent; color: var(--dsw-alias-label-tertiary, #8b93a1); cursor: pointer; }
.nr-pop-trans { font-size: 14px; line-height: 22px; margin: 10px 0 0; color: var(--dsw-alias-label-primary, #1f2328); }
.nr-pop-defs { margin: 8px 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 5px; }
.nr-pop-defs li { font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary, #5c6570); }
.nr-pop-defs b { color: var(--dsw-alias-label-primary, #1f2328); font-weight: 600; }
.nr-pop-actions { display: flex; gap: 7px; margin-top: 12px; flex-wrap: wrap; }
.nr-pop-sentence { font-size: 12.5px; line-height: 19px; color: var(--dsw-alias-label-secondary, #5c6570); margin: 8px 0 0; padding: 8px 9px; background: var(--dsw-alias-bg-layer-2, #f7f8fa); border-radius: 7px; }
.nr-quiz { max-width: 720px; margin: 0 auto; }
.nr-question { font-size: 18px; line-height: 28px; font-weight: 620; margin: 6px 0 18px; }
.nr-option { display: flex; align-items: center; gap: 10px; width: 100%; text-align: left; border: 1px solid var(--dsw-alias-border-l2, #d9dde3); border-radius: 9px; background: var(--dsw-alias-bg-layer-1, #fff); color: var(--dsw-alias-label-primary, #1f2328); font: inherit; font-size: 14px; line-height: 21px; padding: 11px 13px; margin-bottom: 9px; cursor: pointer; }
.nr-option:hover { border-color: var(--dsw-alias-brand-primary, #3566d6); }
.nr-option .nr-letter { width: 22px; height: 22px; border-radius: 6px; background: var(--dsw-alias-bg-layer-2, #f3f4f6); display: grid; place-items: center; font-size: 11px; font-weight: 600; flex: none; }
.nr-option.is-correct { border-color: var(--dsw-alias-state-success-primary, #22c55e); background: rgba(34,197,94,.08); }
.nr-option.is-wrong { border-color: var(--dsw-alias-state-error-primary, #dc2626); background: rgba(220,38,38,.07); }
.nr-option.is-muted { opacity: .6; }
.nr-explain { font-size: 12.5px; line-height: 20px; color: var(--dsw-alias-label-secondary, #5c6570); background: var(--dsw-alias-bg-layer-2, #f7f8fa); border-radius: 8px; padding: 10px 12px; margin: 12px 0; }
.nr-result { text-align: center; padding: 30px 20px; }
.nr-score { font-size: 48px; line-height: 56px; font-weight: 720; letter-spacing: -.04em; }
.nr-score small { font-size: 18px; color: var(--dsw-alias-label-tertiary, #8b93a1); font-weight: 500; }
.nr-heatmap { display: grid; grid-auto-flow: column; grid-template-rows: repeat(7, 11px); gap: 3px; overflow-x: auto; padding: 10px 0; }
.nr-heat-cell { width: 11px; height: 11px; border-radius: 3px; background: var(--dsw-alias-bg-layer-2, #f0f2f5); }
.nr-heat-cell[data-level="1"] { background: rgba(47,111,98,.22); }
.nr-heat-cell[data-level="2"] { background: rgba(47,111,98,.42); }
.nr-heat-cell[data-level="3"] { background: rgba(47,111,98,.64); }
.nr-heat-cell[data-level="4"] { background: rgba(47,111,98,.88); }
.nr-history-row { display: flex; align-items: center; gap: 12px; padding: 11px 0; border-bottom: 1px solid var(--dsw-alias-border-l1, #eef0f3); font-size: 12.5px; color: var(--dsw-alias-label-secondary, #5c6570); }
.nr-history-row:last-child { border-bottom: 0; }
.nr-history-main { flex: 1; min-width: 0; }
.nr-history-title { color: var(--dsw-alias-label-primary, #1f2328); font-weight: 600; }
.nr-history-meta { font-size: 11px; color: var(--dsw-alias-label-tertiary, #8b93a1); }
.nr-section { border-top: 1px solid var(--dsw-alias-border-l1, #eef0f3); padding: 22px 0; }
.nr-section:first-child { border-top: 0; padding-top: 0; }
.nr-section h3 { margin: 0 0 4px; font-size: 15px; line-height: 22px; }
.nr-section > p { margin: 0 0 14px; font-size: 12px; line-height: 19px; color: var(--dsw-alias-label-tertiary, #8b93a1); }
.nr-form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
.nr-switch { display: inline-flex; align-items: center; gap: 8px; border: 0; background: transparent; color: var(--dsw-alias-label-primary, #1f2328); font: inherit; font-size: 12.5px; cursor: pointer; padding: 0; }
.nr-switch-track { width: 36px; height: 21px; border-radius: 99px; background: var(--dsw-alias-border-l2, #d9dde3); position: relative; transition: background .15s; flex: none; }
.nr-switch-track > i { position: absolute; top: 2px; left: 2px; width: 17px; height: 17px; border-radius: 99px; background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.2); transition: left .15s; }
.nr-switch.is-on .nr-switch-track { background: var(--dsw-alias-brand-primary, #3566d6); }
.nr-switch.is-on .nr-switch-track > i { left: 17px; }
.nr-switch:disabled { opacity: .45; cursor: default; }
.nr-toast { position: fixed; left: 50%; bottom: 64px; transform: translateX(-50%); z-index: 1000; background: var(--dsw-alias-label-primary, #1f2328); color: var(--dsw-alias-bg-base, #fff); font-size: 12.5px; line-height: 19px; padding: 9px 15px; border-radius: 8px; box-shadow: 0 8px 28px rgba(0,0,0,.24); max-width: 80vw; }
.nr-toast.is-error { background: var(--dsw-alias-state-error-primary, #dc2626); color: #fff; }
.nr-loading { padding: 60px 0; text-align: center; color: var(--dsw-alias-label-tertiary, #8b93a1); font-size: 13px; }
.nr-kbd { font-family: var(--ds-font-family-code, ui-monospace, Consolas, monospace); font-size: 11px; padding: 1px 5px; border-radius: 4px; border: 1px solid var(--dsw-alias-border-l2, #d9dde3); background: var(--dsw-alias-bg-layer-2, #f7f8fa); }
@media (max-width: 760px) {
  .nr-top { flex-wrap: wrap; gap: 8px 12px; }
  .nr-nav { order: 3; width: 100%; overflow-x: auto; }
  .nr-sync { margin-left: auto; }
  .nr-continue { align-items: flex-start; }
  .nr-continue .nr-cover { width: 72px; }
  .nr-vocab-phonetic, .nr-vocab-source { display: none; }
  .nr-reading { padding-left: 4px; padding-right: 4px; }
  .nr-book-more { opacity: .9; }
}
`;

// src-client/index.jsx
var NAV = [
  ["library", "\u4E66\u67B6"],
  ["vocabulary", "\u751F\u8BCD\u672C"],
  ["practice", "\u7EC3\u4E60"],
  ["history", "\u5386\u53F2"],
  ["settings", "\u8BBE\u7F6E"]
];
function App() {
  const [state, setState] = (0, import_react8.useState)(null);
  const [view, setView] = (0, import_react8.useState)("library");
  const [reader, setReader] = (0, import_react8.useState)(null);
  const [toast, setToast] = (0, import_react8.useState)(null);
  const [practiceScope, setPracticeScope] = (0, import_react8.useState)(null);
  const [loading, setLoading] = (0, import_react8.useState)(true);
  const [loadError, setLoadError] = (0, import_react8.useState)("");
  const timerRef = import_react8.default.useRef(null);
  const notify = (text, error = false) => {
    clearTimeout(timerRef.current);
    setToast({ text, error, key: Date.now() });
    timerRef.current = setTimeout(() => setToast(null), 3200);
  };
  const refresh = async () => {
    try {
      const data = await api("/state");
      setState(data);
      setLoadError("");
    } catch (error) {
      setLoadError(error.message);
      notify(error.message, true);
    } finally {
      setLoading(false);
    }
  };
  (0, import_react8.useEffect)(() => {
    refresh();
  }, []);
  const openReader = (book, chapterIndex) => {
    setReader({ bookId: book.id, chapterIndex: chapterIndex ?? book.progress?.chapterIndex ?? 0 });
  };
  if (reader) {
    return /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, null, /* @__PURE__ */ import_react8.default.createElement("style", null, CSS), /* @__PURE__ */ import_react8.default.createElement("div", { className: "nr-app", style: { paddingTop: "calc(18px + var(--dsh-frame-top-clearance, 0px))" } }, /* @__PURE__ */ import_react8.default.createElement(
      ReaderView,
      {
        bookId: reader.bookId,
        initialChapter: reader.chapterIndex,
        onBack: () => {
          setReader(null);
          refresh();
        },
        onRefresh: refresh,
        notify
      }
    )), /* @__PURE__ */ import_react8.default.createElement(Toast, { toast }));
  }
  return /* @__PURE__ */ import_react8.default.createElement(import_react8.default.Fragment, null, /* @__PURE__ */ import_react8.default.createElement("style", null, CSS), /* @__PURE__ */ import_react8.default.createElement("div", { className: "nr-app" }, /* @__PURE__ */ import_react8.default.createElement("header", { className: "nr-top" }, /* @__PURE__ */ import_react8.default.createElement("div", { className: "nr-brand" }, /* @__PURE__ */ import_react8.default.createElement("svg", { width: "22", height: "22", viewBox: "0 0 36 36", "aria-hidden": "true" }, /* @__PURE__ */ import_react8.default.createElement("path", { d: "M5.5 8.1c4.7-1.8 8.6-.9 12.5 2.1v17.9c-3.9-3-7.8-3.9-12.5-2.1V8.1Z", fill: "#2F6F62" }), /* @__PURE__ */ import_react8.default.createElement("path", { d: "M30.5 8.1c-4.7-1.8-8.6-.9-12.5 2.1v17.9c3.9-3 7.8-3.9 12.5-2.1V8.1Z", fill: "#4E9C8B" }), /* @__PURE__ */ import_react8.default.createElement("path", { d: "M18 10.8v17.1", stroke: "#F7F3EA", strokeWidth: "1.5", strokeLinecap: "round" })), /* @__PURE__ */ import_react8.default.createElement("span", { className: "nr-brand-name" }, "Novel Reader")), /* @__PURE__ */ import_react8.default.createElement("nav", { className: "nr-nav", "aria-label": "Novel Reader" }, NAV.map(([value, label]) => /* @__PURE__ */ import_react8.default.createElement("button", { key: value, type: "button", className: view === value ? "is-on" : "", onClick: () => setView(value) }, label))), /* @__PURE__ */ import_react8.default.createElement("div", { className: "nr-sync" }, /* @__PURE__ */ import_react8.default.createElement("span", { className: `nr-dot ${state?.settings?.sync?.enabled ? state?.sync?.lastResult?.errors?.length ? "is-bad" : "" : "is-idle"}` }), state?.settings?.sync?.enabled ? state.sync?.lastSyncAt ? `\u5DF2\u540C\u6B65 ${relativeTime(state.sync.lastSyncAt)}` : "\u672A\u540C\u6B65" : "\u672C\u673A\u6A21\u5F0F")), /* @__PURE__ */ import_react8.default.createElement("main", { className: "nr-content" }, loading ? /* @__PURE__ */ import_react8.default.createElement(Spinner, null) : null, !loading && !state ? /* @__PURE__ */ import_react8.default.createElement("div", { className: "nr-page" }, /* @__PURE__ */ import_react8.default.createElement(Empty, { title: "\u6570\u636E\u6CA1\u52A0\u8F7D\u51FA\u6765", action: /* @__PURE__ */ import_react8.default.createElement("button", { type: "button", className: "nr-btn is-primary", onClick: refresh }, "\u91CD\u8BD5") }, loadError || "\u8BF7\u7A0D\u540E\u518D\u8BD5\u3002")) : null, !loading && state && view === "library" ? /* @__PURE__ */ import_react8.default.createElement(LibraryView, { books: state.books ?? [], onOpen: openReader, onRefresh: refresh, notify }) : null, !loading && state && view === "vocabulary" ? /* @__PURE__ */ import_react8.default.createElement(VocabView, { state, notify, onRefresh: refresh, onPractice: (scope) => {
    setPracticeScope(scope);
    setView("practice");
  } }) : null, !loading && state && view === "practice" ? /* @__PURE__ */ import_react8.default.createElement(PracticeView, { state, notify, onRefresh: refresh, initialScope: practiceScope }) : null, !loading && state && view === "history" ? /* @__PURE__ */ import_react8.default.createElement(HistoryView, { notify }) : null, !loading && state && view === "settings" ? /* @__PURE__ */ import_react8.default.createElement(SettingsView, { state, notify, onRefresh: refresh }) : null)), /* @__PURE__ */ import_react8.default.createElement(Toast, { toast }));
}
function BookIcon(owner = {}) {
  const size = owner.size ?? 16;
  return /* @__PURE__ */ import_react8.default.createElement("svg", { width: size, height: size, viewBox: "0 0 36 36", "aria-hidden": "true", style: { display: "block" } }, /* @__PURE__ */ import_react8.default.createElement("path", { d: "M5.5 8.1c4.7-1.8 8.6-.9 12.5 2.1v17.9c-3.9-3-7.8-3.9-12.5-2.1V8.1Z", fill: "currentColor", opacity: owner.active ? 1 : 0.82 }), /* @__PURE__ */ import_react8.default.createElement("path", { d: "M30.5 8.1c-4.7-1.8-8.6-.9-12.5 2.1v17.9c3.9-3 7.8-3.9 12.5-2.1V8.1Z", fill: "currentColor", opacity: owner.active ? 0.72 : 0.5 }), /* @__PURE__ */ import_react8.default.createElement("path", { d: "M18 10.8v17.1", stroke: "var(--dsw-alias-bg-base, #fff)", strokeWidth: "1.6", strokeLinecap: "round" }), /* @__PURE__ */ import_react8.default.createElement("path", { d: "M23.7 8.7v9.1l2.5-1.6 2.5 1.6V9.3", fill: "#D9A441" }));
}
var NS = "novel-reader";
var inject = ["slots", "locale"];
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS, {
    zh: { nav: "\u9605\u8BFB" },
    en: { nav: "Reading" }
  }), "novel-reader: locale");
  const t = ctx.locale.bind(NS);
  ctx.effect(() => ctx.slots.inject("main", () => ctx.slots.register({
    name: "main",
    key: "novel-reader",
    locale: NS
  }, App)), "novel-reader: main panel");
  ctx.effect(() => ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({
    name: "sidebar.panellist",
    id: "novel-reader",
    order: 40,
    label: () => t("nav"),
    locale: NS
  }, BookIcon)), "novel-reader: sidebar entry");
}

    return module.exports;
  }
});
