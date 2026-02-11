import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/StudentPage.css";


const StudentPage = () => {
  const { id } = useParams();
  const [moods, setMoods] = useState([]);
  const [forms, setForms] = useState([]);
  const [studentName, setStudentName] = useState("");
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);


  useEffect(() => {
    const fetchSubmissions = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/student/${id}/submissions`);
      const data = await res.json();
      setMoods(data.moods || []);         
    setForms(data.forms || []);      
    setStudentName(data.name || "");  
    setScores(data.scores || []);    
    };
    fetchSubmissions();
  }, [id]);

  return (
    <div className="student-page-container">
      <div className="student-header-box">
        <h2>{studentName}</h2>
        <p className="return-link" onClick={() => navigate("/advisor")}>
            Return to Advisor Page
        </p>
    </div>

    <div className="submission-column">
        <h3>Mood Submissions</h3>
        {moods.map((m, i) => (
            <div
            className="submission-card"
            key={i}
            onClick={() => navigate(`/score/${m.date}`)}
            style={{ cursor: "pointer" }}
            >
            <p>Date: {m.date}</p>
            <p>Slider: {m.slider_value}</p>
            <p>Color: {m.color}</p>
            <p>Image: {m.image}</p>
            </div>
        ))}
      </div>


      <div className="submission-column">
        <h3>Form Submissions</h3>
        {forms.map((f, i) => (
            <div
            className="submission-card"
            key={i}
            onClick={() => navigate(`/score/${f.date}`)}
            style={{ cursor: "pointer" }}
            >
            <p>Date: {f.date}</p>
            <p>Category: {f.category}</p>
            <p>{f.text}</p>
            </div>
        ))}
       </div>

      <div className="submission-column special-column">
        <h3>Calculated Score History</h3>
        {scores.length === 0 ? (
            <p>No scores available.</p>
        ) : (
            scores.map((s, i) => (
            <div
                className="submission-card score-card"
                key={i}
                onClick={() => navigate(`/score/${s.date}`)}
                style={{ cursor: "pointer" }}
            >
                <p>Date: {s.date}</p>
                <p>Score: {s.daily_score}</p>
            </div>
            ))
        )}
        </div>

    </div>
    
  );
};

export default StudentPage;
