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
  FirstPass.setLastSearch(location.search);
  const matches = FirstPass.searchCandidates(filters);
  count.className = "result-count";
  count.textContent =
    matches.length + (matches.length === 1 ? " open prospect" : " open prospects");

  if (!matches.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.innerHTML =
      "<h2>No open prospects</h2><p class='meta'>Candidates you have already invited are listed under Sent invitations. Broaden filters to find someone new.</p>";
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
    view.textContent = "View profile";
    const invite = document.createElement("a");
    invite.className = "button button-primary";
    invite.href = "invite.html?candidate=" + candidate.id;
    invite.textContent = "Invite";
    actions.append(view, invite);

    layout.append(avatar, heading, actions);
    card.append(layout);
    results.append(card);
  });
})();
