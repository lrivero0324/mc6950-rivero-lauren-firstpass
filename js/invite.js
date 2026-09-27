(function () {
  const user = FirstPassUi.requirePage("employer", "search.html");
  if (!user) return;

  const params = new URLSearchParams(location.search);
  const candidateId = params.get("candidate");
  const candidate = candidateId ? FirstPass.getCandidate(candidateId) : null;
  const form = document.getElementById("invite-form");
  const title = document.getElementById("invite-title");
  const cancel = document.getElementById("cancel-link");
  const send = document.getElementById("send-button");
  const recap = document.getElementById("candidate-recap");
  const roleSelect = document.getElementById("job-posting");
  const roles = FirstPass.listJobPostings();

  function renderRecap(person) {
    recap.hidden = false;
    recap.replaceChildren();

    const eyebrow = document.createElement("p");
    eyebrow.className = "page-kicker";
    eyebrow.textContent = "Candidate recap";

    const avatar = document.createElement("div");
    avatar.className = "avatar avatar-lg";
    avatar.textContent = FirstPassUi.initials(person.full_name);

    const name = document.createElement("h2");
    name.textContent = person.full_name;

    const headline = document.createElement("p");
    headline.className = "listing-headline";
    headline.textContent = person.headline;

    const metaRow = document.createElement("div");
    metaRow.className = "meta-row";
    [
      person.location,
      FirstPassUi.arrangementLabel(person.preferred_work_arrangement),
      person.experience_years + " yrs",
      FirstPassUi.formatMoney(person.preferred_salary_min) + "+",
    ].forEach(function (text) {
      const chip = document.createElement("span");
      chip.textContent = text;
      metaRow.append(chip);
    });

    const skills = document.createElement("ul");
    skills.className = "skills";
    FirstPassUi.fillSkills(skills, person.skills.slice(0, 6));

    const summaryLabel = document.createElement("h3");
    summaryLabel.className = "recap-label";
    summaryLabel.textContent = "Summary";
    const summary = document.createElement("p");
    summary.className = "profile-copy";
    summary.textContent = person.summary;

    const prefsLabel = document.createElement("h3");
    prefsLabel.className = "recap-label";
    prefsLabel.textContent = "Looking for";
    const prefs = document.createElement("p");
    prefs.className = "meta";
    prefs.textContent =
      person.preferred_role +
      " · " +
      FirstPassUi.arrangementLabel(person.preferred_work_arrangement) +
      " · from " +
      FirstPassUi.formatMoney(person.preferred_salary_min);

    const profileLink = document.createElement("a");
    profileLink.className = "button";
    profileLink.href = "candidate.html?id=" + person.id;
    profileLink.textContent = "View full profile";

    recap.append(
      eyebrow,
      avatar,
      name,
      headline,
      metaRow,
      skills,
      summaryLabel,
      summary,
      prefsLabel,
      prefs,
      profileLink,
    );
  }

  function fillRoles() {
    roles.forEach(function (role) {
      const option = document.createElement("option");
      option.value = String(role.id);
      option.textContent =
        role.title +
        " · " +
        FirstPassUi.formatMoney(role.salary_min) +
        "–" +
        FirstPassUi.formatMoney(role.salary_max);
      roleSelect.append(option);
    });
  }

  function applyRole(role) {
    form.elements.role_title.value = role.title;
    form.elements.role_summary.value = role.summary;
    form.elements.work_arrangement.value = role.work_arrangement;
    form.elements.expires_in_days.value = role.default_expires_in_days;

    let min = role.salary_min;
    let max = role.salary_max;
    if (candidate && min < candidate.preferred_salary_min) {
      min = candidate.preferred_salary_min;
      if (max < min) max = min + 15000;
    }
    form.elements.salary_min.value = min;
    form.elements.salary_max.value = max;
  }

  function matchRoleForCandidate() {
    if (!candidate || !roles.length) return null;
    const preferred = String(candidate.preferred_role || "").toLowerCase();
    const arrangement = candidate.preferred_work_arrangement;
    const exact = roles.find(function (role) {
      return (
        String(role.title).toLowerCase() === preferred &&
        role.work_arrangement === arrangement
      );
    });
    if (exact) return exact;
    return (
      roles.find(function (role) {
        return String(role.title).toLowerCase().includes(preferred) ||
          preferred.includes(String(role.title).toLowerCase());
      }) || null
    );
  }

  fillRoles();

  if (!candidate) {
    title.textContent = "Send interview invitation";
    form.hidden = true;
    FirstPass.setNotice("Choose a candidate from search before sending an invitation.", "error");
    FirstPassUi.showNotice(document.getElementById("notice"));
    return;
  }

  title.textContent = "Invite " + candidate.full_name;
  cancel.href = "candidate.html?id=" + candidate.id;
  renderRecap(candidate);

  if (!roles.length) {
    FirstPass.setNotice(
      "Save a role first under Roles. Invitations pull title, summary, salary, and arrangement from that opening.",
      "error",
    );
    FirstPassUi.showNotice(document.getElementById("notice"));
  } else {
    const matched = matchRoleForCandidate();
    if (matched) {
      roleSelect.value = String(matched.id);
      applyRole(matched);
    }
  }

  roleSelect.addEventListener("change", function () {
    const role = FirstPass.getJobPosting(roleSelect.value);
    if (!role) return;
    applyRole(role);
    form.elements.reason_for_interest.focus();
  });

  const open = FirstPass.listSent().find(function (item) {
    return (
      item.candidate_id === candidate.id &&
      (item.status === "pending" || item.status === "saved")
    );
  });
  if (open) {
    send.disabled = true;
    FirstPass.setNotice(
      "You already have an open invitation for " +
        candidate.full_name +
        ". Track it under Sent invitations.",
      "error",
    );
    FirstPassUi.showNotice(document.getElementById("notice"));
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!roleSelect.value) {
      FirstPass.setNotice("Choose a saved role before sending the invitation.", "error");
      FirstPassUi.showNotice(document.getElementById("notice"));
      roleSelect.focus();
      return;
    }
    const result = FirstPass.createInvitation({
      candidate_id: candidate.id,
      job_posting_id: roleSelect.value,
      role_title: form.elements.role_title.value,
      role_summary: form.elements.role_summary.value,
      salary_min: form.elements.salary_min.value,
      salary_max: form.elements.salary_max.value,
      work_arrangement: form.elements.work_arrangement.value,
      reason_for_interest: form.elements.reason_for_interest.value,
      expires_in_days: form.elements.expires_in_days.value,
    });
    if (!result.ok) {
      FirstPassUi.showErrors(form, result.errors || {});
      FirstPass.setNotice(result.error, "error");
      FirstPassUi.showNotice(document.getElementById("notice"));
      return;
    }
    FirstPass.setNotice("Interview invitation sent to " + candidate.full_name + ".");
    location.href = "sent.html";
  });
})();
