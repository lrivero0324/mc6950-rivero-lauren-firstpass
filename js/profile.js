(function () {
  const user = FirstPassUi.requirePage("candidate", "profile.html");
  if (!user) return;

  const form = document.getElementById("profile-form");
  const state = document.getElementById("profile-state");
  const profile = FirstPass.getMyProfile();

  function showState(complete) {
    state.textContent = complete
      ? "This profile is searchable."
      : "This profile is not searchable yet. Save the required fields before an employer can find you.";
  }

  if (profile) {
    form.elements.full_name.value = profile.full_name || "";
    form.elements.headline.value = profile.headline || "";
    form.elements.location.value = profile.location || "";
    form.elements.preferred_role.value = profile.preferred_role || "";
    form.elements.preferred_salary_min.value = profile.preferred_salary_min || "";
    form.elements.preferred_work_arrangement.value = profile.preferred_work_arrangement || "";
    form.elements.skills.value = (profile.skills || []).join(", ");
    form.elements.experience_years.value =
      profile.experience_years === "" || profile.experience_years == null ? "" : profile.experience_years;
    form.elements.education.value = profile.education || "";
    form.elements.portfolio_url.value = profile.portfolio_url || "";
    form.elements.summary.value = profile.summary || "";
    showState(profile.profile_complete);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const result = FirstPass.saveProfile({
      full_name: form.elements.full_name.value,
      headline: form.elements.headline.value,
      location: form.elements.location.value,
      preferred_role: form.elements.preferred_role.value,
      preferred_salary_min: form.elements.preferred_salary_min.value,
      preferred_work_arrangement: form.elements.preferred_work_arrangement.value,
      skills: form.elements.skills.value,
      experience_years: form.elements.experience_years.value,
      education: form.elements.education.value,
      portfolio_url: form.elements.portfolio_url.value,
      summary: form.elements.summary.value,
    });
    if (!result.ok) {
      FirstPassUi.showErrors(form, result.errors || {});
      FirstPass.setNotice(result.error, "error");
      FirstPassUi.showNotice(document.getElementById("notice"));
      return;
    }
    FirstPassUi.clearErrors(form);
    form.elements.skills.value = result.profile.skills.join(", ");
    showState(true);
    FirstPass.setNotice("Profile saved. Employers can now find this profile in search.");
    FirstPassUi.showNotice(document.getElementById("notice"));
    FirstPassUi.mountChrome("profile.html");
  });
})();
