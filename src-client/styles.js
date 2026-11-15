export const CSS = `
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
`
