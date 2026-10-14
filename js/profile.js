(function () {
  const user = FirstPassUi.requirePage("candidate", "profile.html");
  if (!user) return;

  const form = document.getElementById("profile-form");
  const state = document.getElementById("profile-state");
  const profile = FirstPass.getMyProfile();

  const REQUIRED = [
    { key: "full_name", label: "Full name" },
    { key: "headline", label: "Headline" },
    { key: "location", label: "Location" },
    { key: "skills", label: "Skills" },
    { key: "experience_years", label: "Experience (years)" },
    { key: "education", label: "Education" },
    { key: "preferred_role", label: "Preferred role" },
    { key: "preferred_salary_min", label: "Salary floor" },
    { key: "preferred_work_arrangement", label: "Work arrangement" },
    { key: "summary", label: "Summary" },
  ];

  function missingRequired(data) {
    const gaps = [];
    REQUIRED.forEach(function (field) {
      const raw = data[field.key];
      if (field.key === "skills") {
        const list = Array.isArray(raw)
          ? raw
          : String(raw || "")
              .split(",")
              .map(function (part) {
                return part.trim();
              })
              .filter(Boolean);
        if (!list.length) gaps.push(field.label);
        return;
      }
      if (field.key === "summary") {
        if (String(raw || "").trim().length < 20) gaps.push(field.label);
        return;
      }
      if (field.key === "experience_years") {
        if (raw === "" || raw == null || Number.isNaN(Number(raw))) gaps.push(field.label);
        return;
      }
      if (field.key === "preferred_salary_min") {
        if (!raw || Number(raw) <= 0) gaps.push(field.label);
        return;
      }
      if (field.key === "preferred_work_arrangement") {
        if (!raw) gaps.push(field.label);
        return;
      }
      if (!String(raw || "").trim()) gaps.push(field.label);
    });
    return gaps;
  }

  function showState(data, complete) {
    state.replaceChildren();
    const status = document.createElement("p");
    status.className = complete ? "notice" : "notice notice-error";
    status.setAttribute("role", "status");
    if (complete) {
      status.textContent =
        "Searchable — employers can find this profile in Find candidates.";
      state.append(status);
      return;
    }
    const gaps = missingRequired(data);
    status.textContent =
      "Not searchable yet — complete and save the required fields before employers can find you.";
    state.append(status);
    if (gaps.length) {
      const listIntro = document.createElement("p");
      listIntro.className = "meta";
      listIntro.textContent =
        "Still needed (" + gaps.length + " of " + REQUIRED.length + " required): " + gaps.join(", ") + ".";
      state.append(listIntro);
    }
    const actions = document.createElement("div");
    actions.className = "actions";
    const focus = document.createElement("a");
    focus.className = "button";
    focus.href = "#profile-form";
    focus.textContent = "Continue editing profile";
    actions.append(focus);
    state.append(actions);
  }

  function formSnapshot() {
    return {
      full_name: form.elements.full_name.value,
      headline: form.elements.headline.value,
      location: form.elements.location.value,
      preferred_role: form.elements.preferred_role.value,
      preferred_salary_min: form.elements.preferred_salary_min.value,
      preferred_work_arrangement: form.elements.preferred_work_arrangement.value,
      skills: form.elements.skills.value,
      experience_years: form.elements.experience_years.value,
      education: form.elements.education.value,
      portfolio_url: form.elements.portfolio_url.value,
      summary: form.elements.summary.value,
    };
  }

  if (profile) {
    form.elements.full_name.value = profile.full_name || "";
    form.elements.headline.value = profile.headline || "";
    form.elements.location.value = profile.location || "";
    form.elements.preferred_role.value = profile.preferred_role || "";
    form.elements.preferred_salary_min.value = profile.preferred_salary_min || "";
    form.elements.preferred_work_arrangement.value = profile.preferred_work_arrangement || "";
    form.elements.skills.value = (profile.skills || []).join(", ");
    form.elements.experience_years.value =
      profile.experience_years === "" || profile.experience_years == null
        ? ""
        : profile.experience_years;
    form.elements.education.value = profile.education || "";
    form.elements.portfolio_url.value = profile.portfolio_url || "";
    form.elements.summary.value = profile.summary || "";
    showState(profile, profile.profile_complete);
  } else {
    showState(formSnapshot(), false);
  }

  form.addEventListener("input", function () {
    if (profile && profile.profile_complete) return;
    showState(formSnapshot(), false);
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const result = FirstPass.saveProfile({
      full_name: form.elements.full_name.value,
      headline: form.elements.headline.value,
      location: form.elements.location.value,
      preferred_role: form.elements.preferred_role.value,
      preferred_salary_min: form.elements.preferred_salary_min.value,
      preferred_work_arrangement: form.elements.preferred_work_arrangement.value,
      skills: form.elements.skills.value,
      experience_years: form.elements.experience_years.value,
      education: form.elements.education.value,
      portfolio_url: form.elements.portfolio_url.value,
      summary: form.elements.summary.value,
    });
    if (!result.ok) {
      FirstPassUi.showErrors(form, result.errors || {});
      FirstPass.setNotice(result.error, "error");
      FirstPassUi.showNotice(document.getElementById("notice"));
      showState(formSnapshot(), false);
      return;
    }
    FirstPassUi.clearErrors(form);
    form.elements.skills.value = result.profile.skills.join(", ");
    showState(result.profile, true);
    FirstPass.setNotice("Profile saved. Employers can now find this profile in search.");
    FirstPassUi.showNotice(document.getElementById("notice"));
    FirstPassUi.mountChrome("profile.html");
  });
})();
