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

  useEffect(() => {
    axios
      .get("/api/dashboard")
      .then((res) => {
        console.log("API Response:", res.data);
        setColumns(res.data); // Set fetched data into state
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      });
  }, []);

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!Object.keys(columns).length) {
    return <div>No columns available</div>;
  }

  return (
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
                  backgroundColor: "#f0f4f8",
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
                      draggableId={String(task.id)}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-3 rounded shadow"
                          style={{
                            userSelect: "none",
                            ...provided.draggableProps.style,
                          }}
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
  );
};

export default MainDashboard;
