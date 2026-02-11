//AdvisorCard.jsx componenet
const AdvisorCard = ({ student, onClick }) => {
    return (
      <div className="advisor-card" onClick={() => onClick(student.id)}>
        <span className="card-name">{student.name}</span>
        <span className="card-score">Score: {student.score}</span>
        <span className="card-date">{student.date}</span>
      </div>
    );
  };
  
  export default AdvisorCard;
  