import CTFd from "@ctfdio/ctfd-js";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { Howl } from "howler";
import $ from "cash-dom";
// import events from "../events";
// import config from "../config";
// import styles from "../styles";
// import times from "../times";
// import { default as helpers } from "../helpers";

import times from "./theme/times";
import styles from "./theme/styles";

dayjs.extend(advancedFormat);

CTFd.init(window.init);
// window.CTFd = CTFd;
// window.helpers = helpers;
// window.$ = $;
// window.dayjs = dayjs;
// window.nunjucks = nunjucks;
// window.Howl = Howl;

$(() => {
  styles();
  times();
});

export default CTFd;