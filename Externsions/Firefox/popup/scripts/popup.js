const execScipt = () => {
  notifyBackgroundPage("token", {});

  const switchTabs = (option) => {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("registerForm").style.display = "none";
    document.getElementById("timer").style.display = "none";
    document.getElementById("limitForm").style.display = "none";

    document.getElementById(option).style.display = "block";
    if (option === "timer") notifyBackgroundPage("timer", {});
  };

  document.getElementById("logout").style.display = "none";
  document.getElementById("loginForm").style.display = "none";
  document.getElementById("registerForm").style.display = "none";
  document.getElementById("limitForm").style.display = "none";
  document.getElementById("timer").style.display = "none";

  document
    .getElementById("loginButton")
    .addEventListener("click", () => switchTabs("loginForm"));
  document
    .getElementById("registerButton")
    .addEventListener("click", () => switchTabs("registerForm"));
  document
    .getElementById("timerButton")
    .addEventListener("click", () => switchTabs("timer"));
  document
    .getElementById("limitButton")
    .addEventListener("click", () => switchTabs("limitForm"));
  document
    .getElementById("logoutButton")
    .addEventListener("click", () => notifyBackgroundPage("logout", {}));

  const login = () => {
    let res = document.querySelectorAll("#loginForm input");
    let email = res[0].value;
    let password = res[1].value;
    console.log("clicked login button");
    notifyBackgroundPage("login", { email, password });
  };
  const register = () => {
    let res = document.querySelectorAll("#registerForm input");
    let email = res[0].value;
    let username = res[1].value;
    let password = res[2].value;
    console.log("clicked login button");
    notifyBackgroundPage("register", { email, password, username });
  };
  const limit = () => {
    let res = document.querySelectorAll("#limitForm input");
    let limit = res[0].value;
    document.getElementById("limitForm").style.display = "none";
    console.log("clicked limit button");
    notifyBackgroundPage("limit", { limit });
  };
  document.getElementById("loginForm").addEventListener("submit", login);
  document.getElementById("registerForm").addEventListener("submit", register);
  document.getElementById("limitForm").addEventListener("submit", limit);
};

const checktoken = (token) => {
  if (token) {
    console.log("there is some token");
    document.getElementById("loginButton").style.display = "none";
    document.getElementById("registerButton").style.display = "none";
    // msg to the browser tab asking for the active time  on this page
    //  with the host name as parameter
    //  get the  time as response
    // initialize timer
  } else {
    // show login/ registeration form
    document.getElementById("timerButton").style.display = "none";
    document.getElementById("logoutButton").style.display = "none";
    document.getElementById("limitButton").style.display = "none";
    // login/ register
    // after login initialize timer
    // send messsage to the background script and ask for the time
  }
};

const handleResponse = (message, type) => {
  console.log(`Message from the background script:  ${message.response}`);
  if (type === "login" && message.response === "wrong credentials")
    document.querySelector("#loginForm .warn").hidden = false;
  else if (type === "register" && message.response === "wrong credentials")
    document.querySelector("#registerForm .warn").hidden = false;
  else if (type === "login" && message.response === "logged in")
    document.querySelector("#loginForm .correct").hidden = false;
  else if (type === "register" && message.response === "logged in")
    document.querySelector("#registerForm .correct").hidden = false;
  else if (type === "token" && message.response === "present") checktoken(1);
  else if (type === "token" && message.response === "not present")
    checktoken(0);
  else if (type === "timer") initializeClock(Number(message.response));
};

const handleError = (error) => {
  console.log(`Error: ${error}`);
};

const notifyBackgroundPage = (type, data) => {
  let { email, password, username, limit } = data;
  let sending = browser.runtime.sendMessage({
    type: type,
    email,
    password,
    username,
    limit,
  });
  sending.then((msg) => handleResponse(msg, type), handleError);
};

const reportExecuteScriptError = (error) => {
  console.error(`Something went wrong : ${error.message}`);
};

execScipt();
let timer;

const initializeClock = (x) => {
  clearInterval(timer);
  let t = x % 60;
  let sec = document.querySelector("#clockdiv  .seconds");
  let min = document.querySelector("#clockdiv  .minutes");
  let hrs = document.querySelector("#clockdiv  .hours");

  sec.innerHTML = x % 60;
  min.innerHTML = Math.floor(x / 60) % 60;
  hrs.innerHTML = Math.floor(x / 3600);

  timer = setInterval(() => {
    t++;
    if (t == 60) {
      if (min.innerHTML === "59") {
        min.innerHTML = 0;
        hrs.innerHTML = Number(hrs.innerHTML) + 1;
      } else {
        min.innerHTML = Number(min.innerHTML) + 1;
      }
      t = 0;
      sec.innerHTML = 0;
    } else {
      sec.innerHTML = t;
    }
  }, 1000);
};
