const User = require("../Models/User");

module.exports.today = async (req, res, next) => {
  try {
    //* Find the required data and send to ther user
    let user = await User.findById(req.user.id);
    let { tracker: trackers, limits } = user;
    let date = new Date().toLocaleDateString();
    console.log("limits", limits);
    let usage = [];
    trackers.forEach((t) => {
      if (t.date === date) usage = [...t.usage];
    });
    usage = JSON.parse(JSON.stringify(usage));
    usage = usage.map((u) => {
      u.limit = 90;
      console.log("u before", u);
      user.limits.forEach((l) => {
        if (l.hostName === u.hostName) u.limit = l.limit;
      });
      console.log("u after", u);
      return u;
    });
    if (usage.length === 0) {
      user.tracker.push({ date: date, usage });
      await user.save();
    }
    console.log(usage);
    res.status(200).json(usage);
  } catch (err) {
    next({ status: 500, message: err });
  }
};

/**
 * Gets the hostName(domain name), as updates the data accordingly
 * ! THIS ENABLES SIMONTANEOUS USAGE OF THE EXTENSION IN FIREFOX AND CHROME WITHOUT ANY DISCREPANCY
 */
module.exports.update = async (req, res, next) => {
  try {
    const { hostName } = req.body;

    let user = await User.findById(req.user.id);
    let date = new Date().toLocaleDateString();
    console.log(user);
    let dateIndex = user.tracker.findIndex((t) => t.date == date);
    let data;
    // Finding the object with the correct hostName and position
    if (dateIndex === -1) {
      let newTracker = { date, usage: [] }; //new tracker obj with date and usage
      data = { hostName: hostName, duration: 1 }; // new host obj
      newTracker.usage.push(data);
      console.log(newTracker);
      user.tracker.push(newTracker);
      data.limit = 90;
      user.limits.forEach((l) =>
        l.hostName === data.hostName ? (data.limit = i.limit) : undefined
      );
    } else {
      // searching for host in usage obj
      let hostIndex = user.tracker[dateIndex].usage.findIndex(
        (t) => t.hostName === hostName
      );
      if (hostIndex === -1) {
        // if no host is there
        data = { hostName, duration: 1 };
        user.tracker[dateIndex].usage.push(data);
        data.limit = 90;
        user.limits.forEach((l) =>
          l.hostName === data.hostName ? (data.limit = i.limit) : undefined
        );
      } else {
        data = user.tracker[dateIndex].usage[hostIndex];
        data = JSON.parse(JSON.stringify(data));
        data.duration += 1;
        user.tracker[dateIndex].usage[hostIndex] = data;
        data.limit = 90;
        user.limits.forEach((l) =>
          l.hostName === data.hostName ? (data.limit = l.limit) : undefined
        );
      }
    }
    await user.save();
    res.status(200).json(data);
  } catch (err) {
    next({ status: 500, message: err });
  }
};

//? Handler for updating limit data
module.exports.limit = async (req, res, next) => {
  try {
    const { hostName, limit } = req.body;
    let user = await User.findById(req.user.id);
    console.log(user);
    let limitIndex = user.limits.findIndex((l) => l.hostName === hostName);

    if (limitIndex === -1) {
      // The User defined limit doesn't exist
      const newLimit = { hostName, limit };
      user.limits.push(newLimit);
    } else {
      user.limits[limitIndex].limit = limit;
    }
    await user.save();
    res.status(200).json(user.limits);
  } catch (err) {
    next({ statsu: 500, message: err });
  }
};
