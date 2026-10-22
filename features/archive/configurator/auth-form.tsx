import { type FormEvent, useEffect, useRef, useState } from "react";
import { cx } from "../../../components/ui/cx";
import { signIn } from "../session";

const FIELD =
  "box-border h-[26px] w-[92px] rounded-xs border border-line bg-surface px-[7px] mono text-control text-ink outline-none";
const DIALOG_FIELD =
  "box-border h-11 rounded-[3px] border border-line bg-surface px-3 mono text-touch text-ink outline-none";
const DIALOG_ACTION = "h-12 cursor-pointer bg-transparent text-touch text-ink";

type AuthFormProps = {
  onAuthed: () => void;
  layout?: "inline" | "dialog";
  onCancel?: () => void;
};

export function AuthForm({
  onAuthed,
  layout = "inline",
  onCancel,
}: AuthFormProps) {
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

  if (layout === "dialog")
    return (
      <form
        onSubmit={submit}
        className="m-0 w-[min(300px,100%)] overflow-hidden rounded-xl bg-paper shadow-alert"
      >
        <div className="flex flex-col items-center gap-1 px-[18px] pb-3.5 pt-5 text-center">
          <div className="text-[17px] font-semibold">Archivist sign-in</div>
          <div className="text-row text-muted text-pretty">
            Writing to the catalog needs a session.
          </div>
        </div>
        <div className="flex flex-col gap-2 px-4 pb-4">
          <input
            ref={userRef}
            name="u"
            placeholder="Username"
            aria-label="user"
            autoComplete="username"
            autoCapitalize="off"
            spellCheck={false}
            value={user}
            onChange={(event) => setUser(event.target.value)}
            className={DIALOG_FIELD}
          />
          <input
            name="p"
            type="password"
            placeholder="Password"
            aria-label="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={DIALOG_FIELD}
          />
          {failed && (
            <div className="mono text-xs text-ink">
              Credentials not recognised.
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 border-t border-line">
          <button
            type="button"
            onClick={onCancel}
            className={cx(DIALOG_ACTION, "border-r border-line")}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className={cx(DIALOG_ACTION, "font-semibold")}
          >
            Sign in
          </button>
        </div>
      </form>
    );

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
