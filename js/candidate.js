(function () {
  const user = FirstPassUi.requirePage("employer", "search.html");
  if (!user) return;

  const back = document.getElementById("back-link");
  const lastSearch = FirstPass.getLastSearch() || "";
  back.href = "search.html" + lastSearch;
  back.textContent = lastSearch
    ? "Back to results (keep filters)"
    : "Back to results";

  const root = document.getElementById("profile");
  const id = new URLSearchParams(location.search).get("id");
  const candidate = id ? FirstPass.getCandidate(id) : null;

  if (!candidate) {
    const missing = document.createElement("div");
    missing.className = "empty-state";
    const heading = document.createElement("h2");
    heading.textContent = "Profile unavailable";
    const body = document.createElement("p");
    body.className = "meta";
    body.textContent = "That candidate is not available to view.";
    const actions = document.createElement("div");
    actions.className = "actions";
    const link = document.createElement("a");
    link.className = "button";
    link.href = "search.html" + lastSearch;
    link.textContent = "Back to results";
    actions.append(link);
    missing.append(heading, body, actions);
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

  const openBadge = document.createElement("p");
  openBadge.className = "notice";
  openBadge.setAttribute("role", "status");
  openBadge.textContent = candidate.profile_complete
    ? "Open to Opportunities — this candidate appears in search and can receive interview invitations."
    : "Not open to opportunities yet — this profile is incomplete and is hidden from search.";

  const lede = document.createElement("p");
  lede.className = "lede";
  lede.textContent = candidate.headline;

  const skillsLabel = document.createElement("h2");
  skillsLabel.textContent = "Skills";
  const skills = document.createElement("ul");
  skills.className = "skills";
  FirstPassUi.fillSkills(skills, candidate.skills);

  const summaryLabel = document.createElement("h2");
  summaryLabel.textContent = "Professional summary";
  const summary = document.createElement("p");
  summary.className = "profile-copy";
  summary.textContent = candidate.summary;

  const experienceLabel = document.createElement("h2");
  experienceLabel.textContent = "Experience";
  const experience = document.createElement("p");
  experience.className = "profile-copy";
  experience.textContent =
    candidate.experience_years +
    (Number(candidate.experience_years) === 1 ? " year of experience" : " years of experience");

  const educationLabel = document.createElement("h2");
  educationLabel.textContent = "Education";
  const education = document.createElement("p");
  education.className = "profile-copy";
  education.textContent = candidate.education;

  const portfolioLabel = document.createElement("h2");
  portfolioLabel.textContent = "Portfolio";
  const portfolio = document.createElement("p");
  portfolio.className = "profile-copy";
  if (candidate.portfolio_url) {
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
  const openInvite = FirstPass.getOpenInvitationForCandidate(candidate.id);
  if (openInvite) {
    const openLink = document.createElement("a");
    openLink.className = "button button-soft";
    openLink.href = "sent.html?id=" + openInvite.id;
    openLink.textContent = "View Invitation";
    actions.append(openLink);
  } else {
    const invite = document.createElement("a");
    invite.className = "button button-primary";
    invite.href = "invite.html?candidate=" + candidate.id;
    invite.textContent = "Invite to Interview";
    actions.append(invite);
  }

  main.append(
    title,
    openBadge,
    lede,
    skillsLabel,
    skills,
    summaryLabel,
    summary,
    experienceLabel,
    experience,
    educationLabel,
    education,
    portfolioLabel,
    portfolio,
    actions,
  );
  layout.append(side, main);
  root.append(layout);
})();
