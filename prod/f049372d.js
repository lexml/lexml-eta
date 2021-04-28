import{e as t,r as e,f as s,s as n,a as o,b as a,c as i,d as r,g as f,i as l,t as h,h as c}from"./e94213f9.js";import{L as u,P as m}from"./50234788.js";import{P as g}from"./953d27ae.js";const d=Symbol("timeout"),p=u(function(f){return class extends f{get[t](){return super[t]||this}[e](i){if(super[e]&&super[e](i),this[s]){(this[t]===this?this:this[n]).addEventListener("transitionend",(e=>{const s=this[o].effectEndTarget||this[t];e.target===s&&this[a]({effectPhase:"after"})}))}}[i](t){if(super[i]&&super[i](t),t.effect||t.effectPhase){const{effect:t,effectPhase:e}=this[o],s=new CustomEvent("effect-phase-changed",{bubbles:!0,detail:{effect:t,effectPhase:e}});this.dispatchEvent(s);const n=new CustomEvent("effectphasechange",{bubbles:!0,detail:{effect:t,effectPhase:e}});this.dispatchEvent(n),t&&("after"!==e&&this.offsetHeight,"before"===e&&this[a]({effectPhase:"during"}))}}async[r](t){await this[a]({effect:t,effectPhase:"before"})}}}(m));class b extends p{constructor(){super(),this.addEventListener("mouseout",(()=>{E(this)})),this.addEventListener("mouseover",(()=>{y(this)}))}attributeChangedCallback(t,e,s){"duration"===t?this.duration=Number(s):super.attributeChangedCallback(t,e,s)}get[f](){return Object.assign(super[f],{duration:null,fromEdge:"bottom"})}get duration(){return this[o].duration}set duration(t){isNaN(t)||this[a]({duration:t})}get[t](){return this[l].frame}get fromEdge(){return this[o].fromEdge}set fromEdge(t){this[a]({fromEdge:t})}[e](t){if(super[e](t),t.fromEdge){const t={bottom:{alignItems:"center",justifyContent:"flex-end"},"bottom-left":{alignItems:"flex-start",justifyContent:"flex-end"},"bottom-right":{alignItems:"flex-end",justifyContent:"flex-end"},top:{alignItems:"center",justifyContent:null},"top-left":{alignItems:"flex-start",justifyContent:null},"top-right":{alignItems:"flex-end",justifyContent:null}};Object.assign(this.style,t[this[o].fromEdge])}if(t.effect||t.effectPhase||t.fromEdge||t.rightToLeft){const{effect:t,effectPhase:e,fromEdge:s,rightToLeft:n}=this[o],a={"bottom-left":"bottom-right","bottom-right":"bottom-left","top-left":"top-right","top-right":"top-left"},i=n&&a[s]||s,r={bottom:"translateY(100%)","bottom-left":"translateX(-100%)","bottom-right":"translateX(100%)",top:"translateY(-100%)","top-left":"translateX(-100%)","top-right":"translateX(100%)"},f={bottom:"translateY(0)","bottom-left":"translateX(0)","bottom-right":"translateX(0)",top:"translateY(0)","top-left":"translateX(0)","top-right":"translateX(0)"},h="open"===t&&"before"!==e||"close"===t&&"before"===e,c=h?1:0,u=h?f[i]:r[i];Object.assign(this[l].frame.style,{opacity:c,transform:u})}}[i](t){super[i](t),E(this)}}function y(t){const e=t;e[d]&&(clearTimeout(e[d]),e[d]=null)}function E(t){t.opened&&function(t){y(t);const e=t[o].duration;null!==e&&e>0&&(t[d]=setTimeout((()=>{t.close()}),e))}(t)}let j,x=t=>t;class C extends b{get[f](){return Object.assign(super[f],{framePartType:g})}get[h](){const t=super[h];return t.content.append(c.html(j||(j=x`
        <style>
          :host {
            align-items: initial;
            display: flex;
            flex-direction: column;
            height: 100%;
            justify-content: initial;
            left: 0;
            outline: none;
            pointer-events: none;
            top: 0;
            -webkit-tap-highlight-color: transparent;
            width: 100%;
          }

          [part~="frame"] {
            margin: 1em;
            transition-duration: 0.25s;
            transition-property: opacity, transform;
            will-change: opacity, transform;
          }
        </style>
      `))),t}}customElements.define("elix-toast",class extends C{});
