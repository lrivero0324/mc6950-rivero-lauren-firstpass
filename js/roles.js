(function () {
  const user = FirstPassUi.requirePage("employer", "roles.html");
  if (!user) return;

  const list = document.getElementById("roles-list");
  const form = document.getElementById("role-form");
  const formTitle = document.getElementById("role-form-title");
  const newButton = document.getElementById("new-role");
  const cancelButton = document.getElementById("cancel-role");

  function hideForm() {
    form.hidden = true;
    form.reset();
    form.elements.id.value = "";
    FirstPassUi.clearErrors(form);
  }

  function showForm(role) {
    FirstPassUi.clearErrors(form);
    form.hidden = false;
    if (role) {
      formTitle.textContent = "Edit role";
      form.elements.id.value = role.id;
      form.elements.title.value = role.title;
      form.elements.summary.value = role.summary;
      form.elements.salary_min.value = role.salary_min;
      form.elements.salary_max.value = role.salary_max;
      form.elements.work_arrangement.value = role.work_arrangement;
      form.elements.default_expires_in_days.value = role.default_expires_in_days;
    } else {
      formTitle.textContent = "New role";
      form.reset();
      form.elements.id.value = "";
      form.elements.default_expires_in_days.value = 7;
    }
    form.scrollIntoView({ behavior: "smooth", block: "nearest" });
    form.elements.title.focus();
  }

  function render() {
    const roles = FirstPass.listJobPostings();
    list.replaceChildren();

    if (!roles.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.innerHTML =
        "<h2>No roles yet</h2><p class='meta'>Save an opening with salary, arrangement, and summary. You will pick it from a dropdown when inviting candidates.</p>";
      list.append(empty);
      return;
    }

    roles.forEach(function (role) {
      const card = document.createElement("article");
      card.className = "card listing-card";

      const top = document.createElement("div");
      top.className = "row-between";
      const heading = document.createElement("div");
      const title = document.createElement("h2");
      title.textContent = role.title;
      const meta = document.createElement("p");
      meta.className = "listing-headline";
      meta.textContent =
        FirstPassUi.formatMoney(role.salary_min) +
        " – " +
        FirstPassUi.formatMoney(role.salary_max) +
        " · " +
        FirstPassUi.arrangementLabel(role.work_arrangement) +
        " · " +
        role.default_expires_in_days +
        "-day response window";
      heading.append(title, meta);
      top.append(heading);

      const summary = document.createElement("p");
      summary.className = "profile-copy";
      summary.textContent = role.summary;

      const actions = document.createElement("div");
      actions.className = "actions";
      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "button";
      edit.textContent = "Edit";
      edit.addEventListener("click", function () {
        showForm(role);
      });
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "button";
      remove.textContent = "Delete";
      remove.addEventListener("click", function () {
        const confirmed = window.confirm(
          "Delete “" + role.title + "”? Existing invitations keep their copied details.",
        );
        if (!confirmed) return;
        const result = FirstPass.deleteJobPosting(role.id);
        if (!result.ok) {
          FirstPass.setNotice(result.error, "error");
          FirstPassUi.showNotice(document.getElementById("notice"));
          return;
        }
        if (String(form.elements.id.value) === String(role.id)) hideForm();
        FirstPass.setNotice("Role deleted.");
        FirstPassUi.showNotice(document.getElementById("notice"));
        render();
      });
      actions.append(edit, remove);

      card.append(top, summary, actions);
      list.append(card);
    });
  }

  newButton.addEventListener("click", function () {
    showForm(null);
  });
  cancelButton.addEventListener("click", hideForm);

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    FirstPassUi.clearErrors(form);
    const result = FirstPass.saveJobPosting({
      id: form.elements.id.value,
      title: form.elements.title.value,
      summary: form.elements.summary.value,
      salary_min: form.elements.salary_min.value,
      salary_max: form.elements.salary_max.value,
      work_arrangement: form.elements.work_arrangement.value,
      default_expires_in_days: form.elements.default_expires_in_days.value,
    });
    if (!result.ok) {
      FirstPassUi.showErrors(form, result.errors || {});
      FirstPass.setNotice(result.error, "error");
      FirstPassUi.showNotice(document.getElementById("notice"));
      return;
    }
    FirstPass.setNotice(
      form.elements.id.value ? "Role updated." : "Role saved. You can select it when inviting a candidate.",
    );
    FirstPassUi.showNotice(document.getElementById("notice"));
    hideForm();
    render();
  });

  render();
})();
