import React, { useRef, useState, useEffect } from 'react';

function PlusIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <rect x="9" y="4" width="2" height="12" rx="1" fill="#14452D" />
      <rect x="4" y="9" width="12" height="2" rx="1" fill="#14452D" />
    </svg>
  );
}

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [inputVals, setInputVals] = useState({});
  const inputRefs = useRef({});

  // Load todos from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('deenboard_todos');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTodos(parsed);
        }
      } catch {}
    }
  }, []);

  // Save todos to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('deenboard_todos', JSON.stringify(todos));
  }, [todos]);

  // Focus the input of the newest todo
  useEffect(() => {
    if (editingId && inputRefs.current[editingId]) {
      inputRefs.current[editingId].focus();
    }
  }, [editingId, todos.length]);

  // Add a new todo
  const addTodo = () => {
    // Check for existing empty todo
    const emptyTodo = todos.find((t) => t.text.trim() === '' && !t.checked);
    if (emptyTodo) {
      setEditingId(emptyTodo.id);
      setTimeout(() => {
        if (inputRefs.current[emptyTodo.id])
          inputRefs.current[emptyTodo.id].focus();
      }, 50);
      return;
    }
    const id = Date.now().toString();
    setTodos((prev) => [...prev, { id, text: '', checked: false }]);
    setEditingId(id);
    setInputVals((vals) => ({ ...vals, [id]: '' }));
  };

  // Handle editing
  const handleEdit = (id, value) => {
    setInputVals((vals) => ({ ...vals, [id]: value }));
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, text: value } : t))
    );
  };

  // Handle check (complete)
  const handleCheck = (id) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, checked: true } : t))
    );
    setTimeout(() => {
      setTodos((prev) => prev.filter((t) => t.id !== id));
      setEditingId(null);
    }, 400); // fade out duration
  };

  // Handle click on text to edit
  const handleTextClick = (id) => {
    setEditingId(id);
    setTimeout(() => {
      if (inputRefs.current[id]) inputRefs.current[id].focus();
    }, 50);
  };

  // Handle blur (finish editing)
  const handleBlur = (id) => {
    setEditingId(null);
  };

  // Handle Enter key
  const handleKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      setEditingId(null);
    }
  };

  // Only count todos that are not checked and have non-empty text
  const remaining = todos.filter(
    (t) => !t.checked && t.text.trim() !== ''
  ).length;

  return (
    <div
      className="w-full h-full rounded-[25px] bg-white flex flex-col p-4 relative overflow-hidden"
      style={{ fontFamily: 'Wix Madefor Display' }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-1">
        <div className="text-lg font-semibold text-[#2B2B2B] -tracking-[0.03em]">
          To-do
        </div>
        <button
          className="flex items-center gap-1 px-2 py-1 rounded-full bg-white hover:bg-[#F2F4F3] border border-[#0F3323] transition-colors text-[#0F3323] font-semibold text-base select-none"
          onClick={addTodo}
        >
          <PlusIcon size={14} />
          <span className="font-semibold text-xs -tracking-[0.02em]">New</span>
        </button>
      </div>
      {/* Remaining count */}
      <div
        className="text-4xl font-regular text-[#2B2B2B] mb-2 mt-1"
        style={{ minHeight: 40 }}
      >
        {remaining}
      </div>
      {/* Todo list */}
      <div
        className="flex-1 min-h-0 overflow-y-auto pr-1"
        style={{ maxHeight: 240 }}
      >
        {todos.length === 0 && (
          <div className="text-[#BDC8C2] text-base">No tasks yet.</div>
        )}
        <ul className="flex flex-col gap-1">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className={`flex items-start gap-1 group transition-opacity duration-500 ${
                todo.checked ? 'opacity-0' : 'opacity-100'
              }`}
              style={{ transition: 'opacity 0.5s' }}
            >
              {/* Checkbox */}
              <button
                className={`w-4 h-4 rounded-[6px] border-2  flex items-center justify-center transition-colors duration-200 mt-2 -tracking-[0.025em] ${
                  todo.checked
                    ? 'bg-[#14452D] border-[#14452D]'
                    : 'hover:bg-[#EBEEED] border-[#D4DAD6] bg-[#F1F7F3]'
                }`}
                onClick={() => handleCheck(todo.id)}
                tabIndex={-1}
                aria-label={todo.checked ? 'Completed' : 'Mark as complete'}
                style={{ flexShrink: 0 }}
              >
                {todo.checked && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M4 8.5L7 11.5L12 5.5"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
              {/* Text or input */}
              {editingId === todo.id ? (
                <input
                  ref={(el) => (inputRefs.current[todo.id] = el)}
                  className="flex-1 bg-transparent border-none outline-none text-base text-[#7E8884] font-medium px-1 py-0.5 rounded break-words whitespace-pre-line hyphens-auto -tracking-[0.025em]"
                  value={inputVals[todo.id] ?? todo.text}
                  onChange={(e) => handleEdit(todo.id, e.target.value)}
                  onBlur={() => handleBlur(todo.id)}
                  onKeyDown={(e) => handleKeyDown(e, todo.id)}
                  maxLength={60}
                  style={{
                    minWidth: 0,
                    wordBreak: 'break-word',
                    hyphens: 'auto',
                  }}
                  autoFocus
                />
              ) : (
                <span
                  className={`flex-1 text-base font-medium px-1 py-0.5 rounded cursor-pointer select-text transition-all duration-200 break-words whitespace-pre-line hyphens-auto -tracking-[0.025em] ${
                    todo.checked
                      ? 'line-through text-[#BDC8C2]'
                      : 'text-[#2B2B2B]'
                  } group-hover:bg-[#F2F4F3]`}
                  onClick={() => handleTextClick(todo.id)}
                  tabIndex={0}
                  style={{
                    minWidth: 0,
                    wordBreak: 'break-word',
                    hyphens: 'auto',
                  }}
                >
                  {todo.text || (
                    <span className="text-[#BDC8C2]">New task...</span>
                  )}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
export default TodoList;
