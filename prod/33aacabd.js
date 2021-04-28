import{g as e,a as t,b as n,r as s,n as r,p as i,H as o,I as a,J as c,K as u,c as p,j as l,s as h,L as d,M as g,N as m,O as b,P as f,Q as x,S as w,T as y,u as v,f as I,U as T,V as k,k as P,W as L,G as O,X as E,i as C,t as A,o as j,R,C as D,h as S,z,v as F}from"./e94213f9.js";import{S as M,K as B,t as H,a as N,r as U,B as q,P as G}from"./953d27ae.js";import{D as K,F as V,P as W}from"./32fa8a71.js";import{L as $,P as X}from"./50234788.js";import{D as Y}from"./1975e423.js";const J={a:"link",article:"region",button:"button",h1:"sectionhead",h2:"sectionhead",h3:"sectionhead",h4:"sectionhead",h5:"sectionhead",h6:"sectionhead",hr:"sectionhead",iframe:"region",link:"link",menu:"menu",ol:"list",option:"option",output:"liveregion",progress:"progressbar",select:"select",table:"table",td:"td",textarea:"textbox",th:"th",ul:"list"};function Q(e){const t=e[h],n=t&&t.querySelector("slot:not([name])");return n&&n.parentNode instanceof Element&&function(e){for(const t of d(e))if(t instanceof HTMLElement&&Z(t))return t;return null}(n.parentNode)||e}function Z(e){const t=getComputedStyle(e),n=t.overflowX,s=t.overflowY;return"scroll"===n||"auto"===n||"scroll"===s||"auto"===s}function _(e,s,r){const i=e[T](e[t],{direction:r,index:s});if(i<0)return!1;const o=e[t].currentIndex!==i;return o&&e[n]({currentIndex:i}),o}const ee=["applet","basefont","embed","font","frame","frameset","isindex","keygen","link","multicol","nextid","noscript","object","param","script","style","template","noembed"];function te(e,n,s){const r=e[t].items,i=s?0:r.length-1,o=s?r.length:0,a=s?1:-1;let c,u,p=null;const{availableItemFlags:l}=e[t];for(c=i;c!==o;c+=a){if((!l||l[c])&&(u=r[c].getBoundingClientRect(),u.top<=n&&n<=u.bottom)){p=r[c];break}}if(!p||!u)return null;const h=getComputedStyle(p),d=h.paddingTop?parseFloat(h.paddingTop):0,g=h.paddingBottom?parseFloat(h.paddingBottom):0,m=u.top+d,b=m+p.clientHeight-d-g;return s&&m<=n||!s&&b>=n?c:c-a}function ne(e,s){const r=e[t].items,i=e[t].currentIndex,o=e[g].getBoundingClientRect(),a=te(e,s?o.bottom:o.top,s);let c;if(a&&i===a){const t=r[i].getBoundingClientRect(),n=e[g].clientHeight;c=te(e,s?t.bottom+n:t.top-n,s)}else c=a;if(!c){const n=s?r.length-1:0;c=e[T]?e[T](e[t],{direction:s?-1:1,index:n}):n}const u=c!==i;if(u){const t=e[l];e[l]=!0,e[n]({currentIndex:c}),e[l]=t}return u}const se=Symbol("typedPrefix"),re=Symbol("prefixTimeout");function ie(e){const t=e;t[re]&&(clearTimeout(t[re]),t[re]=!1)}function oe(e){e[se]="",ie(e)}function ae(e){ie(e),e[re]=setTimeout((()=>{oe(e)}),1e3)}function ce(t){return class extends t{get[e](){return Object.assign(super[e]||{},{items:null})}[v](e,t){const n=super[v]?super[v](e,t):{};if(t.content){const t=e.content,s=t?Array.prototype.filter.call(t,(e=>{return(t=e)instanceof Element&&(!t.localName||ee.indexOf(t.localName)<0);var t})):null;s&&Object.freeze(s),Object.assign(n,{items:s})}return n}}}let ue,pe=e=>e;const le=function(i){return class extends i{get[e](){const t=super[e];return Object.assign(t,{itemRole:t.itemRole||"menuitem",role:t.role||"menu"})}get itemRole(){return this[t].itemRole}set itemRole(e){this[n]({itemRole:e})}[s](e){super[s]&&super[s](e);const n=this[t].items;if((e.items||e.itemRole)&&n){const{itemRole:e}=this[t];n.forEach((t=>{e===J[t.localName]?t.removeAttribute("role"):t.setAttribute("role",e)}))}if(e.role){const{role:e}=this[t];this.setAttribute("role",e)}}get role(){return super.role}set role(e){super.role=e,this[r]||this[n]({role:e})}}}(function(e){return class extends e{attributeChangedCallback(e,t,n){if("current-index"===e)this.currentIndex=Number(n);else if("current-item-required"===e){const t=i(e,n);this.currentItemRequired!==t&&(this.currentItemRequired=t)}else if("cursor-operations-wrap"===e){const t=i(e,n);this.cursorOperationsWrap!==t&&(this.cursorOperationsWrap=t)}else super.attributeChangedCallback(e,t,n)}get currentIndex(){const{items:e,currentIndex:n}=this[t];return e&&e.length>0?n:-1}set currentIndex(e){isNaN(e)||this[n]({currentIndex:e})}get currentItem(){const{items:e,currentIndex:n}=this[t];return e&&e[n]}set currentItem(e){const{items:s}=this[t];if(!s)return;const r=s.indexOf(e);this[n]({currentIndex:r})}get currentItemRequired(){return this[t].currentItemRequired}set currentItemRequired(e){this[n]({currentItemRequired:e})}get cursorOperationsWrap(){return this[t].cursorOperationsWrap}set cursorOperationsWrap(e){this[n]({cursorOperationsWrap:e})}goFirst(){return super.goFirst&&super.goFirst(),this[o]()}goLast(){return super.goLast&&super.goLast(),this[a]()}goNext(){return super.goNext&&super.goNext(),this[c]()}goPrevious(){return super.goPrevious&&super.goPrevious(),this[u]()}[p](e){if(super[p]&&super[p](e),e.currentIndex&&this[l]){const{currentIndex:e}=this[t],n=new CustomEvent("current-index-changed",{bubbles:!0,detail:{currentIndex:e}});this.dispatchEvent(n);const s=new CustomEvent("currentindexchange",{bubbles:!0,detail:{currentIndex:e}});this.dispatchEvent(s)}}}}(function(e){return class extends e{[p](e){super[p]&&super[p](e),e.currentItem&&this.scrollCurrentItemIntoView()}scrollCurrentItemIntoView(){super.scrollCurrentItemIntoView&&super.scrollCurrentItemIntoView();const{currentItem:e,items:n}=this[t];if(!e||!n)return;const s=this[g].getBoundingClientRect(),r=e.getBoundingClientRect(),i=r.bottom-s.bottom,o=r.left-s.left,a=r.right-s.right,c=r.top-s.top,u=this[t].orientation||"both";"horizontal"!==u&&"both"!==u||(a>0?this[g].scrollLeft+=a:o<0&&(this[g].scrollLeft+=Math.ceil(o))),"vertical"!==u&&"both"!==u||(i>0?this[g].scrollTop+=i:c<0&&(this[g].scrollTop+=Math.ceil(c)))}get[g](){return super[g]||Q(this)}}}(K(function(n){return class extends n{get[e](){return Object.assign(super[e]||{},{canGoDown:null,canGoLeft:null,canGoRight:null,canGoUp:null})}[m](){return super[m]&&super[m](),this[c]()}[b](){return super[b]&&super[b](),this[a]()}[f](){return super[f]&&super[f](),this[t]&&this[t].rightToLeft?this[c]():this[u]()}[x](){return super[x]&&super[x](),this[t]&&this[t].rightToLeft?this[u]():this[c]()}[w](){return super[w]&&super[w](),this[o]()}[y](){return super[y]&&super[y](),this[u]()}[v](e,t){const n=super[v]?super[v](e,t):{};if(t.canGoNext||t.canGoPrevious||t.languageDirection||t.orientation||t.rightToLeft){const{canGoNext:t,canGoPrevious:s,orientation:r,rightToLeft:i}=e,o="horizontal"===r||"both"===r,a="vertical"===r||"both"===r,c=a&&t,u=!!o&&(i?t:s),p=!!o&&(i?s:t),l=a&&s;Object.assign(n,{canGoDown:c,canGoLeft:u,canGoRight:p,canGoUp:l})}return n}}}(function(e){return class extends e{get items(){return this[t]?this[t].items:null}[p](e){if(super[p]&&super[p](e),!this[I]&&e.items&&this[l]){const e=new CustomEvent("items-changed",{bubbles:!0});this.dispatchEvent(e);const t=new CustomEvent("itemschange",{bubbles:!0});this.dispatchEvent(t)}}}}(function(n){return class extends n{[T](e,t={}){const n=void 0!==t.direction?t.direction:1,s=void 0!==t.index?t.index:e.currentIndex,r=void 0!==t.wrap?t.wrap:e.cursorOperationsWrap,{items:i}=e,o=i?i.length:0;if(0===o)return-1;if(r){let t=(s%o+o)%o;const r=((t-n)%o+o)%o;for(;t!==r;){if(!e.availableItemFlags||e.availableItemFlags[t])return t;t=((t+n)%o+o)%o}}else for(let t=s;t>=0&&t<o;t+=n){if(!e.availableItemFlags||e.availableItemFlags[t])return t}return-1}get[e](){return Object.assign(super[e]||{},{currentIndex:-1,desiredCurrentIndex:null,currentItem:null,currentItemRequired:!1,cursorOperationsWrap:!1})}[o](){return super[o]&&super[o](),_(this,0,1)}[a](){return super[a]&&super[a](),_(this,this[t].items.length-1,-1)}[c](){super[c]&&super[c]();const{currentIndex:e,items:n}=this[t];return _(this,e<0&&n?0:e+1,1)}[u](){super[u]&&super[u]();const{currentIndex:e,items:n}=this[t];return _(this,e<0&&n?n.length-1:e-1,-1)}[v](e,t){const n=super[v]?super[v](e,t):{};if(t.availableItemFlags||t.items||t.currentIndex||t.currentItemRequired){const{currentIndex:s,desiredCurrentIndex:r,currentItem:i,currentItemRequired:o,items:a}=e,c=a?a.length:0;let u,p=r;if(t.items&&!t.currentIndex&&i&&c>0&&a[s]!==i){const e=a.indexOf(i);e>=0&&(p=e)}else t.currentIndex&&(s<0&&null!==i||s>=0&&(0===c||a[s]!==i)||null===r)&&(p=s);o&&p<0&&(p=0),p<0?(p=-1,u=-1):0===c?u=-1:(u=Math.max(Math.min(c-1,p),0),u=this[T](e,{direction:1,index:u,wrap:!1}),u<0&&(u=this[T](e,{direction:-1,index:u-1,wrap:!1})));const l=a&&a[u]||null;Object.assign(n,{currentIndex:u,desiredCurrentIndex:p,currentItem:l})}return n}}}(function(t){return class extends t{get[e](){return Object.assign(super[e]||{},{texts:null})}[k](e){return super[k]?super[k](e):(t=e).getAttribute("aria-label")||t.getAttribute("alt")||t.innerText||t.textContent||"";var t}[v](e,t){const n=super[v]?super[v](e,t):{};if(t.items){const{items:t}=e,s=function(e,t){return e?Array.from(e,(e=>t(e))):null}(t,this[k]);s&&(Object.freeze(s),Object.assign(n,{texts:s}))}return n}}}(function(e){return class extends e{[m](){if(super[m])return super[m]()}[b](){if(super[b])return super[b]()}[f](){if(super[f])return super[f]()}[x](){if(super[x])return super[x]()}[w](){if(super[w])return super[w]()}[y](){if(super[y])return super[y]()}[P](e){let n=!1;if(e.target===this){const s=this[t].orientation||"both",r="horizontal"===s||"both"===s,i="vertical"===s||"both"===s;switch(e.key){case"ArrowDown":i&&(n=e.altKey?this[b]():this[m]());break;case"ArrowLeft":!r||e.metaKey||e.altKey||(n=this[f]());break;case"ArrowRight":!r||e.metaKey||e.altKey||(n=this[x]());break;case"ArrowUp":i&&(n=e.altKey?this[w]():this[y]());break;case"End":n=this[b]();break;case"Home":n=this[w]()}}return n||super[P]&&super[P](e)||!1}}}(B(function(e){return class extends e{[P](e){let t=!1;if("horizontal"!==this.orientation)switch(e.key){case"PageDown":t=this.pageDown();break;case"PageUp":t=this.pageUp()}return t||super[P]&&super[P](e)}get orientation(){return super.orientation||this[t]&&this[t].orientation||"both"}pageDown(){return super.pageDown&&super.pageDown(),ne(this,!0)}pageUp(){return super.pageUp&&super.pageUp(),ne(this,!1)}get[g](){return super[g]||Q(this)}}}(function(e){return class extends e{constructor(){super(),oe(this)}[L](e){if(super[L]&&super[L](e),null==e||0===e.length)return!1;const s=e.toLowerCase(),r=this[t].texts.findIndex((t=>t.substr(0,e.length).toLowerCase()===s));if(r>=0){const e=this[t].currentIndex;return this[n]({currentIndex:r}),this[t].currentIndex!==e}return!1}[P](e){let t;switch(e.key){case"Backspace":!function(e){const t=e,n=t[se]?t[se].length:0;n>0&&(t[se]=t[se].substr(0,n-1));e[L](t[se]),ae(e)}(this),t=!0;break;case"Escape":oe(this);break;default:e.ctrlKey||e.metaKey||e.altKey||1!==e.key.length||function(e,t){const n=e,s=n[se]||"";n[se]=s+t,e[L](n[se]),ae(e)}(this,e.key)}return t||super[P]&&super[P](e)}}}($(function(e){return ce(M(e))}(function(e){return class extends e{constructor(){super(),this.addEventListener("mousedown",(e=>{0===e.button&&(this[l]=!0,this[O](e),this[l]=!1)}))}[s](e){super[s]&&super[s](e),this[I]&&Object.assign(this.style,{touchAction:"manipulation",mozUserSelect:"none",msUserSelect:"none",webkitUserSelect:"none",userSelect:"none"})}[O](e){const s=e.composedPath?e.composedPath()[0]:e.target,{items:r,currentItemRequired:i}=this[t];if(r&&s instanceof Node){const t=E(r,s),o=t>=0?r[t]:null;(o&&!o.disabled||!o&&!i)&&(this[n]({currentIndex:t}),e.stopPropagation())}}}}(R)))))))))))))));class he extends le{get[e](){return Object.assign(super[e],{availableItemFlags:null,highlightCurrentItem:!0,orientation:"vertical",currentItemFocused:!1})}async flashCurrentItem(){const e=this[t].focusVisible,s=matchMedia("(pointer: fine)").matches;if(e||s){const e=75;this[n]({highlightCurrentItem:!1}),await new Promise((t=>setTimeout(t,e))),this[n]({highlightCurrentItem:!0}),await new Promise((t=>setTimeout(t,e)))}}[s](e){super[s](e),this[I]&&(this.addEventListener("disabledchange",(e=>{this[l]=!0;const s=e.target,{items:r}=this[t],i=null===r?-1:r.indexOf(s);if(i>=0){const e=this[t].availableItemFlags.slice();e[i]=!s.disabled,this[n]({availableItemFlags:e})}this[l]=!1})),"PointerEvent"in window?this.addEventListener("pointerdown",(e=>this[O](e))):this.addEventListener("touchstart",(e=>this[O](e))),this.removeAttribute("tabindex"));const{currentIndex:r,items:i}=this[t];if((e.items||e.currentIndex||e.highlightCurrentItem)&&i){const{highlightCurrentItem:e}=this[t];i.forEach(((t,n)=>{t.toggleAttribute("current",e&&n===r)}))}(e.items||e.currentIndex||e.currentItemFocused||e.focusVisible)&&i&&i.forEach(((e,n)=>{const s=n===r,i=r<0&&0===n;this[t].currentItemFocused?s||i||e.removeAttribute("tabindex"):(s||i)&&(e.tabIndex=0)}))}[p](e){if(super[p](e),!this[I]&&e.currentIndex&&!this[t].currentItemFocused){const{currentItem:e}=this[t];(e instanceof HTMLElement?e:this).focus(),this[n]({currentItemFocused:!0})}}get[g](){return this[C].content}[v](e,t){const n=super[v](e,t);if(t.currentIndex&&Object.assign(n,{currentItemFocused:!1}),t.items){const{items:t}=e,s=null===t?null:t.map((e=>!e.disabled));Object.assign(n,{availableItemFlags:s})}return n}get[A](){return j.html(ue||(ue=pe`
      <style>
        :host {
          box-sizing: border-box;
          cursor: default;
          display: inline-flex;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        #content {
          display: flex;
          flex: 1;
          flex-direction: column;
          max-height: 100%;
          overflow-x: hidden;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch; /* for momentum scrolling */
        }
        
        ::slotted(*) {
          flex-shrink: 0;
          outline: none;
          touch-action: manipulation;
        }

        ::slotted(option) {
          font: inherit;
          min-height: inherit;
        }
      </style>
      <div id="content" role="none">
        <slot></slot>
      </div>
    `))}}const de=Symbol("documentMouseupListener");async function ge(e){const s=this,r=s[h].elementsFromPoint(e.clientX,e.clientY);if(s.opened){const e=r.indexOf(s[C].source)>=0,i=s[C].popup,o=r.indexOf(i)>=0,a=i.frame&&r.indexOf(i.frame)>=0;e?s[t].dragSelect&&(s[l]=!0,s[n]({dragSelect:!1}),s[l]=!1):o||a||(s[l]=!0,await s.close(),s[l]=!1)}}function me(e){e[t].opened&&e.isConnected?e[de]||(e[de]=ge.bind(e),document.addEventListener("mouseup",e[de])):e[de]&&(document.removeEventListener("mouseup",e[de]),e[de]=null)}function be(e,t,n,s){const r=fe(e,n,s);let i=0,o=0;const a="above"===n||"below"===n;switch(n){case"above":i=r.y-t.top;break;case"below":i=t.bottom-r.y;break;case"left":o=r.x-t.left;break;case"right":o=t.right-r.x}switch(s){case"bottom":i=r.y-t.top;break;case"center":a?o=t.width:i=t.height;break;case"stretch":a?o=e.width:i=e.height;break;case"left":o=t.right-r.x;break;case"right":o=r.x-t.left;break;case"top":i=t.bottom-r.y}return i=Math.max(0,i),o=Math.max(0,o),{height:i,width:o}}function fe(e,t,n){let s=0,r=0;const i="above"===t||"below"===t;switch(t){case"above":r=e.top;break;case"below":r=e.bottom;break;case"left":case"right":s=e[t]}switch(n){case"bottom":case"top":r=e[n];break;case"left":case"right":s=e[n];break;case"center":i?s=e.left+e.width/2:r=e.top+e.height/2;break;case"stretch":i?s=e.left:r=e.top}return{x:s,y:r}}function xe(e,t,n,s){const r=function(e){const{align:t,direction:n,rightToLeft:s}=e,r="below",i={above:"above",below:"below",column:"below","column-reverse":"above",left:"left",right:"right",row:s?"left":"right","row-reverse":s?"right":"left"}[n]||r,o={above:"horizontal",below:"horizontal",left:"vertical",right:"vertical"}[i],a={horizontal:"left",vertical:"top"}[o];return{align:{horizontal:{center:"center",end:s?"left":"right",left:"left",right:"right",start:s?"right":"left",stretch:"stretch"},vertical:{bottom:"bottom",center:"center",end:"bottom",start:"top",stretch:"stretch",top:"top"}}[o][t]||a,direction:i,rightToLeft:s}}(s),i=function(e,t){const n={above:"below",below:"above",left:"right",right:"left"},s={top:"bottom",bottom:"top",left:"right",right:"left"},r=[{align:t,direction:e}];"center"===t||"stretch"===t?r.push({align:t,direction:n[e]}):(r.push({align:s[t],direction:e}),r.push({align:t,direction:n[e]}),r.push({align:s[t],direction:n[e]}));return r}(r.direction,r.align);i.sort(((s,r)=>function(e,t,n,s,r){const i=be(n,r,e.direction,e.align),o=be(n,r,t.direction,t.align),a=s.width<=i.width,c=s.height<=i.height,u=a||c,p=a&&c,l=s.width<=o.width,h=s.height<=o.height,d=l||h,g=l&&h,m=i.width*i.height,b=o.width*o.height;return p&&g?0:p?-1:g?1:u&&!d?-1:d&&!u?1:u&&m>b?-1:d&&b>m?1:m>b?-1:b>m?1:0}(s,r,e,t,n)));const o=i[0];return o.rect=function(e,t,n,s,r){const i=fe(e,s,r);let{x:o,y:a,bottom:c,right:u}=n,p=0,l=0,h=t.height,d=t.width;const g="above"===s||"below"===s;switch(s){case"above":l=i.y-t.height,c=i.y;break;case"below":l=i.y,a=i.y;break;case"left":p=i.x-t.width,u=i.x;break;case"right":p=i.x,o=i.x}switch(r){case"bottom":l=i.y-t.height,c=i.y;break;case"left":p=i.x,o=i.x;break;case"center":g?p=i.x-t.width/2:l=i.y-t.height/2;break;case"right":p=i.x-t.width,u=i.x;break;case"stretch":g?(p=i.x,d=e.width):(l=i.y,h=e.height);break;case"top":l=i.y,a=i.y}return p=Math.max(p,o),l=Math.max(l,a),d=Math.min(d,u-p),h=Math.min(h,c-l),new DOMRect(p,l,d,h)}(e,t,n,o.direction,o.align),o}let we,ye=e=>e;const ve=Symbol("resizeListener"),Ie=Y(V($(N(R))));function Te(e){const{popupAlign:s,popupDirection:r,rightToLeft:i}=e[t],o=xe(e[C].source.getBoundingClientRect(),e[C].popup.getBoundingClientRect(),Pe(),{align:s,direction:r,rightToLeft:i});e[n]({popupLayout:o})}function ke(e,t,n){if(!n||n.popupPartType){const{popupPartType:n}=t,s=e.getElementById("popup");s&&H(s,n)}if(!n||n.sourcePartType){const{sourcePartType:n}=t,s=e.getElementById("source");s&&H(s,n)}}function Pe(){const e=window.visualViewport;return e?new DOMRect(e.offsetLeft,e.offsetTop,e.width,e.height):new DOMRect(0,0,window.innerWidth,window.innerHeight)}let Le,Oe=e=>e;const Ee=K(B(function(t){return class extends t{connectedCallback(){super.connectedCallback(),me(this)}get[e](){return Object.assign(super[e]||{},{dragSelect:!0})}disconnectedCallback(){super.disconnectedCallback&&super.disconnectedCallback(),me(this)}[p](e){super[p](e),e.opened&&me(this)}[v](e,t){const n=super[v](e,t);return t.opened&&e.opened&&Object.assign(n,{dragSelect:!0}),n}}}(class extends Ie{get[e](){return Object.assign(super[e],{ariaHasPopup:"true",popupAlign:"start",popupDirection:"column",popupLayout:null,popupPartType:X,sourcePartType:"div"})}get[D](){return this[C].source}get frame(){return this[C].popup.frame}get horizontalAlign(){return this[t].popupAlign}set horizontalAlign(e){console.warn('The "horizontalAlign" property has been renamed to "popupAlign"; the "horizontal-align" attribute is now "popup-align".'),this[n]({popupAlign:e})}get popupAlign(){return this[t].popupAlign}set popupAlign(e){this[n]({popupAlign:e})}get popupDirection(){return this[t].popupDirection}set popupDirection(e){this[n]({popupDirection:e})}get popupPosition(){return this[t].popupPosition}set popupPosition(e){console.warn('The "popupPosition" property has been renamed to "popupDirection"; the "popup-position" attribute is now "popup-direction".'),this[n]({popupPosition:e})}get popupPartType(){return this[t].popupPartType}set popupPartType(e){this[n]({popupPartType:e})}[s](e){if(super[s](e),ke(this[h],this[t],e),this[I]||e.ariaHasPopup){const{ariaHasPopup:e}=this[t];null===e?this[D].removeAttribute("aria-haspopup"):this[D].setAttribute("aria-haspopup",this[t].ariaHasPopup)}if(e.popupPartType&&(this[C].popup.addEventListener("open",(()=>{this.opened||(this[l]=!0,this.open(),this[l]=!1)})),this[C].popup.addEventListener("close",(e=>{if(!this.closed){this[l]=!0;const t=e.detail.closeResult;this.close(t),this[l]=!1}}))),e.opened||e.popupLayout){const{opened:e,popupLayout:n}=this[t];if(e)if(n){const e=this[C].popup,t=function(e){const{align:t,direction:n,rect:s}=e,r=Pe(),i={},o="above"===n||"below"===n;switch(n){case"above":i.bottom=r.bottom-s.bottom+"px";break;case"below":i.top=`${s.top}px`;break;case"left":i.right=r.right-s.right+"px";break;case"right":i.left=`${s.left}px`}switch(t){case"bottom":i.bottom=r.bottom-s.bottom+"px";break;case"center":case"stretch":o?(i.left=`${s.left}px`,i.right=r.right-s.right+"px"):(i.bottom=r.bottom-s.bottom+"px",i.top=`${s.top}px`);break;case"left":i.left=`${s.left}px`;break;case"right":i.right=r.right-s.right+"px";break;case"top":i.top=`${s.top}px`}return i}(n);Object.assign(e.style,t,{opacity:""})}else Object.assign(this[C].popup.style,{bottom:"",left:"",opacity:0,right:"",top:""});else Object.assign(this[C].popup.style,{bottom:"",left:"",opacity:"",right:"",top:""})}if(e.opened){const{opened:e}=this[t];this[C].popup.opened=e}if(e.disabled&&"disabled"in this[C].source){const{disabled:e}=this[t];this[C].source.disabled=e}if(e.popupLayout){const{popupLayout:e}=this[t];if(e){const{align:t,direction:n}=e,s=this[C].popup;"position"in s&&(s.position=n),"align"in s&&(s.align=t)}}}[p](e){super[p](e);const{opened:n}=this[t];var s;e.opened?n?(s=this,setTimeout((()=>{s[t].opened&&(Te(s),function(e){const t=e;t[ve]=()=>{Te(e)},(window.visualViewport||window).addEventListener("resize",t[ve])}(s))}))):function(e){const t=e;if(t[ve]){(window.visualViewport||window).removeEventListener("resize",t[ve]),t[ve]=null}}(this):e.popupLayout&&this[t].opened&&!this[t].popupLayout&&Te(this)}get sourcePartType(){return this[t].sourcePartType}set sourcePartType(e){this[n]({sourcePartType:e})}[v](e,t){const n=super[v](e,t);return(t.opened&&!e.opened||e.opened&&(t.popupAlign||t.popupDirection||t.rightToLeft))&&Object.assign(n,{popupLayout:null}),n}get[A](){const e=super[A];return e.content.append(S.html(we||(we=ye`
      <style>
        :host {
          display: inline-block;
          position: relative;
        }

        [part~="source"] {
          height: 100%;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          width: 100%;
        }

        [part~="popup"] {
          max-height: 100%;
          max-width: 100%;
          outline: none;
          position: fixed;
        }
      </style>
      <div id="source" part="source">
        <slot name="source"></slot>
      </div>
      <div id="popup" part="popup" exportparts="backdrop, frame" role="none">
        <slot></slot>
      </div>
    `))),ke(e.content,this[t]),e}})));async function Ce(e){const t=this,n=e.relatedTarget||document.activeElement;n instanceof Element&&!F(t,n)&&(t[l]=!0,await t.close({canceled:"blur"}),t[l]=!1)}const Ae=Symbol("documentMousemoveListener");function je(e){const s=this,{hasHoveredOverItemSinceOpened:r,opened:i}=s[t];if(i){const i=e.composedPath?e.composedPath()[0]:e.target,o=s.items;if(i&&i instanceof Node&&o){const e=E(o,i),a=o[e],c=a&&!a.disabled?e:-1;(r||c>=0)&&c!==s[t].currentIndex&&(s[l]=!0,s[n]({currentIndex:c}),c>=0&&!r&&s[n]({hasHoveredOverItemSinceOpened:!0}),s[l]=!1)}}}function Re(e){e[t].opened&&e.isConnected?e[Ae]||(e[Ae]=je.bind(e),document.addEventListener("mousemove",e[Ae])):e[Ae]&&(document.removeEventListener("mousemove",e[Ae]),e[Ae]=null)}async function De(e){const n=e[l],s=e[t].currentIndex>=0,r=e.items;if(r){const i=s?r[e[t].currentIndex]:void 0,o=e[t].popupList;s&&"flashCurrentItem"in o&&await o.flashCurrentItem();const a=e[l];e[l]=n,await e.close(i),e[l]=a}}let Se,ze,Fe=e=>e;const Me=function(r){return class extends r{connectedCallback(){super.connectedCallback(),Re(this)}get[e](){return Object.assign(super[e]||{},{currentIndex:-1,hasHoveredOverItemSinceOpened:!1,popupList:null})}disconnectedCallback(){super.disconnectedCallback&&super.disconnectedCallback(),Re(this)}[P](e){let t=!1;switch(e.key){case"Enter":this.opened&&(De(this),t=!0)}return t||super[P]&&super[P](e)||!1}[s](e){if(super[s]&&super[s](e),e.popupList){const{popupList:e}=this[t];e&&(e.addEventListener("mouseup",(async e=>{const n=this[t].currentIndex;this[t].dragSelect||n>=0?(e.stopPropagation(),this[l]=!0,await De(this),this[l]=!1):e.stopPropagation()})),e.addEventListener("currentindexchange",(e=>{this[l]=!0;const t=e;this[n]({currentIndex:t.detail.currentIndex}),this[l]=!1})))}if(e.currentIndex||e.popupList){const{currentIndex:e,popupList:n}=this[t];n&&"currentIndex"in n&&(n.currentIndex=e)}}[p](e){if(super[p]&&super[p](e),e.opened){if(this[t].opened){const{popupList:e}=this[t];e.scrollCurrentItemIntoView&&setTimeout((()=>{e.scrollCurrentItemIntoView()}))}Re(this)}}[v](e,t){const n=super[v]?super[v](e,t):{};return t.opened&&e.opened&&Object.assign(n,{hasHoveredOverItemSinceOpened:!1}),n}}}(class extends Ee{get[e](){return Object.assign(super[e],{sourcePartType:"button"})}[P](e){let t;switch(e.key){case" ":case"ArrowDown":case"ArrowUp":this.closed&&(this.open(),t=!0);break;case"Enter":this.opened||(this.open(),t=!0);break;case"Escape":this.opened&&(this.close({canceled:"Escape"}),t=!0)}if(t=super[P]&&super[P](e),!t&&this.opened&&!e.metaKey&&!e.altKey)switch(e.key){case"ArrowDown":case"ArrowLeft":case"ArrowRight":case"ArrowUp":case"End":case"Home":case"PageDown":case"PageUp":case" ":t=!0}return t}[s](e){if(super[s](e),this[I]&&(this.addEventListener("blur",Ce.bind(this)),this[C].source.addEventListener("focus",(async e=>{const n=z(this[C].popup,e),s=null!==this[t].popupHeight;!n&&this.opened&&s&&(this[l]=!0,await this.close(),this[l]=!1)}))),e.opened){const{opened:e}=this[t];this.toggleAttribute("opened",e)}if(e.sourcePartType){this[C].source.addEventListener("mousedown",(e=>{if(this.disabled)return void e.preventDefault();const t=e;t.button&&0!==t.button||(setTimeout((()=>{this.opened||(this[l]=!0,this.open(),this[l]=!1)})),e.stopPropagation())}))}e.popupPartType&&this[C].popup.removeAttribute("tabindex")}get[A](){const e=super[A];return e.content.append(S.html(Le||(Le=Oe`
        <style>
          [part~="source"] {
            cursor: default;
            outline: none;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
            -moz-user-select: none;
            -ms-user-select: none;
            -webkit-user-select: none;
            user-select: none;
          }

          :host([opened][focus-visible]) {
            outline: none;
          }
        </style>
      `))),e}});class Be extends Me{get[e](){return Object.assign(super[e],{menuPartType:he})}get items(){const e=this[C]&&this[C].menu;return e?e.items:null}get menuPartType(){return this[t].menuPartType}set menuPartType(e){this[n]({menuPartType:e})}[s](e){if(super[s](e),He(this[h],this[t],e),e.menuPartType&&(this[C].menu.addEventListener("blur",(async e=>{const t=e.relatedTarget||document.activeElement;this.opened&&!F(this[C].menu,t)&&(this[l]=!0,await this.close(),this[l]=!1)})),this[C].menu.addEventListener("mousedown",(e=>{0===e.button&&this.opened&&(e.stopPropagation(),e.preventDefault())}))),e.opened){const{opened:e}=this[t];this[C].source.setAttribute("aria-expanded",e.toString())}}[p](e){super[p](e),e.menuPartType&&this[n]({popupList:this[C].menu})}[v](e,t){const n=super[v](e,t);return t.opened&&!e.opened&&Object.assign(n,{currentIndex:-1}),n}get[A](){const e=super[A],n=e.content.querySelector("slot:not([name])");return n&&n.replaceWith(S.html(Se||(Se=Fe`
        <div id="menu" part="menu">
          <slot></slot>
        </div>
      `))),He(e.content,this[t]),e.content.append(S.html(ze||(ze=Fe`
      <style>
        [part~="menu"] {
          max-height: 100%;
        }
      </style>
    `))),e}}function He(e,t,n){if(!n||n.menuPartType){const{menuPartType:n}=t,s=e.getElementById("menu");s&&H(s,n)}}let Ne,Ue=e=>e;const qe=Y(R);class Ge extends qe{get[e](){return Object.assign(super[e],{direction:"down"})}get direction(){return this[t].direction}set direction(e){this[n]({direction:e})}[s](e){if(super[s](e),e.direction){const{direction:e}=this[t];this[C].downIcon.style.display="down"===e?"block":"none",this[C].upIcon.style.display="up"===e?"block":"none"}}get[A](){return j.html(Ne||(Ne=Ue`
      <style>
        :host {
          display: inline-block;
        }
      </style>
      <div id="downIcon" part="toggle-icon down-icon">
        <slot name="down-icon"></slot>
      </div>
      <div id="upIcon" part="toggle-icon up-icon">
        <slot name="up-icon"></slot>
      </div>
    `))}}let Ke,Ve,We=e=>e;function $e(e,t,n){if(!n||n.popupTogglePartType){const{popupTogglePartType:n}=t,s=e.getElementById("popupToggle");s&&H(s,n)}}let Xe,Ye=e=>e;class Je extends he{get[A](){const e=super[A];return e.content.append(S.html(Xe||(Xe=Ye`
        <style>
          :host ::slotted(*) {
            padding: 0.25em 1em;
          }
          
          :host ::slotted([current]) {
            background: highlight;
            color: highlighttext;
          }

          @media (pointer: coarse) {
            ::slotted(*) {
              padding: 1em;
            }
          }
        </style>
      `))),e}}let Qe,Ze,_e,et=e=>e;class tt extends Ge{get[A](){const e=super[A],t=e.content.getElementById("downIcon"),n=S.html(Qe||(Qe=et`
      <svg
        id="downIcon"
        part="toggle-icon down-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 10 5"
      >
        <path d="M 0 0 l5 5 5 -5 z" />
      </svg>
    `)).firstElementChild;t&&n&&U(t,n);const s=e.content.getElementById("upIcon"),r=S.html(Ze||(Ze=et`
      <svg
        id="upIcon"
        part="toggle-icon up-icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 10 5"
      >
        <path d="M 0 5 l5 -5 5 5 z" />
      </svg>
    `)).firstElementChild;return s&&r&&U(s,r),e.content.append(S.html(_e||(_e=et`
        <style>
          :host {
            align-items: center;
            display: inline-flex;
            padding: 2px;
          }

          :host(:not([disabled])):hover {
            background: #eee;
          }

          [part~="toggle-icon"] {
            fill: currentColor;
            height: 10px;
            margin: 0.25em;
            width: 10px;
          }
        </style>
      `))),e}}class nt extends q{}class st extends X{get[e](){return Object.assign(super[e],{backdropPartType:nt,framePartType:G})}}let rt,it=e=>e;class ot extends(function(r){return class extends r{get[e](){return Object.assign(super[e]||{},{popupTogglePartType:Ge})}get popupTogglePartType(){return this[t].popupTogglePartType}set popupTogglePartType(e){this[n]({popupTogglePartType:e})}[s](e){if(super[s](e),$e(this[h],this[t],e),e.popupDirection||e.popupTogglePartType){const{popupDirection:e}=this[t],n="above"===e||"column-reverse"===e?"up":"down",s=this[C].popupToggle;"direction"in s&&(s.direction=n)}if(e.disabled){const{disabled:e}=this[t];this[C].popupToggle.disabled=e}}get[A](){const e=super[A],n=e.content.querySelector('[part~="source"]');return n&&n.append(S.html(Ke||(Ke=We`
          <div
            id="popupToggle"
            part="popup-toggle"
            exportparts="toggle-icon, down-icon, up-icon"
            tabindex="-1"
          ></div>
      `))),$e(e.content,this[t]),e.content.append(S.html(Ve||(Ve=We`
      <style>
        [part~="popup-toggle"] {
          outline: none;
        }

        [part~="source"] {
          align-items: center;
          display: flex;
        }
      </style>
    `))),e}}}(Be)){get[e](){return Object.assign(super[e],{menuPartType:Je,popupPartType:st,popupTogglePartType:tt,sourcePartType:W})}get[A](){const e=super[A];return e.content.append(S.html(rt||(rt=it`
        <style>
          [part~="menu"] {
            background: window;
            border: none;
            padding: 0.5em 0;
          }
        </style>
      `))),e}}customElements.define("elix-menu-button",class extends ot{});
