(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))a(t);new MutationObserver(t=>{for(const e of t)if(e.type==="childList")for(const r of e.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&a(r)}).observe(document,{childList:!0,subtree:!0});function n(t){const e={};return t.integrity&&(e.integrity=t.integrity),t.referrerPolicy&&(e.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?e.credentials="include":t.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function a(t){if(t.ep)return;t.ep=!0;const e=n(t);fetch(t.href,e)}})();(function(){if(window.__AICX_WIDGET_LOADED__){console.warn("[AI-CX Widget] Already initialised – skipping.");return}window.__AICX_WIDGET_LOADED__=!0;const o=document.currentScript||function(){const c=document.getElementsByTagName("script");return c[c.length-1]}(),i={apiUrl:o.getAttribute("data-api-url")||"https://my-ai-bot-backend.onrender.com/widget.bundle.js",theme:o.getAttribute("data-theme")||"dark",companyName:o.getAttribute("data-company-name")||"Support",primaryColor:o.getAttribute("data-primary-color")||"#6C63FF",position:o.getAttribute("data-position")||"bottom-right",welcomeMessage:o.getAttribute("data-welcome-message")||"Hi! I'm your AI assistant. How can I help you today?"};window.__AICX_CONFIG__=i;const n=document.createElement("div");n.id="aicx-widget-host",n.style.cssText=["position: fixed",i.position.includes("right")?"right: 24px":"left: 24px",i.position.includes("bottom")?"bottom: 24px":"top: 24px","z-index: 2147483647","width: 0","height: 0","overflow: visible","font-size: 0","line-height: 0"].join(";"),document.body.appendChild(n);const a=n.attachShadow({mode:"closed"}),t=document.createElement("div");t.id="aicx-root",a.appendChild(t),window.__AICX_SHADOW_ROOT__=a,window.__AICX_MOUNT_POINT__=t;const e=document.createElement("script");e.src="https://cdn.tailwindcss.com",e.onload=()=>{window.tailwind&&window.tailwind.config&&window.tailwind.config({corePlugins:{preflight:!1}})},document.head.appendChild(e);const r=document.createElement("link");r.rel="stylesheet",r.href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500&display=swap",document.head.appendChild(r);const d=document.createElement("style");d.textContent=`
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
  `,a.insertBefore(d,t);const s=document.createElement("script");s.src=o.getAttribute("data-bundle-url")||`${i.apiUrl}/widget.bundle.js`,s.type="text/javascript",s.async=!0,s.onerror=()=>{console.error("[AI-CX Widget] Failed to load widget bundle from:",s.src)},document.body.appendChild(s),window.AICXWidget={open:()=>window.dispatchEvent(new CustomEvent("aicx:open")),close:()=>window.dispatchEvent(new CustomEvent("aicx:close")),toggle:()=>window.dispatchEvent(new CustomEvent("aicx:toggle")),sendMessage:c=>window.dispatchEvent(new CustomEvent("aicx:sendMessage",{detail:{text:c}})),destroy:()=>{document.body.removeChild(n),delete window.__AICX_WIDGET_LOADED__,delete window.AICXWidget}},window.dispatchEvent(new CustomEvent("aicx:ready",{detail:{config:i}}))})();
