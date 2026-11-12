# Connect the app to Firebase

The app uses Google sign-in for user identity, Cloud Firestore for sections, topics, questions, bookmarks, and progress, and Cloud Storage for uploaded images. Every user's records are stored below their Firebase user ID and protected by the included rules. Browser storage remains as an offline cache.

## Firebase console setup

1. Create a Firebase project and register a Web app.
2. In **Authentication → Sign-in method**, enable **Google**.
   In **Authentication → Settings → Authorized domains**, add the deployed app's domain if it is not already listed.
3. Create a **Cloud Firestore** database.
4. Create a **Cloud Storage** bucket.
5. Copy the Web app configuration values into a root `.env.local` file, using [.env.example](.env.example) as the template. The Firebase Web API key is client configuration; database and storage access are protected by Authentication and the rules.
6. Deploy `firestore.rules` and `storage.rules` from this repository. With Firebase CLI installed and the project selected, run:

   ```sh
   firebase deploy --only firestore:rules,storage
   ```

7. Restart the Vite server and open the app. Sign in with Google. On the first sign-in, the app copies the current browser's saved data and locally stored images to Firebase. Later changes sync to that account.

Cloud Storage for Firebase currently requires the project's **Blaze** pay-as-you-go plan. The plan may still have no-cost usage, but billing must be enabled for the bucket.

## Data layout

- `users/{uid}/sections`, `topics`, and `questions`: one Firestore document per record, with an order field so lists retain their order.
- `users/{uid}/appState/bookmarks` and `progress`: the user's study state.
- `users/{uid}/images/{imageId}` in Cloud Storage: uploaded image files.

If Firebase variables are absent, the app keeps working in local-only mode. Google accounts have separate data; signing in on another device with the same Google account loads the same cloud data.
