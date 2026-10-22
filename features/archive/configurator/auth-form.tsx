import { type FormEvent, useEffect, useRef, useState } from "react";
import { signIn } from "../session";

const FIELD =
  "box-border h-[26px] w-[92px] rounded-xs border border-line bg-surface px-[7px] mono text-control text-ink outline-none";

export function AuthForm({ onAuthed }: { onAuthed: () => void }) {
  const userRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [failed, setFailed] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    userRef.current?.focus();
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    const ok = await signIn(user, password).catch(() => false);
    setPending(false);
    if (!ok) {
      setFailed(true);
      setPassword("");
      return;
    }
    onAuthed();
  };

  return (
    <form onSubmit={submit} className="m-0 flex items-center gap-1">
      <input
        ref={userRef}
        name="u"
        aria-label="user"
        autoComplete="username"
        spellCheck={false}
        value={user}
        onChange={(event) => setUser(event.target.value)}
        className={FIELD}
      />
      <input
        name="p"
        type="password"
        aria-label="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className={FIELD}
      />
      <button
        type="submit"
        aria-label="sign in"
        disabled={pending}
        className="h-[26px] w-7 cursor-pointer rounded-xs border border-line bg-paper mono text-control text-ink"
      >
        ↵
      </button>
      <div className="pl-1 mono text-control text-muted">
        {failed ? "✕" : ""}
      </div>
    </form>
  );
}
