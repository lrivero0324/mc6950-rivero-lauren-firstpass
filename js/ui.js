/* Shared page chrome and formatting. Page scripts call requirePage first. */
(function (root) {
  function formatMoney(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatDate(value) {
    if (!value) return "";
    return new Date(value).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function arrangementLabel(value) {
    if (value === "remote") return "Remote";
    if (value === "hybrid") return "Hybrid";
    if (value === "onsite") return "On-site";
    return value || "";
  }

  function statusLabel(value) {
    if (value === "pending") return "Pending";
    if (value === "saved") return "Saved";
    if (value === "accepted") return "Accepted";
    if (value === "declined") return "Declined";
    if (value === "expired") return "Expired";
    return value || "";
  }

  function statusBadge(value) {
    const status = document.createElement("span");
    status.className = "status status-" + String(value || "");
    status.textContent = statusLabel(value);
    return status;
  }

  function timeRemaining(expiresAt) {
    const ms = new Date(expiresAt).getTime() - Date.now();
    if (ms <= 0) return "Deadline passed";
    const hours = Math.floor(ms / 36e5);
    if (hours < 24) {
      const shown = Math.max(hours, 1);
      return shown + (shown === 1 ? " hour left" : " hours left");
    }
    const days = Math.round(hours / 24);
    return days + (days === 1 ? " day left" : " days left");
  }

  function initials(name) {
    return String(name || "")
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }

  function navLink(href, label, active) {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = label;
    if (active === href) link.setAttribute("aria-current", "page");
    return link;
  }

  function mountChrome(active) {
    const header = document.querySelector("[data-header]");
    if (!header) return;
    document.body.classList.add("app-body");
    const user = FirstPass.currentUser();
    header.replaceChildren();

    const bar = document.createElement("div");
    bar.className = "nav-bar";

    const brand = document.createElement("a");
    brand.className = "brand";
    brand.href = user ? FirstPass.homePath() : "index.html";
    brand.append(document.createTextNode("First"));
    const pass = document.createElement("span");
    pass.textContent = "Pass";
    brand.append(pass);
    bar.append(brand);

    const nav = document.createElement("nav");
    nav.className = "nav-links";
    nav.setAttribute("aria-label", "Primary");
    if (user && user.role === "candidate") {
      nav.append(navLink("profile.html", "Profile", active));
      nav.append(navLink("inbox.html", "Inbox", active));
    }
    if (user && user.role === "employer") {
      nav.append(navLink("search.html", "Find candidates", active));
      nav.append(navLink("roles.html", "Roles", active));
      nav.append(navLink("sent.html", "Sent invitations", active));
    }
    bar.append(nav);

    const who = document.createElement("div");
    who.className = "who";
    if (user) {
      const label = document.createElement("span");
      label.className = "who-label";
      label.textContent =
        user.role === "employer" ? user.name + " · " + user.company : user.name + " · Candidate";
      const button = document.createElement("button");
      button.type = "button";
      button.className = "button button-ghost";
      button.textContent = "Sign out";
      button.addEventListener("click", function () {
        FirstPass.signOut();
        location.href = "index.html";
      });
      who.append(label, button);
    }
    bar.append(who);
    header.append(bar);
  }

  function showNotice(node) {
    if (!node) return;
    const notice = FirstPass.takeNotice();
    if (!notice) {
      node.hidden = true;
      node.textContent = "";
      return;
    }
    node.hidden = false;
    node.textContent = notice.message;
    node.className = notice.tone === "error" ? "notice notice-error" : "notice";
    node.setAttribute("role", notice.tone === "error" ? "alert" : "status");
  }

  function clearErrors(form) {
    form.querySelectorAll("[data-error-for]").forEach(function (node) {
      node.textContent = "";
    });
    Array.from(form.elements).forEach(function (field) {
      if (field.removeAttribute) field.removeAttribute("aria-invalid");
    });
  }

  function showErrors(form, errors) {
    clearErrors(form);
    if (!errors) return;
    Object.keys(errors).forEach(function (key) {
      const node = form.querySelector('[data-error-for="' + key + '"]');
      if (node) node.textContent = errors[key];
      const field = form.elements.namedItem(key);
      if (field && field.setAttribute) field.setAttribute("aria-invalid", "true");
    });
  }

  function requirePage(role, active) {
    const gate = FirstPass.requireRole(role);
    if (!gate.ok) {
      location.replace(gate.redirect);
      return null;
    }
    mountChrome(active);
    showNotice(document.getElementById("notice"));
    return gate.user;
  }

  function fillSkills(container, skills) {
    container.replaceChildren();
    (skills || []).forEach(function (skill) {
      const chip = document.createElement("li");
      chip.textContent = skill;
      container.append(chip);
    });
  }

  root.FirstPassUi = {
    formatMoney,
    formatDate,
    arrangementLabel,
    statusLabel,
    statusBadge,
    timeRemaining,
    initials,
    mountChrome,
    showNotice,
    clearErrors,
    showErrors,
    requirePage,
    fillSkills,
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
