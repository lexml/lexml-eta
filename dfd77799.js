import{g as e,k as t,r as s,a as n,n as o,b as r,w as i,s as c,v as l,i as a,f as u,h as d,t as h}from"./e94213f9.js";import{B as p,K as m,O as f,P as y}from"./953d27ae.js";const g=Symbol("previousBodyStyleOverflow"),v=Symbol("previousDocumentMarginRight");let b,w=e=>e;const E=Symbol("wrap"),x=Symbol("wrappingFocus");function C(e){return class extends e{[t](e){const s=i(this[c]);if(s){const t=document.activeElement&&(document.activeElement===s||document.activeElement.contains(s)),n=this[c].activeElement,o=n&&(n===s||l(n,s));(t||o)&&"Tab"===e.key&&e.shiftKey&&(this[x]=!0,this[a].focusCatcher.focus(),this[x]=!1)}return super[t]&&super[t](e)||!1}[s](e){super[s]&&super[s](e),this[u]&&this[a].focusCatcher.addEventListener("focus",(()=>{if(!this[x]){const e=i(this[c]);e&&e.focus()}}))}[E](e){const t=d.html(b||(b=w`
        <style>
          #focusCapture {
            display: flex;
            height: 100%;
            overflow: hidden;
            width: 100%;
          }

          #focusCaptureContainer {
            align-items: center;
            display: flex;
            flex: 1;
            flex-direction: column;
            justify-content: center;
            position: relative;
          }
        </style>
        <div id="focusCapture">
          <div id="focusCaptureContainer"></div>
          <div id="focusCatcher" tabindex="0"></div>
        </div>
      `)),s=t.getElementById("focusCaptureContainer");s&&(e.replaceWith(t),s.append(e))}}}C.wrap=E;class j extends p{constructor(){super(),"PointerEvent"in window||this.addEventListener("touchmove",(e=>{1===e.touches.length&&e.preventDefault()}))}}let k,P=e=>e;const S=function(i){return class extends i{get[e](){return Object.assign(super[e]||{},{role:"dialog"})}[t](e){let s=!1;switch(e.key){case"Escape":this.close({canceled:"Escape"}),s=!0}return s||super[t]&&super[t](e)||!1}[s](e){if(super[s]&&super[s](e),e.opened)if(this[n].opened&&document.documentElement){const e=document.documentElement.clientWidth,t=window.innerWidth-e;this[g]=document.body.style.overflow,this[v]=t>0?document.documentElement.style.marginRight:null,document.body.style.overflow="hidden",t>0&&(document.documentElement.style.marginRight=`${t}px`)}else null!=this[g]&&(document.body.style.overflow=this[g],this[g]=null),null!=this[v]&&(document.documentElement.style.marginRight=this[v],this[v]=null);if(e.role){const{role:e}=this[n];this.setAttribute("role",e)}}get role(){return super.role}set role(e){super.role=e,this[o]||this[r]({role:e})}}}(C(m(f)));class O extends S{get[e](){return Object.assign(super[e],{backdropPartType:j,tabIndex:-1})}get[h](){const e=super[h],t=e.content.querySelector("#frame");return this[C.wrap](t),e.content.append(d.html(k||(k=P`
        <style>
          :host {
            height: 100%;
            left: 0;
            pointer-events: initial;
            top: 0;
            width: 100%;
          }
        </style>
      `))),e}}let R,T=e=>e;class B extends j{get[h](){const e=super[h];return e.content.append(d.html(R||(R=T`
        <style>
          :host {
            background: rgba(0, 0, 0, 0.2);
          }
        </style>
      `))),e}}function D(t){return class extends t{get[e](){return Object.assign(super[e]||{},{backdropPartType:B,framePartType:y})}}}export{O as D,D as P};
