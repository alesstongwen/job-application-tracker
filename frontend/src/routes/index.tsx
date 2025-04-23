import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const Route = createFileRoute("/")({
  component: Index,
});

type Task = {
  id: string;
  content: string;
  company: string;
  addedAt: string;
  description?: string;
};

type Column = {
  id: string;
  name: string;
  tasks: Task[];
};

type Dashboard = Record<string, Column>;

const initialColumns: Dashboard = {
  applied: { id: "applied", name: "Applied", tasks: [] },
  interview: { id: "interview", name: "Interview", tasks: [] },
  offered: { id: "offered", name: "Offered", tasks: [] },
  rejected: { id: "rejected", name: "Rejected", tasks: [] },
};

function Index(): JSX.Element {
  const [columns, setColumns] = useState<Dashboard>(initialColumns);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    section: "applied", // Default section
    description: "",
  });

  const resetForm = () => {
    setNewJob({
      title: "",
      company: "",
      section: "applied",
      description: "",
    });
  };

  const checkAuthentication = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/check`, {
        withCredentials: true,
      });
      if (!response.data.authenticated) {
        window.location.href = `${API_BASE_URL}/auth/login`;
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  // Fetch dashboard data from the backend
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/dashboard`, { withCredentials: true })
      .then((res) => {
        console.log("Fetched Data:", res.data);
        const fetchedData: Dashboard = res.data;

        const updatedColumns = { ...initialColumns };
        for (const [key, value] of Object.entries(fetchedData)) {
          if (updatedColumns[key]) {
            updatedColumns[key].tasks = value.tasks;
          }
        }

        setColumns(updatedColumns);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      });
  }, []);

  // Handle drag-and-drop
  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    // prevent dragging within the same column
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceCol = columns[source.droppableId];
    const destCol = columns[destination.droppableId];

    const sourceTasks = [...sourceCol.tasks];
    const destTasks = [...destCol.tasks];

    const [movedTask] = sourceTasks.splice(source.index, 1);
    destTasks.splice(destination.index, 0, movedTask);

    setColumns({
      ...columns,
      [source.droppableId]: { ...sourceCol, tasks: sourceTasks },
      [destination.droppableId]: { ...destCol, tasks: destTasks },
    });

    // update job
    axios
      .post(
        `${API_BASE_URL}/api/dashboard/update`,
        {
          taskId: movedTask.id,
          sourceCol: source.droppableId,
          destCol: destination.droppableId,
          destIndex: destination.index,
        },
        { withCredentials: true }
      )
      .then(() => console.log("Task position updated successfully"))
      .catch((error) => console.error("Error updating task position:", error));
  };

  // Handle adding or editing a job
  const handleSubmitJob = () => {
    if (!newJob.title || !newJob.company) {
      alert("Please fill out all required fields.");
      return;
    }

    const payload = {
      title: newJob.title,
      company: newJob.company,
      status: newJob.section,
      description: newJob.description || "", // Optional field
    };

    console.log("Submitting Job Payload:", payload);

    const newTask: Task = {
      id: Date.now().toString(),
      content: newJob.title,
      company: newJob.company,
      addedAt: new Date().toLocaleString(),
      description: newJob.description,
    };

    // Update the column safely
    const updatedColumns = { ...columns };
    if (!updatedColumns[newJob.section]) {
      updatedColumns[newJob.section] = {
        id: newJob.section,
        name: newJob.section.charAt(0).toUpperCase() + newJob.section.slice(1),
        tasks: [],
      };
    }
    updatedColumns[newJob.section].tasks.push(newTask);

    setColumns(updatedColumns);
    setIsModalOpen(false);
    resetForm();

    // add job
    axios
      .post(`${API_BASE_URL}/api/dashboard/add`, payload, {
        withCredentials: true,
      })
      .then((res) => {
        console.log("Job added successfully:", res.data);
      })
      .catch((error) => {
        console.error("Error submitting job:", error);
      });
  };

  // Open the modal to edit a job
  const handleEditJob = (task: Task, section: string) => {
    setIsEditing(true);
    setCurrentTaskId(task.id);
    setNewJob({
      title: task.content,
      company: task.company,
      section,
      description: task.description || "",
    });
    setIsModalOpen(true);
  };
  // delete job
  const handleDeleteJob = (taskId: string, columnId: string) => {
    console.log("Deleting Job ID:", taskId);

    axios
      .post(
        `${API_BASE_URL}/api/dashboard/delete`,
        { taskId },
        { withCredentials: true }
      )
      .then(() => {
        console.log("Job deleted successfully");

        const updatedColumns = { ...columns };
        const column = updatedColumns[columnId];
        column.tasks = column.tasks.filter((task) => task.id !== taskId);
        setColumns(updatedColumns);
      })
      .catch((error) => {
        console.error("Error deleting job:", error);
        alert("Failed to delete the job.");
      });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Add Job Button */}
      <div className="flex justify-end p-4">
        <button
          onClick={() => {
            resetForm();
            setIsEditing(false);
            setIsModalOpen(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Job
        </button>
      </div>

      {/* Drag and Drop Context */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-4 gap-4 p-4">
          {Object.entries(columns).map(([columnId, column]) => (
            <Droppable key={columnId} droppableId={columnId}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-blue-50 p-4 rounded shadow-md"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    minHeight: "500px",
                    border: "1px solid #d1d5db",
                  }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">{column.name}</h3>
                    <span className="text-sm text-gray-500">
                      {Array.isArray(column.tasks) ? column.tasks.length : 0}{" "}
                      Job
                      {Array.isArray(column.tasks) && column.tasks.length !== 1
                        ? "s"
                        : ""}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {Array.isArray(column.tasks) &&
                      column.tasks.map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-white p-3 rounded shadow cursor-pointer"
                              style={{
                                userSelect: "none",
                                ...provided.draggableProps.style,
                              }}
                              onClick={() => handleEditJob(task, columnId)}
                            >
                              <h4 className="font-medium">{task.content}</h4>
                              <p className="text-sm text-gray-500">
                                {task.company}
                              </p>
                              <p className="text-xs text-gray-400">
                                {task.addedAt}
                              </p>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Add/Edit Job Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h2 className="text-lg font-semibold mb-4">
              {isEditing ? "Edit Job" : "Add Job"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Job Title</label>
                <input
                  type="text"
                  value={newJob.title}
                  onChange={(e) =>
                    setNewJob((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full border rounded px-2 py-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Company Name
                </label>
                <input
                  type="text"
                  value={newJob.company}
                  onChange={(e) =>
                    setNewJob((prev) => ({ ...prev, company: e.target.value }))
                  }
                  className="w-full border rounded px-2 py-1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Section</label>
                <select
                  value={newJob.section}
                  onChange={(e) =>
                    setNewJob({ ...newJob, section: e.target.value })
                  }
                  className="w-full border rounded px-2 py-1"
                >
                  {Object.keys(columns).map((col) => (
                    <option key={col} value={col}>
                      {columns[col].name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  value={newJob.description}
                  onChange={(e) =>
                    setNewJob({ ...newJob, description: e.target.value })
                  }
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div className="flex justify-between items-center space-x-4 mt-4">
                {isEditing && (
                  <button
                    onClick={() => {
                      if (currentTaskId) {
                        handleDeleteJob(currentTaskId, newJob.section);
                        setIsModalOpen(false); // Close modal after deletion
                      }
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-200 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitJob}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Index;
