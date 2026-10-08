# Tasks

- Finalize and decide on product pricing and pro features and such
- Backend is done ig... I can't find any more excuses not to work on the client side lol so...

## Overall

- I actually wanted to do CI but I'm hungry rn. Hopefully we'll do that later. Anyways I think we've modified the game model enough to support a huge ton of features and render some useful things on the UI so.... BACK TO FRONTEND BRO!!!!!! I'M SERIOUS! lol. 
- Once it's time, make evrything in the app account oriented. For examples max-games should be per account from `Account.plan.gameBankLimit`. Similarly for analysis minutes and such.

- Investigate game storage as some games get past the game cap.
- Sync up socket.io implementation with the frontend and add explicit flows for importing games
- ANALYTICSSSSSSS!!!! IT'S IMPORTANT BRO!!!
- Add stockfish wasm for analysis on the client side
- Remove `.optional()` in Game.opening as it and it's kids are all required. This is just a knock off of the type safety task below but just more precise lol.

## Backend

- Add proper tests for tags to make sure they are normalized the right way and deduplicated

- Add flags for the chess importers so we don't attempt to process non-standard chess games i.e chess variations like bughouse, 4 player chess and so on. I mean we can allow them but add flags to indicate that they are non-standard. If we do allow them, maybe something like chess960 that won't break the entire model. 

For lichess games, the flag is `variant: "standard"` and for chess.com its `rules: "chess"` 

- Implement socket.io for real time feed for imports. But plan the architechture properly cus I have no idea on how to go about this fr. Well import service will need to semd stautus reports... But in the end imports will go through bullmq from now on so the api just dispatches a 202 accepted...
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

- Debug why stockfish isn't working. 
current hepful loogs: [Stockfish] effect setup started
useStockfish.ts:21 [Stockfish] Creating worker /stockfish/stockfish-19-lite-single.js#/stockfish/stockfish-19-lite-single.wasm,worker
useStockfish.ts:25 [Stockfish] Worker constructed Worker {onmessage: null, onerror: null}onmessageerror: (event) => {…}onerror: (event) => {…}onmessage: (event) => {…}[[Prototype]]: Worker
useStockfish.ts:62 [Stockfish] Worker handlers attached
useStockfish.ts:32 [Stockfish] Sending UCI command uci
useStockfish.ts:64 [Stockfish] Initial UCI command sent
useStockfish.ts:65 [Stockfish] Cleaning up worker
useStockfish.ts:32 [Stockfish] Sending UCI command quit
useStockfish.ts:20 [Stockfish] effect setup started
useStockfish.ts:21 [Stockfish] Creating worker /stockfish/stockfish-19-lite-single.js#/stockfish/stockfish-19-lite-single.wasm,worker
useStockfish.ts:25 [Stockfish] Worker constructed Worker {onmessage: null, onerror: null}onmessageerror: (event) => {…}length: 1name: ""arguments: (...)caller: (...)[[FunctionLocation]]: useStockfish.ts:61[[Prototype]]: ƒ ()[[Scopes]]: Scopes[4]onerror: (event) => {…}onmessage: (event) => {…}length: 1name: ""arguments: (...)caller: (...)[[FunctionLocation]]: useStockfish.ts:41[[Prototype]]: ƒ ()[[Scopes]]: Scopes[4][[Prototype]]: Worker
useStockfish.ts:62 [Stockfish] Worker handlers attached
useStockfish.ts:32 [Stockfish] Sending UCI command uci
useStockfish.ts:64 [Stockfish] Initial UCI command sent

maybe use a fetch to confirm stockfish is working and then send the uci command. I think the issue is that the worker isn't ready when we send the uci command.

- Player perspective seems broken. Investigate and fix. In game viewer seems like the wrong player is rendered. and then the perpective should always default to the user's perspective. Basically stuff's broken.

- Rename search ui to be filtering by win loss or draw instead of numbers like 1-0, 0-1, and 0-0

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
- **Stockfish WASM eval bar:** Wire `EvalBar` to real engine evaluation (currently shows placeholder values)

### Later tasks (Project maintenance)

- Remove unnecessary `any` usage throughout the project; every remaining `any` must be genuinely warranted and have a concrete explanation for why it is necessary
- Do proper safeguards like linting all over including the shared folder
- Tests and stuff
- Proper ci
- Self healing deps maybe
- More ideas will be added as they land in my head
