// pages/FormPage.jsx
import { useState, useEffect } from "react";
import { Card, CardBody, CardFooter, CardHeader, Textarea, Button } from "@heroui/react";
import "../styles/Login.css"; // reusing same background SORRY but faster i think!!
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useUser } from "../Context";

const FormPage = ({ goBack }) => {
  const { user } = useUser();
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    
  }, []);


  const handleSubmit = async () => {
    if (!text.trim()) return;
    const studentId = user.id;
    const sliderVal = parseInt(localStorage.getItem('mood'), 10);;
    const color = localStorage.getItem('color');;
    const img = localStorage.getItem('image');;
    const date = new Date().toISOString().split("T")[0];

    const pd = {
      student_id: studentId,
      slider_value: sliderVal,
      color: color,
      image: img,
      date: date,
      text: text,
      category: "neutral" 
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
        setSubmitted(true);
        localStorage.clear();

        console.log("✅ RESPONSE FROM BACKEND:", data);
        console.log(data.summary);
        localStorage.setItem("ai_summ", data.summary);

        setTimeout(() => {
          navigate("/ai-summary");
        }, 1500);
      } else {
        console.error("Error submitting score:", data.error);
      }
    } catch (error) {
      console.error("Submission error:", error);
    }

  };

  return (
    <div className="lin">
      <motion.div
        key="form"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="lin-card" style={{ minHeight: "50vh" }}>
          <CardHeader className="lin-card-body">
            <h2 className="lin-card-header">Form Submission</h2>
          </CardHeader>
          <CardBody className="lin-card-body">
            {submitted ? (
              <p className="lin-card-header">Your journal was submitted, Thank you!</p>
            ) : (
                <textarea
                    className="lin-textarea"
                    placeholder="Write more details about how youre feeling or concerns about the future or what you expect..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
            )}
          </CardBody>
          <CardFooter className="lin-card-body">
            {!submitted && (
              <Button className="lin-submit" onClick={handleSubmit} disabled={!text.trim()}>
                Submit
              </Button>
            )}
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default FormPage;
