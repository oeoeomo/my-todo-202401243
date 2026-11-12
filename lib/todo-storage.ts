export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export interface TodoSnapshot {
  todos: Todo[];
  loading: boolean;
  error: string | null;
}

export class TodoStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TodoStorageError";
  }
}

const storageKey = "my-todo.todos";
const serverSnapshot: TodoSnapshot = {
  todos: [],
  loading: true,
  error: null,
};
const listeners = new Set<() => void>();
let currentSnapshot = serverSnapshot;
let hasLoadedSnapshot = false;

function getStorage(): Storage {
  if (typeof window === "undefined") {
    throw new TodoStorageError("브라우저 저장 공간을 사용할 수 없습니다.");
  }

  try {
    return window.localStorage;
  } catch {
    throw new TodoStorageError("브라우저 저장 공간에 접근할 수 없습니다.");
  }
}

function isTodo(value: unknown): value is Todo {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const todo = value as Record<string, unknown>;

  return (
    typeof todo.id === "string" &&
    typeof todo.title === "string" &&
    todo.title.trim().length > 0 &&
    typeof todo.completed === "boolean" &&
    typeof todo.createdAt === "number" &&
    Number.isFinite(todo.createdAt)
  );
}

function readTodos(): Todo[] {
  let storedValue: string | null;

  try {
    storedValue = getStorage().getItem(storageKey);
  } catch (error) {
    if (error instanceof TodoStorageError) {
      throw error;
    }

    throw new TodoStorageError("브라우저 저장 공간에서 할 일을 읽지 못했습니다.");
  }

  if (storedValue === null) {
    return [];
  }

  let parsedValue: unknown;

  try {
    parsedValue = JSON.parse(storedValue) as unknown;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new TodoStorageError("저장된 할 일 데이터를 읽을 수 없습니다.");
    }

    throw error;
  }

  if (!Array.isArray(parsedValue) || !parsedValue.every(isTodo)) {
    throw new TodoStorageError("저장된 할 일 데이터의 형식이 올바르지 않습니다.");
  }

  return parsedValue;
}

function writeTodos(todos: Todo[]) {
  try {
    getStorage().setItem(storageKey, JSON.stringify(todos));
  } catch (error) {
    if (error instanceof TodoStorageError) {
      throw error;
    }

    throw new TodoStorageError(
      "브라우저 저장 공간에 할 일을 저장하지 못했습니다.",
    );
  }
}

function readSnapshot(): TodoSnapshot {
  try {
    return { todos: readTodos(), loading: false, error: null };
  } catch (error) {
    if (!(error instanceof TodoStorageError)) {
      throw error;
    }

    return { todos: [], loading: false, error: error.message };
  }
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function handleStorageChange(event: StorageEvent) {
  if (event.key !== storageKey && event.key !== null) {
    return;
  }

  currentSnapshot = readSnapshot();
  hasLoadedSnapshot = true;
  notifyListeners();
}

function publishTodos(todos: Todo[]) {
  currentSnapshot = { todos, loading: false, error: null };
  hasLoadedSnapshot = true;
  notifyListeners();
}

function createTodoId(): string {
  if (typeof crypto === "undefined") {
    throw new TodoStorageError("할 일을 구분할 ID를 만들 수 없습니다.");
  }

  try {
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }

    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  } catch {
    throw new TodoStorageError("할 일을 구분할 ID를 만들 수 없습니다.");
  }
}

export function getTodoSnapshot(): TodoSnapshot {
  if (!hasLoadedSnapshot) {
    currentSnapshot = readSnapshot();
    hasLoadedSnapshot = true;
  }

  return currentSnapshot;
}

export function getServerTodoSnapshot(): TodoSnapshot {
  return serverSnapshot;
}

export function subscribeToTodos(listener: () => void) {
  listeners.add(listener);

  if (listeners.size === 1 && typeof window !== "undefined") {
    window.addEventListener("storage", handleStorageChange);
  }

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("storage", handleStorageChange);
    }
  };
}

export function refreshTodos() {
  currentSnapshot = readSnapshot();
  hasLoadedSnapshot = true;
  notifyListeners();
}

export function addTodo(title: string): Todo[] {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    throw new TodoStorageError("할 일 제목을 입력해 주세요.");
  }

  const todos = readTodos();
  const nextTodos = [
    ...todos,
    {
      id: createTodoId(),
      title: trimmedTitle,
      completed: false,
      createdAt: Date.now(),
    },
  ];

  writeTodos(nextTodos);
  publishTodos(nextTodos);
  return nextTodos;
}

export function setTodoCompleted(id: string, completed: boolean): Todo[] {
  const todos = readTodos();
  let foundTodo = false;
  const nextTodos = todos.map((todo) => {
    if (todo.id !== id) {
      return todo;
    }

    foundTodo = true;
    return { ...todo, completed };
  });

  if (!foundTodo) {
    throw new TodoStorageError("변경할 할 일을 찾을 수 없습니다.");
  }

  writeTodos(nextTodos);
  publishTodos(nextTodos);
  return nextTodos;
}

export function deleteTodo(id: string): Todo[] {
  const todos = readTodos();
  const nextTodos = todos.filter((todo) => todo.id !== id);

  if (nextTodos.length === todos.length) {
    throw new TodoStorageError("삭제할 할 일을 찾을 수 없습니다.");
  }

  writeTodos(nextTodos);
  publishTodos(nextTodos);
  return nextTodos;
}
