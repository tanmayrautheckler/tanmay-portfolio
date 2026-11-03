# Partner workspace / fictional interaction study

Local portfolio work based on main cc0de0b. The project cinema was removed from the homepage, its hero link restored to the career journey, and the existing film placed after the Labs experiments.

The local reference page redirected to sign-in; its live authenticated visual appearance was not verified. Read-only source inspiration: partner portal navigation, action queue, order next action, ready-date split planner, and progress timeline in the local Headless repository. No live API, database, secret store or production site was accessed. No source business records, names, product identifiers, values, screenshots or branding were imported into the fictional workspace. The app is newly authored with existing portfolio Button/Dialog components.

Borrowed mechanics:

- Overview metrics derived from shared sample records, with clickable ready-date bars and order-stage chart.
- Searchable and filtered Orders view, including partial receipts.
- Action-first To do view with Take / Release ownership and a personal queue.
- Return response choices update the outstanding return count.
- Prepared queries reveal matching current records; no claim of live AI integration.
- Contextual order commitment drawer with quantity/date splits and a bulk date action.
- Balanced quantities and date validation before confirming.
- Shared record updates, visible batch allocations and next action.
- Ordered/received/open quantities on an independently invented partial-receipt example.
- Whole-order ready and dispatch simulation with an invented tracking reference. Per-item shipment entry is deliberately absent; splitting ready dates is distinct from shipping quantities.

All demo data is hard-coded fiction and kept in local React state. Reset and switching demos create fresh sessions. No network integration or persistence added. Existing approved QC film remains a separate, labeled interface study; it is not a recording of this new fictional workspace.

Verification: production build, scoped ESLint and four schedule validation tests passed. Browser checks at desktop 1440×1000 and mobile 390×844 covered chart drill-down, received-order filtering, search, task claiming and personal queue, commitment planning, over-allocation disabled confirmation, dispatch, return response counts, prepared query results, theme switching, mobile navigation and commitment drawer. Mobile dialog width matched its scroll width (no outer horizontal overflow). Film retained in Labs; homepage matches committed baseline. Reduced motion uses the existing MotionConfig plus explicit zero-duration transitions and CSS preference rules.

Run model checks with `node --test src/components/labs/supply-desk-model.test.mjs`.
