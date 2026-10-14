(function () {
  const user = FirstPassUi.requirePage("candidate", "inbox.html");
  if (!user) return;

  const root = document.getElementById("invitation");
  const notice = document.getElementById("notice");
  const id = new URLSearchParams(location.search).get("id");

  function paint(invitation) {
    root.replaceChildren();
    if (!invitation) {
      const missing = document.createElement("div");
      missing.className = "empty-state";
      missing.innerHTML =
        "<h2>Invitation not found</h2><p class='meta'>That invitation is not in your account.</p>";
      const actions = document.createElement("div");
      actions.className = "actions";
      const back = document.createElement("a");
      back.className = "button";
      back.href = "inbox.html";
      back.textContent = "Back to inbox";
      actions.append(back);
      missing.append(actions);
      root.append(missing);
      return;
    }

    const top = document.createElement("div");
    top.className = "row-between";
    const title = document.createElement("h1");
    title.textContent = invitation.role_title;
    top.append(title, FirstPassUi.statusBadge(invitation.status));

    const from = document.createElement("p");
    from.className = "lede";
    const employer = invitation.employer;
    let timing = "Respond by " + FirstPassUi.formatDate(invitation.expires_at);
    if (invitation.status === "expired") {
      timing =
        "This invitation closed on " +
        FirstPassUi.formatDate(invitation.expires_at) +
        ". Responses are no longer available.";
    } else if (invitation.status === "accepted" || invitation.status === "declined") {
      timing =
        "You " +
        invitation.status +
        " this invitation on " +
        FirstPassUi.formatDate(invitation.responded_at) +
        ".";
    } else {
      timing += " · " + FirstPassUi.timeRemaining(invitation.expires_at);
    }
    from.textContent = "From " + employer.name + " at " + employer.company + ". " + timing;

    const facts = document.createElement("div");
    facts.className = "panel";
    function line(label, value) {
      const paragraph = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = label + " ";
      paragraph.append(strong, document.createTextNode(value));
      facts.append(paragraph);
    }
    line(
      "Salary",
      FirstPassUi.formatMoney(invitation.salary_min) +
        " – " +
        FirstPassUi.formatMoney(invitation.salary_max),
    );
    line("Work arrangement", FirstPassUi.arrangementLabel(invitation.work_arrangement));
    line("Role summary", invitation.role_summary);
    line("Why they reached out", invitation.reason_for_interest);

    const meaning = document.createElement("p");
    meaning.textContent =
      "Accepting means you are willing to interview—it is not a job offer. Accept and Decline ask for confirmation because they are final. Save for Later only parks this invite and does not change the deadline.";

    const actions = document.createElement("div");
    actions.className = "actions";
    const final = invitation.status === "accepted" || invitation.status === "declined";
    const expired = invitation.status === "expired";

    if (!final) {
      [
        ["accept", "Accept Interview", true],
        ["save", "Save for Later", false],
        ["decline", "Decline Interview", false],
      ].forEach(function (spec) {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = spec[1];
        if (spec[2]) button.className = "primary";
        button.disabled = expired;
        button.addEventListener("click", function () {
          if (spec[0] === "accept" || spec[0] === "decline") {
            const confirmed = window.confirm(
              (spec[0] === "accept"
                ? "Accept this interview invitation?"
                : "Decline this interview invitation?") +
                " This decision can’t be undone.",
            );
            if (!confirmed) return;
          }
          const result = FirstPass.respond(invitation.id, spec[0]);
          if (!result.ok) {
            notice.hidden = false;
            notice.className = "notice notice-error";
            notice.setAttribute("role", "alert");
            notice.textContent = result.error;
            return;
          }
          if (spec[0] === "save") {
            FirstPass.setNotice("Saved for later. The response deadline did not change.");
            location.href = "inbox.html?view=saved";
            return;
          }
          if (spec[0] === "accept") {
            FirstPass.setNotice(
              "You accepted the interview. This is not a job offer, and the decision is final.",
            );
          } else {
            FirstPass.setNotice("You declined the invitation. The decision is final.");
          }
          FirstPassUi.showNotice(notice);
          paint(result.invitation);
        });
        actions.append(button);
      });
    }

    const closed = document.createElement("p");
    closed.className = "meta";
    if (expired) {
      closed.textContent =
        "The actions stay visible but inactive so you can see what was possible before the deadline.";
    } else if (final) {
      closed.textContent = "Accept and decline cannot be changed once submitted.";
    } else if (invitation.status === "saved") {
      closed.textContent =
        "This invitation is saved. You can still accept or decline until the original deadline.";
    }

    root.append(top, from, facts, meaning, actions);
    if (closed.textContent) root.append(closed);
  }

  paint(id ? FirstPass.getInvitation(id) : null);
})();
