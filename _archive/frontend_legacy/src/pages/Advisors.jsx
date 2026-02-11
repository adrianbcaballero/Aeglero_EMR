import React, { useEffect, useState } from "react";
import { Button } from "@heroui/react";
import "../styles/Advisors.css";
import { useNavigate } from "react-router-dom";
import AdvisorCard from "../components/AdvisorCard";
import { useUser } from "../Context";
import GraphSettingsPanel from "../components/GraphSettingsPanel";
import GraphDisplay from "../components/GraphDisplay";
import { ScrollShadow } from "@heroui/react";



const AdvisorPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [configs, setConfigs] = useState([
    { studentId: "", dateRange: "", dataType: ""},
    { studentId: "", dateRange: "", dataType: ""},
    { studentId: "", dateRange: "", dataType: ""}
  ]);
  const [graphData, setGraphData] = useState([]);
  
  const updateConfig = (index, field, value) => {
    const newConfigs = [...configs];
    newConfigs[index][field] = value;
    setConfigs(newConfigs);
  };
  
  const generateGraph = async () => {
    setGraphData([]);//clear the previous data

    const filtered = configs.filter(c =>
      c.studentId && c.dateRange && c.dataType
    );
    if (!filtered.length) return;
  
    try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/advisor/${advisorId}/graph-data`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selections: filtered })
        });
        const data = await res.json();
        setGraphData(data);
      } catch (err) {
        console.error("Failed to fetch graph data:", err);
      }
  };
  


  const advisorName = user.name;
  const advisorId = user.id; 

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE}/advisor/${advisorId}/students?page=${page}`
        );
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        console.error("Failed to fetch students:", err);
      }
    };
    fetchStudents();
  }, [page]);

  const handleSignOut = () => {
    localStorage.clear();
    navigate("/");
  };

  const goToStudentPage = (studentId) => {
    navigate(`/student/${studentId}`);
  };

  return (
    <div className="advisor-container">
      <div className="advisor-header">
        <div className="advisor-name-box">{advisorName}</div>
        <Button className="advisor-signout" onPress={handleSignOut}>
                    Sign Out
        </Button>
      </div>

      <div className="advisor-grid">
        <div className="advisor-section top-left">
          <h3 className="advisor-section-title">High Priority Students</h3>
          <div className="hp-container">
          {students.length === 0 ? (
            <p>No recent scores found.</p>
          ) : (
            <>
            <div className="adv-scores">
              {students.map((student) => (
                <AdvisorCard
                  key={student.id}
                  student={student}
                  onClick={goToStudentPage}
                />
              ))}
              </div>
              <div style={{ width: "80%", display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
                <Button className='adv-button' onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
                <Button className='adv-button' onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </>
          )}
          </div>
        </div>

        <div className="advisor-section top-right">
            <h3 className="advisor-section-title">Search Functions</h3>
            <input
                className="search-input"
                type="text"
                placeholder="Search by name"
                value={searchQuery}
                onChange={async (e) => {
                    const q = e.target.value;
                    setSearchQuery(q);
                    if (q.trim()) {
                    const res = await fetch(`${import.meta.env.VITE_API_BASE}/advisor/${advisorId}/search-students?q=${q}`);
                    const data = await res.json();
                    setResults(data);
                    } else {
                    setResults([]);
                    }
                }}
                />
                {results.length > 0 && (
                <div className="search-dropdown">
                    
                    {results.map((s) => (
                    <div key={s.id} className="search-option" onClick={() => navigate(`/student/${s.id}`)}>
                        {s.name}
                    </div>
                    ))}
                </div>
            )}
            <input
                type="date"
                className="search-input"
                onChange={(e) => setSelectedDate(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const selectedDate = e.target.value;
                      if (selectedDate) navigate(`/score/${selectedDate}`);
                    }
                  }}
                placeholder="Search by date"
            />
            <input
                type="number"
                className="search-input"
                placeholder="Search by score value"
                onKeyDown={async (e) => {
                    if (e.key === "Enter") {
                    const score = e.target.value;
                    if (!score.trim()) return;
                    navigate(`/score-by-value/${score}`);
                    }
                }}
            />


        </div>

        <div className="advisor-section bottom-left">
            <h3 className="advisor-section-title">Graph Settings</h3>
            <GraphSettingsPanel
                advisorId={advisorId}
                students={students}
                configs={configs}
                updateConfig={updateConfig}
                generateGraph={generateGraph}
            />
        </div>


        <div className="advisor-section bottom-right">
            <h3 className="advisor-section-title">Graph Display</h3>
            <GraphDisplay graphData={graphData} />
        </div>
      </div>
    </div>
  );
};

export default AdvisorPage;
