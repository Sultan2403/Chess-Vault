# Tasks

- Finalize and decide on product pricing and pro features and such
- Backend is done ig... I can't find any more excuses not to work on the client side lol so...

## Overall

- I actually wanted to do CI but I'm hungry rn. Hopefully we'll do that later. Anyways I think we've modified the game model enough to support a huge ton of features and render some useful things on the UI so.... BACK TO FRONTEND BRO!!!!!! I'M SERIOUS! lol. 
- Once it's time, make evrything in the app account oriented. For examples max-games should be per account from `Account.plan.gameBankLimit`. Similarly for analysis minutes and such.

- Investigate game storage as some games get past the game cap.
- Sync up socket.io implementation with the frontend and add explicit flows for importing games
- ANALYTICSSSSSSS!!!! IT'S IMPORTANT BRO!!!
- Remove `.optional()` in Game.opening as it and it's kids are all required. This is just a knock off of the type safety task below but just more precise lol.

## Backend

- DB migration for termination fielddddd. It's gonna be messy tho oh well. Especially for lichess games. Current implementation plan can go like: for chess.com map out the termination header to our termination values map. lichess doesn't quite have the same thing and it's gonna be messy so we might just delete all lichess games provided they all belong to me. Orrr we could do an annoying manual import for games one by one and then delete the old ones. I think the latter is better but it's gonna be annoying.

- Add proper tests for tags to make sure they are normalized the right way and deduplicated

- Add flags for the chess importers so we don't attempt to process non-standard chess games i.e chess variations like bughouse, 4 player chess and so on. I mean we can allow them but add flags to indicate that they are non-standard. If we do allow them, maybe something like chess960 that won't break the entire model. 

For lichess games, the flag is `variant: "standard"` and for chess.com its `rules: "chess"` 

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

- Rename search ui to be filtering by win loss or draw instead of numbers like 1-0, 0-1, and 0-0

- Maybe add best moves and better moves and such to game viewer?

- Btw we might need a way to find brilliant moves and all that stuff. Hm game review? 

- Folder creation and stuff should use modals. 

- Error modal just feels a bit too bland. Fix that

- Add fallback routes for 404s and other errors. Currently the app just shows a blank page when a route is not found or when an error occurs.

- Make the UI feel more alive with subtle interactive animations and motion polish across auth, dashboard, and key flows (Dashboard + GameViewer done; auth pages and other surfaces still pending)
- Add a branded logo or visual identity treatment to auth pages and major app surfaces

- Maybe change the notation ledger in the frontend when on mobile for better ux. Like the notation ledger should become horizontal so users can see moves without having to scroll and all. 

- Theres a minor bug in the frontemd that makes pages feel slow. I think the issue is in how the components are rendered. Probably the react query hooks fetch in the bg before the ui actually updates or sumthing idk but it makes the app feel slow and is bad for ux.

### Type Safety & Validation

- Remove inappropriate `.optional()` usages where the field should not accept `undefined`; use the established default/null behavior instead
- Audit related types and schemas for unintended `undefined` values and keep optionality intentional

### Game Viewer (post-refactor tasks)

- **Real folder names in `MatchFilePanel`:** Currently shows "In N collection(s)" count. To show real names, backend needs a multi-ID folder lookup endpoint (e.g. `GET /folders?ids[]=...`). Once supported, replace count with real folder name chips.
- **Move to Collection modal:** Replace the stub button in `GameActionsPanel` with a real folder-assignment modal
- **Share / Replay Split View modals:** Replace stub buttons with proper modals (alerts were removed in refactor)
- **Stockfish WASM eval bar:** The UI for the bar needs a rework honestly. 

### Later tasks (Project maintenance)

- Remove unnecessary `any` usage throughout the project; every remaining `any` must be genuinely warranted and have a concrete explanation for why it is necessary
- Do proper safeguards like linting all over including the shared folder
- Tests and stuff
- Proper ci
- Self healing deps maybe
- More ideas will be added as they land in my head
