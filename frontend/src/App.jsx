import { useEffect, useState } from "react";
import "./App.css";
import AuthPanel from "./AuthPanel.jsx";
import { supabase } from "./supabaseclient.js";
function App() {
  const [search, setSearch] = useState("");
    const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
    const [files, setFiles] = useState([]);
  const [apiStatus, setApiStatus] = useState("Checking...");

    useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);
    useEffect(() => {
    if (!session?.user) {
      setFiles([]);
      return;
    }

    let cancelled = false;

    async function loadFiles() {
      const { data, error } = await supabase.storage
        .from("mycloud-files")
        .list(session.user.id, {
          limit: 100,
          sortBy: { column: "name", order: "asc" },
        });

      if (cancelled) return;

      if (error) {
        console.error("Could not load files from Supabase:", error);
        setFiles([]);
        return;
      }

      const fileItems = (data ?? [])
        .filter((item) => item.id !== null)
        .map((item) => {
          const bytes = Number(item.metadata?.size ?? 0);
          const mimeType = item.metadata?.mimetype ?? "";

          return {
            name: item.name,
            type: mimeType ? mimeType.split("/").pop() : "File",
            size: bytes ? `${(bytes / 1024).toFixed(1)} KB` : "—",
            icon: "📄",
          };
        });

      setFiles(fileItems);
    }

    loadFiles();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);
    
  

  const filteredFiles = files.filter((file) =>
    
    file.name.toLowerCase().includes(search.toLowerCase())
  );
  const storageUsedKB = files.reduce((total, file) => {
  const sizeInKB = Number.parseFloat(file.size);
  return total + (Number.isFinite(sizeInKB) ? sizeInKB : 0);
}, 0);
  if (authLoading) {
    return <main className="main">Loading MyCloud...</main>;
  }

  if (!session) {
    return <AuthPanel />;
  }
  return (
    <div className="app">
      <aside className="sidebar">
        <h2 className="logo">☁ MyCloud</h2>
        <p className="nav-heading">WORKSPACE</p>
        <button className="nav-item active">🏠 Dashboard</button>
        <button className="nav-item">📁 My Files</button>
        <button className="nav-item">⭐ Starred</button>
        <button className="nav-item">🗑 Trash</button>

        <div className="storage">
          <p>Storage used</p>
          <div className="progress">
            <div
  style={{
    width: `${Math.min((storageUsedKB / (5 * 1024 * 1024)) * 100, 100)}%`,
  }}
/>
          </div>
         <small>
  {storageUsedKB >= 1024
    ? `${(storageUsedKB / 1024).toFixed(2)} MB`
    : `${storageUsedKB.toFixed(1)} KB`}{" "}
  of 5 GB used
</small>
        </div>
      </aside>

      <main className="main">
               <header className="topbar">
          <h3>MyCloud Storage</h3>
          <div className="profile">
            API: {apiStatus} · 👤 {session.user.email}{" "}
            <button type="button" onClick={() => supabase.auth.signOut()}>
              Sign out
            </button>
          </div>
        </header>
                   
        
          <div className="profile">
            API: {apiStatus} · 👤 {session.user.email}{" "}
            <button type="button" onClick={() => supabase.auth.signOut()}>
              Sign out
            </button>
          </div>
        <section className="welcome">
          <div>
            <h1>Your files, everywhere.</h1>
            <p>Store, organize and access your files in one place.</p>
          </div>
          <label className="upload-btn" style={{ cursor: "pointer" }}>
  + Upload files
  <input
    type="file"
    hidden
    onChange={async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const { error } = await supabase.storage
        .from("mycloud-files")
        .upload(`${session.user.id}/${file.name}`, file, {
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        alert(`Upload failed: ${error.message}`);
        return;
      }

      setFiles((currentFiles) => [
        ...currentFiles,
        {
          name: file.name,
          type: file.type ? file.type.split("/").pop() : "File",
          size: `${(file.size / 1024).toFixed(1)} KB`,
          icon: "📄",
        },
      ]);

      event.target.value = "";
    }}
  />
</label>
        </section>

        <section className="stats">
          <div className="stat-card">
            <span>📁</span>
            <p>Total files</p>
            <h2>{files.length}</h2>
          </div>
          <div className="stat-card">
            <span>☁️</span>
            <p>Storage used</p>
            <h2><h2>
  {storageUsedKB >= 1024
    ? `${(storageUsedKB / 1024).toFixed(2)} MB`
    : `${storageUsedKB.toFixed(1)} KB`}
</h2></h2>
          </div>
          <div className="stat-card">
            <span>🔒</span>
            <p>Privacy</p>
            <h2>Protected</h2>
          </div>
        </section>

        <section className="files-section">
          <div className="files-heading">
            <h2>My Files</h2>
            <input
              type="search"
              placeholder="Search your files..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="file-list">
            {filteredFiles.map((file) =>
             (
              <div className="file-row" key={file.name}>
                <span className="file-icon">{file.icon}</span>
                <div className="file-name">
                  <strong>{file.name}</strong>
                  <small>{file.type}</small>
                </div>
                <span className="file-size">{file.size}</span>
                <div className="file-actions">
  <button
    type="button"
    onClick={async () => {
      const { data, error } = await supabase.storage
        .from("mycloud-files")
        .createSignedUrl(`${session.user.id}/${file.name}`, 60, {
          download: true,
        });

      if (error) {
        alert(`Download failed: ${error.message}`);
        return;
      }

      window.location.href = data.signedUrl;
    }}
  >
    Download
  </button>

  <button
    type="button"
    onClick={async () => {
      if (!window.confirm(`Delete ${file.name}?`)) return;

      const { error } = await supabase.storage
        .from("mycloud-files")
        .remove([`${session.user.id}/${file.name}`]);

      if (error) {
        alert(`Delete failed: ${error.message}`);
        return;
      }

      setFiles((currentFiles) =>
        currentFiles.filter((item) => item.name !== file.name)
      );
    }}
  >
    Delete
  </button>
</div>
    
              </div>
            ))}

            {filteredFiles.length === 0 && (
              <p className="empty">No matching files found.</p>
            )}
          </div>
          <p className="Your files are stored privately in your MyCloud account.">
            Preview interface only — real accounts and private file storage
            will be connected in later steps.
          </p>
        </section>
      </main>
    </div>
  );
}

export default App;