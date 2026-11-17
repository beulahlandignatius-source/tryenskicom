# Product decision log

This log records decisions and the reasoning that should be visible to future contributors. Entries below describe the current product direction or implementation constraints; confirm ownership and dates before treating them as formal historical decisions.

| Decision / direction | Rationale | Trade-off or follow-up |
|---|---|---|
| Organise experiences around learner, creator and affiliate roles | Their primary tasks and information needs differ | Ensure shared patterns remain consistent and role permissions are enforced server-side |
| Bring learning resources, creator products and related opportunities into one platform concept | Supports the Learn, Grow, Earn product proposition | Validate whether users understand the breadth of the offering |
| Keep the current repository documented as a frontend prototype | Avoids overstating integrations that are not present | Update status only after implementation and testing evidence exists |
| Treat the current login experience as demo-only | Current auth form selects a local demo profile rather than verifying an account | Implement and test real authentication before production use |
| Keep wallet and payout claims scoped to confirmed payment capabilities | Financial status must be trustworthy | Document currency, provider, fees, settlement and failure rules before launch |

## Decision record template

- **Date:**
- **Status:** Proposed / Accepted / Superseded
- **Context:**
- **Decision:**
- **Alternatives considered:**
- **Reasoning:**
- **Trade-offs:**
- **Owner:**
- **Review trigger:**
