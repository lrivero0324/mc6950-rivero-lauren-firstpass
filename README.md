# FirstPass

FirstPass is an employer-first career platform. Candidates create professional profiles. Employers search those profiles and send interview invitations. Candidates review each invitation and respond without submitting a traditional job application.

This repository is the project home for FirstPass, developed by Lauren A. Rivero for MMC 6950: Capstone — Web Design and Online Communication at the University of Florida.


## Why it exists

Typical job boards put most of the early work on applicants. Candidates send many similar applications. Employers then sort large piles of résumés to find a match.

FirstPass reverses that sequence. Employers discover people through profiles and preferences, then invite them with the details a candidate needs to decide: role, salary range, work arrangement, a short summary, and why the employer is interested.


## MVP

The minimum viable product covers one hiring loop and nothing extra:

1. A candidate saves a searchable profile.
2. An employer finds and reviews that candidate.
3. The employer sends a complete interview invitation.
4. The candidate reviews the invitation and responds before the deadline.


### Core features

| Feature | What it does |
| --- | --- |
| **Candidate Profiles** | Candidates add name, title, location, summary, skills, experience, education, portfolio URL, desired role, minimum salary, and work arrangement. |
| **Candidate Search and Filtering** | Employers filter by role, skills, work arrangement, and salary minimum, then open a full profile. |
| **Interview Invitations** | Employers send an invitation that includes role title, salary range, work arrangement, role summary, reason for interest, and a response window. |
| **Invitation Inbox** | Candidates see incoming invitations with status and time remaining, and can sort All, Active, Saved, and Past. |
| **Responses, Status, and Expiration** | Candidates choose Accept Interview, Save for Later, or Decline Interview. Statuses are Pending, Saved, Accepted, Declined, and Expired. Save for Later does not extend the deadline. Unanswered invitations expire. |

Accepting an invitation means the candidate is willing to interview. It is not an acceptance of a job offer.

### Screens

The MVP wireframes cover six screens:
1. Candidate Profile Setup
2. Employer Candidate Search
3. Employer Candidate Profile
4. Send Interview Invitation
5. Candidate Invitation Inbox
6. Candidate Invitation Detail / Response


## Technology

| Layer | Choice |
| --- | --- |
| Front end | React |
| Back end | Django and Django REST Framework |
| Data | Application database (candidate profiles, invitations, deadlines, and status) |
| Hosting | Vercel for the React front end; a Django-compatible host for the API |
| Version control | GitHub |

FirstPass does not use an external job-board, résumé, or salary API. Candidates and employers create the data the product needs.

A proof of concept already exists in two companion repositories:

- [Frontend POC](https://github.com/lrivero0324/mc6950-rivero-lauren-assignment1.2-frontend)
- [Backend POC](https://github.com/lrivero0324/mc6950-rivero-lauren-assignment1.2-backend)


Application source code for the full MVP will be added to this repository as development continues.


## Out of scope for the MVP

These can wait until the core loop works:
- Direct messaging
- Built-in interview scheduling
- Email or in-app notifications
- Automated matching or recommendations
- Employer analytics
- Advanced portfolio presentation
- Saved employer searches

