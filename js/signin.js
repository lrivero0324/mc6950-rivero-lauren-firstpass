(function () {
  FirstPassUi.showNotice(document.getElementById("notice"));

  const signInForm = document.getElementById("sign-in-form");
  const registerForm = document.getElementById("register-form");
  const banner = document.getElementById("session-banner");
  const companyField = document.getElementById("company-field");
  const user = FirstPass.currentUser();

  if (user) {
    banner.hidden = false;
    banner.textContent = "";
    banner.append(document.createTextNode("Signed in as " + user.name + ". "));
    const cont = document.createElement("a");
    cont.href = FirstPass.homePath();
    cont.textContent = "Continue to FirstPass";
    banner.append(cont);
  }

  function selectedRole() {
    const checked = registerForm.querySelector('input[name="role"]:checked');
    return checked ? checked.value : "candidate";
  }

  function syncCompanyField() {
    const employer = selectedRole() === "employer";
    companyField.hidden = !employer;
    registerForm.elements.company.required = employer;
  }

  registerForm.querySelectorAll('input[name="role"]').forEach(function (input) {
    input.addEventListener("change", syncCompanyField);
  });
  syncCompanyField();

  function lockAuthVisual() {
    const visual = document.querySelector(".auth-visual");
    const panel = document.querySelector(".auth-panel");
    const art = document.querySelector(".auth-visual-art");
    const demo = document.getElementById("demo-drawer");
    if (!visual || !panel || !art) return;

    // Measure against the resting form (demo closed) so opening the picker does not move the graphic.
    const wasOpen = demo ? demo.open : false;
    if (demo) demo.open = false;

    const panelHeight = panel.getBoundingClientRect().height;
    const artHeight = art.getBoundingClientRect().height;
    const offset = Math.max(0, (panelHeight - artHeight) / 2);

    if (demo) demo.open = wasOpen;

    visual.style.marginTop = offset + "px";
  }

  function showAuthTab(selected) {
    document.body.dataset.authTab = selected;
    document.querySelectorAll("[data-auth-tab]").forEach(function (item) {
      const on = item.getAttribute("data-auth-tab") === selected;
      item.classList.toggle("is-active", on);
      item.setAttribute("aria-selected", on ? "true" : "false");
    });
    document.querySelectorAll("[data-auth-panel]").forEach(function (panel) {
      panel.hidden = panel.getAttribute("data-auth-panel") !== selected;
    });
    window.requestAnimationFrame(lockAuthVisual);
  }

  document.querySelectorAll("[data-auth-tab]").forEach(function (tab) {
    tab.addEventListener("click", function () {
      showAuthTab(tab.getAttribute("data-auth-tab"));
    });
  });

  const initialTab = document.querySelector("[data-auth-tab].is-active");
  showAuthTab(initialTab ? initialTab.getAttribute("data-auth-tab") : "signin");

  const hero = document.querySelector(".auth-mark");
  if (hero) {
    if (hero.complete) lockAuthVisual();
    else hero.addEventListener("load", lockAuthVisual);
  }
  window.addEventListener("resize", lockAuthVisual);

  signInForm.addEventListener("submit", function (event) {
    event.preventDefault();
    FirstPassUi.clearErrors(signInForm);
    const result = FirstPass.signIn(
      signInForm.elements.email.value,
      signInForm.elements.password.value,
    );
    if (!result.ok) {
      FirstPassUi.showErrors(signInForm, { form: result.error });
      return;
    }
    location.href = FirstPass.homePath();
  });

  registerForm.addEventListener("submit", function (event) {
    event.preventDefault();
    FirstPassUi.clearErrors(registerForm);
    const password = registerForm.elements.password.value;
    const confirm = registerForm.elements.confirm_password.value;
    if (password !== confirm) {
      FirstPassUi.showErrors(registerForm, { confirm_password: "Passwords do not match." });
      return;
    }
    const role = selectedRole();
    const result = FirstPass.registerAccount({
      fullName: registerForm.elements.full_name.value,
      email: registerForm.elements.email.value,
      password: password,
      role: role,
      company: registerForm.elements.company.value,
    });
    if (!result.ok) {
      FirstPassUi.showErrors(registerForm, result.errors || { email: result.error });
      return;
    }
    if (role === "employer") {
      FirstPass.setNotice("Employer account created. Start by searching for candidates.");
      location.href = "search.html";
      return;
    }
    FirstPass.setNotice("Account created. Save a complete profile before employers can find you.");
    location.href = "profile.html";
  });

  const host = document.getElementById("demo-accounts");
  // Exactly 4 demo logins: 2 employers + 2 candidates (Miami / Austin).
  const ordered = FirstPass.demoAccounts({ picker: true });
  host.innerHTML = "";

  ordered.forEach(function (account) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "demo-card";
    const name = document.createElement("strong");
    name.textContent = account.name;
    const role = document.createElement("span");
    role.textContent = account.role === "employer" ? "Employer" : "Candidate";
    const detail = document.createElement("span");
    detail.className = "meta";
    detail.textContent = account.detail;
    button.append(name, role, detail);
    button.addEventListener("click", function () {
      showAuthTab("signin");
      signInForm.elements.email.value = account.email;
      signInForm.elements.password.value = account.password;
      signInForm.elements.email.focus();
    });
    host.append(button);
  });

  document.getElementById("reset-demo").addEventListener("click", function () {
    const confirmed = window.confirm(
      "Reset demo data? Profile edits and invitations created in this browser will be replaced with the seeded records.",
    );
    if (!confirmed) return;
    FirstPass.resetDemoData();
    FirstPass.setNotice("Demo data has been restored. Sign in again to continue.");
    location.reload();
  });
})();
