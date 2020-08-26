console.clear();
let isActive = true;
//# PORT

var interval = setInterval(function () {
  if (document.readyState === "complete") {
    clearInterval(interval);
    done();
  }
}, 100);

const done = () => {
  let myPort = browser.runtime.connect({ name: "talking-port" });
  myPort.postMessage({
    greeting: "hello from content script",
    hostName: window.location.hostname,
  });

  myPort.onMessage.addListener(function (m) {
    // console.log("In content script, received message from background script: ");
    console.log(m.greeting);
    // console.log(tabs.Tab);
    if (m.deactivate === "true") {
      console.log(m);
      document.querySelector("body").innerHTML = `
        <h1>You have reached today's limit.</h1>
        <h4>Come back tommorow to use this site</h4>`;
    }
  });
};
