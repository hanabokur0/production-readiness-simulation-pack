# Contributing scenarios

The most valuable contribution is a **real production failure pattern converted into a reusable scenario**.

A good scenario should answer:

1. What failed or could fail?
2. Under what condition does the scenario apply?
3. What observable check proves the risk was exercised?
4. What evidence should be retained?
5. Should missing evidence cause REVIEW, HOLD, or REJECT?

Keep scenarios vendor-neutral when possible. Vendor-specific execution belongs in adapters.

Do not add a scenario whose only check is "an AI thinks this looks safe." Prefer inspectable evidence.
