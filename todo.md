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

- Find a way to pass a folderId and stop using as any so frontend is accurate to the types
- Maybe unboarding might invlve a folder creation step or it should be automated along with account init on signup using the webhook... They all have pros and cons but this is a summary. Good luck bro


### TODO: Wire onboarding imports to send real Game Bank `folderId`

- Relavnt file: Frontend/src/components/onboarding/ImportGames.tsx 
- Update onboarding flow to fetch user's folders and select/create the Game Bank folder.
- Ensure import calls pass `{ platform, username, folderId }` (no `any` casts).
- Verify backend accepts the folder id and imports games into the correct folder.
- Remove temporary placeholder and add tests for import flow.


### Later taks (Project maintenance):
- Do proper safeguards like linting all over including the shared folder
- Tests and stuff
- Proper ci
- Self healing deps maybe
- More ideas will be added as they land in my head