import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

import * as Auth from "@/lib/_core/auth";

export type UserRole = "student" | "teacher";

const ROLE_KEY = "edu-portal-user-role";
const USERS_KEY = "edu-portal-demo-users";

type StoredUser = {
  id: number;
  openId: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  loginMethod: string;
  lastSignedIn: string;
};

const DEMO_USERS: StoredUser[] = [
  {
    id: 1,
    openId: "demo-student",
    name: "John Doe",
    email: "student@edu.com",
    password: "password123",
    role: "student",
    loginMethod: "demo",
    lastSignedIn: new Date().toISOString(),
  },
  {
    id: 2,
    openId: "demo-teacher",
    name: "Prof. Jane Smith",
    email: "teacher@edu.com",
    password: "password123",
    role: "teacher",
    loginMethod: "demo",
    lastSignedIn: new Date().toISOString(),
  },
];

async function readStorage(key: string): Promise<string | null> {
  try {
    if (Platform.OS === "web") {
      if (typeof window === "undefined" || !window.localStorage) return null;
      return window.localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.warn("[demo-auth] readStorage failed:", key, error);
    return null;
  }
}

async function writeStorage(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
      return;
    }
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.warn("[demo-auth] writeStorage failed:", key, error);
  }
}

async function removeStorage(key: string): Promise<void> {
  try {
    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(key);
      }
      return;
    }
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.warn("[demo-auth] removeStorage failed:", key, error);
  }
}

async function getAllUsers(): Promise<StoredUser[]> {
  const raw = await readStorage(USERS_KEY);
  if (!raw) {
    await writeStorage(USERS_KEY, JSON.stringify(DEMO_USERS));
    return DEMO_USERS;
  }
  try {
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return DEMO_USERS;
  }
}

async function saveUsers(users: StoredUser[]): Promise<void> {
  await writeStorage(USERS_KEY, JSON.stringify(users));
}

export async function getUserRole(): Promise<UserRole | null> {
  const role = await readStorage(ROLE_KEY);
  return role === "student" || role === "teacher" ? role : null;
}

export async function setUserRole(role: UserRole): Promise<void> {
  await writeStorage(ROLE_KEY, role);
}

export async function clearUserRole(): Promise<void> {
  await removeStorage(ROLE_KEY);
}

function toAuthUser(user: StoredUser): Auth.User {
  return {
    id: user.id,
    openId: user.openId,
    name: user.name,
    email: user.email,
    loginMethod: user.loginMethod,
    lastSignedIn: new Date(user.lastSignedIn),
  };
}

export async function demoSignIn(
  email: string,
  password: string,
): Promise<{ user: Auth.User; role: UserRole }> {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await getAllUsers();
  const match = users.find((u) => u.email.toLowerCase() === normalizedEmail);

  if (!match || match.password !== password) {
    throw new Error("Invalid email or password");
  }

  const user = toAuthUser({ ...match, lastSignedIn: new Date().toISOString() });
  await Auth.setUserInfo(user);
  await Auth.setSessionToken(`demo-session-${match.id}`);
  await setUserRole(match.role);

  return { user, role: match.role };
}

export async function demoSignUp(
  name: string,
  email: string,
  password: string,
  role: UserRole,
): Promise<{ user: Auth.User; role: UserRole }> {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await getAllUsers();

  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    throw new Error("An account with this email already exists");
  }

  const newUser: StoredUser = {
    id: users.length + 1,
    openId: `demo-${role}-${Date.now()}`,
    name: name.trim(),
    email: normalizedEmail,
    password,
    role,
    loginMethod: "demo",
    lastSignedIn: new Date().toISOString(),
  };

  users.push(newUser);
  await saveUsers(users);

  const user = toAuthUser(newUser);
  await Auth.setUserInfo(user);
  await Auth.setSessionToken(`demo-session-${newUser.id}`);
  await setUserRole(role);

  return { user, role };
}

export async function demoSignOut(): Promise<void> {
  await Auth.removeSessionToken();
  await Auth.clearUserInfo();
  await clearUserRole();
}

export function getDashboardPath(role: UserRole): "/student/dashboard" | "/teacher/dashboard" {
  return role === "teacher" ? "/teacher/dashboard" : "/student/dashboard";
}
