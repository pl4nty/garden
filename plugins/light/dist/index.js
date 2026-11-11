// src/palettes.ts
var day = {
  sky1: "#b9d0d9",
  sky2: "#edf0e4",
  ground1: "#e3e6d3",
  ground2: "#cfd6b8",
  sun: "#ffffff",
  sunA: 0.65,
  sunX: 50,
  sunY: 2,
  pool: "#fffbe0",
  poolA: 0.7,
  poolX: 52,
  shade: "#6f8478",
  shadeA: 0.1,
  g1: "#a6c07c",
  g2: "#76a563",
  g3: "#3b8440",
  g4: "#2a6a3c",
  stem: "#4f7d47",
  wood: "#6b5a45",
  straw: "#c8b572",
  p1: "#fbf8ec",
  p2: "#a99bd0",
  p3: "#ecd98a",
  yolk: "#dfae36",
  sh: "#34504a",
  shA: 0.28,
  shx: -0.4,
  shy: -0.24,
  hud: "#25332b",
  halo: "#edf0e4",
  stars: 0
};
var night = {
  sky1: "#060a13",
  sky2: "#101a2b",
  ground1: "#121c2b",
  ground2: "#0d151f",
  sun: "#a9bfe0",
  sunA: 0.16,
  sunX: 72,
  sunY: 14,
  pool: "#7f9cc4",
  poolA: 0.1,
  poolX: 60,
  shade: "#04070c",
  shadeA: 0.5,
  g1: "#c4d6c6",
  g2: "#9cbcab",
  g3: "#74a08d",
  g4: "#557f70",
  stem: "#6e9483",
  wood: "#7b8a86",
  straw: "#c0bf9f",
  p1: "#f3f5ee",
  p2: "#bdb8e8",
  p3: "#e9e2b4",
  yolk: "#dccd8c",
  sh: "#000000",
  shA: 0.38,
  shx: -0.45,
  shy: -0.2,
  hud: "#c5d0d6",
  halo: "#060a13",
  stars: 1
};
var dawn = {
  ...day,
  sky1: "#aebbd6",
  sky2: "#f1d6cf",
  ground1: "#e2d5d6",
  ground2: "#cfcdd2",
  sun: "#ffd8c6",
  sunA: 0.75,
  sunX: 86,
  sunY: 30,
  pool: "#ffe6d6",
  poolA: 0.5,
  poolX: 70,
  shade: "#5b6488",
  shadeA: 0.18,
  g1: "#9ab894",
  g2: "#6a9a78",
  g3: "#3b7a58",
  g4: "#275a4a",
  stem: "#4f7f62",
  wood: "#6a5f5a",
  straw: "#cdb98a",
  p1: "#fff8f0",
  p3: "#f0dd98",
  yolk: "#e0ac48",
  sh: "#4f5a86",
  shA: 0.2,
  shx: 2.3,
  shy: -0.14,
  hud: "#2c3348",
  halo: "#f1e4e4"
};
var morning = {
  ...day,
  sky1: "#c5d6de",
  sky2: "#eef0e2",
  sun: "#fff6dc",
  sunA: 0.7,
  sunX: 80,
  sunY: 14,
  pool: "#fffbe6",
  poolX: 64,
  shade: "#6f8478",
  shadeA: 0.12,
  sh: "#3f5e58",
  shA: 0.26,
  shx: 1.2,
  shy: -0.22
};
var afternoon = {
  ...day,
  sky2: "#f0eedc",
  sunX: 24,
  sunY: 12,
  poolX: 38,
  shx: -1,
  shy: -0.22
};
var golden = {
  ...day,
  sky1: "#c3cbd6",
  sky2: "#f4dba6",
  ground1: "#e9dcb6",
  ground2: "#d6c597",
  sun: "#ffcf73",
  sunA: 0.85,
  sunX: 10,
  sunY: 32,
  pool: "#ffe9ae",
  poolA: 0.6,
  poolX: 30,
  shade: "#7a5a4a",
  shadeA: 0.16,
  g1: "#b7b765",
  g2: "#869c48",
  g3: "#457a30",
  g4: "#2d5630",
  stem: "#5f7a3c",
  wood: "#6b5540",
  straw: "#d9b865",
  p1: "#fff3d6",
  p2: "#b79ac4",
  p3: "#f2d47a",
  yolk: "#e09a30",
  sh: "#5b4763",
  shA: 0.26,
  shx: -2.1,
  shy: -0.15,
  hud: "#33301f",
  halo: "#f4e6bf"
};
var dusk = {
  ...night,
  sky1: "#232a4d",
  sky2: "#a96a7c",
  ground1: "#4a4763",
  ground2: "#2a2e47",
  sun: "#ff9a78",
  sunA: 0.5,
  sunX: 6,
  sunY: 36,
  pool: "#b98aa0",
  poolA: 0.18,
  poolX: 24,
  shade: "#0d1024",
  shadeA: 0.4,
  g1: "#8fae96",
  g2: "#6a927f",
  g3: "#4a776b",
  g4: "#345c58",
  stem: "#527a6c",
  wood: "#5c5a66",
  straw: "#a99d86",
  p1: "#e9e2ea",
  p2: "#a79ad6",
  p3: "#d6c79a",
  yolk: "#cfa868",
  sh: "#0b0d20",
  shA: 0.3,
  shx: -2.8,
  shy: -0.12,
  hud: "#e6e1ee",
  halo: "#232a4d",
  stars: 0.25
};
var DAY = day;
var NIGHT = night;
var rgb = (hex2) => [1, 3, 5].map((i) => parseInt(hex2.slice(i, i + 2), 16));
var hex = (c) => `#${c.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
var mix = (a, b, k) => {
  const [x, y] = [rgb(a), rgb(b)];
  return hex([0, 1, 2].map((i) => x[i] + (y[i] - x[i]) * k));
};
var alpha = (colour, a) => `rgb(${rgb(colour).join(" ")} / ${Math.round(a * 100) / 100})`;
var PAGE = { light: "#f2f3ea", dark: "#0c1219" };
function cssVars(l, dark) {
  const n = (v) => String(Math.round(v * 100) / 100);
  const side = Math.min(1, Math.abs(l.shx) / 2.2);
  return {
    "--l-sky1": l.sky1,
    "--l-sky2": l.sky2,
    "--l-ground1": l.ground1,
    "--l-ground2": l.ground2,
    "--l-sun": alpha(l.sun, l.sunA),
    "--l-sun-x": `${n(l.sunX)}%`,
    "--l-sun-y": `${n(l.sunY)}%`,
    "--l-pool": alpha(l.pool, l.poolA),
    "--l-pool-x": `${n(l.poolX)}%`,
    "--l-shade": alpha(l.shade, l.shadeA),
    "--l-far": mix(l.ground1, l.g4, 0.3),
    "--g1": l.g1,
    "--g2": l.g2,
    "--g3": l.g3,
    "--g4": l.g4,
    "--stem": l.stem,
    "--wood": l.wood,
    "--straw": l.straw,
    "--p1": l.p1,
    "--p2": l.p2,
    "--p3": l.p3,
    "--yolk": l.yolk,
    "--sh": alpha(l.sh, l.shA),
    "--sha": n(1 - 0.75 * side),
    "--shb": n(0.3 * side * Math.sign(l.shx)),
    "--shx": n(l.shx),
    "--shy": n(l.shy),
    "--l-hud": l.hud,
    "--l-halo": l.halo,
    "--l-stars": n(l.stars),
    "--l-tint": dark ? mix(PAGE.dark, l.sky2, 0.6) : mix(PAGE.light, l.sky1, 0.35)
  };
}
var declarations = (vars) => Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(";");

// src/light.inline.ts
var light_inline_default = '"use strict";(()=>{var l={sky1:"#b9d0d9",sky2:"#edf0e4",ground1:"#e3e6d3",ground2:"#cfd6b8",sun:"#ffffff",sunA:.65,sunX:50,sunY:2,pool:"#fffbe0",poolA:.7,poolX:52,shade:"#6f8478",shadeA:.1,g1:"#a6c07c",g2:"#76a563",g3:"#3b8440",g4:"#2a6a3c",stem:"#4f7d47",wood:"#6b5a45",straw:"#c8b572",p1:"#fbf8ec",p2:"#a99bd0",p3:"#ecd98a",yolk:"#dfae36",sh:"#34504a",shA:.28,shx:-.4,shy:-.24,hud:"#25332b",halo:"#edf0e4",stars:0},f={sky1:"#060a13",sky2:"#101a2b",ground1:"#121c2b",ground2:"#0d151f",sun:"#a9bfe0",sunA:.16,sunX:72,sunY:14,pool:"#7f9cc4",poolA:.1,poolX:60,shade:"#04070c",shadeA:.5,g1:"#c4d6c6",g2:"#9cbcab",g3:"#74a08d",g4:"#557f70",stem:"#6e9483",wood:"#7b8a86",straw:"#c0bf9f",p1:"#f3f5ee",p2:"#bdb8e8",p3:"#e9e2b4",yolk:"#dccd8c",sh:"#000000",shA:.38,shx:-.45,shy:-.2,hud:"#c5d0d6",halo:"#060a13",stars:1},O={...l,sky1:"#aebbd6",sky2:"#f1d6cf",ground1:"#e2d5d6",ground2:"#cfcdd2",sun:"#ffd8c6",sunA:.75,sunX:86,sunY:30,pool:"#ffe6d6",poolA:.5,poolX:70,shade:"#5b6488",shadeA:.18,g1:"#9ab894",g2:"#6a9a78",g3:"#3b7a58",g4:"#275a4a",stem:"#4f7f62",wood:"#6a5f5a",straw:"#cdb98a",p1:"#fff8f0",p3:"#f0dd98",yolk:"#e0ac48",sh:"#4f5a86",shA:.2,shx:2.3,shy:-.14,hud:"#2c3348",halo:"#f1e4e4"},j={...l,sky1:"#c5d6de",sky2:"#eef0e2",sun:"#fff6dc",sunA:.7,sunX:80,sunY:14,pool:"#fffbe6",poolX:64,shade:"#6f8478",shadeA:.12,sh:"#3f5e58",shA:.26,shx:1.2,shy:-.22},D={...l,sky2:"#f0eedc",sunX:24,sunY:12,poolX:38,shx:-1,shy:-.22},C={...l,sky1:"#c3cbd6",sky2:"#f4dba6",ground1:"#e9dcb6",ground2:"#d6c597",sun:"#ffcf73",sunA:.85,sunX:10,sunY:32,pool:"#ffe9ae",poolA:.6,poolX:30,shade:"#7a5a4a",shadeA:.16,g1:"#b7b765",g2:"#869c48",g3:"#457a30",g4:"#2d5630",stem:"#5f7a3c",wood:"#6b5540",straw:"#d9b865",p1:"#fff3d6",p2:"#b79ac4",p3:"#f2d47a",yolk:"#e09a30",sh:"#5b4763",shA:.26,shx:-2.1,shy:-.15,hud:"#33301f",halo:"#f4e6bf"},I={...f,sky1:"#232a4d",sky2:"#a96a7c",ground1:"#4a4763",ground2:"#2a2e47",sun:"#ff9a78",sunA:.5,sunX:6,sunY:36,pool:"#b98aa0",poolA:.18,poolX:24,shade:"#0d1024",shadeA:.4,g1:"#8fae96",g2:"#6a927f",g3:"#4a776b",g4:"#345c58",stem:"#527a6c",wood:"#5c5a66",straw:"#a99d86",p1:"#e9e2ea",p2:"#a79ad6",p3:"#d6c79a",yolk:"#cfa868",sh:"#0b0d20",shA:.3,shx:-2.8,shy:-.12,hud:"#e6e1ee",halo:"#232a4d",stars:.25};var y=[[0,f],[4.7,f],[6.1,O],[8.5,j],[12.5,l],[15.5,D],[17.6,C],[19.1,I],[20.6,f],[24,f]],M=t=>t<5.4||t>=18.5;function S(t){return t<4.7||t>=20.4?"night":t<7.2?"dawn":t<11?"morning":t<14?"midday":t<16.6?"afternoon":t<18.4?"golden hour":"dusk"}var w=t=>[1,3,5].map(e=>parseInt(t.slice(e,e+2),16)),N=t=>`#${t.map(e=>Math.round(e).toString(16).padStart(2,"0")).join("")}`,A=(t,e,s)=>{let[o,d]=[w(t),w(e)];return N([0,1,2].map(a=>o[a]+(d[a]-o[a])*s))},k=(t,e)=>`rgb(${w(t).join(" ")} / ${Math.round(e*100)/100})`;function $(t){let e=(t%24+24)%24,s=0;for(;s<y.length-2&&y[s+1][0]<=e;)s++;let[o,d]=y[s],[a,c]=y[s+1],g=(e-o)/(a-o),b=g*g*(3-2*g),n={};for(let i of Object.keys(d)){let[r,p]=[d[i],c[i]];n[i]=typeof r=="number"?r+(p-r)*b:A(r,p,b)}return n}var X={light:"#f2f3ea",dark:"#0c1219"};function E(t,e){let s=d=>String(Math.round(d*100)/100),o=Math.min(1,Math.abs(t.shx)/2.2);return{"--l-sky1":t.sky1,"--l-sky2":t.sky2,"--l-ground1":t.ground1,"--l-ground2":t.ground2,"--l-sun":k(t.sun,t.sunA),"--l-sun-x":`${s(t.sunX)}%`,"--l-sun-y":`${s(t.sunY)}%`,"--l-pool":k(t.pool,t.poolA),"--l-pool-x":`${s(t.poolX)}%`,"--l-shade":k(t.shade,t.shadeA),"--l-far":A(t.ground1,t.g4,.3),"--g1":t.g1,"--g2":t.g2,"--g3":t.g3,"--g4":t.g4,"--stem":t.stem,"--wood":t.wood,"--straw":t.straw,"--p1":t.p1,"--p2":t.p2,"--p3":t.p3,"--yolk":t.yolk,"--sh":k(t.sh,t.shA),"--sha":s(1-.75*o),"--shb":s(.3*o*Math.sign(t.shx)),"--shx":s(t.shx),"--shy":s(t.shy),"--l-hud":t.hud,"--l-halo":t.halo,"--l-stars":s(t.stars),"--l-tint":e?A(X.dark,t.sky2,.6):A(X.light,t.sky1,.35)}}var h=["auto","light","dark"],m=document.documentElement,x=[],Y=()=>{let t=localStorage.getItem("theme");return t==="light"||t==="dark"?t:"auto"},q=()=>{let t=new URLSearchParams(location.search).get("t");return t!==null&&t!==""&&!isNaN(Number(t))?Number(t):void 0},P=()=>{let t=new Date;return t.getHours()+t.getMinutes()/60},T=t=>{let e=Math.floor(t)%24,s=Math.floor(t%1*60+1e-6);return`${e%12||12}:${String(s).padStart(2,"0")} ${e<12?"am":"pm"}`};function u(){let t=q(),e=t===void 0?Y():"auto",s=t===void 0&&matchMedia("(prefers-color-scheme: dark)").matches,o=t??P(),d=t===void 0&&navigator.webdriver,a=e==="auto"&&!s&&!d,c=a?M(o)?"dark":"light":e==="light"||e==="auto"&&!s?"light":"dark";for(let n of x)m.style.removeProperty(n);if(x=[],a){let n=E($(o),c==="dark");for(let[i,r]of Object.entries(n))m.style.setProperty(i,r);x=Object.keys(n)}let g=m.getAttribute("saved-theme");m.setAttribute("saved-theme",c),m.dataset.light=e,document.body&&(document.body.classList.remove("theme-dark","theme-light"),document.body.classList.add(`theme-${c}`)),g!==null&&g!==c&&document.dispatchEvent(new CustomEvent("themechange",{detail:{theme:c}}));let b=a?S(o):"";for(let n of document.querySelectorAll("[data-light-name]"))n.textContent=b;for(let n of document.querySelectorAll("[data-light-clock]"))n.textContent=T(o);for(let n of document.querySelectorAll("[data-light-switch]")){let i=e==="auto"?"Auto":e==="light"?"Day":"Night",r=h[(h.indexOf(e)+1)%h.length],p=r==="auto"?"your local time":r==="light"?"day":"night";n.dataset.mode=e;let L=n.querySelector("[data-light-label]");L&&(L.textContent=i);let v=a?"follows your local time":e==="auto"?`automatic, which is ${c==="dark"?"night while your system asks for dark":"day"}`:i.toLowerCase();n.setAttribute("aria-label",`Light: ${v}. Switch to ${p}.`),n.title=`Light: ${v}`}}u();var R=()=>{let t=h[(h.indexOf(Y())+1)%h.length];t==="auto"?localStorage.removeItem("theme"):localStorage.setItem("theme",t),u()};document.addEventListener("nav",()=>{u();for(let t of document.querySelectorAll("[data-light-switch]"))t.addEventListener("click",R),window.addCleanup(()=>t.removeEventListener("click",R))});setInterval(u,6e4);document.addEventListener("visibilitychange",()=>document.hidden||u());matchMedia("(prefers-color-scheme: dark)").addEventListener("change",u);})();\n';

// src/light.scss
var light_default = ".light-switch{display:inline-flex;align-items:center;gap:.4em;margin:0;padding:0;border:0;background:none;font:inherit;color:inherit;cursor:pointer}.light-switch svg{flex:none;fill:none;stroke:currentColor;stroke-width:1.2;stroke-linecap:round;stroke-linejoin:round}.light-switch .light-day,.light-switch .light-night{display:none}.light-switch[data-mode=light] .light-auto{display:none}.light-switch[data-mode=light] .light-day{display:inline}.light-switch[data-mode=dark] .light-auto{display:none}.light-switch[data-mode=dark] .light-night{display:inline}";

// src/Light.tsx
import { jsx, jsxs } from "preact/jsx-runtime";
var Light_default = (() => {
  const Light = ({ displayClass }) => /* @__PURE__ */ jsxs(
    "button",
    {
      type: "button",
      class: `light-switch ${displayClass ?? ""}`,
      "data-light-switch": true,
      "aria-label": "Light",
      children: [
        /* @__PURE__ */ jsxs("svg", { viewBox: "0 0 16 16", width: "14", height: "14", "aria-hidden": "true", children: [
          /* @__PURE__ */ jsx("g", { class: "light-auto", children: /* @__PURE__ */ jsx("path", { d: "M1.5 11.5h13M4.6 11.5a3.4 3.4 0 0 1 6.8 0M8 3.2v1.6M2.9 5.9l1.1 1.1M13.1 5.9 12 7" }) }),
          /* @__PURE__ */ jsxs("g", { class: "light-day", children: [
            /* @__PURE__ */ jsx("circle", { cx: "8", cy: "8", r: "3" }),
            /* @__PURE__ */ jsx("path", { d: "M8 1.6v1.6M8 12.8v1.6M1.6 8h1.6M12.8 8h1.6M3.5 3.5l1.1 1.1M11.4 11.4l1.1 1.1M3.5 12.5l1.1-1.1M11.4 4.6l1.1-1.1" })
          ] }),
          /* @__PURE__ */ jsx("g", { class: "light-night", children: /* @__PURE__ */ jsx("path", { d: "M12.9 9.8A5.4 5.4 0 0 1 6.2 3.1a5.4 5.4 0 1 0 6.7 6.7z" }) })
        ] }),
        /* @__PURE__ */ jsx("span", { "data-light-label": true, children: "Auto" })
      ]
    }
  );
  const dayVars = declarations(cssVars(DAY, false));
  const nightVars = declarations(cssVars(NIGHT, true));
  Light.css = `:root{${dayVars};--page:${PAGE.light}}:root[saved-theme="dark"]{${nightVars};--page:${PAGE.dark}}@media (scripting:none) and (prefers-color-scheme:dark){:root{${nightVars};--page:${PAGE.dark}}}` + light_default;
  Light.beforeDOMLoaded = light_inline_default;
  return Light;
});
export {
  Light_default as Light
};
