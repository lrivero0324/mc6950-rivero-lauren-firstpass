/* FirstPass prototype data.
   Records follow the Assignment 1.2 Django models: employers, candidates,
   and interview invitations with status and expires_at.
   Employers also keep reusable job postings (roles) so invitation details
   are selected once and reused instead of retyped per candidate.
   Passwords exist only so the class demo can keep a candidate session
   distinct from an employer session. They are not account security. */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }
  root.FirstPass = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
  const STORAGE_KEY = "firstpass.prototype.v1";
  const SESSION_KEY = "firstpass.session";
  const NOTICE_KEY = "firstpass.notice";
  const LAST_SEARCH_KEY = "firstpass.lastSearch";
  const VERSION = 3;
  const DEMO_PASSWORD = "demo";
  const ARRANGEMENTS = ["remote", "hybrid", "onsite"];

  function memoryStorage() {
    const data = new Map();
    return {
      getItem(key) {
        return data.has(key) ? data.get(key) : null;
      },
      setItem(key, value) {
        data.set(String(key), String(value));
      },
      removeItem(key) {
        data.delete(key);
      },
    };
  }

  const browser =
    typeof root.document !== "undefined" && root.localStorage && root.sessionStorage;
  const bags = {
    local: browser ? root.localStorage : memoryStorage(),
    session: browser ? root.sessionStorage : memoryStorage(),
  };

  function daysFromNow(days) {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  }

  function buildSeed() {
    return {
      version: VERSION,
      next_id: 100,
      employers: [
        {
          id: 1,
          name: "Maya Chen",
          company: "Northstar Digital",
          title: "Talent Partner",
        },
        {
          id: 2,
          name: "Jordan Blake",
          company: "Harbor Health Systems",
          title: "Hiring Manager",
        },
      ],
      candidates: [
        {
          id: 1,
          full_name: "Alex Rivera",
          headline: "Junior Frontend Developer",
          location: "Miami, FL",
          skills: ["React", "JavaScript", "CSS", "Accessibility"],
          experience_years: 2,
          education: "B.S. Information Technology, Florida International University",
          preferred_role: "Frontend Developer",
          preferred_salary_min: 70000,
          preferred_work_arrangement: "hybrid",
          summary:
            "Builds accessible interfaces and wants employers to lead with salary, work arrangement, and a concrete reason for interest.",
          portfolio_url: "https://example.com/alex",
          profile_complete: true,
        },
        {
          id: 2,
          full_name: "Sam Okonkwo",
          headline: "Full-Stack Engineer",
          location: "Gainesville, FL",
          skills: ["Python", "Django", "React", "PostgreSQL"],
          experience_years: 4,
          education: "M.S. Computer Science, University of Florida",
          preferred_role: "Full-Stack Engineer",
          preferred_salary_min: 95000,
          preferred_work_arrangement: "remote",
          summary:
            "Ships product features across a Django API and a React client, and will not guess at pay or work arrangement.",
          portfolio_url: "https://example.com/sam",
          profile_complete: true,
        },
        {
          id: 3,
          full_name: "Priya Nair",
          headline: "UX Designer",
          location: "Orlando, FL",
          skills: ["Figma", "User Research", "Prototyping", "Design Systems"],
          experience_years: 3,
          education: "B.F.A. Graphic Design, University of Central Florida",
          preferred_role: "Product Designer",
          preferred_salary_min: 80000,
          preferred_work_arrangement: "hybrid",
          summary:
            "Turns research into product flows and answers interview invitations that explain why the team reached out.",
          portfolio_url: "https://example.com/priya",
          profile_complete: true,
        },
        {
          id: 4,
          full_name: "Chris Delgado",
          headline: "Data Analyst",
          location: "Tampa, FL",
          skills: ["SQL", "Python", "Tableau", "Excel"],
          experience_years: 5,
          education: "B.S. Statistics, University of South Florida",
          preferred_role: "Data Analyst",
          preferred_salary_min: 85000,
          preferred_work_arrangement: "onsite",
          summary:
            "Turns operational data into decisions for clinical and product teams, and prefers on-site roles with a stated salary range.",
          portfolio_url: "https://example.com/chris",
          profile_complete: true,
        },
        {
          id: 5,
          full_name: "Taylor Kim",
          headline: "Marketing Operations Specialist",
          location: "Atlanta, GA",
          skills: ["HubSpot", "Campaign Analytics", "Copywriting", "SEO"],
          experience_years: 3,
          education: "B.A. Communications, Emory University",
          preferred_role: "Marketing Operations",
          preferred_salary_min: 65000,
          preferred_work_arrangement: "remote",
          summary:
            "Coordinates campaign operations and reporting, and expects a role summary before agreeing to an interview.",
          portfolio_url: "https://example.com/taylor",
          profile_complete: true,
        },
        {
          id: 6,
          full_name: "Jordan Ellis",
          headline: "Backend Developer",
          location: "Austin, TX",
          skills: ["Django", "REST APIs", "Docker", "AWS"],
          experience_years: 6,
          education: "B.S. Software Engineering, University of Texas at Austin",
          preferred_role: "Backend Engineer",
          preferred_salary_min: 110000,
          preferred_work_arrangement: "hybrid",
          summary:
            "Designs APIs and data models, and responds when an employer can say which service the opening actually covers.",
          portfolio_url: "https://example.com/jordan",
          profile_complete: true,
        },
      ],
      users: [
        {
          id: 1,
          email: "maya.chen@northstar.example",
          password: DEMO_PASSWORD,
          role: "employer",
          name: "Maya Chen",
          employer_id: 1,
          demo: true,
        },
        {
          id: 2,
          email: "jordan.blake@harbor.example",
          password: DEMO_PASSWORD,
          role: "employer",
          name: "Jordan Blake",
          employer_id: 2,
          demo: true,
        },
        {
          id: 3,
          email: "alex.rivera@example.com",
          password: DEMO_PASSWORD,
          role: "candidate",
          name: "Alex Rivera",
          candidate_id: 1,
          demo: true,
        },
        {
          id: 4,
          email: "sam.okonkwo@example.com",
          password: DEMO_PASSWORD,
          role: "candidate",
          name: "Sam Okonkwo",
          candidate_id: 2,
          demo: true,
        },
        {
          id: 5,
          email: "priya.nair@example.com",
          password: DEMO_PASSWORD,
          role: "candidate",
          name: "Priya Nair",
          candidate_id: 3,
          demo: true,
        },
        {
          id: 6,
          email: "chris.delgado@example.com",
          password: DEMO_PASSWORD,
          role: "candidate",
          name: "Chris Delgado",
          candidate_id: 4,
          demo: true,
        },
        {
          id: 7,
          email: "taylor.kim@example.com",
          password: DEMO_PASSWORD,
          role: "candidate",
          name: "Taylor Kim",
          candidate_id: 5,
          demo: true,
        },
        {
          id: 8,
          email: "jordan.ellis@example.com",
          password: DEMO_PASSWORD,
          role: "candidate",
          name: "Jordan Ellis",
          candidate_id: 6,
          demo: true,
        },
      ],
      job_postings: [
        {
          id: 1,
          employer_id: 1,
          title: "Frontend Developer",
          summary:
            "Northstar Digital is hiring a frontend developer for a client reporting portal. The team ships in React, works hybrid, and needs someone who can take a rough layout to a usable screen.",
          salary_min: 78000,
          salary_max: 92000,
          work_arrangement: "hybrid",
          default_expires_in_days: 7,
          created_at: daysFromNow(-20),
        },
        {
          id: 2,
          employer_id: 1,
          title: "Full-Stack Engineer",
          summary:
            "Northstar needs a full-stack engineer to extend a Django API and the React app in front of it. The role is remote within the United States.",
          salary_min: 100000,
          salary_max: 118000,
          work_arrangement: "remote",
          default_expires_in_days: 7,
          created_at: daysFromNow(-18),
        },
        {
          id: 3,
          employer_id: 1,
          title: "Product Designer",
          summary:
            "Northstar is staffing a product designer for the same client portal. The role is hybrid, with research weeks and interface weeks on the same squad.",
          salary_min: 86000,
          salary_max: 99000,
          work_arrangement: "hybrid",
          default_expires_in_days: 10,
          created_at: daysFromNow(-12),
        },
        {
          id: 4,
          employer_id: 2,
          title: "Patient Portal Frontend Developer",
          summary:
            "Harbor Health is replacing the patient portal used to review appointments and records. The work is hybrid in Miami, two days on site, and is built in React.",
          salary_min: 76000,
          salary_max: 90000,
          work_arrangement: "hybrid",
          default_expires_in_days: 7,
          created_at: daysFromNow(-15),
        },
        {
          id: 5,
          employer_id: 2,
          title: "Backend Engineer",
          summary:
            "Harbor Health is hiring a backend engineer for the services behind the patient portal. The role is hybrid in Austin.",
          salary_min: 120000,
          salary_max: 135000,
          work_arrangement: "hybrid",
          default_expires_in_days: 10,
          created_at: daysFromNow(-10),
        },
      ],
      invitations: [
        invitationSeed({
          id: 1,
          employer_id: 2,
          candidate_id: 1,
          job_posting_id: 4,
          role_title: "Patient Portal Frontend Developer",
          role_summary:
            "Harbor Health is replacing the patient portal used to review appointments and records. The work is hybrid in Miami, two days on site, and is built in React.",
          salary_min: 76000,
          salary_max: 90000,
          work_arrangement: "hybrid",
          reason_for_interest:
            "Your profile pairs React with accessibility, which is the gap on the current portal. We want to talk through how you handle keyboard support in forms.",
          status: "pending",
          expires_at: daysFromNow(6),
          created_at: daysFromNow(-1),
          responded_at: null,
        }),
        invitationSeed({
          id: 2,
          employer_id: 1,
          candidate_id: 1,
          job_posting_id: 1,
          role_title: "Frontend Developer",
          role_summary:
            "Northstar Digital is hiring a frontend developer for a client reporting portal. The team ships in React, works hybrid, and needs someone who can take a rough layout to a usable screen.",
          salary_min: 78000,
          salary_max: 92000,
          work_arrangement: "hybrid",
          reason_for_interest:
            "The accessibility notes on your profile match a portal rebuild we are staffing. I saved the details here so you can compare them with other invitations before the deadline.",
          status: "saved",
          expires_at: daysFromNow(4),
          created_at: daysFromNow(-3),
          responded_at: null,
        }),
        invitationSeed({
          id: 3,
          employer_id: 1,
          candidate_id: 1,
          role_title: "UI Engineer",
          role_summary:
            "This was an earlier Northstar opening on a marketing-site refresh. The response window closed before a decision was recorded.",
          salary_min: 70000,
          salary_max: 82000,
          work_arrangement: "hybrid",
          reason_for_interest:
            "We reached out because of your interface work. The deadline passed with no response, so this invitation is closed.",
          status: "pending",
          expires_at: daysFromNow(-6),
          created_at: daysFromNow(-14),
          responded_at: null,
        }),
        invitationSeed({
          id: 4,
          employer_id: 1,
          candidate_id: 2,
          job_posting_id: 2,
          role_title: "Full-Stack Engineer",
          role_summary:
            "Northstar needs a full-stack engineer to extend a Django API and the React app in front of it. The role is remote within the United States.",
          salary_min: 100000,
          salary_max: 118000,
          work_arrangement: "remote",
          reason_for_interest:
            "Your profile already lists Django, React, and PostgreSQL, which is the stack this opening uses. We invited you so the next step is an interview, not an application form.",
          status: "accepted",
          expires_at: daysFromNow(5),
          created_at: daysFromNow(-8),
          responded_at: daysFromNow(-2),
        }),
        invitationSeed({
          id: 5,
          employer_id: 1,
          candidate_id: 3,
          job_posting_id: 3,
          role_title: "Product Designer",
          role_summary:
            "Northstar is staffing a product designer for the same client portal. The role is hybrid, with research weeks and interface weeks on the same squad.",
          salary_min: 86000,
          salary_max: 99000,
          work_arrangement: "hybrid",
          reason_for_interest:
            "You describe research turning into flows, which is what this squad is missing. The salary range and hybrid schedule are included so you can decide before we take interview time.",
          status: "pending",
          expires_at: daysFromNow(8),
          created_at: daysFromNow(-1),
          responded_at: null,
        }),
        invitationSeed({
          id: 6,
          employer_id: 1,
          candidate_id: 4,
          role_title: "Data Analyst",
          role_summary:
            "Northstar offered an on-site analyst role supporting campaign and product reporting in Tampa. The invitation is closed because it was declined.",
          salary_min: 86000,
          salary_max: 96000,
          work_arrangement: "onsite",
          reason_for_interest:
            "Your Tableau and SQL work matched the reporting need. You declined, and this prototype does not reopen a final response.",
          status: "declined",
          expires_at: daysFromNow(2),
          created_at: daysFromNow(-10),
          responded_at: daysFromNow(-4),
        }),
        invitationSeed({
          id: 7,
          employer_id: 1,
          candidate_id: 5,
          role_title: "Marketing Operations Specialist",
          role_summary:
            "Northstar needed a remote marketing operations specialist for campaign reporting. The response window has passed.",
          salary_min: 68000,
          salary_max: 76000,
          work_arrangement: "remote",
          reason_for_interest:
            "HubSpot and campaign analytics on your profile matched the opening. No response arrived before the deadline.",
          status: "pending",
          expires_at: daysFromNow(-3),
          created_at: daysFromNow(-12),
          responded_at: null,
        }),
        invitationSeed({
          id: 8,
          employer_id: 2,
          candidate_id: 6,
          job_posting_id: 5,
          role_title: "Backend Engineer",
          role_summary:
            "Harbor Health is hiring a backend engineer for the services behind the patient portal. The role is hybrid in Austin.",
          salary_min: 120000,
          salary_max: 135000,
          work_arrangement: "hybrid",
          reason_for_interest:
            "The API and Docker experience on your profile lines up with the service rewrite we are starting. This invitation is still open.",
          status: "pending",
          expires_at: daysFromNow(10),
          created_at: daysFromNow(-2),
          responded_at: null,
        }),
      ],
    };
  }

  function invitationSeed(record) {
    return record;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function persist(db) {
    bags.local.setItem(STORAGE_KEY, JSON.stringify(db));
  }

  function refreshExpirations(db) {
    const now = Date.now();
    let changed = false;
    db.invitations.forEach((invitation) => {
      const open = invitation.status === "pending" || invitation.status === "saved";
      if (open && new Date(invitation.expires_at).getTime() <= now) {
        invitation.status = "expired";
        changed = true;
      }
    });
    return changed;
  }

  function loadDb() {
    const raw = bags.local.getItem(STORAGE_KEY);
    let db = null;
    if (raw) {
      try {
        db = JSON.parse(raw);
      } catch {
        db = null;
      }
    }
    if (!db || db.version !== VERSION) {
      db = buildSeed();
      persist(db);
      return db;
    }
    if (refreshExpirations(db)) persist(db);
    return db;
  }

  function nextId(db) {
    const id = db.next_id;
    db.next_id += 1;
    return id;
  }

  function sessionUserId() {
    const raw = bags.session.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed.userId || null;
    } catch {
      return null;
    }
  }

  function currentRecord() {
    const userId = sessionUserId();
    if (!userId) return null;
    const db = loadDb();
    const user = db.users.find((item) => item.id === userId) || null;
    if (!user) return null;
    return { db, user };
  }

  function presentUser(user, db) {
    const employer = db.employers.find((item) => item.id === user.employer_id) || null;
    const candidate = db.candidates.find((item) => item.id === user.candidate_id) || null;
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      candidate_id: user.candidate_id || null,
      employer_id: user.employer_id || null,
      company: employer ? employer.company : "",
      title: employer ? employer.title : candidate ? candidate.headline : "",
    };
  }

  function presentCandidate(candidate) {
    return clone(candidate);
  }

  function presentInvitation(invitation, db) {
    const copy = clone(invitation);
    const candidate = db.candidates.find((item) => item.id === invitation.candidate_id);
    const employer = db.employers.find((item) => item.id === invitation.employer_id);
    copy.candidate = candidate ? presentCandidate(candidate) : null;
    copy.employer = employer ? clone(employer) : null;
    return copy;
  }

  function byNewest(a, b) {
    return new Date(b.created_at) - new Date(a.created_at);
  }

  function parseSkills(value) {
    const list = Array.isArray(value) ? value : String(value || "").split(",");
    const seen = new Set();
    const skills = [];
    list.forEach((item) => {
      const skill = String(item || "").trim();
      const key = skill.toLowerCase();
      if (!skill || seen.has(key)) return;
      seen.add(key);
      skills.push(skill);
    });
    return skills;
  }

  function parseInteger(value) {
    if (value === "" || value == null) return null;
    if (typeof value === "number" && Number.isInteger(value)) return value;
    const text = String(value).trim();
    if (!/^\d+$/.test(text)) return null;
    return Number(text);
  }

  function fail(error, errors) {
    return errors ? { ok: false, error, errors } : { ok: false, error };
  }

  function validateProfile(fields) {
    const errors = {};
    const fullName = String(fields.full_name || "").trim();
    const headline = String(fields.headline || "").trim();
    const location = String(fields.location || "").trim();
    const education = String(fields.education || "").trim();
    const preferredRole = String(fields.preferred_role || "").trim();
    const summary = String(fields.summary || "").trim();
    const arrangement = String(fields.preferred_work_arrangement || "").trim();
    const skills = parseSkills(fields.skills);
    const experience = parseInteger(fields.experience_years);
    const salary = parseInteger(fields.preferred_salary_min);
    let portfolioUrl = "";

    if (fullName.length < 2) errors.full_name = "Enter your full name.";
    if (!headline) errors.headline = "Enter a headline.";
    if (!location) errors.location = "Enter a location.";
    if (!skills.length) errors.skills = "Enter at least one skill, separated by commas.";
    if (experience == null || experience < 0 || experience > 60) {
      errors.experience_years = "Enter years of experience from 0 to 60.";
    }
    if (!education) errors.education = "Enter your education.";
    if (!preferredRole) errors.preferred_role = "Enter the role you want.";
    if (salary == null || salary <= 0) {
      errors.preferred_salary_min = "Enter a salary floor greater than zero.";
    }
    if (!ARRANGEMENTS.includes(arrangement)) {
      errors.preferred_work_arrangement = "Choose remote, hybrid, or on-site.";
    }
    if (summary.length < 20) {
      errors.summary = "Write a short summary of at least 20 characters.";
    }

    const portfolioRaw = String(fields.portfolio_url || "").trim();
    if (portfolioRaw) {
      try {
        const url = new URL(portfolioRaw);
        if (url.protocol !== "http:" && url.protocol !== "https:") {
          errors.portfolio_url = "Portfolio URL must start with http:// or https://.";
        } else {
          portfolioUrl = url.href;
        }
      } catch {
        errors.portfolio_url = "Enter a valid portfolio URL or leave it blank.";
      }
    }

    if (Object.keys(errors).length) {
      return fail("Complete the required profile fields before saving.", errors);
    }

    return {
      ok: true,
      value: {
        full_name: fullName,
        headline,
        location,
        skills,
        experience_years: experience,
        education,
        preferred_role: preferredRole,
        preferred_salary_min: salary,
        preferred_work_arrangement: arrangement,
        summary,
        portfolio_url: portfolioUrl,
      },
    };
  }

  function validateJobPosting(fields) {
    const errors = {};
    const title = String(fields.title || "").trim();
    const summary = String(fields.summary || "").trim();
    const arrangement = String(fields.work_arrangement || "").trim();
    const salaryMin = parseInteger(fields.salary_min);
    const salaryMax = parseInteger(fields.salary_max);
    const expires = parseInteger(fields.default_expires_in_days);

    if (title.length < 2) errors.title = "Enter a role title.";
    if (summary.length < 20) {
      errors.summary = "Describe the role in at least 20 characters.";
    }
    if (!ARRANGEMENTS.includes(arrangement)) {
      errors.work_arrangement = "Choose remote, hybrid, or on-site.";
    }
    if (salaryMin == null || salaryMin <= 0) {
      errors.salary_min = "Enter a minimum salary greater than zero.";
    }
    if (salaryMax == null || salaryMax <= 0) {
      errors.salary_max = "Enter a maximum salary greater than zero.";
    }
    if (salaryMin != null && salaryMax != null && salaryMax < salaryMin) {
      errors.salary_max = "Maximum salary must be greater than or equal to minimum.";
    }
    if (expires == null || expires < 1 || expires > 30) {
      errors.default_expires_in_days = "Choose a response window from 1 to 30 days.";
    }

    if (Object.keys(errors).length) {
      return fail("Save the role once every required field is complete.", errors);
    }

    return {
      ok: true,
      value: {
        title,
        summary,
        salary_min: salaryMin,
        salary_max: salaryMax,
        work_arrangement: arrangement,
        default_expires_in_days: expires,
      },
    };
  }

  function presentJobPosting(role) {
    return {
      id: role.id,
      employer_id: role.employer_id,
      title: role.title,
      summary: role.summary,
      salary_min: role.salary_min,
      salary_max: role.salary_max,
      work_arrangement: role.work_arrangement,
      default_expires_in_days: role.default_expires_in_days,
      created_at: role.created_at,
      updated_at: role.updated_at || null,
    };
  }

  function validateInvitation(fields) {
    const errors = {};
    const roleTitle = String(fields.role_title || "").trim();
    const roleSummary = String(fields.role_summary || "").trim();
    const reason = String(fields.reason_for_interest || "").trim();
    const arrangement = String(fields.work_arrangement || "").trim();
    const salaryMin = parseInteger(fields.salary_min);
    const salaryMax = parseInteger(fields.salary_max);
    const expires = parseInteger(fields.expires_in_days);

    if (!roleTitle) errors.role_title = "Enter the role title.";
    if (roleSummary.length < 20) {
      errors.role_summary = "Describe the role in at least 20 characters.";
    }
    if (reason.length < 20) {
      errors.reason_for_interest = "Explain why you are interested in at least 20 characters.";
    }
    if (!ARRANGEMENTS.includes(arrangement)) {
      errors.work_arrangement = "Choose remote, hybrid, or on-site.";
    }
    if (salaryMin == null || salaryMin <= 0) {
      errors.salary_min = "Enter a minimum salary greater than zero.";
    }
    if (salaryMax == null || salaryMax <= 0) {
      errors.salary_max = "Enter a maximum salary greater than zero.";
    }
    if (salaryMin != null && salaryMax != null && salaryMax < salaryMin) {
      errors.salary_max = "Maximum salary must be greater than or equal to minimum.";
    }
    if (expires == null || expires < 1 || expires > 30) {
      errors.expires_in_days = "Choose a response window from 1 to 30 days.";
    }

    if (Object.keys(errors).length) {
      return fail("An invitation cannot be sent until every transparency field is complete.", errors);
    }

    return {
      ok: true,
      expires_in_days: expires,
      value: {
        role_title: roleTitle,
        role_summary: roleSummary,
        salary_min: salaryMin,
        salary_max: salaryMax,
        work_arrangement: arrangement,
        reason_for_interest: reason,
      },
    };
  }

  function homePathFor(user, db) {
    if (user.role === "employer") return "search.html";
    const candidate = db.candidates.find((item) => item.id === user.candidate_id);
    if (!candidate || !candidate.profile_complete) return "profile.html";
    return "inbox.html";
  }

  function matchesView(status, view) {
    if (view === "active") return status === "pending";
    if (view === "saved") return status === "saved";
    if (view === "past") return status === "accepted" || status === "declined" || status === "expired";
    return true;
  }

  function emptyCandidate(id, name) {
    return {
      id,
      full_name: name,
      headline: "",
      location: "",
      skills: [],
      experience_years: "",
      education: "",
      preferred_role: "",
      preferred_salary_min: "",
      preferred_work_arrangement: "",
      summary: "",
      portfolio_url: "",
      profile_complete: false,
    };
  }

  function signIn(email, password) {
    const db = loadDb();
    const normalized = String(email || "").trim().toLowerCase();
    const user = db.users.find(
      (item) => item.email === normalized && item.password === String(password || ""),
    );
    if (!user) {
      return fail("That email and password do not match a FirstPass account.");
    }
    bags.session.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }));
    return { ok: true, user: presentUser(user, db) };
  }

  function signOut() {
    bags.session.removeItem(SESSION_KEY);
  }

  function currentUser() {
    const record = currentRecord();
    if (!record) return null;
    return presentUser(record.user, record.db);
  }

  function requireRole(role) {
    const record = currentRecord();
    if (!record) {
      setNotice("Sign in to continue.", "error");
      return { ok: false, redirect: "index.html" };
    }
    const user = presentUser(record.user, record.db);
    if (user.role !== role) {
      if (role === "candidate") {
        setNotice("That page is for candidates. You are signed in as an employer.", "error");
        return { ok: false, redirect: "search.html" };
      }
      setNotice("That page is for employers. You are signed in as a candidate.", "error");
      return { ok: false, redirect: homePathFor(user, record.db) };
    }
    return { ok: true, user };
  }

  function homePath() {
    const record = currentRecord();
    if (!record) return "index.html";
    return homePathFor(presentUser(record.user, record.db), record.db);
  }

  function registerAccount({ fullName, email, password, role, company }) {
    const db = loadDb();
    const name = String(fullName || "").trim();
    const normalized = String(email || "").trim().toLowerCase();
    const pass = String(password || "");
    const accountRole = role === "employer" ? "employer" : "candidate";
    const companyName = String(company || "").trim();
    const errors = {};
    if (name.length < 2) errors.full_name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      errors.email = "Enter a valid email address.";
    } else if (db.users.some((user) => user.email === normalized)) {
      errors.email = "An account with that email already exists.";
    }
    if (pass.length < 4) errors.password = "Use at least 4 characters.";
    if (accountRole === "employer" && companyName.length < 2) {
      errors.company = "Enter your company name.";
    }
    if (Object.keys(errors).length) {
      return fail("Check the highlighted fields.", errors);
    }

    const userId = nextId(db);
    if (accountRole === "candidate") {
      const candidateId = nextId(db);
      db.candidates.push(emptyCandidate(candidateId, name));
      db.users.push({
        id: userId,
        email: normalized,
        password: pass,
        role: "candidate",
        name,
        candidate_id: candidateId,
        demo: false,
      });
    } else {
      const employerId = nextId(db);
      db.employers.push({
        id: employerId,
        name,
        company: companyName,
        title: "Hiring contact",
      });
      db.users.push({
        id: userId,
        email: normalized,
        password: pass,
        role: "employer",
        name,
        employer_id: employerId,
        demo: false,
      });
    }
    persist(db);
    bags.session.setItem(SESSION_KEY, JSON.stringify({ userId }));
    const user = db.users.find((item) => item.id === userId);
    return { ok: true, user: presentUser(user, db) };
  }

  function registerCandidate(fields) {
    return registerAccount(Object.assign({}, fields, { role: "candidate" }));
  }

  function getMyProfile() {
    const record = currentRecord();
    if (!record || record.user.role !== "candidate") return null;
    const candidate = record.db.candidates.find((item) => item.id === record.user.candidate_id);
    return candidate ? presentCandidate(candidate) : null;
  }

  function saveProfile(fields) {
    const record = currentRecord();
    if (!record || record.user.role !== "candidate") {
      return fail("Sign in as a candidate to save a profile.");
    }
    const validated = validateProfile(fields);
    if (!validated.ok) return validated;
    const candidate = record.db.candidates.find((item) => item.id === record.user.candidate_id);
    Object.assign(candidate, validated.value, { profile_complete: true });
    record.user.name = validated.value.full_name;
    persist(record.db);
    return { ok: true, profile: presentCandidate(candidate) };
  }

  function searchCandidates(filters) {
    const db = loadDb();
    const record = currentRecord();
    const criteria = filters || {};
    const skill = String(criteria.skill || "").trim().toLowerCase();
    const location = String(criteria.location || "").trim().toLowerCase();
    const role = String(criteria.role || "").trim().toLowerCase();
    const work = String(criteria.work_arrangement || "").trim();
    const rawSalary = criteria.salary_max;
    const salaryMax =
      rawSalary === "" || rawSalary == null ? null : parseInteger(rawSalary);
    const alreadyInvited = new Set();
    if (record && record.user.role === "employer") {
      record.db.invitations.forEach(function (invitation) {
        if (invitation.employer_id === record.user.employer_id) {
          alreadyInvited.add(invitation.candidate_id);
        }
      });
    }

    return db.candidates
      .filter((candidate) => candidate.profile_complete)
      .filter((candidate) => !alreadyInvited.has(candidate.id))
      .filter((candidate) => {
        if (skill && !candidate.skills.some((item) => String(item).toLowerCase().includes(skill))) {
          return false;
        }
        if (location && !String(candidate.location).toLowerCase().includes(location)) return false;
        if (role && !String(candidate.preferred_role).toLowerCase().includes(role)) return false;
        if (work && candidate.preferred_work_arrangement !== work) return false;
        if (salaryMax != null && candidate.preferred_salary_min > salaryMax) return false;
        return true;
      })
      .map(presentCandidate);
  }

  function getCandidate(id) {
    const db = loadDb();
    const candidate = db.candidates.find((item) => item.id === Number(id));
    if (!candidate || !candidate.profile_complete) return null;
    return presentCandidate(candidate);
  }

  function openInvitation(db, employerId, candidateId) {
    return db.invitations.find(
      (item) =>
        item.employer_id === employerId &&
        item.candidate_id === candidateId &&
        (item.status === "pending" || item.status === "saved"),
    );
  }

  function listJobPostings() {
    const record = currentRecord();
    if (!record || record.user.role !== "employer") return [];
    return record.db.job_postings
      .filter((item) => item.employer_id === record.user.employer_id)
      .slice()
      .sort((a, b) => String(a.title).localeCompare(String(b.title)))
      .map(presentJobPosting);
  }

  function getJobPosting(id) {
    const record = currentRecord();
    if (!record || record.user.role !== "employer") return null;
    const role = record.db.job_postings.find(
      (item) => item.id === Number(id) && item.employer_id === record.user.employer_id,
    );
    return role ? presentJobPosting(role) : null;
  }

  function saveJobPosting(fields) {
    const record = currentRecord();
    if (!record || record.user.role !== "employer") {
      return fail("Sign in as an employer to manage roles.");
    }
    const validated = validateJobPosting(fields || {});
    if (!validated.ok) return validated;

    const editingId = fields && fields.id != null && fields.id !== "" ? Number(fields.id) : null;
    let role = null;
    if (editingId != null) {
      role = record.db.job_postings.find(
        (item) => item.id === editingId && item.employer_id === record.user.employer_id,
      );
      if (!role) return fail("That role could not be found.");
      Object.assign(role, validated.value, { updated_at: new Date().toISOString() });
    } else {
      role = {
        id: nextId(record.db),
        employer_id: record.user.employer_id,
        ...validated.value,
        created_at: new Date().toISOString(),
        updated_at: null,
      };
      if (!record.db.job_postings) record.db.job_postings = [];
      record.db.job_postings.push(role);
    }
    persist(record.db);
    return { ok: true, role: presentJobPosting(role) };
  }

  function deleteJobPosting(id) {
    const record = currentRecord();
    if (!record || record.user.role !== "employer") {
      return fail("Sign in as an employer to manage roles.");
    }
    const index = record.db.job_postings.findIndex(
      (item) => item.id === Number(id) && item.employer_id === record.user.employer_id,
    );
    if (index < 0) return fail("That role could not be found.");
    record.db.job_postings.splice(index, 1);
    persist(record.db);
    return { ok: true };
  }

  function createInvitation(fields) {
    const record = currentRecord();
    if (!record || record.user.role !== "employer") {
      return fail("Sign in as an employer to send an invitation.");
    }
    const validated = validateInvitation(fields || {});
    if (!validated.ok) return validated;

    const candidate = record.db.candidates.find((item) => item.id === Number(fields.candidate_id));
    if (!candidate || !candidate.profile_complete) {
      return fail("That candidate profile is not available.");
    }
    if (openInvitation(record.db, record.user.employer_id, candidate.id)) {
      return fail(
        "You already have an open invitation for this candidate. It stays open until they respond or the deadline passes.",
      );
    }

    let jobPostingId = null;
    if (fields.job_posting_id != null && fields.job_posting_id !== "") {
      const posting = record.db.job_postings.find(
        (item) =>
          item.id === Number(fields.job_posting_id) &&
          item.employer_id === record.user.employer_id,
      );
      if (!posting) return fail("Choose a saved role that belongs to your account.");
      jobPostingId = posting.id;
    }

    const invitation = {
      id: nextId(record.db),
      employer_id: record.user.employer_id,
      candidate_id: candidate.id,
      job_posting_id: jobPostingId,
      ...validated.value,
      status: "pending",
      expires_at: new Date(Date.now() + validated.expires_in_days * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      responded_at: null,
    };
    record.db.invitations.push(invitation);
    persist(record.db);
    return { ok: true, invitation: presentInvitation(invitation, record.db) };
  }

  function listInbox(view) {
    const record = currentRecord();
    if (!record || record.user.role !== "candidate") return [];
    const selected = view || "all";
    return record.db.invitations
      .filter((item) => item.candidate_id === record.user.candidate_id)
      .filter((item) => matchesView(item.status, selected))
      .sort(byNewest)
      .map((item) => presentInvitation(item, record.db));
  }

  function listSent() {
    const record = currentRecord();
    if (!record || record.user.role !== "employer") return [];
    return record.db.invitations
      .filter((item) => item.employer_id === record.user.employer_id)
      .sort(byNewest)
      .map((item) => presentInvitation(item, record.db));
  }

  function getInvitation(id) {
    const record = currentRecord();
    if (!record) return null;
    const invitation = record.db.invitations.find((item) => item.id === Number(id));
    if (!invitation) return null;
    if (record.user.role === "candidate" && invitation.candidate_id !== record.user.candidate_id) {
      return null;
    }
    if (record.user.role === "employer" && invitation.employer_id !== record.user.employer_id) {
      return null;
    }
    return presentInvitation(invitation, record.db);
  }

  function respond(id, action) {
    const record = currentRecord();
    if (!record || record.user.role !== "candidate") {
      return fail("Sign in as a candidate to respond.");
    }
    if (!["accept", "save", "decline"].includes(action)) {
      return fail("Choose accept, save, or decline.");
    }
    const invitation = record.db.invitations.find((item) => item.id === Number(id));
    if (!invitation || invitation.candidate_id !== record.user.candidate_id) {
      return fail("That invitation could not be found.");
    }
    if (invitation.status === "expired") {
      return fail("This invitation has expired.");
    }
    if (invitation.status === "accepted" || invitation.status === "declined") {
      return fail("This invitation is already " + invitation.status + ".");
    }

    if (action === "save") {
      invitation.status = "saved";
    } else if (action === "accept") {
      invitation.status = "accepted";
      invitation.responded_at = new Date().toISOString();
    } else {
      invitation.status = "declined";
      invitation.responded_at = new Date().toISOString();
    }
    persist(record.db);
    return { ok: true, invitation: presentInvitation(invitation, record.db) };
  }

  // Shown in the sign-in "Try a demo account" picker only (keeps popup short).
  const DEMO_PICKER_NAMES = ["Jordan Blake", "Maya Chen", "Alex Rivera", "Jordan Ellis"];

  function demoAccounts(options) {
    const db = loadDb();
    const pickerOnly = options && options.picker;
    const pickerNames = new Set(DEMO_PICKER_NAMES);
    return db.users
      .filter((user) => user.demo)
      .filter((user) => !pickerOnly || pickerNames.has(user.name))
      .map((user) => {
        const employer = db.employers.find((item) => item.id === user.employer_id);
        const candidate = db.candidates.find((item) => item.id === user.candidate_id);
        return {
          email: user.email,
          password: user.password,
          role: user.role,
          name: user.name,
          detail: employer
            ? employer.title + ", " + employer.company
            : candidate
              ? candidate.headline + " · " + candidate.location
              : "",
        };
      })
      .sort(function (a, b) {
        if (!pickerOnly) return 0;
        return DEMO_PICKER_NAMES.indexOf(a.name) - DEMO_PICKER_NAMES.indexOf(b.name);
      });
  }

  function resetDemoData() {
    persist(buildSeed());
    bags.session.removeItem(SESSION_KEY);
  }

  function setNotice(message, tone) {
    bags.session.setItem(
      NOTICE_KEY,
      JSON.stringify({ message: message, tone: tone || "ok" }),
    );
  }

  function takeNotice() {
    const raw = bags.session.getItem(NOTICE_KEY);
    if (!raw) return null;
    bags.session.removeItem(NOTICE_KEY);
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function setLastSearch(search) {
    bags.session.setItem(LAST_SEARCH_KEY, search || "");
  }

  function getLastSearch() {
    return bags.session.getItem(LAST_SEARCH_KEY) || "";
  }

  return {
    signIn,
    signOut,
    currentUser,
    requireRole,
    homePath,
    registerAccount,
    registerCandidate,
    getMyProfile,
    saveProfile,
    searchCandidates,
    getCandidate,
    listJobPostings,
    getJobPosting,
    saveJobPosting,
    deleteJobPosting,
    createInvitation,
    listInbox,
    listSent,
    getInvitation,
    respond,
    demoAccounts,
    resetDemoData,
    setNotice,
    takeNotice,
    setLastSearch,
    getLastSearch,
  };
});
