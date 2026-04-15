/**
 * widget-loader.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Drop-in loader for the AI Support Widget.
 * Paste ONE script tag on the client's site — this file does everything else.
 *
 * <script
 *   src="https://your-cdn.com/widget-loader.js"
 *   data-api-url="https://your-backend.com"
 *   data-theme="dark"
 *   data-company-name="Acme Corp"
 *   data-primary-color="#6C63FF"
 *   defer
 * ></script>
 * ─────────────────────────────────────────────────────────────────────────────
 */

(function () {
  "use strict";

  // ── 1. Guard against double-initialisation ──────────────────────────────────
  if (window.__AICX_WIDGET_LOADED__) {
    console.warn("[AI-CX Widget] Already initialised – skipping.");
    return;
  }
  window.__AICX_WIDGET_LOADED__ = true;

  // ── 2. Read configuration from the <script> tag's data-* attributes ─────────
  const currentScript =
    document.currentScript ||
    (function () {
      const scripts = document.getElementsByTagName("script");
      return scripts[scripts.length - 1];
    })();

  const CONFIG = {
    apiUrl:
      currentScript.getAttribute("data-api-url") ||
      "http://localhost:3001",
    theme: currentScript.getAttribute("data-theme") || "dark",
    companyName:
      currentScript.getAttribute("data-company-name") || "Support",
    primaryColor:
      currentScript.getAttribute("data-primary-color") || "#6C63FF",
    position: currentScript.getAttribute("data-position") || "bottom-right",
    welcomeMessage:
      currentScript.getAttribute("data-welcome-message") ||
      "Hi! I'm your AI assistant. How can I help you today?",
  };

  // Expose config globally so the React bundle can read it
  window.__AICX_CONFIG__ = CONFIG;

  // ── 3. Create the host element and attach a Shadow DOM ──────────────────────
  const hostEl = document.createElement("div");
  hostEl.id = "aicx-widget-host";
  hostEl.style.cssText = [
    "position: fixed",
    CONFIG.position.includes("right") ? "right: 24px" : "left: 24px",
    CONFIG.position.includes("bottom") ? "bottom: 24px" : "top: 24px",
    "z-index: 2147483647", // max z-index – always on top
    "width: 0",
    "height: 0",
    "overflow: visible",
    "font-size: 0",           // prevents host from affecting host page layout
    "line-height: 0",
  ].join(";");

  document.body.appendChild(hostEl);

  // Attach Shadow DOM (closed mode – host page JS cannot pierce it)
  const shadow = hostEl.attachShadow({ mode: "closed" });

  // Provide a mount point inside the shadow root
  const mountPoint = document.createElement("div");
  mountPoint.id = "aicx-root";
  shadow.appendChild(mountPoint);

  // Expose the shadow root so the React bundle can render into it
  window.__AICX_SHADOW_ROOT__ = shadow;
  window.__AICX_MOUNT_POINT__ = mountPoint;

  // ── 4. Inject Tailwind CDN inside Shadow DOM ────────────────────────────────
  //    (Shadow DOM blocks external stylesheets on the host page, so we load
  //     Tailwind's Play CDN directly inside the shadow root.)
  const tailwindScript = document.createElement("script");
  tailwindScript.src = "https://cdn.tailwindcss.com";
  tailwindScript.onload = () => {
    // Tailwind normally scans document.head; tell it to target our shadow root
    if (window.tailwind && window.tailwind.config) {
      window.tailwind.config({ corePlugins: { preflight: false } });
    }
  };
  // Tailwind CDN writes <style> to document.head by default, which is fine –
  // we will also inject our own <style> block into the shadow root for
  // widget-specific styles that Tailwind won't generate on its own.
  document.head.appendChild(tailwindScript);

  // ── 5. Inject Google Fonts into the DOCUMENT head (fonts are global) ────────
  const fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href =
    "https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap";
  document.head.appendChild(fontLink);

  // ── 6. Inject base styles INTO the shadow root ──────────────────────────────
  const baseStyle = document.createElement("style");
  baseStyle.textContent = `
    :host, #aicx-root, #aicx-root * {
      box-sizing: border-box;
      font-family: 'DM Sans', sans-serif;
    }
    /* Scrollbar styling scoped to widget */
    #aicx-root ::-webkit-scrollbar { width: 4px; }
    #aicx-root ::-webkit-scrollbar-track { background: transparent; }
    #aicx-root ::-webkit-scrollbar-thumb {
      background: rgba(255,255,255,0.15);
      border-radius: 999px;
    }
    /* Remove default button/input browser chrome */
    #aicx-root button { cursor: pointer; border: none; outline: none; }
    #aicx-root input, #aicx-root textarea {
      outline: none;
      font-family: inherit;
    }
    /* Typing dots animation */
    @keyframes aicx-bounce {
      0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
      40%           { transform: translateY(-6px); opacity: 1; }
    }
    .aicx-dot {
      display: inline-block;
      width: 6px; height: 6px;
      border-radius: 50%;
      background: currentColor;
      animation: aicx-bounce 1.2s ease-in-out infinite;
    }
    .aicx-dot:nth-child(1) { animation-delay: 0s; }
    .aicx-dot:nth-child(2) { animation-delay: 0.2s; }
    .aicx-dot:nth-child(3) { animation-delay: 0.4s; }
    /* Glassmorphism backdrop support */
    @supports not (backdrop-filter: blur(1px)) {
      .aicx-glass { background: rgba(15, 15, 30, 0.97) !important; }
    }
    /* Notification badge pulse */
    @keyframes aicx-pulse-ring {
      0%   { transform: scale(1);   opacity: 0.8; }
      100% { transform: scale(1.6); opacity: 0;   }
    }
    .aicx-pulse-ring {
      animation: aicx-pulse-ring 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
    }
    /* Gradient text */
    .aicx-gradient-text {
      background: linear-gradient(135deg, #a78bfa 0%, #60a5fa 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  `;
  shadow.insertBefore(baseStyle, mountPoint);

  // ── 7. Load the React widget bundle ─────────────────────────────────────────
  //    The bundle (built by Vite/Webpack) calls ReactDOM.render() into
  //    window.__AICX_MOUNT_POINT__ using window.__AICX_CONFIG__.
  const bundleScript = document.createElement("script");
  // In production this points to your CDN; locally it's served by the dev server.
  bundleScript.src =
    currentScript.getAttribute("data-bundle-url") ||
    `${CONFIG.apiUrl}/widget.bundle.js`;
  bundleScript.type = "text/javascript";
  bundleScript.async = true;
  bundleScript.onerror = () => {
    console.error(
      "[AI-CX Widget] Failed to load widget bundle from:",
      bundleScript.src
    );
  };
  document.body.appendChild(bundleScript);

  // ── 8. Public API (optional programmatic control from host page) ────────────
  window.AICXWidget = {
    open:  () => window.dispatchEvent(new CustomEvent("aicx:open")),
    close: () => window.dispatchEvent(new CustomEvent("aicx:close")),
    toggle:() => window.dispatchEvent(new CustomEvent("aicx:toggle")),
    sendMessage: (text) =>
      window.dispatchEvent(new CustomEvent("aicx:sendMessage", { detail: { text } })),
    destroy: () => {
      document.body.removeChild(hostEl);
      delete window.__AICX_WIDGET_LOADED__;
      delete window.AICXWidget;
    },
  };

  // Emit a ready event so host page can react
  window.dispatchEvent(new CustomEvent("aicx:ready", { detail: { config: CONFIG } }));
})();
