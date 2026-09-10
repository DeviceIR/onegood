You are a senior product architect, UX designer, frontend architect, backend architect, and technical project manager.

I want you to PLAN a real-world charity / social impact platform before writing any code.

Do NOT start implementing the application yet.

Your first task is to deeply analyze the product idea, identify missing requirements, propose the architecture, define the UX, data model, pages, components, backend APIs, admin panel, payment architecture, security requirements, and implementation phases.

## PROJECT

Working brand name:

HAFEZ

Persian brand:

حافظ خوبی‌ها

Possible English tagline:

Keeping Goodness Alive.

The idea started from a real situation.

My mother and I wanted to help two elementary school children who could not afford basic school supplies. We bought them things such as school bags, notebooks, pens, pencils, and other necessary supplies.

Then a friend told me that he also wanted to help several students.

This made me think about creating a larger and more organized platform where people in our local community can contribute to helping students and families who need support.

The platform should make charitable work:

- easier
- more organized
- transparent
- measurable
- trustworthy
- visually beautiful
- emotionally meaningful

The core philosophy is:

A small contribution can create a real change.

The platform should not feel like a generic donation website.

It should feel like a modern, trustworthy social-impact product.

---

# CORE PRODUCT

Users should be able to:

1. Discover current charity campaigns.
2. Understand exactly what each campaign needs.
3. Contribute financially.
4. Optionally display their name.
5. Optionally display their donation amount.
6. See the impact created by donations.
7. See photos and videos of completed activities.
8. Read testimonials.
9. Contact the organization.
10. Volunteer or participate in future activities.

The platform should prioritize transparency and trust.

---

# HOMEPAGE

Design the homepage as a premium modern social-impact website.

The page should contain:

## 1. HERO

Introduce HAFEZ.

The emotional message should communicate:

"Helping good things continue."

The hero should contain:

- brand
- short mission statement
- primary CTA: مشارکت در یک کمک
- secondary CTA: مشاهده اثر کمک‌ها

Avoid generic charity clichés.

The visual language should feel modern, warm, human, premium, and trustworthy.

---

# 2. 3D IMPACT CARD

Create a visually impressive 3D / glass / interactive impact card.

It should display real platform statistics:

- Total donations
- Students helped
- Completed campaigns
- Number of contributors

Example:

Total impact:

12,850,000 تومان

Students helped:

37

Campaigns completed:

12

Contributors:

84

The card should have subtle motion and depth.

Do not sacrifice accessibility or performance for visual effects.

---

# 3. DONATION ACTIVITY

Show recent donations.

Each donation can contain:

- donor name
- amount
- date
- campaign

However, donors must control privacy.

When donating, users should be able to choose:

[ ] نمایش نام من

[ ] نمایش مبلغ کمک من

If name is hidden:

"یک خیر"

If amount is hidden:

"مبلغ نامشخص"

Never expose private donor information without consent.

---

# 4. IMPACT GALLERY

Create a section showing real-world impact.

Examples:

- school supplies
- backpacks
- notebooks
- clothing
- food packages
- completed purchases
- delivery
- community activities

Each item should contain:

- image
- short description
- campaign
- date

The UI should make the user feel that their money becomes a real-world result.

---

# 5. VIDEOS

Create a video section for real videos from charity activities.

Support:

- video thumbnail
- title
- description
- date
- campaign

Do not autoplay videos with sound.

Use lazy loading.

---

# 6. TESTIMONIALS

Create testimonials from:

- donors
- volunteers
- community members
- teachers
- beneficiaries when appropriate and ethically permitted

Do not exploit children emotionally.

The design should maintain dignity and privacy.

---

# 7. ACTIVE CAMPAIGNS

Create campaign cards.

Each campaign should show:

- title
- description
- cover image
- target amount
- collected amount
- percentage
- deadline
- number of contributors
- CTA

Example:

🎒 School Supplies

Target:
30,000,000 تومان

Collected:
18,400,000 تومان

Progress:
61%

CTA:

مشارکت در این کمک

Each campaign should have a dedicated detail page.

---

# 8. CAMPAIGN DETAIL PAGE

Create a complete campaign page containing:

- campaign story
- goal
- required items
- target amount
- current amount
- progress
- deadline
- contributors
- photos
- videos
- expenses
- receipts
- updates
- donation CTA

Transparency is a core feature.

---

# 9. TRANSPARENCY

Create a dedicated transparency section/page.

Users should be able to see:

Total money received

Total money spent

Remaining balance

Campaign-specific expenses

Purchase receipts

Delivery costs

Other legitimate expenses

Example:

Received:
25,000,000 تومان

School supplies:
18,500,000 تومان

Transportation:
1,200,000 تومان

Remaining:
5,300,000 تومان

The system must distinguish between:

DONATION

EXPENSE

REFUND

TRANSFER

OTHER

Never fake or invent financial information.

---

# ADMIN PANEL

The application must have a secure admin dashboard.

Admin dashboard:

- total donations
- successful payments
- failed payments
- active campaigns
- completed campaigns
- students helped
- expenses
- remaining funds
- recent activity

## Donation management

Admin can view:

- donor
- amount
- campaign
- payment ID
- payment gateway
- payment status
- created date
- privacy preferences

Statuses:

PENDING
SUCCESS
FAILED
CANCELLED
REFUNDED

Admin must NOT be able to accidentally modify verified payment records without an audit trail.

---

# CAMPAIGN MANAGEMENT

Admin can:

- create campaign
- edit campaign
- publish/unpublish
- upload images
- upload videos
- define target
- define deadline
- add updates
- add expenses
- upload receipts
- mark campaign completed

---

# MEDIA MANAGEMENT

Admin should be able to manage:

- images
- videos
- testimonials
- campaign updates

Optimize images automatically.

Use lazy loading.

Do not load large original images unnecessarily.

---

# DONATION FLOW

Design a secure donation flow.

User selects:

Campaign

Amount

Optional message

Display name?

Display amount?

Then:

Create payment

Redirect to payment gateway

Return to callback

Verify payment server-side

Create successful donation record

Show success page

Generate a donation reference / tracking ID.

Do NOT trust the client for payment success.

---

# PAYMENT ARCHITECTURE

Use a payment abstraction layer.

Do not tightly couple the application to one gateway.

Architecture should support:

PaymentGateway interface

ZarinPalGateway

FutureGateway

For example:

createPayment()

verifyPayment()

refundPayment()

The frontend must never contain secret payment credentials.

All sensitive payment credentials must remain server-side.

---

# ZARINPAL

The project should be architected so ZarinPal can be integrated as the initial payment provider.

Research and document:

- required merchant/account information
- authentication
- payment creation
- redirect
- callback
- verification
- payment status handling
- error handling
- idempotency
- transaction tracking
- production vs sandbox configuration

Do not invent undocumented API behavior.

If documentation is needed, explicitly identify what must be verified from official ZarinPal documentation.

---

# LEGAL / COMPLIANCE

Because this is a charity platform, identify all legal and compliance questions that must be resolved before public fundraising.

Create a section in the plan called:

LEGAL REQUIREMENTS TO VERIFY

Include:

- legal status of the organization
- charity / NGO registration
- required permissions
- bank account ownership
- payment gateway requirements
- tax/accounting considerations
- donation receipts
- privacy requirements
- terms of use
- financial transparency
- child privacy
- consent for publishing children's photos/videos
- data retention
- deletion requests
- financial reporting

Do NOT assume that a normal personal bank account is sufficient for public charitable fundraising.

Clearly separate:

TECHNICAL REQUIREMENTS

from

LEGAL REQUIREMENTS

and mark legal assumptions that require professional confirmation.

---

# CHILD SAFETY AND PRIVACY

This is extremely important.

The platform may involve children.

Design the system so that:

- children's full names are not publicly exposed by default
- exact addresses are never publicly exposed
- school details should be minimized when necessary
- photos/videos require appropriate consent
- sensitive personal information is never displayed
- stories should preserve dignity
- no exploitative imagery
- no unnecessary identifying information

Create a privacy model for beneficiary profiles.

---

# SECURITY

Plan for:

- authentication
- authorization
- admin roles
- rate limiting
- CSRF protection where relevant
- XSS prevention
- SQL injection prevention
- secure cookies
- environment secrets
- webhook/callback verification
- payment idempotency
- audit logs
- file upload validation
- MIME validation
- image processing
- maximum upload size
- malware considerations
- logging
- backups

---

# TECH STACK

Assume this stack unless there is a strong reason to recommend otherwise:

Frontend:

Next.js
App Router
TypeScript
Tailwind CSS
shadcn/ui
Framer Motion
Lucide React

Backend:

Next.js server-side APIs OR a separate backend if justified.

Database:

PostgreSQL

ORM:

Prisma

Authentication:

Choose an appropriate secure solution.

Storage:

Object storage for images/videos.

Payments:

ZarinPal abstraction.

Deployment:

Vercel or another appropriate production architecture.

Explain every major technology choice.

---

# DESIGN SYSTEM

The design should be:

- modern
- warm
- premium
- minimal
- human
- trustworthy
- accessible

Avoid:

- excessive gradients
- generic NGO aesthetics
- excessive rounded cards
- unnecessary animations
- dark patterns
- emotional manipulation

Use subtle motion.

Potential visual language:

- warm neutral background
- soft green / emerald accent
- cream
- charcoal
- white
- subtle gold accent

Typography should support Persian and English.

RTL must be first-class.

Use:

Vazirmatn

or another high-quality Persian font if justified.

---

# RESPONSIVE DESIGN

Design for:

Desktop

Tablet

Mobile

Do not simply shrink the desktop UI.

Define mobile-specific layouts where necessary.

---

# ACCESSIBILITY

Plan for:

WCAG-oriented accessibility.

Include:

- keyboard navigation
- focus states
- semantic HTML
- screen-reader labels
- sufficient contrast
- reduced motion
- accessible forms
- accessible donation flow

---

# SEO

Plan:

- metadata
- OpenGraph
- Twitter/X cards
- sitemap
- robots
- canonical URLs
- structured data where appropriate
- campaign SEO pages
- Persian SEO
- English SEO if bilingual

---

# ANALYTICS

Plan analytics while respecting privacy.

Track useful events such as:

campaign_view

donation_started

donation_completed

donation_failed

campaign_shared

volunteer_form_submitted

Do not collect unnecessary personal information.

---

# DATABASE

Design the complete database schema.

At minimum consider:

User

Admin

Donor

Campaign

Donation

Payment

Expense

Receipt

Media

Testimonial

CampaignUpdate

VolunteerApplication

ContactMessage

AuditLog

Consent

Beneficiary / ImpactRecord

Define relationships, indexes, constraints, enums, and important fields.

Pay particular attention to financial integrity.

---

# FINANCIAL DATA

Financial records must be immutable or auditable.

Never simply overwrite historical financial information.

Use:

createdAt

updatedAt

verifiedAt

transaction/reference IDs

audit records

and appropriate status transitions.

---

# UX FLOW

Define complete user journeys for:

1. First-time visitor

2. Donor

3. Anonymous donor

4. Returning donor

5. Volunteer

6. Admin

7. Campaign manager

8. User who starts but abandons payment

9. Failed payment

10. Successful payment

---

# PAGES

Define all required routes.

Example:

/

 /campaigns

 /campaigns/[slug]

 /donate/[campaign]

 /impact

 /transparency

 /about

 /contact

 /volunteer

 /privacy

 /terms

 /donation/success

 /donation/failed

 /donation/callback

 /admin

 /admin/campaigns

 /admin/donations

 /admin/expenses

 /admin/media

 /admin/testimonials

 /admin/volunteers

 /admin/settings

Add or remove routes where appropriate.

---

# COMPONENT ARCHITECTURE

Define reusable components.

Examples:

ImpactCard

DonationActivity

CampaignCard

CampaignProgress

DonationForm

PaymentStatus

ImpactGallery

VideoGallery

TestimonialCard

TransparencyTable

ExpenseItem

ReceiptViewer

AdminSidebar

AdminDataTable

StatsCard

MediaUploader

CampaignEditor

etc.

Do not create unnecessary abstractions.

---

# PROJECT STRUCTURE

Propose a scalable folder structure.

Prefer feature/domain-oriented architecture where appropriate instead of putting everything into generic folders.

Show the complete proposed tree.

---

# IMPLEMENTATION PHASES

Break the project into phases.

Phase 0:
Architecture and decisions

Phase 1:
Foundation

Phase 2:
Public website

Phase 3:
Campaign system

Phase 4:
Donation/payment system

Phase 5:
Admin dashboard

Phase 6:
Transparency system

Phase 7:
Media system

Phase 8:
Security

Phase 9:
SEO/accessibility

Phase 10:
Production deployment

Phase 11:
Legal/payment activation

For every phase define:

- goals
- tasks
- dependencies
- acceptance criteria
- risks

---

# MVP

Clearly distinguish:

MUST HAVE

SHOULD HAVE

NICE TO HAVE

Do not over-engineer the MVP.

---

# IMPORTANT

Do NOT write application code yet.

Do NOT create files yet.

Do NOT install packages yet.

Do NOT make assumptions about undocumented payment APIs.

First produce a comprehensive implementation plan.

At the end provide:

1. Product summary
2. Recommended brand direction
3. UX architecture
4. Page architecture
5. Component architecture
6. Database schema
7. API architecture
8. Payment architecture
9. Admin architecture
10. Security architecture
11. Legal requirements to verify
12. Privacy / child-safety model
13. Folder structure
14. Implementation phases
15. MVP scope
16. Risks
17. Open questions
18. Recommended next step

Then STOP and wait for my approval before implementation.