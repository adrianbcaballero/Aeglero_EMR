import { useEffect, useState } from 'react';

const TestPage = () => {
    const [message, setMessage] = useState("...");

  useEffect(() => {
    const url = `${import.meta.env.VITE_API_BASE}/`;
    console.log("✅ Fetching from:", url);
  
    fetch(url)
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(err => {
        console.error("❌ Fetch failed:", err);
        setMessage("⚠️ Could not connect to backend");
      });
  }, []);
    return (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <h1>CPP Hackathon 2025</h1>
            <h2>Afterglow</h2>
            <p>Backend says: {message}</p>
        </div>
    );
};
export default TestPage;