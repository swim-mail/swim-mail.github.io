const MAX_desktop=40,MAX_mobile=30,ENLIST_DAY=new Date("2021-02-15"),COMPLETION_DAY=new Date("2021-03-19"),DISCHARGE_DAY=new Date("2022-11-14"),PRECISION=5,DEFAULT_THROTTLE=500,API_PATH="http://127.0.0.1:8088",API_TIMEOUT=10,NOW_INTERVAL=10;class Animator{constructor(e){this.break=null,this.throttle=e||500}register(e){this.f=t=>{this.break||(t-this.starttime>this.throttle&&(this.starttime=t,e()),window.requestAnimationFrame(this.f))}}start(){this.break=null,this.starttime=performance.now(),window.requestAnimationFrame(this.f)}stop(){this.break=!0}}class PaperGraph extends HTMLElement{constructor(){super()}static get observedAttributes(){return["value","today","max"]}connectedCallback(){this.start()}attributeChangedCallback(e,t,s){this[e]=s,this.start()}update(e,t){this.today==e&&this.value==t||(this.today=e,this.value=t,this.start())}start(){window.matchMedia("(min-width: 900px)").matches||(this.max=30);const e=`<style>\n      paper-graph{\n        height:${Math.min(37,1*this.value+Math.max(0,22-this.value)/3)}vw\n      }\n      .tdfig{\n        height:${Math.min(this.max-10,Math.max(this.today,10)),(10-this.total+this.today)/10*this.max}vw\n      }\n    @media (max-width: 900px) {\n      paper-graph{\n      min-height:15vw;\n      height:${Math.min(55,10+1.5*Math.min(this.value,this.max))}vw;\n      margin-bottom:3em;\n      }\n      .tdfig{\n        height:${Math.min(this.max+10,Math.max(1.5*this.today,15))}vw\n      }\n    }\n    </style>\n`,t=Math.min(this.value,this.max);let s=`<use xlink:href=${this.today<=0?"#letter":"#letterH"} opacity="0">\n      <animate attributeName="opacity" from="0" to="1" begin="${.1*Math.log2(t)/.8}" dur="0.1s" fill="freeze"/>\n      </use>`;for(let e=0;e<t-1;e++)s+=`<use xlink:href="${e>this.today-2?"#stack":"#stackH"}"  y="${35+13*e}" opacity="0">\n         <animate attributeName="opacity" from="0" to="1" begin="${.1*Math.log2(t-e)*.9**e}" dur="0.1s" fill="freeze"  />\n        </use>`;if(this.value<12)var r=`\n      <div class="tdfig">\n      <span>오늘의/총 편지</span><br>\n      <span class="big">${this.today}</span><span>/${this.value}개</span>\n      </div>\n      `;else r=`\n      <div class="tdfig tcd">\n      <span>오늘</span><span class='mbhide'> 전달된 편지</span><br>\n      <count-up value="${this.today}" dur="1.2" class="big"></count-up><span class="faded">개</span>\n      </div>\n\n      <div class="ttfig">\n      <span>총</span><span class='mbhide'> 전달된 편지</span><br>\n      <count-up value="${this.value}" dur="1.2" class="big"></count-up><span>개</span>\n      </div>\n      `;this.innerHTML=e+'<svg viewbox="0 0 100 70" preserveAspectRatio="xMidYMin meet">\n                <symbol id="letter" viewbox="-10 0 120 60">\n            <polygon class=\'graph\' points="0,30 50,60 100,30 50,0 0,30"/>\n          </symbol>\n          <symbol id="letterH" viewbox="-10 0 120 60">\n          <polygon class=\'graph\' points="0,30 50,60 100,30 50,0 0,30"/>\n        </symbol>\n          <symbol id="stack" viewbox="-7 -7 114 60">\n            <polyline class=\'graph\' points="0,0 50,30 100,0"/>\n          </symbol>\n          <symbol id="stackH" viewbox="-7 -7 114 60">\n          <polyline class=\'graph\' points="0,0 50,30 100,0"/>\n        </symbol>\n          '+s+"\n      </svg>\n        "+r}}const chart=document.querySelector("paper-graph");!function(e,t,s){s=s||window;var r=!1;s.addEventListener("resize",(function(){r||(r=!0,requestAnimationFrame((function(){s.dispatchEvent(new CustomEvent("optimizedResize")),r=!1})))}))}();let resizeTimer=null;window.addEventListener("optimizedResize",(function(){clearTimeout(resizeTimer),resizeTimer=setTimeout(()=>{window.matchMedia("(min-width: 900px)").matches?40!=chart.max&&(chart.max=40,chart.start()):30!=chart.max&&(chart.max=30,chart.start())},100)}));class CountUp extends HTMLElement{constructor(){super(),this.start=null,this.i=0}static get observedAttributes(){return["value","dur"]}connectedCallback(){""!=this.value&&this.go()}attributeChangedCallback(e,t,s){this[e]=s,""!=this.value&&this.go()}go(){this.start=performance.now(),window.requestAnimationFrame(this.frame.bind(this))}frame(e){let t=e-this.start;var s;this.i=((s=t/(1e3*this.dur))>1?1:s*(2-s))*this.value,this.i<this.value&&(this.innerText=Math.ceil(this.i),window.requestAnimationFrame(this.frame.bind(this)))}}class ProBar extends HTMLElement{constructor(){super()}static get observedAttributes(){return["value"]}connectedCallback(){this.pt=null,this.fill()}attributeChangedCallback(e,t,s){this[e]=s,s!=t&&this.fill()}fill(){let e=Number(this.value.split("%")[0]).toFixed(1);if(this.querySelector("#percent").innerText=this.value,this.pt||(this.pt=e),this.pt!=e){this.pt=e;let t=`\n--bg: linear-gradient(\n  0deg,\n  var(--theme-color-light) ${this.pt}%,\n  white ${this.pt}%\n);`;this.style.cssText=t}}}customElements.define("paper-graph",PaperGraph),customElements.define("count-up",CountUp),customElements.define("pro-bar",ProBar);const toast=(e,t,s=3e3)=>{let r=document.querySelector("toast"),a=document.querySelector("toast #icon"),n=document.querySelector("toast #messages");"warning"==e?(a.innerText="priority_high",a.style.cssText="background:#e3002d"):"success"==e?(a.innerText="check",a.style.cssText="background:#1b8558"):(a.innerText="notifications",a.style.cssText="background:#e8b600"),n.innerText=t,r.classList.remove("hide"),window.setTimeout(()=>{r.classList.add("hide")},s)},DOMLinker=(e,t,s)=>{for(let[r,a]of Object.entries(t))Object.defineProperty(e,r,{get:()=>s?document.querySelector(a)[s]:document.querySelector(a),set(e){s&&(document.querySelector(a)[s]=e)}})},AttrLinker=(e,t)=>{for(let[s,r,a]of t)Object.defineProperty(e,s,{get:()=>document.querySelector(r).getAttribute(a),set(e){document.querySelector(r).setAttribute(a,e)}})},container=document.querySelector(".container");DOMLinker(container,{writeButton:"#writebut"});const letter=document.querySelector("div#letter");DOMLinker(letter,{editProfileButton:"#pfbut",exitButton:"div#letter .back"});const profile=document.querySelector("#profile");DOMLinker(profile,{saveButton:"#pfsavebut"}),container.writeButton.addEventListener("click",e=>{e.isTrusted&&history.pushState({now:"letter"},"",location.href),rtd.stop(),container.classList.add("blur"),letter.classList.remove("slide"),DB.access.name&&DB.access.pw||(setTimeout(()=>{document.querySelector(".sender").classList.add("highlight")},1e3),setTimeout(()=>{document.querySelector(".sender").classList.remove("highlight")},3e3)),(tempLetter=forms.tempLoad())&&([forms.title,forms.body]=[tempLetter.title,tempLetter.body]),DB.access.getItem("name")&&(profileInfo.icon="person",pf={name:DB.access.name,rel:DB.access.rel,postcode:DB.access.postcode,addr1:DB.access.addr1,addr2:DB.access.addr2,addr3:DB.access.addr3,pw:DB.access.pw},profileInfo.render(pf),forms.update(pf))}),letter.editProfileButton.addEventListener("click",e=>{e.isTrusted&&history.pushState({now:"profile"},"",location.href),letter.classList.add("blur"),profile.classList.remove("slide")}),document.querySelectorAll(".back").forEach(e=>{e.addEventListener("click",()=>{currentPopup=e.parentElement.parentElement,currentPopup.classList.add("slide"),currentPopup.previousElementSibling.classList.remove("blur"),"container"==currentPopup.previousElementSibling.classList.value?rtd.start():(document.querySelectorAll(".clsd").forEach(e=>{e.classList.remove("clsd")}),postal_wrap.style.display="none")})}),window.onpopstate=e=>{try{"profile"==e.state.now?letter.editProfileButton.click():"letter"==e.state.now?(document.querySelector("div#profile .back").click(),letter.classList.contains("slide")&&container.writeButton.click()):"main"==e.state.now?document.querySelector("div#letter .back").click():e.state.beforeExit&&toast("","뒤로 버튼을 한번 더 누르면 종료됩니다.")}catch(e){history.back()}},window.addEventListener("load",(function(){window.history.pushState({beforeExit:!0},""),window.history.pushState({now:"main"},"")})),document.addEventListener("keyup",e=>{"Escape"!=e.key||document.querySelector("div#letter").classList.contains("slide")||history.back()});const postal_wrap=document.getElementById("wrap"),postalcodeSearch=()=>{document.querySelectorAll(".clsb").forEach(e=>{e.classList.add("clsd")}),new daum.Postcode({oncomplete:function(e){var t,s="";t="R"===e.userSelectedType?e.roadAddress:e.jibunAddress,"R"===e.userSelectedType?(""!==e.bname&&/[동|로|가]$/g.test(e.bname)&&(s+=e.bname),""!==e.buildingName&&"Y"===e.apartment&&(s+=""!==s?", "+e.buildingName:e.buildingName),""!==s&&(s=" ("+s+")"),document.getElementById("extraAddress").value=s):document.getElementById("extraAddress").value="",document.getElementById("postcode").value=e.zonecode,document.getElementById("address").value=t,document.querySelectorAll(".clsd").forEach(e=>{e.classList.remove("clsd")}),document.getElementById("detailAddress").focus(),postal_wrap.style.display="none"},width:"100%",height:"100%"}).embed(postal_wrap),postal_wrap.style.display="block"};document.getElementById("postbut").addEventListener("click",postalcodeSearch);const forms={tempSave:()=>{DB.access.tempLetter=JSON.stringify({title:forms.title,body:forms.body})},tempLoad:()=>{try{return JSON.parse(DB.access.tempLetter)}catch{return!1}}};DOMLinker(forms,{name:"#namef",rel:"#relf",postcode:"#postcode",addr1:"#address",addr2:"#detailAddress",addr3:"#extraAddress",pw:"#pw",title:".ltitle input",body:".contents textarea"},"value");const profileInfo={};DOMLinker(profileInfo,{name:".info #name",rel:".info #rel",addr1:".info #addr1",addr2:".info #addr2",icon:"#pfbut"},"innerText");const DB={save:e=>{let t=localStorage;t.name=e.name,t.rel=e.rel,t.postcode=e.postcode,t.addr1=e.addr1,t.addr2=e.addr2,t.addr3=e.addr3,t.pw=""==e.pw?e.name+e.postcode:e.pw},access:localStorage};function update(e){"string"==typeof e&&(e=new Date(e));let t=(e,t)=>(t-e)/1e3/60/60/24;this.percent=Number((e-ENLIST_DAY)/(this.end-ENLIST_DAY)*100).toFixed(5)+"%";let s=Math.floor(t(e,this.end));this.left!=s&&(this.left=Math.floor(t(e,this.end)))}profileInfo.render=e=>{profileInfo.name=e.name,profileInfo.rel=e.rel,profileInfo.addr1=e.addr1+" "+e.addr2,profileInfo.addr2=e.addr3},forms.update=e=>{forms.name=e.name,forms.rel=e.rel,forms.postcode=e.postcode,forms.addr1=e.addr1,forms.addr2=e.addr2,forms.addr3=e.addr3,forms.pw=e.pw},document.querySelectorAll("#profile input").forEach(e=>{e.addEventListener("keyup",e=>{"Enter"==e.key&&profile.saveButton.click()})}),profile.saveButton.addEventListener("click",()=>{DB.save(forms),profileInfo.render(forms),profile.querySelector(".back").click(),toast("success","프로필을 저장하였습니다.")});const completion={end:COMPLETION_DAY,update:update},discharge={end:DISCHARGE_DAY,update:update};AttrLinker(completion,[["percent","pro-bar#cp","value"],["left","#cpFig","value"]]),AttrLinker(discharge,[["percent","pro-bar#dc","value"],["left","#dcFig","value"]]);let unchanged=0;const autosaver=window.setInterval(()=>{letter.classList.contains("slide")||(0==forms.tempLoad()?forms.tempSave():forms.tempLoad().body!=forms.body?(unchanged=0,forms.tempSave()):unchanged<=5&&(unchanged+=1,unchanged>5&&toast("","자동 저장되었습니다.")))},1e3),loading=e=>{document.querySelector("loading").style.cssText=e?"display:block":""},send=()=>{let e={zipcode:forms.postcode,addr1:forms.addr1,addr2:forms.addr2+forms.addr3,name:forms.name,relationship:forms.rel,title:forms.title,contents:forms.body,password:forms.pw};""==e.name||""==e.password?(toast("warning","프로필을 먼저 등록해주세요"),letter.editProfileButton.click()):(timeout=new Promise((e,t)=>{loading(!0);const s=setTimeout(()=>{clearTimeout(s),t("timeout!")},1e4)}),ajax=async()=>{const t=await fetch(API_PATH,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e)}),s=await t.json();return Number(s.result)},Promise.race([ajax(),timeout]).then(e=>{loading(!1),2==e?(letter.exitButton.click(),window.setTimeout(()=>{forms.title="",forms.body="",forms.tempSave()},1e3),toast("success","전송되었습니다.")):-1==e?toast("warning","공군 서버 응답없음- 다시 시도해주세요!"):-2==e?toast("warning","전송 과정 오류 - 다시 시도해주세요!"):-99==e&&toast("warning","개발중입니다.")}).catch(e=>{loading(!1),toast("warning","API 서버 응답없음- 다시 시도해주세요!")}))};document.querySelectorAll("#send").forEach(e=>{e.addEventListener("click",send)}),"serviceWorker"in navigator&&window.addEventListener("load",()=>{navigator.serviceWorker.register("service-worker-min.js").then(e=>{}).catch(e=>{})}),window.addEventListener("beforeinstallprompt",e=>{e.preventDefault(),deferredPrompt=e,addBtn=document.querySelector("#install"),addBtn.style.display="inline",addBtn.addEventListener("click",e=>{addBtn.style.display="none",deferredPrompt.prompt(),deferredPrompt.userChoice.then(e=>{e.outcome,deferredPrompt=null})})}),chart.update(15,15);const rtd=new Animator(300);rtd.register(()=>{now=new Date,offset=new Date(1*now+3456e6),completion.update(offset),discharge.update(offset)}),rtd.start();