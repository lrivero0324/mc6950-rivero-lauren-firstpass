(function () {
  const user = FirstPassUi.requirePage("candidate", "inbox.html");
  if (!user) return;

  const allowed = ["all", "active", "saved", "past"];
  let view = new URLSearchParams(location.search).get("view") || "all";
  if (!allowed.includes(view)) view = "all";

  document.querySelectorAll(".tabs a").forEach(function (link) {
    if (link.getAttribute("data-view") === view) {
      link.setAttribute("aria-current", "page");
    }
  });

  const invitations = FirstPass.listInbox(view);
  const count = document.getElementById("inbox-count");
  const list = document.getElementById("inbox-list");
  count.className = "result-count";
  count.textContent =
    invitations.length + (invitations.length === 1 ? " invitation" : " invitations");

  if (!invitations.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    const messages = {
      all: "When an employer reaches out, the invitation will appear here.",
      active: "No active invitations right now.",
      saved: "Nothing saved for later.",
      past: "No past invitations yet.",
    };
    empty.innerHTML = "<h2>Inbox is clear</h2><p class='meta'>" + messages[view] + "</p>";
    list.append(empty);
    return;
  }

  invitations.forEach(function (invitation) {
    const card = document.createElement("article");
    card.className = "card listing-card";
    const top = document.createElement("div");
    top.className = "row-between";
    const heading = document.createElement("div");
    const title = document.createElement("h2");
    title.textContent = invitation.role_title;
    const company = document.createElement("p");
    company.className = "listing-headline";
    company.textContent = invitation.employer.name + " · " + invitation.employer.company;
    heading.append(title, company);
    top.append(heading, FirstPassUi.statusBadge(invitation.status));

    const timing =
      invitation.status === "pending" || invitation.status === "saved"
        ? "Respond by " + FirstPassUi.formatDate(invitation.expires_at)
        : "Deadline " + FirstPassUi.formatDate(invitation.expires_at);

    const metaRow = document.createElement("div");
    metaRow.className = "meta-row";
    [
      FirstPassUi.formatMoney(invitation.salary_min) +
        " – " +
        FirstPassUi.formatMoney(invitation.salary_max),
      FirstPassUi.arrangementLabel(invitation.work_arrangement),
      timing,
    ].forEach(function (text) {
      const chip = document.createElement("span");
      chip.textContent = text;
      metaRow.append(chip);
    });

    const actions = document.createElement("div");
    actions.className = "actions";
    const open = document.createElement("a");
    open.className = "button button-primary";
    open.href = "invitation.html?id=" + invitation.id;
    open.textContent =
      invitation.status === "pending" || invitation.status === "saved"
        ? "Open invitation"
        : "View details";
    actions.append(open);

    card.append(top, metaRow, actions);
    list.append(card);
  });
})();
