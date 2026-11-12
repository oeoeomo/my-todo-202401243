"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import {
  addTodo,
  deleteTodo,
  getServerTodoSnapshot,
  getTodoSnapshot,
  refreshTodos,
  setTodoCompleted,
  subscribeToTodos,
  TodoStorageError,
  type Todo,
} from "@/lib/todo-storage";

function TodoRow({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  onToggle: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
}) {
  return (
    <li className="flex items-center gap-3 border-b border-slate-100 py-4 last:border-b-0">
      <label className="flex min-w-0 flex-1 cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo)}
          aria-label={`${todo.title} 완료`}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 text-transparent transition peer-checked:border-emerald-500 peer-checked:bg-emerald-500 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-emerald-600"
        >
          <svg viewBox="0 0 16 16" fill="none" className="size-3">
            <path
              d="m3.5 8 3 3 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span
          className={`min-w-0 break-words leading-6 ${
            todo.completed ? "text-slate-400 line-through" : "text-slate-700"
          }`}
        >
          {todo.title}
        </span>
      </label>
      <button
        type="button"
        onClick={() => onDelete(todo)}
        aria-label={`${todo.title} 삭제`}
        className="flex size-9 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="size-5"
        >
          <path
            d="M4.5 6h11m-9.5 0 .6 10h5.8l.6-10M8 6V4.5h4V6m-3 3v4m2-4v4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </li>
  );
}

export default function Home() {
  const snapshot = useSyncExternalStore(
    subscribeToTodos,
    getTodoSnapshot,
    getServerTodoSnapshot,
  );
  const todos = snapshot.todos;
  const [title, setTitle] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [todoToDelete, setTodoToDelete] = useState<Todo | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const isLoaded = !snapshot.loading;
  const loadFailed = snapshot.error !== null;
  const storageError = actionError ?? snapshot.error;

  useEffect(() => {
    if (todoToDelete && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
  }, [todoToDelete]);

  const sortedTodos = [...todos].sort(
    (first, second) => second.createdAt - first.createdAt,
  );
  const activeTodos = sortedTodos.filter((todo) => !todo.completed);
  const completedTodos = sortedTodos.filter((todo) => todo.completed);
  const remainingCount = activeTodos.length;

  function runStorageAction(action: () => Todo[]) {
    try {
      action();
      setActionError(null);
      return true;
    } catch (error) {
      if (!(error instanceof TodoStorageError)) {
        throw error;
      }

      setActionError(error.message);
      return false;
    }
  }

  function handleAddTodo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setInputError("할 일 제목을 입력해 주세요.");
      return;
    }

    if (runStorageAction(() => addTodo(trimmedTitle))) {
      setTitle("");
      setInputError(null);
    }
  }

  function handleToggleTodo(todo: Todo) {
    runStorageAction(() => setTodoCompleted(todo.id, !todo.completed));
  }

  function handleConfirmDelete() {
    if (!todoToDelete) {
      return;
    }

    if (runStorageAction(() => deleteTodo(todoToDelete.id))) {
      closeDeleteDialog();
    }
  }

  function closeDeleteDialog() {
    dialogRef.current?.close();
    setTodoToDelete(null);
  }

  function handleReloadTodos() {
    refreshTodos();
    setActionError(null);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 sm:py-16">
      <div className="mx-auto w-full max-w-2xl">
        <header className="mb-8">
          <p className="mb-3 text-sm font-semibold tracking-wide text-emerald-700">
            나만의 체크리스트
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            오늘의 할 일
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-500">
            할 일을 적고, 하나씩 완료해 보세요.
          </p>
        </header>

        <section
          aria-label="할 일 목록"
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm shadow-slate-200/60"
        >
          <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-white px-5 py-5 sm:px-7">
            <div>
              <p className="text-sm font-medium text-slate-500">남은 할 일</p>
              <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">
                {isLoaded && !loadFailed ? remainingCount : "—"}
                <span className="ml-1 text-base font-semibold text-slate-500">
                  개
                </span>
              </p>
            </div>
            <span
              aria-hidden="true"
              className="flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"
            >
              <svg viewBox="0 0 24 24" fill="none" className="size-6">
                <path
                  d="m5 12.5 4.2 4.2L19 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </div>

          <div className="p-5 sm:p-7">
            {storageError && (
              <div
                role="alert"
                className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800"
              >
                <p>{storageError}</p>
                {loadFailed && (
                  <button
                    type="button"
                    onClick={handleReloadTodos}
                    className="mt-2 font-semibold underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-700"
                  >
                    다시 불러오기
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleAddTodo} className="flex gap-2 sm:gap-3">
              <label htmlFor="todo-title" className="sr-only">
                새 할 일
              </label>
              <input
                id="todo-title"
                type="text"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  if (inputError) {
                    setInputError(null);
                  }
                }}
                placeholder="새로운 할 일을 입력하세요"
                disabled={!isLoaded || loadFailed}
                aria-invalid={inputError ? true : undefined}
                aria-describedby={inputError ? "todo-title-error" : undefined}
                className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 disabled:bg-slate-100"
              />
              <button
                type="submit"
                disabled={!isLoaded || loadFailed}
                className="shrink-0 rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:px-5 sm:text-base"
              >
                추가
              </button>
            </form>

            {inputError && (
              <p
                id="todo-title-error"
                role="alert"
                className="mt-2 text-sm text-rose-700"
              >
                {inputError}
              </p>
            )}

            <div className="mt-6" aria-live="polite">
              {!isLoaded ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  할 일을 불러오는 중입니다...
                </p>
              ) : loadFailed ? (
                <p className="py-8 text-center text-sm text-slate-500">
                  저장된 할 일을 불러오지 못했습니다.
                </p>
              ) : todos.length === 0 ? (
                <div className="rounded-2xl bg-slate-50 px-5 py-10 text-center">
                  <p className="font-semibold text-slate-700">
                    아직 할 일이 없어요.
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    위 입력창에 첫 번째 할 일을 적어 보세요.
                  </p>
                </div>
              ) : (
                <div>
                  {activeTodos.length > 0 ? (
                    <section aria-labelledby="active-todos-heading">
                      <h2
                        id="active-todos-heading"
                        className="mb-1 text-sm font-semibold text-slate-500"
                      >
                        진행 중
                      </h2>
                      <ul>
                        {activeTodos.map((todo) => (
                          <TodoRow
                            key={todo.id}
                            todo={todo}
                            onToggle={handleToggleTodo}
                            onDelete={setTodoToDelete}
                          />
                        ))}
                      </ul>
                    </section>
                  ) : (
                    <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                      모든 할 일을 완료했어요.
                    </p>
                  )}

                  {completedTodos.length > 0 && (
                    <section
                      aria-labelledby="completed-todos-heading"
                      className="mt-6 border-t border-slate-100 pt-5"
                    >
                      <h2
                        id="completed-todos-heading"
                        className="mb-1 text-sm font-semibold text-slate-500"
                      >
                        완료
                      </h2>
                      <ul>
                        {completedTodos.map((todo) => (
                          <TodoRow
                            key={todo.id}
                            todo={todo}
                            onToggle={handleToggleTodo}
                            onDelete={setTodoToDelete}
                          />
                        ))}
                      </ul>
                    </section>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        <p className="mt-5 text-center text-xs leading-5 text-slate-400">
          할 일은 이 브라우저에 저장됩니다.
        </p>
      </div>

      <dialog
        ref={dialogRef}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        onCancel={(event) => {
          event.preventDefault();
          closeDeleteDialog();
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl border border-slate-200 bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-950/40"
      >
        {todoToDelete && (
          <div className="p-6 sm:p-7">
            <h2 id="delete-dialog-title" className="text-lg font-bold">
              할 일을 삭제할까요?
            </h2>
            <p
              id="delete-dialog-description"
              className="mt-3 break-words text-sm leading-6 text-slate-600"
            >
              “{todoToDelete.title}”을(를) 삭제하면 다시 되돌릴 수 없어요.
            </p>
            {storageError && (
              <p role="alert" className="mt-3 text-sm text-rose-700">
                {storageError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                autoFocus
                onClick={closeDeleteDialog}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600"
              >
                삭제
              </button>
            </div>
          </div>
        )}
      </dialog>
    </main>
  );
}
