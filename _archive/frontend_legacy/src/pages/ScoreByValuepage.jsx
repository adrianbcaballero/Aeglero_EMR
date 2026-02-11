import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/StudentPage.css";

const ScoreByValuePage = () => {
  const { value } = useParams();
  const [scores, setScores] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchScores = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/advisor/1/search-by-score?score=${value}`);
      const data = await res.json();
      setScores(data);
    };
    fetchScores();
  }, [value]);

  return (
    <div className="student-page-container">
      <div className="student-header-box">
        <h2>Scores: {value}</h2>
        <p className="return-link" onClick={() => navigate("/advisor")}>
          Return to Advisor Page
        </p>
      </div>

      <div className="submission-column">
        <h3>Students with Score {value}</h3>
        {scores.length === 0 ? (
          <p>No entries found.</p>
        ) : (
          scores.map((s, i) => (
            <div
              key={i}
              className="submission-card"
              onClick={() => navigate(`/student/${s.id}`)}
              style={{ cursor: "pointer" }}
            >
              <p>Name: {s.name}</p>
              <p>Date: {s.date}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ScoreByValuePage;
