import CTFd from "@ctfdio/ctfd-js";

import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";

import times from "./theme/times";
import styles from "./theme/styles";

import alerts from "./utils/alerts";
import tooltips from "./utils/tooltips";
import collapse from "./utils/collapse";
import highlight from "./utils/highlight";

dayjs.extend(advancedFormat);

CTFd.init(window.init);

// TODO: Toast alerts
CTFd._functions.events.eventAlert = (data) => {
  console.log(data);
  alert(JSON.stringify(data));
};

(() => {
  styles();
  times();
  highlight();

  alerts();
  tooltips();
  collapse();
})();

export default CTFd;
