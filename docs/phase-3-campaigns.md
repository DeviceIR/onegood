# Phase 3 — Campaign system

## Delivered

- Public list `/campaigns` and detail `/campaigns/[slug]` via cached queries
- Tag revalidation: `campaigns` + `campaign:{slug}` on create/update/status/needs/updates
- Admin: create, edit content, status, needs CRUD, campaign updates + publish
- Components: `CampaignCard`, `CampaignProgress`, `CampaignNeedsList`, `CampaignUpdateTimeline`, `CampaignExpenseSummary`
- Homepage featured campaigns use the same cache tags

## Acceptance check

1. Log in at `/admin/login`
2. Create a campaign (DRAFT) on `/admin/campaigns`
3. Open it, add needs + an update, set status **PUBLISHED**
4. Visit `/campaigns` and `/campaigns/{slug}` — content and progress appear
5. Edit target/story — public page reflects after revalidation

## Key files

- `src/server/campaigns/queries.ts`
- `src/features/campaigns/campaign-actions.ts`
- `src/app/(admin)/admin/(dashboard)/campaigns/`
- `src/app/(public)/campaigns/`
