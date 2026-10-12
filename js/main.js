(() => {
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector("#nav-links");
  const contactForm = document.querySelector("#contact-form");
  const formStatus = document.querySelector("#form-status");
  const emailFallback = document.querySelector("#email-fallback");
  const currentYear = document.querySelector("#current-year");
  const emailAddress = "juancgallo.biomedico@gmail.com";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (currentYear) currentYear.textContent = String(new Date().getFullYear());

  if (navToggle && navLinks) {
    const setMenuOpen = (isOpen) => {
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
      navLinks.classList.toggle("is-open", isOpen);
    };

    navToggle.addEventListener("click", () => {
      setMenuOpen(navToggle.getAttribute("aria-expanded") !== "true");
    });

    navLinks.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("a")) setMenuOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") {
        setMenuOpen(false);
        navToggle.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (event.target instanceof Node
        && !navLinks.contains(event.target)
        && !navToggle.contains(event.target)) setMenuOpen(false);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) setMenuOpen(false);
    });
  }

  document.querySelectorAll("[data-service]").forEach((link) => {
    link.addEventListener("click", () => {
      const serviceSelect = document.querySelector("#service");
      const requestedService = link.getAttribute("data-service");
      if (serviceSelect && requestedService) serviceSelect.value = requestedService;
    });
  });

  if (contactForm instanceof HTMLFormElement && formStatus && emailFallback instanceof HTMLAnchorElement) {
    const fields = Array.from(contactForm.querySelectorAll("input, select, textarea"));

    fields.forEach((field) => {
      const clearFieldError = () => {
        field.removeAttribute("aria-invalid");
        if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
          field.setCustomValidity("");
        }
        formStatus.textContent = "";
      };
      field.addEventListener("input", clearFieldError);
      field.addEventListener("change", clearFieldError);
    });

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      formStatus.textContent = "";
      emailFallback.classList.remove("is-visible");

      fields.forEach((field) => {
        if ((field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) && field.required) {
          field.setCustomValidity(field.value.trim() ? "" : "Completa este campo.");
        }
      });
      const invalidFields = fields.filter((field) => !field.checkValidity());
      fields.forEach((field) => field.removeAttribute("aria-invalid"));

      if (invalidFields.length > 0) {
        invalidFields.forEach((field) => field.setAttribute("aria-invalid", "true"));
        formStatus.textContent = "Revisa los campos resaltados para continuar.";
        invalidFields[0].focus();
        contactForm.reportValidity();
        return;
      }

      const formData = new FormData(contactForm);
      const subject = `Consulta de servicios - ${String(formData.get("service"))}`;
      const body = [
        `Nombre: ${String(formData.get("name")).trim()}`,
        `Institución o empresa: ${String(formData.get("organization")).trim() || "No especificada"}`,
        `Correo de contacto: ${String(formData.get("email")).trim()}`,
        `Servicio de interés: ${String(formData.get("service"))}`,
        "",
        "Descripción de la necesidad:",
        String(formData.get("message")).trim()
      ].join("\n");
      const mailto = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

      emailFallback.href = mailto;
      emailFallback.classList.add("is-visible");
      formStatus.textContent = "Tu aplicación de correo intentará abrir un borrador con estos datos. Revísalo y envíalo desde tu correo; este sitio no transmite la solicitud.";
      window.location.href = mailto;
    });
  }

  if (!reducedMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -24px 0px" });

    document.documentElement.classList.add("reveal-ready");
    document.querySelectorAll("[data-reveal]").forEach((element) => revealObserver.observe(element));
  }
})();
