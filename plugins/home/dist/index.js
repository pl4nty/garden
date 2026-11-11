// src/components/Home.tsx
import { resolveRelative } from "@quartz-community/utils";

// ../note-plant/src/components/stats.ts
import { simplifySlug } from "@quartz-community/utils";
function noteStats(file, allFiles) {
  const here = simplifySlug(file.slug ?? "");
  const pages = new Set(allFiles.map((f) => simplifySlug(f.slug ?? "")));
  const linksOut = new Set(
    (file.links ?? []).filter((link) => link !== here && pages.has(link))
  ).size;
  const linksIn = allFiles.filter(
    (f) => f.slug !== file.slug && (f.links ?? []).includes(here)
  ).length;
  const words = (file.text ?? "").split(/\s+/).filter(Boolean).length;
  return { words, linksOut, linksIn };
}

// ../shared/pages.ts
import { getDate } from "@quartz-community/utils";
var titleOf = (f) => f.frontmatter?.title ?? f.slug ?? "";
function dateOf(f, cfg) {
  const type = f.defaultDateType ?? cfg.defaultDateType;
  if (!type) return void 0;
  return getDate({ ...f, defaultDateType: type });
}
var dayMonthYear = (date, locale) => date.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
function newestFirst(allFiles, cfg, folders) {
  const prefixes = folders.map((folder) => `${folder.replace(/\/$/, "")}/`);
  return allFiles.filter((f) => {
    const slug = f.slug ?? "";
    return prefixes.some((prefix) => slug.startsWith(prefix)) && !slug.endsWith("/index");
  }).map((f) => ({ f, date: dateOf(f, cfg) })).filter((page) => Boolean(page.date)).sort((a, b) => b.date.getTime() - a.date.getTime());
}

// ../shared/garden/garden.inline.ts
var garden_inline_default = '"use strict";(()=>{var at=Object.defineProperty;var ct=(n,t,e)=>t in n?at(n,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):n[t]=e;var B=(n,t,e)=>ct(n,typeof t!="symbol"?t+"":t,e);var K=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5],H=class{constructor(t,e){B(this,"w",t);B(this,"h",e);B(this,"g");B(this,"p");B(this,"m");B(this,"x0",0);B(this,"y0",0);B(this,"x1",-1);B(this,"y1",-1);this.g=new Float32Array(t*e),this.p=new Float32Array(t*e),this.m=new Uint8Array(t*e),this.reset()}reset(){this.x0=this.w,this.y0=this.h,this.x1=-1,this.y1=-1}set(t,e,s,p){if(t<0||e<0||t>=this.w||e>=this.h)return;let o=e*this.w+t;this.g[o]=s,this.p[o]=p,this.m[o]=1,t<this.x0&&(this.x0=t),t>this.x1&&(this.x1=t),e<this.y0&&(this.y0=e),e>this.y1&&(this.y1=e)}};function q(n,t,e,s,p,o){for(let a=Math.floor(e-s);a<=Math.ceil(e+s);a++)for(let r=Math.floor(t-s);r<=Math.ceil(t+s);r++)Math.hypot(r+.5-t,a+.5-e)<=s&&n.set(r,a,p,o)}function T(n,t,e,s,p,o,a,r){let c=o/2,i=s-t,d=p-e,E=i*i+d*d||1;for(let b=Math.floor(Math.min(e,p)-c);b<=Math.ceil(Math.max(e,p)+c);b++)for(let P=Math.floor(Math.min(t,s)-c);P<=Math.ceil(Math.max(t,s)+c);P++){let v=P+.5-t,S=b+.5-e,N=Math.max(0,Math.min(1,(v*i+S*d)/E));Math.hypot(v-N*i,S-N*d)<=c&&n.set(P,b,a,r)}}function z(n,t,e,s,p,o){for(let a=0;a<t.length-1;a++){let r=t[a],c=t[a+1],i=e+(s-e)*a/Math.max(1,t.length-2);T(n,r[0],r[1],c[0],c[1],i,p,o)}}function D(n,t,e,s){let p=[];for(let o=0;o<=s;o++){let a=o/s,r=1-a;p.push([r*r*n[0]+2*r*a*t[0]+a*a*e[0],r*r*n[1]+2*r*a*t[1]+a*a*e[1]])}return p}function V(n,t,e,s,p,o,a,r){let c=Math.cos(s),i=Math.sin(s),d=p+1,E=c>=0?-1:1;for(let b=Math.floor(e-d);b<=Math.ceil(e+d);b++)for(let P=Math.floor(t-d);P<=Math.ceil(t+d);P++){let v=P+.5-t,S=b+.5-e,N=(v*c+S*i)/p;if(N<0||N>1)continue;let F=-v*i+S*c,j=o/2*Math.sin(Math.PI*Math.pow(N,.72))+.35;Math.abs(F)>j||n.set(P,b,F*E>.3?a:r,0)}}function Q(n,t){let{w:e,h:s}=n,p=[];if(t.x1<0)return new Int32Array(0);for(let o=Math.max(0,t.y0-1);o<=Math.min(s-1,t.y1+1);o++)for(let a=Math.max(0,t.x0-1);a<=Math.min(e-1,t.x1+1);a++){let r=o*e+a;if(t.m[r])continue;(a>0&&t.m[r-1]||a<e-1&&t.m[r+1]||o>0&&t.m[r-e]||o<s-1&&t.m[r+e])&&(n.g[r]=0)}for(let o=t.y0;o<=t.y1;o++)for(let a=t.x0;a<=t.x1;a++){let r=o*e+a;t.m[r]&&(n.g[r]=t.g[r],n.p[r]=t.p[r],p.push(r),t.g[r]=0,t.p[r]=0,t.m[r]=0)}return t.reset(),Int32Array.from(p)}function X(n,t,e,s){let{w:p,h:o,g:a,p:r}=n;for(let c=0;c<o;c++)for(let i=0;i<p;i++){let d=c*p+i,E=a[d]>(K[(c&3)*4+(i&3)]+.5)/16,P=Math.max(r[d],t?t[d]:0)>(K[(c+2&3)*4+(i+1&3)]+.5)/16,v=E&&P?s.over:E?s.ink1:P?s.ink2:s.paper;e[d*4]=v[0],e[d*4+1]=v[1],e[d*4+2]=v[2],e[d*4+3]=255}}var Z=["bay","fern","reed","gum"];function Y(n){let t=2166136261;for(let e=0;e<n.length;e++)t^=n.charCodeAt(e),t=Math.imul(t,16777619);return t>>>0}function _(n){let t=Y(n);return()=>{t=t+1831565813|0;let e=Math.imul(t^t>>>15,1|t);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}function W(n){let t=n.split("/");if(t[0]==="posts")return"daisy";let e=t.slice(0,-1).join("/");return Z[(Y(e)>>>24)%Z.length]}function it(n){return Math.max(1,Math.min(7,Math.round(Math.log2(Math.max(n,40)/40))))}var L=(n,t)=>n[Math.max(0,Math.min(n.length-1,Math.round(t*(n.length-1))))];function tt(n,t,e,s,p=1){let o=_(t.seed),a=W(t.seed),r=it(t.words),c=Math.min(t.linksOut+t.linksIn,6),i=p;if(a==="fern"){let m=3+Math.floor(r/2);for(let h=0;h<m;h++){let u=h/(m-1)*2-1,l=u*1.1+(o()-.5)*.3,y=(14+r*5.4)*(.7+o()*.3)*i*(1-Math.abs(u)*.3),x=[e+Math.sin(l)*y*1.05,s-Math.cos(l)*y*.82],f=[e+Math.sin(l)*y*.3,s-y*.85],M=D([e,s],f,x,Math.ceil(y));z(n,M,1.1,1,1,0);for(let g=2;g<M.length-1;g+=2){let[I,k]=M[g],[$,w]=M[g+1],C=g/M.length,O=(1.2+3.8*Math.sin(Math.PI*Math.pow(C,.8)))*i,G=-(w-k),U=$-I,J=h%2===0?1:.6;T(n,I,k,I+G*O+($-I),k+U*O+(w-k),1,J,0),T(n,I,k,I-G*O+($-I),k-U*O+(w-k),1,J,0)}}for(let h=0;h<c;h++){let u=(h%2?1:-1)*(2+o()*5)*i,l=s-(6+o()*4+h*2.5)*i;z(n,D([e,s],[e+u*.2,l],[e+u,l],6),1,1,1,0),q(n,e+u,l,1.9*i+.2,0,1)}return}if(a==="reed"){let m=4+r,h=(16+r*5.4)*i;for(let u=0;u<m;u++){let l=h*(u<Math.max(1,c)?.82+o()*.18:.4+o()*.5),y=(o()-.5)*l*.75,x=[e+(o()-.5)*3*i,s],f=D(x,[x[0]+y*.1,s-l*.7],[x[0]+y,s-l],Math.ceil(l/1.5));if(z(n,f,u<c?1.2:1.7,1,u%3===2?.6:1,0),u<c){let[M,g]=f[f.length-1],[I,k]=f[f.length-2],$=Math.hypot(M-I,g-k)||1,w=(4.5+o()*2)*i;T(n,M,g,M+(M-I)/$*w,g+(g-k)/$*w,2.5*i,0,1)}}return}let d=a==="daisy",E=(d?14+r*5.2:9+r*4.6)*i,b=(o()-.5)*Math.min(12,E*.4),P=[e+b,s-E],v=D([e,s],[e-b*.4+(o()-.5)*4,s-E*.55],P,Math.ceil(E));z(n,v,r>=4?1.9:1.3,1.1,1,0);let S=Math.max(2,d?Math.ceil(r/2)+1:r),N=[],F=o()<.5?0:1;for(let m=0;m<S;m++){let h=[void 0,void 0];h[F]="leaf",o()<.66&&(h[1-F]="leaf"),N.push(h),F=1-F}if(!d){let m=[];N.forEach((h,u)=>h.forEach((l,y)=>m.push([u,y]))),m.sort((h,u)=>+(N[u[0]][u[1]]===void 0)-+(N[h[0]][h[1]]===void 0)||Y(`${t.seed}/${h}`)-Y(`${t.seed}/${u}`));for(let h=0;h<c&&h<m.length-1;h++){let[u,l]=m[h];N[u][l]="flower"}}for(let m=0;m<S;m++){let h=(m+.7)/(S+.6)*(d?.6:.92),[u,l]=L(v,h);for(let y of[0,1]){let x=N[m][y];if(!x)continue;let f=y===0?-1:1,M=1-m/S*.4,g=.25+o()*.5+m/S*.3,I=f>0?-g:Math.PI+g;if(x==="flower"){let k=(3.5+o()*2.5)*i,$=u+Math.cos(I)*k,w=l+Math.sin(I)*k-1;T(n,u,l,$,w,1,1,0),q(n,$,w,(2.1+o()*.6)*i,0,1)}else if(a==="gum"){let k=(2.1+o()*1.2)*i*M,$=u+Math.cos(I)*(k+2.2*i),w=l+Math.sin(I)*(k+2.2*i);T(n,u,l,$,w,1,1,0),q(n,$,w,k,1,0),q(n,$-.5*f,w-.7,k*.6,.5,0)}else{let k=(d?9+o()*4:8+o()*5)*i*M;V(n,u,l,I,k,k*(d?.36:.46),.5,1)}}}if(d){let m=[[P,1]];for(let h=0;h<Math.min(c,3);h++){let[u,l]=L(v,.58+h*.12),y=(h%2===0?1:-1)*(b>0?-1:1),x=[u+y*(6+o()*3)*i,l-(5+o()*4)*i];z(n,D([u,l],[u+y*2*i,x[1]+1],x,6),1,1,1,0),m.push([x,.72])}for(let[[h,u],l]of m){let y=7+Math.floor(o()*3),x=3.6*i*l,f=o()*Math.PI;for(let M=0;M<y;M++){let g=f+M/y*Math.PI*2;q(n,h+Math.cos(g)*x,u+Math.sin(g)*x,1.75*i*l,0,1)}q(n,h,u,x*.8,0,1),q(n,h,u,1.7*i*l,1,1)}return}let[j,R]=v[v.length-3],A=(7+Math.min(r,5))*i;a==="gum"?(q(n,P[0],P[1]-1,2.4*i,1,0),q(n,P[0]-.5,P[1]-1.7,1.4*i,.5,0)):V(n,P[0],P[1],Math.atan2(P[1]-R,P[0]-j),A,A*.42,.5,1)}function nt(n){let t=_(n),e=Array.from({length:256},t),s=(o,a)=>e[o*37+a*101&255],p=o=>o*o*(3-2*o);return(o,a=0)=>{let r=Math.floor(o),c=Math.floor(a),i=p(o-r),d=p(a-c),E=s(r,c)+(s(r+1,c)-s(r,c))*i,b=s(r,c+1)+(s(r+1,c+1)-s(r,c+1))*i;return E+(b-E)*d}}function et(n,t,e,s,p,o,a){tt(t,e,p,o,a);let{x0:r,y0:c,x1:i,y1:d}=t,E=Q(n,t);return{index:s,cells:E,x0:r,y0:c,x1:i,y1:d}}function ot(n,t,e){let{w:s,h:p,g:o,p:a}=n;for(let{cells:r}of e)for(let c of r){if(a[c]===0||o[c]>0)continue;let i=c%s,d=(c-i)/s;for(let E=-1;E<=1;E++)for(let b=-1;b<=1;b++)i+b>=0&&i+b<s&&d+E>=0&&d+E<p&&(t[c+E*s+b]=0)}}function rt(n,t,e,s,p){let o=new H(n,t),a=new H(n,t),r=new Float32Array(n*t),c=t-5,i=_(s),d=nt(`${s}/grain`);[[.5,.11,10],[.28,.24,7]].forEach(([f,M,g],I)=>{let k=nt(`${s}/hedge/${I}`),$=new Float32Array(n).fill(t);for(let w=-g;w<n+g;w+=g*(.7+i()*.8)){let C=g*(.7+i()*.7),O=c-t*f*(.45+.75*k(w/30))+C*.3;for(let G=Math.max(0,Math.floor(w-C));G<=Math.min(n-1,Math.ceil(w+C));G++){let U=G+.5-w;$[G]=Math.min($[G],O-Math.sqrt(Math.max(0,C*C-U*U)))}}for(let w=0;w<n;w++)for(let C=Math.max(0,Math.round($[w]));C<c;C++){let O=C-$[w]<2?-.05:0;o.g[C*n+w]=M+O+.07*d(w/3,C/2.5)}});let b=p>=6&&p<18,P=((p+(b?-6:6))%24+24)%24/12,v=Math.min(10,t*.17),S=n*(.1+.8*P),N=v+6+(1-Math.sin(Math.PI*P))*t*.3;for(let f=0;f<t;f++)for(let M=0;M<n;M++){let g=Math.hypot(M+.5-S,f+.5-N),I=g<=v?1:Math.max(0,.42-(g-v)/(v*1.6));b||(I=g<=v&&Math.hypot(M+.5-S-v*.5,f+.5-N+v*.25)>v*.9?1:0),r[f*n+M]=I}let F=Math.max(3,Math.floor((n-6)/17)),j=F+1,R=e.map((f,M)=>M),A=f=>W(e[f].seed)==="daisy",m=R.filter(f=>!A(f)).slice(0,F),h=R.filter(A).slice(0,Math.ceil(j*.6)),u=R.filter(f=>!A(f)&&!m.includes(f)),l=[];for(let f=0,M=0,g=0;f<j;f++){let k=Math.floor((f+1)*h.length/j)>Math.floor(f*h.length/j)?h[M++]:u[g++];k!==void 0&&l.push(k)}let y=[],x=(f,M,g,I)=>{let k=_(`row/${M}/${g}`);f.forEach(($,w)=>{let C=(w+.5)/M*n+(k()-.5)*4;y.push(et(o,a,e[$],$,C,I,g))})};x(l,j,.8,c),x(m,F,1,c+1);for(let f=c;f<t;f++)for(let M=0;M<n;M++)o.g[f*n+M]=1,o.p[f*n+M]=f===c?1:.2;return ot(o,r,y),y.reverse(),{plate:o,over:r,plants:y}}function st(n,t,e){let s=new H(n,t),p=new H(n,t),o=new H(n,t),a=t-3;q(o,n/2,a-5,n*.36,0,1),o.p.fill(0,a*n);let r=et(s,p,e,0,n/2,a+1,1);for(let c=2;c<n-2;c++)s.g[a*n+c]=1;return ot(s,o.p,[r]),{plate:s,over:o.p,plants:[r]}}function lt(n){let t=n.trim().replace("#",""),e=parseInt(t.length===3?t.replace(/./g,"$&$&"):t,16);return[e>>16&255,e>>8&255,e&255]}function ht(n){let t=getComputedStyle(n),e=s=>lt(t.getPropertyValue(s));return{paper:e("--paper"),ink1:e("--ink1"),ink2:e("--ink2"),over:e("--over")}}function ut(n,t){let e=n.querySelector("canvas"),s=e?.getContext("2d");if(!e||!s)return;let p=e.parentElement,o=[...n.querySelectorAll("[data-seed]")],a=o.map(A=>({seed:A.dataset.seed,words:Number(A.dataset.words),linksOut:Number(A.dataset.out),linksIn:Number(A.dataset.in)})),r=n.dataset.garden==="bed",c=r?o:[],i=window.matchMedia("(max-width: 800px)"),d=n.querySelector("[data-caption]"),E=d?.textContent??"",b,P=0,v=-1,S=()=>{if(!b)return;let{plate:A,over:m,plants:h}=b,u=m,l=h.find(x=>x.index===v);if(l){u=m.slice();for(let x of l.cells)u[x]=1}let y=s.createImageData(A.w,A.h);X(A,u,y.data,ht(n)),s.putImageData(y,0,0)},N=()=>{let A=p.clientWidth;if(A===0)return;let m=r&&!i.matches?3:2,h=r?Math.floor(A/m):Number(e.dataset.w),u=Number(e.dataset.h);if(!(b&&b.plate.w===h&&P===m)){if(P=m,e.width=h,e.height=u,e.style.width=`${h*m}px`,e.style.height=`${u*m}px`,r){let l=new Date,y=`${l.getFullYear()}-${l.getMonth()+1}-${l.getDate()}`;b=rt(h,u,a,y,l.getHours()+l.getMinutes()/60)}else b=st(h,u,a[0]);c.forEach(l=>l.hidden=!0),r&&b.plants.forEach((l,y)=>{let x=c[l.index];x.hidden=!1,x.style.left=`${l.x0*m}px`,x.style.top=`${l.y0*m}px`,x.style.width=`${(l.x1-l.x0+1)*m}px`,x.style.height=`${(l.y1-l.y0+1)*m}px`,x.style.zIndex=String(b.plants.length-y)}),n.classList.add("grown"),S()}},F=A=>{v!==A&&(v=A,d&&(d.textContent=A<0?E:c[A]?.dataset.label??E),S())};c.forEach((A,m)=>{let h=()=>F(m),u=()=>F(-1);for(let l of["pointerenter","focus"])A.addEventListener(l,h);for(let l of["pointerleave","blur"])A.addEventListener(l,u)});let j=0,R=()=>{cancelAnimationFrame(j),j=requestAnimationFrame(N)};window.addEventListener("resize",R),document.addEventListener("themechange",S),t(()=>{window.removeEventListener("resize",R),document.removeEventListener("themechange",S)}),N()}document.addEventListener("nav",()=>{let n=t=>window.addCleanup(t);for(let t of document.querySelectorAll("figure.garden"))ut(t,n)});})();\n';

// src/components/styles/home.scss
var home_default = '.garden{--cell: 3px;margin:0}@media(max-width: 800px){.garden{--cell: 2px}}.garden-plate{position:relative;overflow:hidden;border:2px solid var(--ink1);background-color:var(--paper)}.garden-plate canvas{position:relative;display:block;image-rendering:pixelated}.garden-plate ol{margin:0;padding:0;list-style:none}.garden-plate a{position:absolute;overflow:hidden;color:rgba(0,0,0,0);font-size:0}.garden-plate a:focus-visible{outline:2px solid var(--over);outline-offset:-2px}.garden-bed .garden-plate{height:calc(64*var(--cell))}.garden-bed .garden-plate::before{content:"";position:absolute;inset:45% 0 0;background-image:conic-gradient(at var(--cell) var(--cell), transparent 75%, var(--ink1) 0),conic-gradient(at var(--cell) var(--cell), transparent 75%, var(--ink1) 0);background-position:0 0,calc(2*var(--cell)) calc(2*var(--cell));background-size:calc(4*var(--cell)) calc(4*var(--cell))}.garden-bed .garden-plate::after{content:"";position:absolute;inset:0;background:linear-gradient(var(--ink1), var(--ink1)) bottom/100% calc(5*var(--cell)) no-repeat,radial-gradient(circle at 72% 34%, var(--ink2) calc(10 * var(--cell)), transparent calc(10 * var(--cell) + 0.5px))}.garden-bed.grown .garden-plate::before,.garden-bed.grown .garden-plate::after{display:none}.garden-bed figcaption{margin-top:.5rem;font-size:.85rem;line-height:1.4;color:var(--gray)}';

// src/components/Home.tsx
import { jsx, jsxs } from "preact/jsx-runtime";
var defaultOptions = {
  notesFolder: "notes",
  postsFolder: "posts",
  plants: 36,
  height: 64
};
var Home_default = ((opts) => {
  const options = { ...defaultOptions, ...opts };
  const Home = ({
    fileData,
    allFiles,
    cfg,
    displayClass
  }) => {
    if (fileData.slug !== "index") return null;
    const locale = cfg.locale || "en-US";
    const pages = [
      ...newestFirst(allFiles, cfg, [options.notesFolder]).slice(0, options.plants),
      ...newestFirst(allFiles, cfg, [options.postsFolder])
    ];
    return /* @__PURE__ */ jsxs("figure", { class: `garden garden-bed ${displayClass ?? ""}`, "data-garden": "bed", children: [
      /* @__PURE__ */ jsxs("div", { class: "garden-plate", children: [
        /* @__PURE__ */ jsx("canvas", { "data-h": options.height, "aria-hidden": "true" }),
        /* @__PURE__ */ jsx("ol", { children: pages.map(({ f, date }) => {
          const { words, linksOut, linksIn } = noteStats(f, allFiles);
          return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
            "a",
            {
              href: resolveRelative(fileData.slug, f.slug),
              "data-seed": f.slug,
              "data-words": words,
              "data-out": linksOut,
              "data-in": linksIn,
              "data-label": `${titleOf(f)}, tended ${dayMonthYear(date, locale)}`,
              hidden: true,
              children: titleOf(f)
            }
          ) });
        }) })
      ] }),
      /* @__PURE__ */ jsx("figcaption", { "data-caption": true, children: "A plant for each note I\u2019ve tended lately, and a daisy for each post. Longer notes grow taller, and a flower opens for every link between two of them." })
    ] });
  };
  Home.css = home_default;
  Home.afterDOMLoaded = garden_inline_default;
  return Home;
});
export {
  Home_default as Home
};
