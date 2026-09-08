# Tasks

- Finalize and decide on product pricing and pro features and such
- Backend is done ig... I can't find any more excuses not to work on the client side lol so...

## Frontend

- Polish frontend and fix any bugs
- Make sure chess game viewer works correctly
- Fix up accounts on frontend
- Make accounts use clerk account context and clerk controls.
- Make player context i.e username derived from account data
- Enforce onboarding validation so users must provide at least one valid platform username before importing games
- Add a clear empty-state/onboarding guard for no imported games and no selected accounts
- Make the UI feel more alive with subtle interactive animations and motion polish across auth, dashboard, and key flows
- Add a branded logo or visual identity treatment to auth pages and major app surfaces
- In game viewer.tsx add support for keyboard arrow key controls and a board flipping feature that defaults to the perspective of the user's color in the game, and allow users to flip the board manually as well

### Game <-> Folder relationship

- Add explicit game-to-folder membership API: add a game to one or more folders
- Add explicit game-to-folder membership API: remove a game from one or more folders
- Keep `userId` as ownership and `folderIds` as optional organization membership
- Do not introduce a GameBank entity or ID
- Treat `null` as "not in any folder" rather than an empty array

### Type Safety & Validation

- Remove inappropriate `.optional()` usages where the field should not accept `undefined`; use the established default/null behavior instead
- Audit related types and schemas for unintended `undefined` values and keep optionality intentional

### Later taks (Project maintenance)

- Do proper safeguards like linting all over including the shared folder
- Tests and stuff
- Proper ci
- Self healing deps maybe
- More ideas will be added as they land in my head
 