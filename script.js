(function () {
  "use strict";

  var CONFIG = {
    metaPixelId: "1715327215350220",
    appsScriptUrl: "",
    thankYouUrl: "grazie.html",
    whatsappNumber: "393490646346",
    whatsappMessage: "Ciao AGICOOM, vorrei richiedere l'analisi gratuita della mia presenza online."
  };

  var CONSENT_KEY = "agicoomConsentMarketing";
  var PIXEL_LOADED_KEY = "agicoomPixelLoaded";

  function getConsent() {
    try {
      return window.localStorage.getItem(CONSENT_KEY);
    } catch (error) {
      return "";
    }
  }

  function setConsent(value) {
    try {
      window.localStorage.setItem(CONSENT_KEY, value);
    } catch (error) {
      window[CONSENT_KEY] = value;
    }
  }

  function showBanner() {
    var banner = document.querySelector("[data-cookie-banner]");
    if (banner) {
      banner.hidden = false;
    }
  }

  function hideBanner() {
    var banner = document.querySelector("[data-cookie-banner]");
    if (banner) {
      banner.hidden = true;
    }
  }

  function ensureMetaPixel() {
    if (getConsent() !== "accepted" || window[PIXEL_LOADED_KEY]) {
      return;
    }

    window[PIXEL_LOADED_KEY] = true;
    window.fbq = window.fbq || function () {
      window.fbq.callMethod ? window.fbq.callMethod.apply(window.fbq, arguments) : window.fbq.queue.push(arguments);
    };
    if (!window._fbq) {
      window._fbq = window.fbq;
    }
    window.fbq.push = window.fbq;
    window.fbq.loaded = true;
    window.fbq.version = "2.0";
    window.fbq.queue = [];

    var script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);

    window.fbq("init", CONFIG.metaPixelId);
    window.fbq("track", "PageView");
  }

  function maybeTrackLead() {
    if (document.body.dataset.page !== "thanks" || getConsent() !== "accepted") {
      return;
    }
    ensureMetaPixel();
    var trackKey = "agicoomLeadTracked:" + location.pathname + location.search;
    if (sessionStorage.getItem(trackKey)) {
      return;
    }
    sessionStorage.setItem(trackKey, "1");
    if (typeof window.fbq === "function") {
      window.fbq("track", "Lead");
    }
  }

  function setupConsent() {
    var acceptButtons = document.querySelectorAll("[data-consent-accept]");
    var rejectButtons = document.querySelectorAll("[data-consent-reject]");
    var openButtons = document.querySelectorAll("[data-open-consent]");

    acceptButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        setConsent("accepted");
        hideBanner();
        ensureMetaPixel();
        maybeTrackLead();
      });
    });

    rejectButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        setConsent("rejected");
        hideBanner();
      });
    });

    openButtons.forEach(function (button) {
      button.addEventListener("click", showBanner);
    });

    if (!getConsent()) {
      showBanner();
    } else if (getConsent() === "accepted") {
      ensureMetaPixel();
      maybeTrackLead();
    }
  }

  function setCampaignFields(form) {
    var params = new URLSearchParams(window.location.search);
    var zona = form.querySelector("[name='zona']");
    var post = form.querySelector("[name='post']");
    if (zona) {
      zona.value = params.get("zona") || "";
    }
    if (post) {
      post.value = params.get("post") || "";
    }
  }

  function setupWhatsAppLinks() {
    var params = new URLSearchParams(window.location.search);
    var message = CONFIG.whatsappMessage;
    if (params.get("zona") || params.get("post")) {
      message += "\n\nOrigine campagna:";
      if (params.get("zona")) {
        message += " zona " + params.get("zona");
      }
      if (params.get("post")) {
        message += " post " + params.get("post");
      }
    }
    var href = "https://wa.me/" + CONFIG.whatsappNumber + "?text=" + encodeURIComponent(message);
    document.querySelectorAll("[data-whatsapp-link]").forEach(function (link) {
      link.href = href;
    });
  }

  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function isPhone(value) {
    var compact = value.replace(/[\s().-]/g, "");
    return /^\+?\d{6,16}$/.test(compact);
  }

  function buildPayload(form) {
    return {
      nome: form.nome.value.trim(),
      telefono: form.telefono.value.trim(),
      email: form.email.value.trim(),
      attivita: form.attivita.value.trim(),
      comune: form.comune.value.trim(),
      zona: form.zona.value.trim(),
      post: form.post.value.trim()
    };
  }

  function setStatus(form, message) {
    var status = form.querySelector("[data-form-status]");
    if (status) {
      status.textContent = message || "";
    }
  }

  function validateForm(form) {
    var payload = buildPayload(form);
    if (!payload.nome || !payload.telefono || !payload.attivita || !payload.comune) {
      return "Compila tutti i campi obbligatori.";
    }
    if (!isPhone(payload.telefono)) {
      return "Inserisci un numero di telefono valido.";
    }
    if (payload.email && !isEmail(payload.email)) {
      return "Inserisci una email valida oppure lascia il campo vuoto.";
    }
    if (!form.privacy.checked) {
      return "Devi accettare l'informativa privacy per inviare la richiesta.";
    }
    return "";
  }

  function setupForm() {
    var form = document.querySelector("[data-lead-form]");
    if (!form) {
      return;
    }

    setCampaignFields(form);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      setStatus(form, "");

      var error = validateForm(form);
      if (error) {
        setStatus(form, error);
        return;
      }

      if (!CONFIG.appsScriptUrl) {
        setStatus(form, "Invio non ancora configurato: manca l'URL Web App di Google Apps Script.");
        return;
      }

      var button = form.querySelector("button[type='submit']");
      if (button) {
        button.disabled = true;
        button.textContent = "Invio in corso...";
      }

      var payload = buildPayload(form);
      fetch(CONFIG.appsScriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      }).finally(function () {
        var redirectParams = new URLSearchParams();
        if (payload.zona) {
          redirectParams.set("zona", payload.zona);
        }
        if (payload.post) {
          redirectParams.set("post", payload.post);
        }
        var suffix = redirectParams.toString() ? "?" + redirectParams.toString() : "";
        window.location.href = CONFIG.thankYouUrl + suffix;
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupConsent();
    setupWhatsAppLinks();
    setupForm();
  });
})();
