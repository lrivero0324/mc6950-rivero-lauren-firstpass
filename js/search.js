(function () {
  const user = FirstPassUi.requirePage("employer", "search.html");
  if (!user) return;

  const form = document.getElementById("search-form");
  const results = document.getElementById("results");
  const count = document.getElementById("result-count");
  const params = new URLSearchParams(location.search);
  ["skill", "location", "role", "work_arrangement", "salary_max"].forEach(function (name) {
    if (params.has(name)) form.elements.namedItem(name).value = params.get(name);
  });

  const filters = {
    skill: form.elements.skill.value,
    location: form.elements.location.value,
    role: form.elements.role.value,
    work_arrangement: form.elements.work_arrangement.value,
    salary_max: form.elements.salary_max.value,
  };
  const filtersActive = Boolean(
    filters.skill ||
      filters.location ||
      filters.role ||
      filters.work_arrangement ||
      filters.salary_max,
  );

  FirstPass.setLastSearch(location.search);
  const matches = FirstPass.searchCandidates(filters);

  const toolbar = document.createElement("div");
  toolbar.className = "results-toolbar";
  const countLabel = document.createElement("p");
  countLabel.className = "result-count";
  countLabel.textContent =
    matches.length + (matches.length === 1 ? " open prospect" : " open prospects");
  toolbar.append(countLabel);
  if (filtersActive) {
    const clear = document.createElement("a");
    clear.className = "filters-clear";
    clear.href = "search.html";
    clear.textContent = "Clear filters";
    toolbar.append(clear);
  }
  count.replaceWith(toolbar);

  if (!matches.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    const heading = document.createElement("h2");
    heading.textContent = filtersActive ? "No matches for these filters" : "No open prospects";
    const body = document.createElement("p");
    body.className = "meta";
    body.textContent = filtersActive
      ? "Nothing matches the current filters. Clear them to see all searchable candidates again."
      : "When candidates complete searchable profiles, they appear here.";
    const actions = document.createElement("div");
    actions.className = "actions";
    if (filtersActive) {
      const clearBtn = document.createElement("a");
      clearBtn.className = "button button-primary";
      clearBtn.href = "search.html";
      clearBtn.textContent = "Clear filters";
      actions.append(clearBtn);
      const sent = document.createElement("a");
      sent.className = "button";
      sent.href = "sent.html";
      sent.textContent = "View Sent invitations";
      actions.append(sent);
    } else {
      const sent = document.createElement("a");
      sent.className = "button button-primary";
      sent.href = "sent.html";
      sent.textContent = "View Sent invitations";
      actions.append(sent);
    }
    empty.append(heading, body, actions);
    results.append(empty);
    return;
  }

  matches.forEach(function (candidate) {
    const card = document.createElement("article");
    card.className = "card listing-card";

    const layout = document.createElement("div");
    layout.className = "card-layout";

    const avatar = document.createElement("div");
    avatar.className = "avatar";
    avatar.textContent = FirstPassUi.initials(candidate.full_name);

    const heading = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = candidate.full_name;
    const headline = document.createElement("p");
    headline.className = "listing-headline";
    headline.textContent = candidate.headline;

    const arrangement = FirstPassUi.arrangementLabel(candidate.preferred_work_arrangement);
    const metaBits = [];
    if (String(candidate.location).toLowerCase() !== arrangement.toLowerCase()) {
      metaBits.push(candidate.location);
    }
    metaBits.push(
      arrangement,
      candidate.experience_years + " yrs",
      FirstPassUi.formatMoney(candidate.preferred_salary_min) + "+",
    );

    const metaRow = document.createElement("div");
    metaRow.className = "meta-row";
    metaBits.forEach(function (text) {
      const chip = document.createElement("span");
      chip.textContent = text;
      metaRow.append(chip);
    });

    const skills = document.createElement("ul");
    skills.className = "skills";
    FirstPassUi.fillSkills(skills, candidate.skills.slice(0, 5));

    heading.append(title, headline, metaRow, skills);

    const actions = document.createElement("div");
    actions.className = "actions";
    const view = document.createElement("a");
    view.className = "button";
    view.href = "candidate.html?id=" + candidate.id;
    view.textContent = "View Profile";

    const openInvite = FirstPass.getOpenInvitationForCandidate(candidate.id);
    if (openInvite) {
      const openLink = document.createElement("a");
      openLink.className = "button button-soft";
      openLink.href = "sent.html?id=" + openInvite.id;
      openLink.textContent = "View Invitation";
      actions.append(view, openLink);
    } else {
      const invite = document.createElement("a");
      invite.className = "button button-primary";
      invite.href = "invite.html?candidate=" + candidate.id;
      invite.textContent = "Invite to Interview";
      actions.append(view, invite);
    }

    layout.append(avatar, heading, actions);
    card.append(layout);
    results.append(card);
  });
})();
