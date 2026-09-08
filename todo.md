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

### Game <-> Folder relationship

- Add explicit game-to-folder membership API: add a game to one or more folders
- Add explicit game-to-folder membership API: remove a game from one or more folders
- Keep `userId` as ownership and `folderIds` as optional organization membership
- Do not introduce a GameBank entity or ID
- Treat `null` as "not in any folder" rather than an empty array

### Later taks (Project maintenance)

- Do proper safeguards like linting all over including the shared folder
- Tests and stuff
- Proper ci
- Self healing deps maybe
- More ideas will be added as they land in my head
