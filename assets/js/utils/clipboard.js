import { Tooltip } from "bootstrap";

export function copyToClipboard($input) {
  // Copy to clipboard
  navigator.clipboard.writeText($input.value);

  const tooltip = new Tooltip($input, {
    title: "Copied!",
    trigger: "manual",
  });

  tooltip.show();
  setTimeout(() => {
    tooltip.hide();
  }, 1500);
}
