(function () {
  const user = FirstPassUi.requirePage("employer", "sent.html");
  if (!user) return;

  const host = document.getElementById("sent-table");
  const detail = document.getElementById("sent-detail");
  const count = document.getElementById("sent-count");
  const params = new URLSearchParams(location.search);
  const allowed = ["all", "pending", "saved", "accepted", "declined", "expired"];
  let status = params.get("status") || "all";
  if (!allowed.includes(status)) status = "all";
  const focusId = params.get("id") ? Number(params.get("id")) : null;

  const allSent = FirstPass.listSent();
  const focusInvite = focusId
    ? allSent.find(function (item) {
        return item.id === focusId;
      })
    : null;
  // Deep links open the invite in context on the All list.
  if (focusInvite) status = "all";

  document.querySelectorAll("#sent-filters a").forEach(function (link) {
    if (link.getAttribute("data-status") === status) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  const invitations = allSent.filter(function (invitation) {
    return status === "all" || invitation.status === status;
  });

  count.textContent =
    invitations.length +
    (invitations.length === 1 ? " invitation" : " invitations") +
    (status === "all" ? "" : " · " + FirstPassUi.statusLabel(status));

  if (!invitations.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    const heading = document.createElement("h2");
    heading.textContent =
      status === "all" ? "No invitations sent yet" : "No " + status + " invitations";
    const body = document.createElement("p");
    body.className = "meta";
    body.textContent =
      status === "all"
        ? "Search for a candidate, open their profile, and send an interview invitation with salary, arrangement, and a deadline."
        : "Try another status filter, or send a new invitation from Find candidates.";
    const actions = document.createElement("div");
    actions.className = "actions";
    const search = document.createElement("a");
    search.className = "button button-primary";
    search.href = "search.html";
    search.textContent = "Find candidates";
    if (status !== "all") {
      const all = document.createElement("a");
      all.className = "button";
      all.href = "sent.html?status=all";
      all.textContent = "View all sent";
      actions.append(all);
    }
    actions.append(search);
    empty.append(heading, body, actions);
    host.append(empty);
    return;
  }

  const table = document.createElement("table");
  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  ["Candidate", "Role", "Status", "Deadline", "Time remaining", ""].forEach(function (label) {
    const cell = document.createElement("th");
    cell.textContent = label;
    headRow.append(cell);
  });
  head.append(headRow);
  table.append(head);

  const body = document.createElement("tbody");
  let focusRow = null;
  invitations.forEach(function (invitation) {
    const row = document.createElement("tr");
    row.dataset.inviteId = String(invitation.id);
    function cell(text) {
      const item = document.createElement("td");
      item.textContent = text;
      return item;
    }
    const openStatus = invitation.status === "pending" || invitation.status === "saved";
    const remaining = openStatus
      ? FirstPassUi.timeRemaining(invitation.expires_at)
      : "—";
    row.append(cell(invitation.candidate.full_name), cell(invitation.role_title));
    const statusCell = document.createElement("td");
    statusCell.append(FirstPassUi.statusBadge(invitation.status));
    row.append(
      statusCell,
      cell(FirstPassUi.formatDate(invitation.expires_at)),
      cell(remaining),
    );

    const action = document.createElement("td");
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "View";
    button.addEventListener("click", function () {
      showDetail(invitation, row);
    });
    action.append(button);
    row.append(action);
    body.append(row);
    if (focusId && invitation.id === focusId) focusRow = row;
  });
  table.append(body);
  host.append(table);

  function showDetail(invitation, row) {
    document.querySelectorAll("#sent-table tr.is-focused").forEach(function (node) {
      node.classList.remove("is-focused");
    });
    if (row) row.classList.add("is-focused");

    detail.hidden = false;
    detail.replaceChildren();
    const title = document.createElement("h2");
    title.textContent = invitation.role_title + " — " + invitation.candidate.full_name;
    const statusLine = document.createElement("p");
    statusLine.append(document.createTextNode("Status: "));
    statusLine.append(FirstPassUi.statusBadge(invitation.status));

    function paragraph(label, value) {
      const node = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = label + " ";
      node.append(strong, document.createTextNode(value));
      return node;
    }

    detail.append(
      title,
      statusLine,
      paragraph(
        "Salary",
        FirstPassUi.formatMoney(invitation.salary_min) +
          " – " +
          FirstPassUi.formatMoney(invitation.salary_max),
      ),
      paragraph("Work arrangement", FirstPassUi.arrangementLabel(invitation.work_arrangement)),
      paragraph("Deadline", FirstPassUi.formatDate(invitation.expires_at)),
      paragraph("Role summary", invitation.role_summary),
      paragraph("Reason for interest", invitation.reason_for_interest),
    );
    const locked = document.createElement("p");
    locked.className = "meta";
    locked.textContent =
      "This invitation is read-only. The prototype does not include messaging or scheduling.";
    detail.append(locked);
    detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  if (focusInvite) {
    const row =
      focusRow ||
      host.querySelector('tr[data-invite-id="' + focusInvite.id + '"]');
    showDetail(focusInvite, row);
    if (row) row.scrollIntoView({ behavior: "smooth", block: "center" });
  }
})();
