"use server";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "aci.session";
const MAX_AGE = 60 * 60 * 8;

function credentials() {
  const user = process.env.ARCHIVE_USER;
  const password = process.env.ARCHIVE_PASSWORD;
  const secret = process.env.ARCHIVE_SESSION_SECRET;
  if (!user || !password || !secret) return null;
  return { user, password, secret };
}

function sign(secret: string, user: string) {
  return createHmac("sha256", secret).update(`archive:${user}`).digest("hex");
}

function equal(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function readSession() {
  const config = credentials();
  if (!config) return false;
  const token = (await cookies()).get(COOKIE)?.value;
  return Boolean(token && equal(token, sign(config.secret, config.user)));
}

export async function signIn(user: string, password: string) {
  const config = credentials();
  if (!config) return false;
  const valid = equal(user, config.user) && equal(password, config.password);
  if (!valid) return false;
  (await cookies()).set(COOKIE, sign(config.secret, config.user), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
  return true;
}

export async function signOut() {
  (await cookies()).delete(COOKIE);
}
