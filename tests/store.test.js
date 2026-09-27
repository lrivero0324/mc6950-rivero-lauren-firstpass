const assert = require("assert");
const FirstPass = require("../js/store.js");

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function signInAs(name) {
  const account = FirstPass.demoAccounts().find((item) => item.name === name);
  assert.ok(account, "missing demo account " + name);
  const result = FirstPass.signIn(account.email, account.password);
  assert.strictEqual(result.ok, true, result.error);
  return result.user;
}

function validInvite(overrides) {
  return Object.assign(
    {
      role_title: "Platform Engineer",
      role_summary: "This opening covers API work for an internal tools team over the next two quarters.",
      salary_min: 90000,
      salary_max: 110000,
      work_arrangement: "remote",
      reason_for_interest: "The profile matches the services this team is hiring for right now.",
      expires_in_days: 7,
    },
    overrides || {},
  );
}

test("search filters skill, location, role, arrangement, and salary budget", function () {
  FirstPass.signOut();
  const react = FirstPass.searchCandidates({ skill: "react" });
  assert.ok(react.some((item) => item.full_name === "Alex Rivera"));
  assert.ok(react.some((item) => item.full_name === "Sam Okonkwo"));
  assert.ok(!react.some((item) => item.full_name === "Priya Nair"));

  const miami = FirstPass.searchCandidates({ location: "Miami" });
  assert.deepStrictEqual(
    miami.map((item) => item.full_name),
    ["Alex Rivera"],
  );

  const frontend = FirstPass.searchCandidates({ role: "Frontend" });
  assert.deepStrictEqual(
    frontend.map((item) => item.full_name),
    ["Alex Rivera"],
  );

  const remote = FirstPass.searchCandidates({ work_arrangement: "remote" });
  assert.ok(remote.some((item) => item.full_name === "Sam Okonkwo"));
  assert.ok(remote.some((item) => item.full_name === "Taylor Kim"));
  assert.ok(!remote.some((item) => item.full_name === "Alex Rivera"));

  const budget = FirstPass.searchCandidates({ salary_max: 75000 });
  assert.ok(budget.some((item) => item.full_name === "Alex Rivera"));
  assert.ok(budget.some((item) => item.full_name === "Taylor Kim"));
  assert.ok(!budget.some((item) => item.full_name === "Sam Okonkwo"));
});

test("search hides candidates the signed-in employer has already invited", function () {
  signInAs("Maya Chen");
  const results = FirstPass.searchCandidates({});
  assert.ok(!results.some((item) => item.full_name === "Alex Rivera"));
  assert.ok(!results.some((item) => item.full_name === "Sam Okonkwo"));
  assert.ok(results.some((item) => item.full_name === "Jordan Ellis"));
});

test("an incomplete profile stays out of search until it is saved", function () {
  const created = FirstPass.registerCandidate({
    fullName: "Riley Santos",
    email: "riley.santos@example.com",
    password: "demo",
  });
  assert.strictEqual(created.ok, true);
  assert.strictEqual(FirstPass.getMyProfile().profile_complete, false);

  const duplicate = FirstPass.registerCandidate({
    fullName: "Alex Rivera",
    email: "Alex.Rivera@example.com",
    password: "demo",
  });
  assert.strictEqual(duplicate.ok, false);

  FirstPass.signOut();
  signInAs("Maya Chen");
  assert.ok(!FirstPass.searchCandidates({}).some((item) => item.full_name === "Riley Santos"));

  FirstPass.signOut();
  assert.strictEqual(FirstPass.signIn("riley.santos@example.com", "demo").ok, true);
  const tooShort = FirstPass.saveProfile({
    full_name: "Riley Santos",
    headline: "QA Analyst",
    location: "Miami, FL",
    skills: "Testing",
    experience_years: 1,
    education: "B.S. Information Technology",
    preferred_role: "QA Analyst",
    preferred_salary_min: 60000,
    preferred_work_arrangement: "hybrid",
    summary: "Too short",
  });
  assert.strictEqual(tooShort.ok, false);
  assert.strictEqual(FirstPass.getMyProfile().profile_complete, false);

  const saved = FirstPass.saveProfile({
    full_name: "Riley Santos",
    headline: "QA Analyst",
    location: "Miami, FL",
    skills: "Testing, Zig, Accessibility",
    experience_years: 1,
    education: "B.S. Information Technology",
    preferred_role: "QA Analyst",
    preferred_salary_min: 60000,
    preferred_work_arrangement: "hybrid",
    summary: "Tests web flows and writes up what broke before a release goes out.",
    portfolio_url: "https://example.com/riley",
  });
  assert.strictEqual(saved.ok, true, saved.error);

  FirstPass.signOut();
  signInAs("Maya Chen");
  const found = FirstPass.searchCandidates({ skill: "Zig" });
  assert.strictEqual(found.length, 1);
  assert.strictEqual(found[0].full_name, "Riley Santos");
});

test("saving a profile rejects an incomplete form and keeps the stored profile", function () {
  signInAs("Alex Rivera");
  const before = FirstPass.getMyProfile().summary;
  const result = FirstPass.saveProfile({
    full_name: "Alex Rivera",
    headline: "Junior Frontend Developer",
    location: "Miami, FL",
    skills: "",
    experience_years: 2,
    education: "B.S. Information Technology",
    preferred_role: "Frontend Developer",
    preferred_salary_min: 70000,
    preferred_work_arrangement: "hybrid",
    summary: before,
  });
  assert.strictEqual(result.ok, false);
  assert.ok(result.errors.skills);
  assert.strictEqual(FirstPass.getMyProfile().summary, before);
  assert.ok(FirstPass.getMyProfile().skills.includes("React"));
});

test("an invitation requires every transparency field and a valid salary range", function () {
  signInAs("Maya Chen");
  const ellis = FirstPass.searchCandidates({ skill: "Docker" })[0];
  assert.ok(ellis);

  const missing = FirstPass.createInvitation(
    validInvite({ candidate_id: ellis.id, reason_for_interest: "" }),
  );
  assert.strictEqual(missing.ok, false);
  assert.ok(missing.errors.reason_for_interest);

  const inverted = FirstPass.createInvitation(
    validInvite({ candidate_id: ellis.id, salary_min: 100000, salary_max: 90000 }),
  );
  assert.strictEqual(inverted.ok, false);
  assert.strictEqual(
    inverted.errors.salary_max,
    "Maximum salary must be greater than or equal to minimum.",
  );

  const tooShort = FirstPass.createInvitation(validInvite({ candidate_id: ellis.id, expires_in_days: 0 }));
  const tooLong = FirstPass.createInvitation(validInvite({ candidate_id: ellis.id, expires_in_days: 31 }));
  assert.strictEqual(tooShort.ok, false);
  assert.strictEqual(tooLong.ok, false);
  assert.strictEqual(
    tooShort.errors.expires_in_days,
    "Choose a response window from 1 to 30 days.",
  );

  const before = Date.now();
  const created = FirstPass.createInvitation(validInvite({ candidate_id: ellis.id, expires_in_days: 1 }));
  const after = Date.now();
  assert.strictEqual(created.ok, true, created.error);
  assert.strictEqual(created.invitation.status, "pending");
  const expires = new Date(created.invitation.expires_at).getTime();
  assert.ok(expires >= before + 24 * 60 * 60 * 1000 - 2000);
  assert.ok(expires <= after + 24 * 60 * 60 * 1000 + 2000);

  const duplicate = FirstPass.createInvitation(validInvite({ candidate_id: ellis.id }));
  assert.strictEqual(duplicate.ok, false);
  assert.match(duplicate.error, /open invitation/);
});

test("employers save roles and reuse them when inviting", function () {
  signInAs("Maya Chen");
  const roles = FirstPass.listJobPostings();
  assert.ok(roles.length >= 2);
  assert.ok(roles.some((item) => item.title === "Full-Stack Engineer"));

  const created = FirstPass.saveJobPosting({
    title: "Platform Engineer",
    summary: "Own internal developer tooling and the APIs that keep client portals shipping.",
    salary_min: 105000,
    salary_max: 125000,
    work_arrangement: "remote",
    default_expires_in_days: 5,
  });
  assert.strictEqual(created.ok, true, created.error);
  assert.strictEqual(created.role.title, "Platform Engineer");

  const ellis = FirstPass.searchCandidates({ skill: "Docker" })[0];
  assert.ok(ellis);
  const invited = FirstPass.createInvitation(
    validInvite({
      candidate_id: ellis.id,
      job_posting_id: created.role.id,
      role_title: created.role.title,
      role_summary: created.role.summary,
      salary_min: created.role.salary_min,
      salary_max: created.role.salary_max,
      work_arrangement: created.role.work_arrangement,
      expires_in_days: created.role.default_expires_in_days,
    }),
  );
  assert.strictEqual(invited.ok, true, invited.error);
  assert.strictEqual(invited.invitation.role_title, "Platform Engineer");

  const removed = FirstPass.deleteJobPosting(created.role.id);
  assert.strictEqual(removed.ok, true);
  assert.ok(!FirstPass.listJobPostings().some((item) => item.id === created.role.id));
});

test("a final or expired invitation does not block a new one, but an open one does", function () {
  signInAs("Maya Chen");
  const alex = FirstPass.getCandidate(1);
  assert.ok(alex);
  assert.ok(
    !FirstPass.searchCandidates({}).some((item) => item.id === alex.id),
    "open prospects should hide candidates with any prior invitation",
  );
  const blocked = FirstPass.createInvitation(validInvite({ candidate_id: alex.id }));
  assert.strictEqual(blocked.ok, false);

  const chris = FirstPass.getCandidate(4);
  assert.ok(chris);
  const again = FirstPass.createInvitation(validInvite({ candidate_id: chris.id }));
  assert.strictEqual(again.ok, true, again.error);
});

test("save for later does not move the deadline, and accept is final", function () {
  signInAs("Alex Rivera");
  const pending = FirstPass.listInbox("active").find(
    (item) => item.role_title === "Patient Portal Frontend Developer",
  );
  assert.ok(pending);
  const deadline = pending.expires_at;

  const saved = FirstPass.respond(pending.id, "save");
  assert.strictEqual(saved.ok, true);
  assert.strictEqual(saved.invitation.status, "saved");
  assert.strictEqual(saved.invitation.expires_at, deadline);
  assert.strictEqual(saved.invitation.responded_at, null);
  assert.ok(FirstPass.listInbox("saved").some((item) => item.id === pending.id));
  assert.ok(!FirstPass.listInbox("active").some((item) => item.id === pending.id));

  const accepted = FirstPass.respond(pending.id, "accept");
  assert.strictEqual(accepted.ok, true);
  assert.strictEqual(accepted.invitation.status, "accepted");
  assert.ok(accepted.invitation.responded_at);

  const declined = FirstPass.respond(pending.id, "decline");
  assert.strictEqual(declined.ok, false);
  assert.match(declined.error, /already accepted/);
});

test("a passed deadline expires a saved invitation and blocks a response", function () {
  signInAs("Taylor Kim");
  const active = FirstPass.listInbox("active");
  const past = FirstPass.listInbox("past");
  assert.ok(!active.some((item) => item.role_title === "Marketing Operations Specialist"));
  const expired = past.find((item) => item.role_title === "Marketing Operations Specialist");
  assert.ok(expired);
  assert.strictEqual(expired.status, "expired");
  const denied = FirstPass.respond(expired.id, "accept");
  assert.strictEqual(denied.ok, false);
  assert.match(denied.error, /expired/);
});

test("Alex's inbox already contains active, saved, and past invitations", function () {
  signInAs("Alex Rivera");
  assert.ok(FirstPass.listInbox("active").length >= 1);
  assert.ok(FirstPass.listInbox("saved").length >= 1);
  assert.ok(FirstPass.listInbox("past").some((item) => item.status === "expired"));
});

test("Maya can see every invitation status on the sent list", function () {
  signInAs("Maya Chen");
  const statuses = new Set(FirstPass.listSent().map((item) => item.status));
  ["pending", "saved", "accepted", "declined", "expired"].forEach(function (status) {
    assert.ok(statuses.has(status), "missing " + status);
  });
});

let failed = 0;
tests.forEach(function (item) {
  FirstPass.resetDemoData();
  try {
    item.fn();
    console.log("ok " + item.name);
  } catch (error) {
    failed += 1;
    console.error("FAIL " + item.name);
    console.error(error);
  }
});

if (failed) {
  console.error(failed + " failed");
  process.exit(1);
}
console.log(tests.length + " passed");
