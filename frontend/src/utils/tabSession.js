export function initTabSession() {
    if (typeof window !== "undefined") {
      let id = sessionStorage.getItem("tabSessionId");
      if (!id) {
        id = crypto.randomUUID();
        sessionStorage.setItem("tabSessionId", id);
      }
      return id;
    }
    return null;
  }
  
  export function clearTabSession() {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("tabSessionId");
    }
  }
  