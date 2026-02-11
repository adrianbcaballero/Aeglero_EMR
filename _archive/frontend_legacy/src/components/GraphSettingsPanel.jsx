import React from "react";

const GraphSettingsPanel = ({ students, configs, updateConfig, generateGraph }) => {
  return (
    <div className="graph-settings">
      {configs.map((config, i) => (
        <div className="graph-column" key={i}>
          <select onChange={e => updateConfig(i, "studentId", e.target.value)} value={config.studentId}>
            <option value="">Select Student</option>
            <option value="all">All Students</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <select onChange={e => updateConfig(i, "dateRange", e.target.value)} value={config.dateRange}>
            <option value="">Select Date Range</option>
            <option value="all">All Time</option>
            <option value="month">Past Month</option>
            <option value="week">Past Week</option>
            <option value="day">Daily</option>
          </select>

          <select onChange={e => updateConfig(i, "dataType", e.target.value)} value={config.dataType}>
            <option value="">Select Data Type</option>
            <option value="score">Total Score</option>
            <option value="mood">Mood Score (Slider)</option>
            <option value="form">Journal Score (Form)</option>
          </select>
        </div>
      ))}
      <button className="generate-graph-button" onClick={generateGraph}>Generate Graph</button>
    </div>
  );
};

export default GraphSettingsPanel;
