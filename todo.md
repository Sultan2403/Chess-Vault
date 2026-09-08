# Tasks

- Finalize and decide on product pricing and pro features and such
- Backend is done ig... I can't find any more excuses not to work on the client side lol so...

## Frontend 

- Polish frontend and fix any bugs 
- Make sure chess game viewer works correctly
- Fix up accounts on frontend
- Make accounts use clerk account context and clerk controls.
- Make player context i.e username derived from account data

### Short version of all the bs below: 

- Replace the single-folder assumption with optional many-to-many `folderIds` and keep `userId` as the ownership anchor.
- `null` means the game is currently unassigned to any folder; no GameBank entity or ID should be introduced.
- Update onboarding imports to send optional folder memberships when a folder is selected.


### TODO: Wire onboarding imports to send optional folder memberships

- Relevant file: Frontend/src/components/onboarding/ImportGames.tsx 
- Update onboarding flow to fetch user's folders and optionally select one or more folders.
- Ensure import calls pass `{ platform, username, folderIds: [...] | null }` without `any` casts.
- Verify backend accepts the optional folder memberships and imports games without forcing a Game Bank.
- Remove temporary placeholder and add tests for import flow.


### Later taks (Project maintenance):
- Do proper safeguards like linting all over including the shared folder
- Tests and stuff
- Proper ci
- Self healing deps maybe
- More ideas will be added as they land in my head