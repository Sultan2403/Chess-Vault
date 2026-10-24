# Tasks

- Finalize and decide on product pricing and pro features and such
- Backend is done ig... I can't find any more excuses not to work on the client side lol so...
- Finalize if user data should be purged asap or after a grace period and so on. Right now, user data is purged asap and it should probably remain like that. 

## Up next

- Redo the onboarding flow since imports have been reworked.
- Import have been reworked to something better and more manageable. Seems pretty good ngl. I'm yet to test it tho. Architechture has been decided and documented in `Docs/IMPORTS.md`.
- **Finalize bidirectional sync architecture (Future vs Past)**:
  - Separate *forward sync* (importing newly played games since newest cursor) from *historical backfill* (crawling backward before the oldest imported game when capped accounts upgrade).
  - Define explicit cursor tracking and background worker strategies for both directions across Chess.com and Lichess.
  - Honestly we might need to revisit or product decision of newest first or sum.
  - -Backfill idea (later)

You only have more history than the vault holds if an import reached the cap.
On the first import that hits the cap, set a hasMoreHistory flag on the linked account.
The flag is a quick way to tell the user “you have more games on your account that aren’t imported yet”. The UI can show it without any extra checking.
When a user upgrades to pro, or otherwise gets more room and has the flag set, run a backfill to fetch the older games.
A backfill is a special case of the normal importer, with the same pipeline, going older instead of newer. It’s not a new system.
Not now. This is a later task.

Two small details from our discussion, so you don’t have to rediscover them:

Run backfills in the same platform queue at lower priority, not in a separate queue, so the one-request-at-a-time rule per platform still holds.
The boundary to go older than can be computed from your stored games (the oldest game you hold for that platform), so no extra cursor field is needed.

- Rework the UI to something that represents the app.
- Decide on platform flow: Should stats and views across Dashboard and Game Bank always default to unified (Chess.com + Lichess), or provide an explicit account/platform switcher?
- After imports we auto generate collections and all.

## Overall

- Error handling could be better. for example failed imports have a retry button but the ui doesnt really let the user know that the server is working.
- The import complete ui doesnt show but at least the core thing works. Just needs patches at the edges.
- The import also renders duplicate ui and stuff.
- Might wanna consider increasing the batches we process.
- I actually wanted to do CI but I'm hungry rn. Hopefully we'll do that later. Anyways I think we've modified the game model enough to support a huge ton of features and render some useful things on the UI so.... BACK TO FRONTEND BRO!!!!!! I'M SERIOUS! lol.
- Once it's time, make evrything in the app account oriented. For examples max-games should be per account from `Account.plan.gameBankLimit`. Similarly for analysis minutes and such.

- Investigate game storage as some games get past the game cap.
- ANALYTICSSSSSSS!!!! IT'S IMPORTANT BRO!!!
- Remove `.optional()` in Game.opening as it and it's kids are all required. This is just a knock off of the type safety task below but just more precise lol.

## Payments

- [ ] Move payments from Paystack to Baschs

## Backend

- [ ] **Verify game ↔ folder reference integrity across CRUD operations**
  - Ensure create/read/update/delete flows preserve valid, user-scoped game-folder relationships
  - Handle missing or stale folder references safely when reading games and folders
  - When deleting a folder, remove its ID from affected games (or enforce another consistent relationship strategy); when deleting a game, ensure no relationship records are left behind
  - Validate folder ownership on assignment and bulk-add/import paths; prevent duplicates and invalid cross-user references
  - Add tests for CRUD flows, stale/missing references, ownership boundaries, bulk operations, and partial failures

- DB migration for termination fielddddd. It's gonna be messy tho oh well. Especially for lichess games. Current implementation plan can go like: for chess.com map out the termination header to our termination values map. lichess doesn't quite have the same thing and it's gonna be messy so we might just delete all lichess games provided they all belong to me. Orrr we could do an annoying manual import for games one by one and then delete the old ones. I think the latter is better but it's gonna be annoying.

- Add final tests where necessary
- Add a `GET /analytics` endpoint that returns personal chess statistics such as:
  - Platform distribution
  - Result distribution
  - Time-class distribution
  - Game length statistics
  - Most-played opponents
  - Opening distribution
  - Opponent/rating statistics and trends
  - Games played over time / activity trends
  - Other useful personal insights that can be derived from the user's archived games

## Frontend

- Btw bro if you're gonna test this app then test it all over the place. the error screens, the fallbacks, the minor things, the tiny ux quirks everywhere. Don't just half-ass it and say "meh, good enough". Lol i know it's frontend but push through bro :)

- Currently frontend verify endpoint runs parallel verify requests which isnt efficient. a single endpoint that accepts an accounts array is much more scalable. 

- Normalize player stats and shit before sending it to the frontend. 

- Maybe add best moves and better moves and such to game viewer?

- Btw we might need a way to find brilliant moves and all that stuff. Hm game review?

- Folder creation and stuff should use modals.

- Error banner just feels a bit too bland. Fix that

- Make the UI feel more alive with subtle interactive animations and motion polish across auth, dashboard, and key flows (Dashboard + GameViewer done; auth pages and other surfaces still pending)
- Add a branded logo or visual identity treatment to auth pages and major app surfaces

- Make notation ledger view and all way better and user friendly on mobile.

- Theres a minor bug in the frontemd that makes pages feel slow. I think the issue is in how the components are rendered. Probably the react query hooks fetch in the bg before the ui actually updates or sumthing idk but it makes the app feel slow and is bad for ux.

### Type Safety & Validation

- Remove inappropriate `.optional()` usages where the field should not accept `undefined`; use the established default/null behavior instead
- Audit related types and schemas for unintended `undefined` values and keep optionality intentional

### Game Viewer (post-refactor tasks)

- **/ Replay Split View modals:** Replace stub buttons with proper modals (alerts were removed in refactor)
- **Stockfish WASM eval bar:** The UI for the bar needs a rework honestly.

### Later tasks (Project maintenance)

- Remove unnecessary `any` usage throughout the project; every remaining `any` must be genuinely warranted and have a concrete explanation for why it is necessary
- Do proper safeguards like linting all over including the shared folder
- Tests and stuff
- Proper ci
- Self healing deps maybe
- More ideas will be added as they land in my head
