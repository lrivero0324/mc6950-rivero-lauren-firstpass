(function () {
  const user = FirstPassUi.requirePage("candidate", "inbox.html");
  if (!user) return;

  const profile = FirstPass.getMyProfile();
  const list = document.getElementById("inbox-list");
  const count = document.getElementById("inbox-count");
  const helper = document.getElementById("inbox-helper");

  if (!profile || !profile.profile_complete) {
    if (helper) helper.hidden = true;
    count.hidden = true;
    const tabs = document.querySelector(".tabs");
    if (tabs) tabs.hidden = true;
    const gate = document.createElement("div");
    gate.className = "empty-state";
    const heading = document.createElement("h2");
    heading.textContent = "Finish your profile first";
    const body = document.createElement("p");
    body.className = "meta";
    body.textContent =
      "Your profile is not searchable yet. Complete and save the required fields so employers can find you—and so your inbox is ready when invitations arrive.";
    const actions = document.createElement("div");
    actions.className = "actions";
    const link = document.createElement("a");
    link.className = "button button-primary";
    link.href = "profile.html";
    link.textContent = "Complete your profile";
    actions.append(link);
    gate.append(heading, body, actions);
    list.append(gate);
    FirstPass.setNotice(
      "Complete your profile before using the invitation inbox.",
      "error",
    );
    FirstPassUi.showNotice(document.getElementById("notice"));
    return;
  }

  const allowed = ["all", "active", "saved", "past"];
  let view = new URLSearchParams(location.search).get("view") || "all";
  if (!allowed.includes(view)) view = "all";

  document.querySelectorAll(".tabs a").forEach(function (link) {
    if (link.getAttribute("data-view") === view) {
      link.setAttribute("aria-current", "page");
    }
  });

  const invitations = FirstPass.listInbox(view);
  count.className = "result-count";
  count.textContent =
    invitations.length + (invitations.length === 1 ? " invitation" : " invitations");

  if (!invitations.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    const messages = {
      all: {
        title: "Inbox is clear",
        body: "When an employer invites you to interview, the invitation appears here with salary, arrangement, and a deadline.",
        actionHref: "profile.html",
        actionLabel: "Review your profile",
      },
      active: {
        title: "No active invitations",
        body: "Active means Pending — new invites you have not accepted, saved, or declined yet.",
        actionHref: "inbox.html?view=all",
        actionLabel: "View all invitations",
      },
      saved: {
        title: "Nothing saved for later",
        body: "Save for Later parks an invitation without changing the deadline—and without a confirm step. Open an Active invitation to save one.",
        actionHref: "inbox.html?view=active",
        actionLabel: "View active invitations",
      },
      past: {
        title: "No past invitations yet",
        body: "Accepted, declined, and expired invitations show up here after you respond or a deadline passes.",
        actionHref: "inbox.html?view=all",
        actionLabel: "View all invitations",
      },
    };
    const copy = messages[view];
    const heading = document.createElement("h2");
    heading.textContent = copy.title;
    const body = document.createElement("p");
    body.className = "meta";
    body.textContent = copy.body;
    const actions = document.createElement("div");
    actions.className = "actions";
    const link = document.createElement("a");
    link.className = "button";
    link.href = copy.actionHref;
    link.textContent = copy.actionLabel;
    actions.append(link);
    empty.append(heading, body, actions);
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

    const openStatus = invitation.status === "pending" || invitation.status === "saved";
    const timing = openStatus
      ? "Respond by " +
        FirstPassUi.formatDate(invitation.expires_at) +
        " · " +
        FirstPassUi.timeRemaining(invitation.expires_at)
      : "Deadline " + FirstPassUi.formatDate(invitation.expires_at);

    const metaRow = document.createElement("div");
    metaRow.className = "meta-row";
    [
      FirstPassUi.formatMoney(invitation.salary_min) +
        " – " +
        FirstPassUi.formatMoney(invitation.salary_max),
      FirstPassUi.arrangementLabel(invitation.work_arrangement),
      "Status: " + FirstPassUi.statusLabel(invitation.status),
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
    open.textContent = openStatus ? "View Invitation" : "View details";
    actions.append(open);

    card.append(top, metaRow, actions);
    list.append(card);
  });
})();
