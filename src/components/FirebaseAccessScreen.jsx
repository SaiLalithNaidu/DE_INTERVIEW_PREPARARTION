import React from 'react';
import { Cloud, LoaderCircle } from 'lucide-react';

export default function FirebaseAccessScreen({ status, error, busy, onSignIn }) {
  const isConnecting = status === 'connecting';

  return (
    <main className="firebase-access-screen">
      <section className="firebase-access-card">
        <div className="firebase-access-icon"><Cloud size={25} /></div>
        <p className="firebase-access-eyebrow">DATA ENGINEER INTERVIEW PREP</p>
        <h1>{isConnecting ? 'Connecting to your data' : 'Sign in to your workspace'}</h1>
        <p className="firebase-access-copy">
          {isConnecting
            ? 'Loading your questions, images, bookmarks, and progress from Firebase.'
            : 'Sign in with Google to keep your questions, uploaded images, bookmarks, and progress in your Firebase account.'}
        </p>
        {error && <p className="firebase-access-error" role="alert">{error}</p>}
        {isConnecting ? (
          <div className="firebase-access-loading"><LoaderCircle size={18} className="firebase-loading-spinner" /> Loading cloud data…</div>
        ) : (
          <button type="button" className="firebase-sign-in-button" onClick={onSignIn} disabled={busy}>
            {busy ? 'Opening Google sign-in…' : 'Continue with Google'}
          </button>
        )}
        <p className="firebase-access-note">Your Firebase account can only access its own saved data.</p>
      </section>
    </main>
  );
}
