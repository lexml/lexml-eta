import{j as e,a as t,b as s,k as n,l as o,g as i,m as r,r as a,n as l,t as c,o as h,R as u,p as d,d as p,q as f,c as m,u as b,f as g,v as y,w as x,h as v,x as E,s as w,i as C,y as P}from"./e94213f9.js";function I(c){return class extends c{constructor(){super(),this.addEventListener("keydown",(async o=>{this[e]=!0,this[t].focusVisible||this[s]({focusVisible:!0});this[n](o)&&(o.preventDefault(),o.stopImmediatePropagation()),await Promise.resolve(),this[e]=!1}))}attributeChangedCallback(e,t,s){if("tabindex"===e){let e;null===s?e=-1:(e=Number(s),isNaN(e)&&(e=this[o]?this[o]:0)),this.tabIndex=e}else super.attributeChangedCallback(e,t,s)}get[i](){const e=this[r]?-1:0;return Object.assign(super[i]||{},{tabIndex:e})}[n](e){return!!super[n]&&super[n](e)}[a](e){super[a]&&super[a](e),e.tabIndex&&(this.tabIndex=this[t].tabIndex)}get tabIndex(){return super.tabIndex}set tabIndex(e){super.tabIndex!==e&&(super.tabIndex=e),this[l]||this[s]({tabIndex:e})}}}const k=new Map;function T(e){if("function"==typeof e){let t;try{t=new e}catch(s){if("TypeError"!==s.name)throw s;!function(e){let t;const s=/^[A-Za-z][A-Za-z0-9_$]*$/,n=e.name&&e.name.match(s);if(n){const e=/([A-Z])/g;t=n[0].replace(e,((e,t,s)=>s>0?`-${t}`:t)).toLowerCase()}else t="custom-element";let o,i=k.get(t)||0;for(;o=`${t}-${i}`,customElements.get(o);i++);customElements.define(o,e),k.set(t,i+1)}(e),t=new e}return t}return document.createElement(e)}function S(e,t){const s=e.parentNode;if(!s)throw"An element must have a parent before it can be substituted.";return(e instanceof HTMLElement||e instanceof SVGElement)&&(t instanceof HTMLElement||t instanceof SVGElement)&&(Array.prototype.forEach.call(e.attributes,(e=>{t.getAttribute(e.name)||"class"===e.name||"style"===e.name||t.setAttribute(e.name,e.value)})),Array.prototype.forEach.call(e.classList,(e=>{t.classList.add(e)})),Array.prototype.forEach.call(e.style,(s=>{t.style[s]||(t.style[s]=e.style[s])}))),t.append(...e.childNodes),s.replaceChild(t,e),t}function R(e,t){if("function"==typeof t&&e.constructor===t||"string"==typeof t&&e instanceof Element&&e.localName===t)return e;{const s=T(t);return S(e,s),s}}let F,N=e=>e;const z=function(e){return class extends e{get[i](){return Object.assign(super[i]||{},{role:null})}[a](e){if(super[a]&&super[a](e),e.role){const{role:e}=this[t];e?this.setAttribute("role",e):this.removeAttribute("role")}}get role(){return super.role}set role(e){const t=String(e);super.role=t,this[l]||this[s]({s:t})}}}(u);class A extends z{get[i](){return Object.assign(super[i],{role:"none"})}get[c](){return h.html(F||(F=N`
      <style>
        :host {
          display: inline-block;
          height: 100%;
          left: 0;
          position: fixed;
          top: 0;
          touch-action: manipulation;
          width: 100%;
        }
      </style>
      <slot></slot>
    `))}}const j=Symbol("closePromise"),O=Symbol("closeResolve");function L(n){return class extends n{attributeChangedCallback(e,t,s){if("opened"===e){const t=d(e,s);this.opened!==t&&(this.opened=t)}else super.attributeChangedCallback(e,t,s)}async close(e){super.close&&await super.close(),this[s]({closeResult:e}),await this.toggle(!1)}get closed(){return this[t]&&!this[t].opened}get closeFinished(){return this[t].closeFinished}get closeResult(){return this[t].closeResult}get[i](){const e={closeResult:null,opened:!1};return this[p]&&Object.assign(e,{closeFinished:!0,effect:"close",effectPhase:"after",openCloseEffects:!0}),Object.assign(super[i]||{},e)}async open(){super.open&&await super.open(),this[s]({closeResult:void 0}),await this.toggle(!0)}get opened(){return this[t]&&this[t].opened}set opened(e){this[s]({closeResult:void 0}),this.toggle(e)}[a](e){if(super[a](e),e.opened){const{opened:e}=this[t];f(this,"opened",e)}if(e.closeFinished){const{closeFinished:e}=this[t];f(this,"closed",e)}}[m](s){if(super[m]&&super[m](s),s.opened&&this[e]){const e=new CustomEvent("opened-changed",{bubbles:!0,detail:{closeResult:this[t].closeResult,opened:this[t].opened}});this.dispatchEvent(e);const s=new CustomEvent("openedchange",{bubbles:!0,detail:{closeResult:this[t].closeResult,opened:this[t].opened}});if(this.dispatchEvent(s),this[t].opened){const e=new CustomEvent("opened",{bubbles:!0});this.dispatchEvent(e);const t=new CustomEvent("open",{bubbles:!0});this.dispatchEvent(t)}else{const e=new CustomEvent("closed",{bubbles:!0,detail:{closeResult:this[t].closeResult}});this.dispatchEvent(e);const s=new CustomEvent("close",{bubbles:!0,detail:{closeResult:this[t].closeResult}});this.dispatchEvent(s)}}const n=this[O];this.closeFinished&&n&&(this[O]=null,this[j]=null,n(this[t].closeResult))}[b](e,t){const s=super[b]?super[b](e,t):{};if(t.openCloseEffects||t.effect||t.effectPhase||t.opened){const{effect:t,effectPhase:n,openCloseEffects:o,opened:i}=e,r=o?"close"===t&&"after"===n:!i;Object.assign(s,{closeFinished:r})}return s}async toggle(e=!this.opened){super.toggle&&await super.toggle(e);if(e!==this[t].opened){const n={opened:e};this[t].openCloseEffects&&(n.effect=e?"open":"close","after"===this[t].effectPhase&&(n.effectPhase="before")),await this[s](n)}}whenClosed(){return this[j]||(this[j]=new Promise((e=>{this[O]=e}))),this[j]}}}let M,$=e=>e;class H extends u{get[c](){return h.html(M||(M=$`
      <style>
        :host {
          display: inline-block;
          position: relative;
        }
      </style>
      <slot></slot>
    `))}}let V,Z,q=e=>e;const B=Symbol("appendedToDocument"),D=Symbol("assignedZIndex"),G=Symbol("restoreFocusToElement");function K(e){const t=function(){const e=document.body.querySelectorAll("*"),t=Array.from(e,(e=>{const t=getComputedStyle(e);let s=0;if("static"!==t.position&&"auto"!==t.zIndex){const e=t.zIndex?parseInt(t.zIndex):0;s=isNaN(e)?0:e}return s}));return Math.max(...t)}()+1;e[D]=t,e.style.zIndex=t.toString()}function _(e){const t=getComputedStyle(e).zIndex,s=e.style.zIndex,n=!isNaN(parseInt(s));if("auto"===t)return n;if("0"===t&&!n){const t=e.assignedSlot||(e instanceof ShadowRoot?e.host:e.parentNode);if(!(t instanceof HTMLElement))return!0;if(!_(t))return!1}return!0}function J(t){return class extends t{get[E](){const e=this[w]&&this[w].querySelector("slot:not([name])");return this[w]&&e||console.warn(`SlotContentMixin expects ${this.constructor.name} to define a shadow tree that includes a default (unnamed) slot.\nSee https://elix.org/documentation/SlotContentMixin.`),e}get[i](){return Object.assign(super[i]||{},{content:null})}[m](t){if(super[m]&&super[m](t),this[g]){const t=this[E];t&&t.addEventListener("slotchange",(async()=>{this[e]=!0;const n=t.assignedNodes({flatten:!0});Object.freeze(n),this[s]({content:n}),await Promise.resolve(),this[e]=!1}))}}}}let Q,U=e=>e;const W=L(function(e){return class extends e{get autoFocus(){return this[t].autoFocus}set autoFocus(e){this[s]({autoFocus:e})}get[i](){return Object.assign(super[i]||{},{autoFocus:!0,persistent:!1})}async open(){this[t].persistent||this.isConnected||(this[B]=!0,document.body.append(this)),super.open&&await super.open()}[a](e){if(super[a]&&super[a](e),this[g]&&this.addEventListener("blur",(e=>{const t=e.relatedTarget||document.activeElement;if(t instanceof HTMLElement){y(this,t)||(this.opened?this[G]=t:(t.focus(),this[G]=null))}})),(e.effectPhase||e.opened||e.persistent)&&!this[t].persistent){(void 0===this.closeFinished?this.closed:this.closeFinished)?this[D]&&(this.style.zIndex="",this[D]=null):this[D]?this.style.zIndex=this[D]:_(this)||K(this)}}[m](e){if(super[m]&&super[m](e),this[g]&&this[t].persistent&&!_(this)&&K(this),e.opened&&this[t].autoFocus)if(this[t].opened){this[G]||document.activeElement===document.body||(this[G]=document.activeElement);const e=x(this);e&&e.focus()}else this[G]&&(this[G].focus(),this[G]=null);!this[g]&&!this[t].persistent&&this.closeFinished&&this[B]&&(this[B]=!1,this.parentNode&&this.parentNode.removeChild(this))}get[c](){const e=super[c]||h.html(V||(V=q``));return e.content.append(v.html(Z||(Z=q`
        <style>
          :host([closed]) {
            display: none;
          }
        </style>
      `))),e}}}(J(u)));class X extends W{get backdrop(){return this[C]&&this[C].backdrop}get backdropPartType(){return this[t].backdropPartType}set backdropPartType(e){this[s]({backdropPartType:e})}get[i](){return Object.assign(super[i],{backdropPartType:A,framePartType:H})}get frame(){return this[C].frame}get framePartType(){return this[t].framePartType}set framePartType(e){this[s]({framePartType:e})}[a](e){super[a](e),Y(this[w],this[t],e)}[m](e){super[m](e),e.opened&&this[t].content&&this[t].content.forEach((e=>{e[P]&&e[P]()}))}get[c](){const e=super[c];return e.content.append(v.html(Q||(Q=U`
      <style>
        :host {
          display: inline-grid;
          /* Constrain content if overlay's height is constrained. */
          grid-template: minmax(0, 1fr) / minmax(0, 1fr);
          max-height: 100vh;
          max-width: 100vw;
          outline: none;
          position: fixed;
          -webkit-tap-highlight-color: transparent;
        }

        [part~="frame"] {
          box-sizing: border-box;
          display: grid;
          overscroll-behavior: contain;
          pointer-events: initial;
          position: relative;
        }

        #frameContent {
          display: grid;
          grid-template: minmax(0, 1fr) / minmax(0, 1fr);
          overflow: hidden;
        }
      </style>
      <div id="backdrop" part="backdrop" tabindex="-1"></div>
      <div id="frame" part="frame" role="none">
        <div id="frameContent">
          <slot></slot>
        </div>
      </div>
    `))),Y(e.content,this[t]),e}}function Y(e,t,s){if(!s||s.backdropPartType){const{backdropPartType:s}=t,n=e.getElementById("backdrop");n&&R(n,s)}if(!s||s.framePartType){const{framePartType:s}=t,n=e.getElementById("frame");n&&R(n,s)}}let ee,te=e=>e;class se extends H{get[c](){const e=super[c];return e.content.append(v.html(ee||(ee=te`
        <style>
          :host {
            background: white;
            border: 1px solid rgba(0, 0, 0, 0.2);
            box-shadow: 0 0px 10px rgba(0, 0, 0, 0.5);
            box-sizing: border-box;
          }
        </style>
      `))),e}}export{A as B,I as K,X as O,se as P,J as S,L as a,T as c,S as r,R as t};
