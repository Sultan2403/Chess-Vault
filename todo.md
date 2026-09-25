# Tasks

- Finalize and decide on product pricing and pro features and such
- Backend is done ig... I can't find any more excuses not to work on the client side lol so...

## Overall

- Implemnt socket.io for importing games. And make games a background task using bullmq
- ANALYTICSSSSSSS!!!! IT'S IMPORTANT BRO!!!
- Add stockfish wasm for analysis on the client side
- Remove `.optional()` in Game.opening as it and it's kids are all required. This is just a knock off of the type safety task below but just more precise lol. 

## Backend

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

- Maybe add time control/time rendering to game viewer? 
- Polish frontend and fix any bugs
- Make player context i.e username derived from account data
- Onboarding validation enforced but UI is shitty soo fix that.
- Make the UI feel more alive with subtle interactive animations and motion polish across auth, dashboard, and key flows
- Add a branded logo or visual identity treatment to auth pages and major app surfaces
- Mini chessboard apparently renders the same freaking position for all games... investigate and fix

- Theres a minor bug in the frontemd that makes pages feel slow. I think the issue is in how the components are rendered. Probably the react query hooks fetch in the bg before the ui actually updates or sumthing idk but it makes the app feel slow and is bad for ux. 

### Type Safety & Validation

- Remove inappropriate `.optional()` usages where the field should not accept `undefined`; use the established default/null behavior instead
- Audit related types and schemas for unintended `undefined` values and keep optionality intentional

### Later taks (Project maintenance)

- Remove unnecessary `any` usage throughout the project; every remaining `any` must be genuinely warranted and have a concrete explanation for why it is necessary
- Do proper safeguards like linting all over including the shared folder
- Tests and stuff
- Proper ci
- Self healing deps maybe
- More ideas will be added as they land in my head
