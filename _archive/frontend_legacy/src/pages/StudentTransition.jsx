import { useNavigate } from "react-router-dom";
import { useUser } from '../Context';
import "../styles/Transition.css"; // Optional new file if needed

const StudentTransition = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  const handleYes = () => {
    navigate("/journal");
  };

  const handleNo = async () => {
    const studentId = user.id;
    const sliderVal = parseInt(localStorage.getItem('mood'), 10);
    const color = localStorage.getItem('color');
    const img = localStorage.getItem('image');
    const date = new Date().toISOString().split("T")[0];

    const pd = {
      student_id: studentId,
      slider_value: sliderVal,
      color: color,
      image: img,
      date: date
    };
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE}/submit_score`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pd),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.clear();
        localStorage.setItem("ai_summ", data.summary);
        navigate("/ai-summary");
      } else {
        console.error("Error submitting score:", data.error);
      }
    } catch (error) {
      console.error("Submission error:", error);
    }

  };

  return (
    <div className="transition-container">
      <div className="transition-box">
        <h2 className="transition-header">
          Would you like to fill out an optional journal entry with more information?
        </h2>
        <p className="transition-subtext">
          This can be any current thoughts, more detailed feelings (good or bad ones), or future worries </p>
        <div className="transition-buttons">
          <button className="lin-button" onClick={handleYes}>Yes</button>
          <button className="lin-button" onClick={handleNo}>No</button>
        </div>
      </div>
    </div>
  );
};

export default StudentTransition;
