export function copyToClipboard(inputElement) {
    inputElement.select()
  
    // Copy to clipboard
    document.execCommand("copy");
  
    // Show tooltip to user
    // $(event.target).tooltip({
    //   title: "Copied!",
    //   trigger: "manual"
    // });
    // $(event.target).tooltip("show");
  
    // setTimeout(function() {
    //   $(event.target).tooltip("hide");
    // }, 1500);
  }