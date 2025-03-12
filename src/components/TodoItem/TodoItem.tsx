import { useEffect, useRef, useState } from 'react';
import { Todo } from '../../types/Todo';

/* eslint-disable jsx-a11y/label-has-associated-control */
type Props = {
  todo: Todo;
  temporaryTodo?: Todo;
  onDeleteTodo: (id: number) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  onToggleTodoStatus: (id: number) => void;
  updatingTodos: boolean;
  onUpdateTodoTitle: (id: number, newTitle: string) => void;
};

export const TodoItem = ({
  todo: { id, title, completed },
  temporaryTodo,
  onDeleteTodo,
  inputRef,
  onToggleTodoStatus,
  updatingTodos,
  onUpdateTodoTitle,
}: Props) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const renameInputRef = useRef<HTMLInputElement | null>(null);
  const checkboxRef = useRef<HTMLInputElement | null>(null);

  const handleDelete = async () => {
    setIsUpdating(true);

    try {
      await onDeleteTodo(id);
    } finally {
      setIsUpdating(false);
      inputRef.current?.focus();
    }
  };

  const handleToggleStatus = async () => {
    setIsUpdating(true);

    try {
      await onToggleTodoStatus(id);
    } finally {
      setIsUpdating(false);
      inputRef.current?.focus();
    }
  };

  const handleEscapeUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') {
      setIsEditing(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedTitle = newTitle.trim();

    if (!isEditing || trimmedTitle === title) {
      setIsEditing(false);

      return;
    }

    setIsUpdating(true);

    try {
      if (trimmedTitle === '') {
        await handleDelete();
      } else {
        await onUpdateTodoTitle(id, trimmedTitle);
      }

      setIsEditing(false);
    } catch {
      setIsEditing(true);
      renameInputRef.current?.focus();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOnBlur = (event: React.FormEvent) => {
    setTimeout(() => {
      handleSubmit(event);
    }, 0);
  };

  useEffect(() => {
    if (isEditing && renameInputRef.current) {
      renameInputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <div data-cy="Todo" className={`todo ${completed ? 'completed' : ''}`}>
      {isEditing ? (
        <>
          <label className="todo__status-label" htmlFor={`todo=${id}`}>
            <input
              ref={checkboxRef}
              data-cy="TodoStatus"
              type="checkbox"
              className="todo__status"
              checked={completed}
              onChange={handleToggleStatus}
            />
          </label>

          <form onSubmit={handleSubmit}>
            <input
              data-cy="TodoTitleField"
              ref={renameInputRef}
              type="text"
              className="todo__title-field"
              placeholder="Empty todo will be deleted"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onBlur={handleOnBlur}
              onKeyUp={handleEscapeUp}
            />
          </form>
        </>
      ) : (
        <>
          <label className="todo__status-label" htmlFor={`todo-${id}`}>
            <input
              data-cy="TodoStatus"
              id={`todo-${id}`}
              type="checkbox"
              className="todo__status"
              checked={completed}
              onChange={handleToggleStatus}
            />
          </label>

          <span
            data-cy="TodoTitle"
            className="todo__title"
            onDoubleClick={() => {
              setIsEditing(true);
              setNewTitle(title);
            }}
          >
            {title}
          </span>

          <button
            type="button"
            className="todo__remove"
            data-cy="TodoDelete"
            onClick={handleDelete}
          >
            ×
          </button>
        </>
      )}
      <div
        data-cy="TodoLoader"
        className={`modal overlay ${(temporaryTodo || isUpdating || updatingTodos) && 'is-active'}`}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
