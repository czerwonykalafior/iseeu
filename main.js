const events = ["click", "keydown"];
const maxIdleTime = 5000; //ms
const minTimeOnURL = 500; //ms
window.localStorage.setItem("username", "Stiven Sigl");

const startActivity = (StartEventType) => {
  now = currentTime();
  const activity = {
    start: now,
    stop: now,
    userName: window.localStorage.getItem("username"),
    location: { url: window.location.href, view: "here" }, // TODO: taking this from react variables changes everything? Parse URL
    StartEventType, // DEBUG
    StopEventType: null, // DEBUG
  };

  window.localStorage.setItem("currentActivity", JSON.stringify(activity));
};

const stopActivity = (StopEventType) => {
  const currentActivity = JSON.parse(
    window.localStorage.getItem("currentActivity")
  );
  currentActivity["StopEventType"] = StopEventType;

  const previousActivities =
    JSON.parse(window.localStorage.getItem("previousActivities")) || [];

  window.localStorage.setItem(
    "previousActivities",
    JSON.stringify([...previousActivities, currentActivity])
  );
  window.localStorage.removeItem("currentActivity");
};

const continueActivity = (timeOfAction) => {
  const currentActivity = JSON.parse(
    window.localStorage.getItem("currentActivity")
  );
  currentActivity["stop"] = timeOfAction;

  window.localStorage.setItem(
    "currentActivity",
    JSON.stringify(currentActivity)
  );
};

const onUrlChange = () => {
  const currentActivity = JSON.parse(
    window.localStorage.getItem("currentActivity")
  );

  const now = currentTime();
  currentActivity["stop"] = now;
  const timeSpentOnURL = now.timeStamp - currentActivity.start.timeStamp;

  // 1) change URL after being inactive - click will stop/start Activity than onUrlChange will imidietly stop Activity just started in 'click'.
  // 2) change URLs fast (<500ms) - prevent producing Activities that last 0 time. Do not stop current Activity (and current URL) if time spend is too small.
  if (timeSpentOnURL > minTimeOnURL) {
    stopActivity("hashChange");
    startActivity("hashChange");
  }
};

const onEvent = (event) => {
  const currentActivity = JSON.parse(
    window.localStorage.getItem("currentActivity")
  );

  if (currentActivity == null) {
    startActivity(event.type);
    return;
  }

  const eventTime = currentTime();
  const timeSinceLastAction =
    eventTime["timeStamp"] - currentActivity["stop"]["timeStamp"];

  if (timeSinceLastAction > maxIdleTime) {
    stopActivity(event.type);
    startActivity(event.type);
    return;
  } else {
    continueActivity(eventTime);
    return;
  }
};

const currentTime = () => {
  return {
    timeStamp: new Date().getTime(),
    humanReadable: new Date().toLocaleString(), // DEBUG
  };
};

events.forEach((event) => document.addEventListener(event, (e) => onEvent(e)));
window.addEventListener("hashchange", onUrlChange, false); // URL change recogintion & is this even needed? user changes URLs by click, need more examples
