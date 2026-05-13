import { useState } from "react";
import ProjectTasksTab from "../../pages/Projects/tabs/ProjectTasksTab";
import AssignTasksTab from "../../pages/Projects/tabs/AssignTasksTab";

export default function Tabs({ project }) {
  const [tab, setTab] = useState("tasks");

  return (
    <div>
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setTab("tasks")}>Tasks</button>
        <button onClick={() => setTab("assign")}>Assign</button>
      </div>

      <div style={{ marginTop: 20 }}>
        {tab === "tasks" && <ProjectTasksTab project={project} />}
        {tab === "assign" && <AssignTasksTab project={project} />}
      </div>
    </div>
  );
}