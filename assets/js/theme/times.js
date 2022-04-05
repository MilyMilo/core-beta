import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(advancedFormat);

export default () => {
  document.querySelectorAll("[data-ctfd-time]").forEach($el => {
      const time = $el.getAttribute("data-ctfd-time");
      const format = $el.getAttribute("data-ctfd-time-format") || "MMMM Do, h:mm:ss A";
      $el.innerText = dayjs(time).format(format);
  })
};
