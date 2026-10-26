import { useState } from "react";
import { supabase } from "./supabaseclient.js";

function AuthPanel() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    const { data, error } = isSignUp
      ? await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        })
      : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (error) {
      setMessage(error.message);
    } else if (isSignUp && !data.session) {
      setMessage("Account created. Check your email to confirm, then sign in.");
    } else {
      setMessage("Signed in successfully.");
    }
  }
  async function sendSignInLink() {
    if (!email) {
      setMessage("Enter your account email first.");
      return;
    }

    setMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
        shouldCreateUser: false,
      },
    });

    setLoading(false);
    setMessage(
      error
        ? error.message
        : "If this email has a MyCloud account, a sign-in link will be sent. Check your inbox."
    );
  }
  return (
    <main style={{ maxWidth: "420px", margin: "60px auto", padding: "24px" }}>
      <section className="files-section">
        <h2>{isSignUp ? "Create your MyCloud account" : "Sign in to MyCloud"}</h2>

        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", margin: "20px 0" }}>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              style={{ display: "block", width: "100%", marginTop: "8px", padding: "12px" }}
            />
          </label>

          <label style={{ display: "block", margin: "20px 0" }}>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
              style={{ display: "block", width: "100%", marginTop: "8px", padding: "12px" }}
            />
          </label>

          <button className="upload-btn" type="submit" disabled={loading}>
            {loading ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}
          </button>
        </form>
        {!isSignUp && (
          <button
            type="button"
            onClick={sendSignInLink}
            disabled={loading}
            style={{ marginTop: "12px" }}
          >
            Email me a sign-in link
          </button>
        )}
        <p role="status" style={{ margin: "16px 0" }}>{message}</p>

        <button type="button" onClick={() => {
          setIsSignUp(!isSignUp);
          setMessage("");
        }}>
          {isSignUp ? "Already have an account? Sign in" : "Need an account? Sign up"}
        </button>
      </section>
    </main>
  );
}

export default AuthPanel;