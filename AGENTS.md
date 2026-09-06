# AGENTS.md

## Purpose

This file contains the general guidelines for AI agents working anywhere in the Chess Vault repository.

For product strategy, product scope, vision, terminology, and feature direction, refer to:

PRODUCT_DIRECTION.md

PRODUCT_DIRECTION.md is the source of truth for product direction.

This file is the source of truth for how agents should work.

---

## 1. Respect the Existing Project

Do not assume a new architecture, pattern, naming convention, folder structure, or abstraction is needed.

Before introducing something new:

* inspect the surrounding code
* look for existing patterns
* follow established conventions where they make sense
* reuse existing utilities and abstractions when appropriate
* avoid unnecessary refactors

Do not create a new pattern when an established project pattern already exists.

---

## 2. Shared Types and Single Definition Rule

Types that are reused must be declared once and for all in a central location—never duplicated across multiple files.

* If a type is shared between the client and the server, it must live in shared (e.g., @shared/types or shared/types).
* Do not re-declare or redefine existing types locally when an established shared type exists.

---

## 3. Protect the Core Game Type

The Game type is the core model of the entire application and must not be modified recklessly.

The authoritative Game model is defined as:

type Game = {
    id: string;
    userId: string;
    folderId: string;
    platform: "chess.com" | "lichess";
    platformGameId: string;
    sourceUrl: string;
    whitePlayer: {
        username: string;
        rating: number;
    };
    blackPlayer: {
        username: string;
        rating: number;
    };
    result: "white" | "black" | "draw";
    isRated: boolean;
    timeClass: "ultraBullet" | "bullet" | "blitz" | "rapid" | "classical" | "daily" | "correspondence";
    playedAt: Date;
    pgn: string;
    title?: string | undefined;
    notes?: string | undefined;
    tags?: string | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
}

* Avoid altering, deleting, or renaming fields in Game without explicit user instruction.
* If the Game type is modified, you must update every single reference, schema, service, interface, and test across the entire project that depends on it.

---

## 4. Do Not Invent Patterns

Do not introduce new conventions simply because they are personally preferred or commonly used elsewhere.

For example, do not arbitrarily introduce:

* a new API pattern
* a new state-management pattern
* a new folder structure
* a new naming convention
* a new abstraction layer
* a new dependency
* a new error-handling strategy

when the repository already has an established way of doing the same thing.

Consistency is generally more valuable than personal preference.

---

## 5. When Unsure, Inspect First

Before making a structural decision, inspect similar existing implementations.

Look at:

* nearby files
* related features
* existing API modules
* existing hooks
* existing schemas
* existing services
* existing components
* existing tests

Use the codebase itself as evidence.

Do not guess when the answer can be determined by inspecting the repository.

---

## 6. When the Pattern Is Unclear, Tell the User

If the repository does not clearly establish a pattern and the choice would meaningfully affect the project, do not silently invent one.

Tell the user that the pattern is unclear and explain the reasonable options.

For example:

> I couldn't find an established pattern for this in the codebase. There are two reasonable approaches here. I'd rather confirm the direction before introducing a new convention.

Do not pretend certainty where there isn't any.

---

## 7. Do Not Break Existing Patterns Without Reason

Do not replace an existing pattern simply because another approach is cleaner in isolation.

A new approach should have a concrete reason, such as:

* the existing pattern no longer fits
* the existing pattern causes a real problem
* the user explicitly requested the change
* the architecture is intentionally being refactored

Avoid unnecessary churn.

---

## 8. Keep Changes Scoped

Make the smallest coherent change needed to complete the task.

Do not turn:

> "Add this endpoint"

into:

> "Rewrite the API architecture."

Do not turn:

> "Fix this component"

into:

> "Refactor the entire frontend."

Avoid unrelated cleanup unless it is necessary for the requested change.

---

## 9. Preserve Existing Work

Do not overwrite, delete, reset, or modify unrelated work.

Assume that existing changes may be intentional.

Before making destructive changes, make sure they are actually required.

Never use broad cleanup or reset operations casually.

---

## 10. Product Direction

Before implementing a meaningful product feature, refer to:

PRODUCT_DIRECTION.md

Use it to understand the intended direction of Chess Vault.

Do not silently make product decisions that contradict it.

If a requested feature appears to conflict with the current product direction, tell the user.

For example:

> This implementation is possible, but it appears to move the product in a different direction from PRODUCT_DIRECTION.md. Do you want Chess Vault's direction to evolve, or should we solve the requirement another way?

The user decides whether the product direction changes.

---

## 11. Product Direction Is Allowed to Evolve

Do not treat PRODUCT_DIRECTION.md as immutable.

The product may evolve.

When the user intentionally changes the direction:

* follow the new direction
* identify relevant consequences
* update documentation when appropriate
* avoid continuing to enforce obsolete assumptions

The important thing is that changes in direction are intentional rather than accidental.

---

## 12. Avoid Premature Complexity

Prefer the simplest solution that satisfies the current requirement.

Do not add complexity purely for hypothetical future needs.

This includes unnecessary:

* abstractions
* services
* wrappers
* configuration
* dependencies
* infrastructure
* generalized frameworks

Future-proofing is useful when it is cheap and natural.

It should not make the current project harder to understand.

---

## 13. Follow Existing Dependencies

Before adding a dependency, check whether the project already has something suitable.

Do not introduce a library simply because:

* it is popular
* it is the standard choice elsewhere
* an AI-generated example used it
* it makes one small task slightly easier

New dependencies should have a clear reason.

---

## 14. Keep Responsibilities Clear

Respect the responsibilities already established by the project.

Do not move logic between layers arbitrarily.

For example, if an existing architecture separates:

UI
→
Hooks / Application Logic
→
API
→
Backend
→
Database

do not bypass those boundaries without a reason.

Follow the project's actual architecture rather than inventing a new one for a single task.

---

## 15. Match Existing Naming and Style

When adding files or code, generally follow the naming and formatting conventions already used in the relevant part of the repository.

Do not introduce a different style merely because you prefer it.

Consistency matters.

---

## 16. Do Not Over-Abstract

Only create an abstraction when it provides a real benefit.

Avoid abstractions that exist primarily to:

* make code look architectural
* reduce a few repeated lines
* prepare for hypothetical future requirements
* imitate patterns from another codebase

Prefer straightforward code when straightforward code is enough.

---

## 17. Validate Assumptions

Do not confidently claim that something works without checking it when it can reasonably be checked.

Inspect:

* relevant files
* configuration
* package versions
* existing implementations
* types
* tests
* build output

When something cannot be verified, say so.

---

## 18. Handle Errors Honestly

Do not hide failures.

If an implementation is incomplete, blocked, or uncertain, state that clearly.

Do not claim:

* a feature is fully implemented when it is not
* tests passed when they were not run
* a build succeeded when it was not verified
* an API works when it was not checked

Accuracy is more important than appearing successful.

---

## 19. Test Relevant Changes

When practical, verify meaningful changes with the project's existing tooling.

Prioritize testing:

* changed behavior
* important business logic
* API behavior
* validation
* authorization
* regressions

Do not create unnecessary tests simply for coverage.

---

## 20. Security

Never commit or expose secrets.

Do not hardcode:

* API keys
* passwords
* tokens
* private credentials
* production secrets

Respect authentication and authorization boundaries.

Never rely on frontend behavior as the only protection for user data.

---

## 21. Documentation

When a change materially affects architecture, behavior, conventions, or product direction, update the relevant documentation.

Do not create documentation for every trivial change.

Keep documentation aligned with reality.

---

## 22. Communication

When finishing a task, clearly communicate:

* what was changed
* anything important that was intentionally left unchanged
* relevant verification performed
* any uncertainty or follow-up decision required

Do not hide important tradeoffs.

---

## 23. Decision Hierarchy

When making a decision, generally use this order:

1. User's explicit request
2. Product direction in PRODUCT_DIRECTION.md
3. Core domain types (e.g., Game model in shared)
4. Existing project patterns
5. Established technical constraints
6. Simplest reasonable implementation
7. Personal preference

Personal preference should be the weakest consideration.

---

## 24. The Core Rule

When working on Chess Vault:

> Do not invent what the project has not established.

Inspect first.

Follow existing patterns.

Keep shared types centralized.

Protect the Game model.

Keep changes focused.

Respect PRODUCT_DIRECTION.md.

And when the correct approach is genuinely unclear:

> Tell the user instead of silently deciding for them.