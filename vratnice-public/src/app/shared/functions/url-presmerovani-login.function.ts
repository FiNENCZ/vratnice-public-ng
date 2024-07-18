export function saveUrlPresmerovaniLoginFunction() {
  if (!window.location.hash || 
    window.location.hash.startsWith("#/neaktivita") || 
    window.location.hash.startsWith("#/nedostupne-api") || 
    window.location.hash.startsWith("#/login-sso-complete")
    ) return;
  sessionStorage.setItem("presmerovani-url", window.location.hash.startsWith("#") ? window.location.hash.substring(1) : window.location.hash);
}
