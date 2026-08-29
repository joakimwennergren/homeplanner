function TaskCard() {
  return (
    <div className="task-card">
      <div className="task-card-header">
        <h3>Task Title</h3>
        <span className="task-card-status">In Progress</span>
      </div>
      <div className="task-card-body">
        <p>
          This is a brief description of the task. It provides an overview of
          what needs to be done.
        </p>
      </div>
      <div className="task-card-footer">
        <button className="task-card-button">View Details</button>
      </div>
    </div>
  );
}

export default TaskCard;
