import React, { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import axios from "axios";

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

const MainDashboard: React.FC = () => {
  const [columns, setColumns] = useState<Dashboard>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state for editing jobs
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // Modal state for adding jobs
  const [selectedTask, setSelectedTask] = useState<Task | null>(null); // Selected task for editing
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    section: "applied", // Default section
    description: "",
  });

  // Fetch dashboard data from the backend
  useEffect(() => {
    axios
      .get("/api/dashboard")
      .then((res) => {
        setColumns(res.data);
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

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceCol = columns[source.droppableId];
    const destCol = columns[destination.droppableId];
    const sourceTasks = Array.from(sourceCol.tasks);
    const destTasks = Array.from(destCol.tasks);

    const [movedTask] = sourceTasks.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceTasks.splice(destination.index, 0, movedTask);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceCol,
          tasks: sourceTasks,
        },
      });
    } else {
      destTasks.splice(destination.index, 0, movedTask);
      setColumns({
        ...columns,
        [source.droppableId]: {
          ...sourceCol,
          tasks: sourceTasks,
        },
        [destination.droppableId]: {
          ...destCol,
          tasks: destTasks,
        },
      });
    }

    axios
      .post("/api/dashboard/update", {
        taskId: movedTask.id,
        sourceCol: source.droppableId,
        destCol: destination.droppableId,
        destIndex: destination.index,
      })
      .then(() => console.log("Task position updated successfully"))
      .catch((error) => console.error("Error updating task position:", error));
  };

  // Open edit modal
  const handleCardClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // Handle save
  const handleSave = () => {
    if (selectedTask) {
      const updatedColumns = { ...columns };
      const columnId = Object.keys(updatedColumns).find((colId) =>
        updatedColumns[colId].tasks.some((t) => t.id === selectedTask.id)
      );

      if (columnId) {
        const column = updatedColumns[columnId];
        const taskIndex = column.tasks.findIndex(
          (t) => t.id === selectedTask.id
        );
        column.tasks[taskIndex] = selectedTask;

        setColumns(updatedColumns);

        axios
          .post("/api/dashboard/update-task", selectedTask)
          .then(() => console.log("Task updated successfully"))
          .catch((error) => console.error("Error updating task:", error));
      }
    }

    setIsModalOpen(false);
    setSelectedTask(null);
  };

  // Handle adding a new job
  const handleAddJob = () => {
    const newTask: Task = {
      id: Date.now().toString(), // Generate a unique ID
      content: newJob.title,
      company: newJob.company,
      addedAt: new Date().toLocaleString(),
      description: newJob.description,
    };

    const updatedColumn = {
      ...columns[newJob.section],
      tasks: [...columns[newJob.section].tasks, newTask],
    };

    setColumns({
      ...columns,
      [newJob.section]: updatedColumn,
    });

    // Close modal and reset form
    setIsAddModalOpen(false);
    setNewJob({
      title: "",
      company: "",
      section: "applied",
      description: "",
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
          onClick={() => setIsAddModalOpen(true)}
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
                      {column.tasks.length} Job
                      {column.tasks.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {column.tasks.map((task, index) => (
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
                            onClick={() => handleCardClick(task)}
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

      {/* Add Job Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h2 className="text-lg font-semibold mb-4">Add Job</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Job Title</label>
                <input
                  type="text"
                  value={newJob.title}
                  onChange={(e) =>
                    setNewJob({ ...newJob, title: e.target.value })
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
                    setNewJob({ ...newJob, company: e.target.value })
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
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-gray-200 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddJob}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {isModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h2 className="text-lg font-semibold mb-4">Edit Job</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Job Title</label>
                <input
                  type="text"
                  value={selectedTask.content}
                  onChange={(e) =>
                    setSelectedTask({
                      ...selectedTask,
                      content: e.target.value,
                    })
                  }
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Company Name
                </label>
                <input
                  type="text"
                  value={selectedTask.company}
                  onChange={(e) =>
                    setSelectedTask({
                      ...selectedTask,
                      company: e.target.value,
                    })
                  }
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  value={selectedTask.description || ""}
                  onChange={(e) =>
                    setSelectedTask({
                      ...selectedTask,
                      description: e.target.value,
                    })
                  }
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedTask(null);
                  }}
                  className="bg-gray-200 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainDashboard;
