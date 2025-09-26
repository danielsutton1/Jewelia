export async function copyToClipboard(text: string, toast?: (msg: string) => void) {
  if (typeof navigator !== "undefined" && navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      if (toast) toast("Copied to clipboard!");
      return true;
    } catch (e) {
      if (toast) toast("Failed to copy to clipboard");
      return false;
    }
  } else {
    // fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      const successful = document.execCommand("copy");
      if (toast) toast(successful ? "Copied to clipboard!" : "Failed to copy to clipboard");
      return successful;
    } catch (e) {
      if (toast) toast("Copy to clipboard is not supported in this browser");
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
} 