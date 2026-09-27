(function () {
  const user = FirstPassUi.requirePage("employer", "search.html");
  if (!user) return;

  const back = document.getElementById("back-link");
  back.href = "search.html" + (FirstPass.getLastSearch() || "");

  const root = document.getElementById("profile");
  const id = new URLSearchParams(location.search).get("id");
  const candidate = id ? FirstPass.getCandidate(id) : null;

  if (!candidate) {
    const missing = document.createElement("div");
    missing.className = "empty-state";
    missing.innerHTML = "<h2>Profile unavailable</h2><p class='meta'>That candidate is not available to view.</p>";
    root.append(missing);
    return;
  }

  const layout = document.createElement("div");
  layout.className = "profile-view";

  const side = document.createElement("aside");
  side.className = "profile-side";
  const avatar = document.createElement("div");
  avatar.className = "avatar avatar-lg";
  avatar.textContent = FirstPassUi.initials(candidate.full_name);
  const prefs = document.createElement("div");
  prefs.className = "panel prefs-card";
  const prefsTitle = document.createElement("h2");
  prefsTitle.textContent = "Preferences";
  prefs.append(prefsTitle);
  [
    ["Preferred role", candidate.preferred_role],
    ["Arrangement", FirstPassUi.arrangementLabel(candidate.preferred_work_arrangement)],
    ["Salary floor", FirstPassUi.formatMoney(candidate.preferred_salary_min)],
    ["Location", candidate.location],
  ].forEach(function (pair) {
    const row = document.createElement("div");
    row.className = "pref-row";
    const label = document.createElement("span");
    label.textContent = pair[0];
    const value = document.createElement("strong");
    value.textContent = pair[1];
    row.append(label, value);
    prefs.append(row);
  });
  side.append(avatar, prefs);

  const main = document.createElement("div");
  main.className = "profile-main";
  const title = document.createElement("h1");
  title.textContent = candidate.full_name;
  const lede = document.createElement("p");
  lede.className = "lede";
  lede.textContent =
    candidate.headline +
    " · " +
    candidate.experience_years +
    " years · " +
    candidate.education;
  const skills = document.createElement("ul");
  skills.className = "skills";
  FirstPassUi.fillSkills(skills, candidate.skills);

  const summaryLabel = document.createElement("h2");
  summaryLabel.textContent = "Summary";
  const summary = document.createElement("p");
  summary.className = "profile-copy";
  summary.textContent = candidate.summary;

  const portfolio = document.createElement("p");
  portfolio.className = "profile-copy";
  if (candidate.portfolio_url) {
    portfolio.append(document.createTextNode("Portfolio "));
    const link = document.createElement("a");
    link.href = candidate.portfolio_url;
    link.textContent = candidate.portfolio_url;
    link.rel = "noopener";
    link.target = "_blank";
    portfolio.append(link);
  } else {
    portfolio.className = "meta";
    portfolio.textContent = "No portfolio URL on this profile.";
  }

  const actions = document.createElement("div");
  actions.className = "actions";
  const invite = document.createElement("a");
  invite.className = "button button-primary";
  invite.href = "invite.html?candidate=" + candidate.id;
  invite.textContent = "Invite to interview";
  actions.append(invite);

  main.append(title, lede, skills, summaryLabel, summary, portfolio, actions);
  layout.append(side, main);
  root.append(layout);
})();
