//상수
const MAX_desktop = 40;
const MAX_mobile = 30;
const ENLIST_DAY_ = new Date("2021-02-15");
const COMPLETION_DAY_ = new Date("2021-03-19");
const DISCHARGE_DAY_ = new Date("2022-11-14");

//베타서비스 데이터
const ENLIST_DAY = new Date("2021-01-04");
const COMPLETION_DAY = new Date("2021-02-05");
const DISCHARGE_DAY = new Date("2022-10-03");

const PRECISION = 5;
const DEFAULT_THROTTLE = 500;
const API_PATH = "https://us-central1-swim-mail.cloudfunctions.net/send-test";
const API_TIMEOUT = 10;
const NOW_INTERVAL = 10;
//Animator

class Animator {
  constructor(throttle) {
    this.break = null;
    this.throttle = throttle || DEFAULT_THROTTLE;
  }
  register(f) {
    this.f = (timestamp) => {
      if (!this.break) {
        if (timestamp - this.starttime > this.throttle) {
          this.starttime = timestamp;
          f();
        }
        window.requestAnimationFrame(this.f);
      }
    };
  }
  start() {
    this.break = null;
    this.starttime = performance.now();
    window.requestAnimationFrame(this.f);
  }
  stop() {
    this.break = true;
  }
}
//Custom-Element 정의
class PaperGraph extends HTMLElement {
  constructor() {
    super();
  }
  static get observedAttributes() {
    return ["value", "today", "max"];
  }

  connectedCallback() {
    this.start();
  }
  attributeChangedCallback(attrName, oldVal, newVal) {
    this[attrName] = newVal;
    this.start();
  }
  update(today, value) {
    if (this.today != today || this.value != value) {
      this.today = today;
      this.value = value;
      this.start();
    }
  }
  start() {
    if (!window.matchMedia("(min-width: 900px)").matches) {
      this.max = MAX_mobile;
    }
    const ss = `<style>
      paper-graph{
        height:${Math.min(
          37,
          this.value * 1 + Math.max(0, 22 - this.value) / 3
        )}vw
      }
      .tdfig{
        height:${
          (Math.min(this.max - 10, Math.max(this.today, 10)) * 0.8,
          ((10 - this.total + this.today) / 10) * this.max)
        }vw
      }
    @media (max-width: 900px) {
      paper-graph{
      min-height:15vw;
      height:${Math.min(55, 10 + 1.5 * Math.min(this.value, this.max))}vw;
      margin-bottom:3em;
      }
      .tdfig{
        height:${
          (Math.min(this.max + 10, Math.max(this.today * 1.5, 15)),
          ((10 - this.total + this.today) / 10) * this.max)
        }vw
      }
    }
    </style>
`;

    const v = Math.min(this.value, this.max);
    const hd = `<svg viewbox="0 0 100 70" preserveAspectRatio="xMidYMin meet">
                <symbol id="letter" viewbox="-10 0 120 60">
            <polygon class='graph' points="0,30 50,60 100,30 50,0 0,30"/>
          </symbol>
          <symbol id="letterH" viewbox="-10 0 120 60">
          <polygon class='graph' points="0,30 50,60 100,30 50,0 0,30"/>
        </symbol>
          <symbol id="stack" viewbox="-7 -7 114 60">
            <polyline class='graph' points="0,0 50,30 100,0"/>
          </symbol>
          <symbol id="stackH" viewbox="-7 -7 114 60">
          <polyline class='graph' points="0,0 50,30 100,0"/>
        </symbol>
          `;
    let t = 0.1;
    let ct = `<use xlink:href=${
      this.today <= 0 ? "#letter" : "#letterH"
    } opacity="0">
      <animate attributeName="opacity" from="0" to="1" begin="${
        (t * Math.log2(v)) / 0.8
      }" dur="${t}s" fill="freeze"/>
      </use>`;
    for (let i = 0; i < v - 1; i++) {
      ct += `<use xlink:href="${
        i > this.today - 2 ? "#stack" : "#stackH"
      }"  y="${35 + i * 13}" opacity="0">
         <animate attributeName="opacity" from="0" to="1" begin="${
           t * Math.log2(v - i) * 0.9 ** i
         }" dur="${t}s" fill="freeze"  />
        </use>`;
    }
    const ft = `
      </svg>
        `;
    if (this.value < 12) {
      var fig = `
      <div class="tdfig">
      <span>오늘의/총 편지</span><br>
      <span class="big">${this.today}</span><span>/${this.value}개</span>
      </div>
      `;
    } else {
      var fig = `
      <div class="tdfig tcd">
      <span>오늘</span><span class='mbhide'> 전달된 편지</span><br>
      <count-up value="${this.today}" dur="1.2" class="big"></count-up><span class="faded">개</span>
      </div>

      <div class="ttfig">
      <span>총</span><span class='mbhide'> 전달된 편지</span><br>
      <count-up value="${this.value}" dur="1.2" class="big"></count-up><span>개</span>
      </div>
      `;
    }
    this.innerHTML = ss + hd + ct + ft + fig;
  }
}

const chart = document.querySelector("paper-graph");
//모바일의 반응형 그래프 크기 제어
(function () {
  var throttle = function (type, name, obj) {
    obj = obj || window;
    var running = false;
    var func = function () {
      if (running) {
        return;
      }
      running = true;
      requestAnimationFrame(function () {
        obj.dispatchEvent(new CustomEvent(name));
        running = false;
      });
    };
    obj.addEventListener(type, func);
  };
  throttle("resize", "optimizedResize");
})();

let resizeTimer = null;
window.addEventListener("optimizedResize", function () {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (!window.matchMedia("(min-width: 900px)").matches) {
      if (chart.max != MAX_mobile) {
        chart.max = MAX_mobile;
        chart.start();
      }
    } else {
      if (chart.max != MAX_desktop) {
        chart.max = MAX_desktop;
        chart.start();
      }
    }
  }, 100);
});

class CountUp extends HTMLElement {
  constructor() {
    super();
    this.start = null;
    this.i = 0;
  }
  static get observedAttributes() {
    return ["value", "dur"];
  }
  connectedCallback() {
    if (this.value != "") {
      this.go();
    }
  }
  attributeChangedCallback(attrName, oldVal, newVal) {
    this[attrName] = newVal;
    if (this.value != "") {
      this.go();
    }
  }
  go() {
    this.start = performance.now();
    window.requestAnimationFrame(this.frame.bind(this));
  }
  frame(timestamp) {
    const easeOut = (t) => (t > 1 ? 1 : t * (2 - t));
    let d = timestamp - this.start;
    this.i = easeOut(d / (this.dur * 1000)) * this.value;
    if (this.i < this.value) {
      this.innerText = Math.ceil(this.i);
      window.requestAnimationFrame(this.frame.bind(this));
    }
  }
}

class ProBar extends HTMLElement {
  constructor() {
    super();
  }
  static get observedAttributes() {
    return ["value"];
  }
  connectedCallback() {
    this.pt = null;
    this.fill();
  }
  attributeChangedCallback(attrName, oldVal, newVal) {
    this[attrName] = newVal;
    if (newVal != oldVal) this.fill();
  }

  fill() {
    let nt = Number(this.value.split("%")[0]).toFixed(1);
    this.querySelector("#percent").innerText = this.value;
    if (!this.pt) this.pt = nt;
    if (this.pt != nt) {
      this.pt = nt;
      let st = `
--bg: linear-gradient(
  0deg,
  var(--theme-color-light) ${this.pt}%,
  white ${this.pt}%
);`;
      this.style.cssText = st;
    }
  }
}

customElements.define("paper-graph", PaperGraph);
customElements.define("count-up", CountUp);
customElements.define("pro-bar", ProBar);

const toast = (type, msg, interval = 3000) => {
  let t = document.querySelector("toast");
  let icon = document.querySelector("toast #icon");
  let message = document.querySelector("toast #messages");
  if (type == "warning") {
    icon.innerText = "priority_high";
    icon.style.cssText = "background:#e3002d";
  } else if (type == "success") {
    icon.innerText = "check";
    icon.style.cssText = "background:#1b8558";
  } else {
    icon.innerText = "notifications";
    icon.style.cssText = "background:#e8b600";
  }
  message.innerText = msg;
  t.classList.remove("hide");
  window.setTimeout(() => {
    t.classList.add("hide");
  }, interval);
};

//DOM 조작
const DOMLinker = (obj, properties, option) => {
  for (let [key, value] of Object.entries(properties)) {
    Object.defineProperty(obj, key, {
      get() {
        return option
          ? document.querySelector(value)[option]
          : document.querySelector(value);
      },
      set(x) {
        if (option) {
          document.querySelector(value)[option] = x;
        } else {
          //document.querySelector(value) = x;
        }
      },
    });
  }
};
const AttrLinker = (obj, properties) => {
  for (let [propertyname, path, linkedattr] of properties) {
    Object.defineProperty(obj, propertyname, {
      get() {
        return document.querySelector(path).getAttribute(linkedattr);
      },
      set(x) {
        document.querySelector(path).setAttribute(linkedattr, x);
      },
    });
  }
};

const container = document.querySelector(".container");
DOMLinker(container, { writeButton: "#writebut" });
const letter = document.querySelector("div#letter");
DOMLinker(letter, {
  editProfileButton: "#pfbut",
  exitButton: "div#letter .back",
});
const profile = document.querySelector("#profile");
DOMLinker(profile, { saveButton: "#pfsavebut" });

//Pagination
container.writeButton.addEventListener("click", (evt) => {
  if (evt.isTrusted) {
    history.pushState({ now: "letter" }, "", location.href);
  }
  rtd.stop();
  container.classList.add("blur");
  letter.classList.remove("slide");
  if (!DB.access.name || !DB.access.pw) {
    setTimeout(() => {
      document.querySelector(".sender").classList.add("highlight");
    }, 1000);
    setTimeout(() => {
      document.querySelector(".sender").classList.remove("highlight");
    }, 3000);
  }
  if ((tempLetter = forms.tempLoad())) {
    [forms.title, forms.body] = [tempLetter.title, tempLetter.body];
  }
  if (DB.access.getItem("name")) {
    profileInfo.icon = "person";
    pf = {
      name: DB.access.name,
      rel: DB.access.rel,
      postcode: DB.access.postcode,
      addr1: DB.access.addr1,
      addr2: DB.access.addr2,
      addr3: DB.access.addr3,
      pw: DB.access.pw,
    };
    profileInfo.render(pf);
    forms.update(pf);
  }
});

letter.editProfileButton.addEventListener("click", (evt) => {
  if (evt.isTrusted) {
    history.pushState({ now: "profile" }, "", location.href);
  }
  letter.classList.add("blur");
  profile.classList.remove("slide");
});

document.querySelectorAll(".back").forEach((x) => {
  x.addEventListener("click", () => {
    currentPopup = x.parentElement.parentElement;
    currentPopup.classList.add("slide");
    currentPopup.previousElementSibling.classList.remove("blur");
    if (currentPopup.previousElementSibling.classList.value == "container") {
      rtd.start();
    } else {
      document.querySelectorAll(".clsd").forEach((x) => {
        x.classList.remove("clsd");
      });
      postal_wrap.style.display = "none";
    }
  });
});

window.onpopstate = (evt) => {
  try {
    if (evt.state.now == "profile") {
      letter.editProfileButton.click();
    } else if (evt.state.now == "letter") {
      document.querySelector("div#profile .back").click();
      if (letter.classList.contains("slide")) {
        container.writeButton.click();
      }
    } else if (evt.state.now == "main") {
      document.querySelector("div#letter .back").click();
    } else if (evt.state.beforeExit) {
      toast("", "뒤로 버튼을 한번 더 누르면 종료됩니다.");
    } else {
    }
  } catch (err) {
    history.back();
  }
};

window.addEventListener("load", function () {
  //console.log("load history hooked");
  window.history.pushState({ beforeExit: true }, "");
  window.history.pushState({ now: "main" }, "");
});

//Esc
document.addEventListener("keyup", (y) => {
  if (
    y.key == "Escape" &&
    !document.querySelector("div#letter").classList.contains("slide")
  )
    history.back();
});

//우편번호 찾기
const postal_wrap = document.getElementById("wrap");
const postalcodeSearch = () => {
  document.querySelectorAll(".clsb").forEach((x) => {
    x.classList.add("clsd");
  });
  new daum.Postcode({
    oncomplete: function (data) {
      var addr = "";
      var extraAddr = "";
      if (data.userSelectedType === "R") {
        addr = data.roadAddress;
      } else {
        addr = data.jibunAddress;
      }
      if (data.userSelectedType === "R") {
        if (data.bname !== "" && /[동|로|가]$/g.test(data.bname)) {
          extraAddr += data.bname;
        }
        if (data.buildingName !== "" && data.apartment === "Y") {
          extraAddr +=
            extraAddr !== "" ? ", " + data.buildingName : data.buildingName;
        }
        if (extraAddr !== "") {
          extraAddr = " (" + extraAddr + ")";
        }
        document.getElementById("extraAddress").value = extraAddr;
      } else {
        document.getElementById("extraAddress").value = "";
      }
      document.getElementById("postcode").value = data.zonecode;
      document.getElementById("address").value = addr;
      document.querySelectorAll(".clsd").forEach((x) => {
        x.classList.remove("clsd");
      });
      document.getElementById("detailAddress").focus();
      postal_wrap.style.display = "none";
    },
    width: "100%",
    height: "100%",
  }).embed(postal_wrap);

  postal_wrap.style.display = "block";
};

document.getElementById("postbut").addEventListener("click", postalcodeSearch);

//프로필 저장
const forms = {
  tempSave: () => {
    DB.access.tempLetter = JSON.stringify({
      title: forms.title,
      body: forms.body,
    });
  },
  tempLoad: () => {
    try {
      return JSON.parse(DB.access.tempLetter);
    } catch {
      return false;
    }
  },
};
DOMLinker(
  forms,
  {
    name: "#namef",
    rel: "#relf",
    postcode: "#postcode",
    addr1: "#address",
    addr2: "#detailAddress",
    addr3: "#extraAddress",
    pw: "#pw",
    title: ".ltitle input",
    body: ".contents textarea",
  },
  "value"
);

const profileInfo = {};
DOMLinker(
  profileInfo,
  {
    name: ".info #name",
    rel: ".info #rel",
    addr1: ".info #addr1",
    addr2: ".info #addr2",
    icon: "#pfbut",
  },
  "innerText"
);

const DB = {
  save: (x) => {
    let ls = localStorage;
    ls.name = x.name;
    ls.rel = x.rel;
    ls.postcode = x.postcode;
    ls.addr1 = x.addr1;
    ls.addr2 = x.addr2;
    ls.addr3 = x.addr3;
    ls.pw = x.pw == "" ? x.name + x.postcode : x.pw;
  },
  access: localStorage,
};

profileInfo.render = (x) => {
  profileInfo.name = x.name;
  profileInfo.rel = x.rel;
  profileInfo.addr1 = x.addr1 + " " + x.addr2;
  profileInfo.addr2 = x.addr3;
};
forms.update = (x) => {
  forms.name = x.name;
  forms.rel = x.rel;
  forms.postcode = x.postcode;
  forms.addr1 = x.addr1;
  forms.addr2 = x.addr2;
  forms.addr3 = x.addr3;
  forms.pw = x.pw;
};
document.querySelectorAll("#profile input").forEach((x) => {
  x.addEventListener("keyup", (y) => {
    if (y.key == "Enter") profile.saveButton.click();
  });
});
profile.saveButton.addEventListener("click", () => {
  DB.save(forms);
  profileInfo.render(forms);
  profile.querySelector(".back").click();
  toast("success", "프로필을 저장하였습니다.");
});

//d-day 위젯들
function update(date) {
  if (typeof date == "string") {
    date = new Date(date);
  }
  let diff = (x, y) => (y - x) / 1000 / 60 / 60 / 24;
  this.percent =
    Number(((date - ENLIST_DAY) / (this.end - ENLIST_DAY)) * 100).toFixed(
      PRECISION
    ) + "%";
  let nleft = Math.floor(diff(date, this.end));
  if (this.left != nleft) this.left = Math.floor(diff(date, this.end));
}

const completion = { end: COMPLETION_DAY, update: update };
const discharge = { end: DISCHARGE_DAY, update: update };
AttrLinker(completion, [
  ["percent", "pro-bar#cp", "value"],
  ["left", "#cpFig", "value"],
]);
AttrLinker(discharge, [
  ["percent", "pro-bar#dc", "value"],
  ["left", "#dcFig", "value"],
]);
//편지 임시저장 기능
let unchanged = 0;
const autosaver = window.setInterval(() => {
  if (!letter.classList.contains("slide")) {
    if (forms.tempLoad() == false) {
      forms.tempSave();
    } else if (forms.tempLoad().body != forms.body) {
      unchanged = 0;
      forms.tempSave();
    } else if (unchanged <= 5) {
      unchanged += 1;
      if (unchanged > 5) {
        toast("", "자동 저장되었습니다.");
      }
    }
  }
}, 1000);
//편지 전송
const loading = (onoff) => {
  if (onoff) {
    document.querySelector("loading").style.cssText = "display:block";
  } else {
    document.querySelector("loading").style.cssText = "";
  }
};
const send = () => {
  let data = {
    zipcode: forms.postcode,
    addr1: forms.addr1,
    addr2: forms.addr2 + forms.addr3,
    name: forms.name,
    relationship: forms.rel,
    title: forms.title,
    contents: forms.body,
    password: forms.pw,
  };
  if (data.name == "" || data.password == "") {
    toast("warning", "프로필을 먼저 등록해주세요");
    letter.editProfileButton.click();
  } else {
    //API 연동부분
    timeout = new Promise((resolve, reject) => {
      loading(true);
      const id = setTimeout(() => {
        clearTimeout(id);
        reject("timeout!");
      }, API_TIMEOUT * 1000);
    });
    ajax = async () => {
      const res = await fetch(API_PATH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await res.json();
      return Number(body.result);
      //return -99;
    };

    console.log(JSON.stringify(data));
    Promise.race([ajax(), timeout])
      .then((res) => {
        loading(false);
        if (res == 2) {
          letter.exitButton.click();
          window.setTimeout(() => {
            forms.title = "";
            forms.body = "";
            forms.tempSave();
          }, 1000);
          toast("success", "전송되었습니다.");
        } else if (res == -1) {
          toast("warning", "공군 서버 응답없음- 다시 시도해주세요!");
        } else if (res == -2) {
          toast("warning", "전송 과정 오류 - 다시 시도해주세요!");
        } else if (res == -99) {
          toast("warning", "개발중입니다.");
        }
      })
      .catch((err) => {
        loading(false);
        toast("warning", "API 서버 응답없음- 다시 시도해주세요!");
      });
  }
};
document.querySelectorAll("#send").forEach((x) => {
  x.addEventListener("click", send);
});
//서비스워커
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("service-worker-min.js") // serviceWorker 파일 경로
      .then((reg) => {
        //console.log("Service worker registered.", reg);
      })
      .catch((e) => console.log(e));
  });
}
//install prompt
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  addBtn = document.querySelector("#install");
  addBtn.style.display = "inline";
  addBtn.addEventListener("click", (e) => {
    addBtn.style.display = "none";
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        //console.log("User accepted the A2HS prompt");
      } else {
        //console.log("User dismissed the A2HS prompt");
      }
      deferredPrompt = null;
    });
  });
});
//테스트용 초기값
//chart.update(15, 15);

const rtd = new Animator(300);
rtd.register(() => {
  now = new Date();
  completion.update(now);
  discharge.update(now);
});
rtd.start();

const getCount = () => {
  now = async () => {
    const res = await fetch(API_PATH);
    return await res.json();
  };
  now().then((res) => {
    if (res.result == 1) {
      chart.update(res.today, res.total);
    } else {
      clearInterval(rtn);
      document.querySelectorAll("count-up").forEach((x) => (x.innerText = "?"));
      toast("warning", "편지수를 받아올 수 없습니다.");
    }
  });
};
getCount();
const rtn = setInterval(() => {
  getCount();
}, 1000 * NOW_INTERVAL);
