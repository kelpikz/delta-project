let ports = [];
let allWebSites = [];
let timer;
let activeTab;
let currentTab;
let token = localStorage.getItem("projectJWTkey");

// -----------------------------------------------UTILITIES--------------------------------------------

//# Function to check if the array contains the hostName
let checkIfHostNamePresent = (hostName) => {
  let sameSite = 0;
  allWebSites.forEach((singleWebite) => {
    if (singleWebite.hostName === hostName) sameSite = 1;
  });
  if (sameSite === 1) return true;
  else return false;
};

// ----------------------------------------- x ---TIMER UPDATER--- x --------------------------------------
const userExists = async () => {
  const connected = (p) => {
    //  p => is it is the details of the port which has been estabished
    ports[p.sender.tab.id] = p;
    // console.log("NEW PORT : ", p);
    timerUpdate(p.sender.tab.windowId);

    p.onMessage.addListener((msg) => {
      // console.log("Message recieved from CONENT SCRIPT");

      //! Updating allWebsites for new tabs
      if (msg.hostName) {
        if (checkIfHostNamePresent(msg.hostName)) {
          allWebSites.forEach((singleWebite) => {
            if (singleWebite.hostName === msg.hostName)
              singleWebite.tabsId.push(p.sender.tab.id);
          });
        } else {
          let x = {
            hostName: msg.hostName,
            tabsId: [p.sender.tab.id],
            duration: 0,
            limit: 5400,
          };
          allWebSites.push(x);
        }
      }
    });
  };

  //Get data from the user
  let res = await fetch("http://localhost:3500/tracker/today", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
      authorization: `Bearer ${token}`,
    },
  });
  console.log(res.status);
  if (res.status === 200) {
    let data = await res.json();
    console.log(data);
    data = JSON.parse(JSON.stringify(data));
    data.forEach((d) => {
      d.duration *= 60;
      d.limit *= 60;
      d.tabsId = [];
    });
    allWebSites = [...data];
    console.log("updated data : ", allWebSites);
    browser.runtime.onConnect.addListener(connected);
  } else {
    // The token you have is invalid
    localStorage.setItem("projectJWTkey", null);
  }

  //! When you switch tabs, active tab changes
  browser.tabs.onActivated.addListener((activeInfo) => {
    // console.log("ACTIVE TAB INFO", activeInfo);
    /*
    ! activeInfo
      => tabId : { current tab id }
      => windowId : { current window id }
      => previousTabId : {...}
  */
    timerUpdate(activeInfo.windowId);
  });

  //# Function to update the timers
  const timerUpdate = async (activeTabWindowId) => {
    /*
   * We call the query for activeTab passing the tabId and WindowId
   * We send message to the tab that it has been activated
   * clearInterval timer
   * Create a setInterval function and store it in timer
      ! Which adds +5 to duration every 5 seconds
      ! Sends that to the active tab
   * 
  */

    if (activeTabWindowId === -1) {
      console.log("activeTabWindowId", activeTabWindowId);
      clearInterval(timer);
      // return;
    }
    let queryCurrent = browser.tabs.query({
      active: true,
      windowId: activeTabWindowId,
    });

    currentTab = await queryCurrent.then(logTabs, onError);

    if (currentTab !== undefined) {
      console.log(currentTab);

      // finding the port with the correct
      ports[currentTab.id].postMessage({
        greeting: " This tab is now active",
        isActive: "active",
      });
      let allWebSitesIndex, activeTabPort;

      // index of the current tab id in allWebsites array
      allWebSites.forEach((singleWebite, index) => {
        if (singleWebite.tabsId.indexOf(currentTab.id) !== -1)
          allWebSitesIndex = index;
      });
      activeTabPort = ports[currentTab.id];
      activeTab = allWebSitesIndex;
      clearInterval(timer);

      timer = setInterval(async () => {
        allWebSites[allWebSitesIndex].duration += 5;
        activeTabPort.postMessage({
          greeting: `Time spent on this domain : ${allWebSites[allWebSitesIndex].duration}`,
        });

        //! Updating the dataBase
        if (allWebSites[allWebSitesIndex].duration % 60 === 0) {
          let data = {
            hostName: allWebSites[allWebSitesIndex].hostName,
          };
          let res = await fetch("http://localhost:3500/tracker/update", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json, text/plain, */*",
              authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
          });
          console.log(res.status);
          if (res.status === 200) {
            let data = await res.json();
            console.log(data);

            if (
              allWebSites[allWebSitesIndex].duration % 60 !==
              Number(data.duration)
            )
              allWebSites[allWebSitesIndex].duration = data.duration * 60;
            if (allWebSites[allWebSitesIndex].limit % 60 !== Number(data.limit))
              allWebSites[allWebSitesIndex].limit = data.limit * 60;
          }
        }
        //* Every 60 secs data is sent to the server for updatation
        // We send req => with the domaain name => server adds +1 to the duration
        //    => We do not send in actual time we spent on the domain

        //* If the limit it reached, We send msg to server to disable the site
        if (
          allWebSites[allWebSitesIndex].limit <=
          allWebSites[allWebSitesIndex].duration
        )
          if (activeTabPort)
            activeTabPort.postMessage({
              greeting: "You have reached the deadline",
              deactivate: "true",
            });
      }, 5000);
    }
  };

  // Returns an array of tabs which satisfy the query
  const logTabs = (tabs) => {
    // console.log("allWebSites : ", allWebSites);
    if (tabs.length && !tabs[0].url.includes("http")) return;
    return tabs[0];
  };

  const onError = (err) => {
    console.log("Some error occoured.", err);
  };

  //# To change the active tab when we change the browser page
  browser.windows.onFocusChanged.addListener((windowId) => {
    // console.log("changed tab", windowId);
    timerUpdate(windowId);
  });

  /*
   * A function which will send the web tracking data to the server every 5 mins
   * Sends with an jwt header to verify the user
   *
   */
};
// ------------------------------------------------BROWSER POP-UP-------------------------------------------------

//# Message Handler for popup
const handleMessage = async (request, sender) => {
  if (request.type === "login") {
    // recieve data
    // send it to the popup
    // add jwt to the page and execute the script
    // send any error back to the popup
    console.log(request.email);
    let user = {
      email: request.email,
      password: request.password,
    };
    console.log(user);
    let res = await fetch("http://localhost:3500/auth/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
      },
      body: JSON.stringify(user),
    });
    console.log(res.status);
    if (res.status === 200) {
      let data = await res.json();
      console.log(data);
      localStorage.setItem("projectJWTkey", data.token);
      setTimeout(() => location.reload(), 2000);
      return Promise.resolve({ response: "logged in" });
    }
    return Promise.resolve({ response: "wrong credentials" });
  } else if (request.type === "register") {
    console.log(request.email);
    let user = {
      email: request.email,
      password: request.password,
      username: request.username,
    };
    console.log(user);
    let res = await fetch("http://localhost:3500/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
      },
      body: JSON.stringify(user),
    });
    console.log(res.status);
    if (res.status === 200) {
      let data = await res.json();
      console.log(data);
      // store the data as jwt
      localStorage.setItem("projectJWTkey", data.token);
      setTimeout(() => location.reload(), 2000);
      return Promise.resolve({ response: "logged in" });
    }
    return Promise.resolve({ response: "wrong credentials" });
  } else if (request.type === "token") {
    if (token) return Promise.resolve({ response: "present" });
    return Promise.resolve({ response: "not present" });
  } else if (request.type === "timer") {
    console.log(allWebSites[activeTab]);
    return Promise.resolve({ response: allWebSites[activeTab].duration });
  } else if (request.type === "limit") {
    let limit = Number(request.limit);
    let hostName = allWebSites[activeTab].hostName;
    let data = { limit, hostName };
    let res = await fetch("http://localhost:3500/tracker/limit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    console.log(res.status);
    if (res.status === 200) {
      let data = await res.json();
      console.log(data);
      return Promise.resolve({ response: "updated" });
    }
  } else if (request.type === "logout") {
    localStorage.setItem("projectJWTkey", null);
    setTimeout(() => location.reload(), 2000);
    return Promise.resolve({ response: "logged out" });
  }
};

if (token) userExists();

browser.runtime.onMessage.addListener(handleMessage);
