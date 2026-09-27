(function () {
  const user = FirstPassUi.requirePage("employer", "sent.html");
  if (!user) return;

  const host = document.getElementById("sent-table");
  const detail = document.getElementById("sent-detail");
  const invitations = FirstPass.listSent();

  if (!invitations.length) {
    const empty = document.createElement("p");
    empty.className = "panel";
    empty.textContent = "You have not sent an invitation yet.";
    host.append(empty);
    return;
  }

  const table = document.createElement("table");
  const head = document.createElement("thead");
  const headRow = document.createElement("tr");
  ["Candidate", "Role", "Status", "Deadline", ""].forEach(function (label) {
    const cell = document.createElement("th");
    cell.textContent = label;
    headRow.append(cell);
  });
  head.append(headRow);
  table.append(head);

  const body = document.createElement("tbody");
  invitations.forEach(function (invitation) {
    const row = document.createElement("tr");
    function cell(text) {
      const item = document.createElement("td");
      item.textContent = text;
      return item;
    }
    row.append(
      cell(invitation.candidate.full_name),
      cell(invitation.role_title),
    );
    const statusCell = document.createElement("td");
    statusCell.append(FirstPassUi.statusBadge(invitation.status));
    row.append(statusCell, cell(FirstPassUi.formatDate(invitation.expires_at)));

    const action = document.createElement("td");
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "View";
    button.addEventListener("click", function () {
      showDetail(invitation);
    });
    action.append(button);
    row.append(action);
    body.append(row);
  });
  table.append(body);
  host.append(table);

  function showDetail(invitation) {
    detail.hidden = false;
    detail.replaceChildren();
    const title = document.createElement("h2");
    title.textContent = invitation.role_title + " — " + invitation.candidate.full_name;
    const status = document.createElement("p");
    status.append(document.createTextNode("Status: "));
    status.append(FirstPassUi.statusBadge(invitation.status));

    function paragraph(label, value) {
      const node = document.createElement("p");
      const strong = document.createElement("strong");
      strong.textContent = label + " ";
      node.append(strong, document.createTextNode(value));
      return node;
    }

    detail.append(
      title,
      status,
      paragraph("Salary", FirstPassUi.formatMoney(invitation.salary_min) + " – " + FirstPassUi.formatMoney(invitation.salary_max)),
      paragraph("Work arrangement", FirstPassUi.arrangementLabel(invitation.work_arrangement)),
      paragraph("Deadline", FirstPassUi.formatDate(invitation.expires_at)),
      paragraph("Role summary", invitation.role_summary),
      paragraph("Reason for interest", invitation.reason_for_interest),
    );
    const locked = document.createElement("p");
    locked.className = "meta";
    locked.textContent = "This invitation is read-only. The prototype does not include messaging or scheduling.";
    detail.append(locked);
    detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
})();
