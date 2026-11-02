"use client";
import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  api,
  Avatar,
  Button,
  Empty,
  Icon,
  Notice,
  Panel,
  useAction,
  useData,
  type Row,
} from "@sleektech/ui";
import {
  Pagination,
  LoadState,
  recordURL,
  timestamp,
  useDebounced,
} from "./crm-ui";
import { useNotifications } from "./NotificationProvider";
import { useCrmNavigation } from "./crm-navigation";
export function MentionComposer({
  type,
  id,
  parentId = null,
  onPosted,
}: {
  type: string;
  id: string;
  parentId?: string | null;
  onPosted: () => void;
}) {
  const fieldId = useId();
  const [body, setBody] = useState("");
  const [mentions, setMentions] = useState<Row[]>([]);
  const [caret, setCaret] = useState(0);
  const [active, setActive] = useState(0);
  const [suggest, setSuggest] = useState(true);
  const action = useAction();
  const before = body.slice(0, caret),
    match = before.match(/@([^@\n]{0,80})$/),
    query = useDebounced(match?.[1] || "");
  const { data, error } = useData(
    suggest && match && query.length >= 2
      ? "/collaboration/people?q=" + encodeURIComponent(query)
      : null,
  );
  const items: Row[] = data?.items || [];
  const pick = (person: Row) => {
    const start = before.lastIndexOf("@");
    setBody(body.slice(0, start) + "@" + person.name + " " + body.slice(caret));
    setMentions((old) => [...old.filter((p) => p.id !== person.id), person]);
    setSuggest(false);
    setActive(0);
  };
  return (
    <form
      className="comment-composer"
      onSubmit={async (event) => {
        event.preventDefault();
        const result = await action.run(() =>
          api(`/collaboration/records/${type}/${id}/comments`, {
            method: "POST",
            body: {
              body,
              parent_id: parentId,
              mention_ids: mentions
                .filter((person) => body.includes("@" + person.name))
                .map((person) => person.id),
              request_id: crypto.randomUUID(),
            },
          }),
        );
        if (result) {
          setBody("");
          setMentions([]);
          setSuggest(false);
          onPosted();
        }
      }}
    >
      <label htmlFor={fieldId}>
        {parentId ? "Your reply" : "Add a comment"}
      </label>
      <textarea
        id={fieldId}
        rows={2}
        required
        minLength={1}
        maxLength={5000}
        value={body}
        placeholder="Share an update. Type @ to mention a teammate."
        aria-describedby={fieldId + "-hint"}
        aria-autocomplete="list"
        aria-controls={suggest && match ? fieldId + "-suggestions" : undefined}
        onChange={(event) => {
          setBody(event.target.value);
          setCaret(event.target.selectionStart);
          setActive(0);
          setSuggest(true);
        }}
        onClick={(event) => setCaret(event.currentTarget.selectionStart)}
        onKeyDown={(event) => {
          if (!suggest || !items.length) return;
          if (event.key === "Escape") setSuggest(false);
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((index) => Math.min(index + 1, items.length - 1));
          }
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((index) => Math.max(index - 1, 0));
          }
          if (event.key === "Enter" && items[active]) {
            event.preventDefault();
            pick(items[active]);
          }
        }}
      />
      {suggest && match && (
        <div
          className="mention-suggestions"
          id={fieldId + "-suggestions"}
          role="listbox"
          aria-label="Mention suggestions"
        >
          {items.map((person, index) => (
            <button
              type="button"
              role="option"
              aria-selected={index === active}
              key={person.id}
              onClick={() => pick(person)}
            >
              <Avatar name={person.name} />
              <span>
                <b>{person.name}</b>
                <small>{person.email}</small>
              </span>
            </button>
          ))}
          {!items.length && (
            <p>
              {error ||
                (query.length < 2
                  ? "Type two letters to find a teammate."
                  : data
                    ? "No eligible teammates found."
                    : "Searching…")}
            </p>
          )}
        </div>
      )}
      <small id={fieldId + "-hint"}>
        Use @ to mention and notify a teammate.
      </small>
      <Notice error>{action.error}</Notice>
      <div className="form-actions">
        <span className="muted">{body.length}/5,000</span>
        <Button type="submit" disabled={action.busy || !body.trim()}>
          {action.busy ? "Posting…" : parentId ? "Post reply" : "Post comment"}
        </Button>
      </div>
    </form>
  );
}
function Replies({
  type,
  id,
  parent,
  initialPage = 1,
  onPosted,
}: {
  type: string;
  id: string;
  parent: Row;
  initialPage?: number;
  onPosted: () => void;
}) {
  const [page, setPage] = useState(initialPage);
  const { data, error, reload } = useData(
    `/collaboration/records/${type}/${id}/comments?parent=${parent.id}&page=${page}&limit=10`,
  );
  return (
    <div className="comment-replies">
      {!data ? (
        <LoadState error={error} retry={reload} />
      ) : (
        <>
          {data.items.map((comment: Row) => (
            <Comment key={comment.id} comment={comment} />
          ))}
          <Pagination pagination={data.pagination} onPage={setPage} />
        </>
      )}
      <MentionComposer
        type={type}
        id={id}
        parentId={parent.id}
        onPosted={() => {
          reload();
          onPosted();
        }}
      />
    </div>
  );
}
function Comment({
  comment,
  children,
}: {
  comment: Row;
  children?: React.ReactNode;
}) {
  const { params } = useCrmNavigation();
  const focused = params.get("comment") === comment.id;
  const element = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!focused) return;
    const frame = requestAnimationFrame(() => {
      element.current?.scrollIntoView({ block: "center", behavior: "instant" });
      element.current?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [focused]);
  return (
    <article
      ref={element}
      tabIndex={focused ? -1 : undefined}
      className={"comment" + (focused ? " comment-highlight" : "")}
      id={"comment-" + comment.id}
    >
      <header>
        <Avatar name={comment.author_name} />
        <div>
          <b>{comment.author_name}</b>
          <time dateTime={comment.created_at}>
            {timestamp(comment.created_at)}
          </time>
        </div>
      </header>
      <p>{comment.body}</p>
      {children}
    </article>
  );
}
export function Discussion({ type, id }: { type: string; id: string }) {
  const { params } = useCrmNavigation();
  const commentId = params.get("comment");
  const { data: location, error: locationError } = useData(
    commentId
      ? `/collaboration/records/${type}/${id}/comments/${encodeURIComponent(commentId)}/location`
      : null,
  );
  const [tab, setTab] = useState("comments");
  const [page, setPage] = useState(1);
  const [reply, setReply] = useState<string | null>(null);
  useEffect(() => {
    if (!location) return;
    setTab("comments");
    setPage(location.page);
    setReply(location.parent_id || null);
  }, [location]);
  const { data, error, reload } = useData(
    `/collaboration/records/${type}/${id}/${tab}?page=${page}&limit=10`,
  );
  return (
    <section className="discussion">
      <Notice error>{locationError}</Notice>
      <div className="record-section-heading">
        <h2>Team workspace</h2>
        <div className="tabs" aria-label="Record discussion">
          <button
            aria-pressed={tab === "comments"}
            className={tab === "comments" ? "active" : ""}
            onClick={() => {
              setTab("comments");
              setPage(1);
            }}
          >
            Comments & replies
          </button>
          <button
            aria-pressed={tab === "timeline"}
            className={tab === "timeline" ? "active" : ""}
            onClick={() => {
              setTab("timeline");
              setPage(1);
            }}
          >
            Activity timeline
          </button>
        </div>
      </div>
      {!data ? (
        <LoadState error={error} retry={reload} />
      ) : (
        <>
          {tab === "comments" ? (
            <>
              {data.items.length ? (
                data.items.map((comment: Row) => (
                  <Comment comment={comment} key={comment.id}>
                    <button
                      className="text-button"
                      onClick={() =>
                        setReply(reply === comment.id ? null : comment.id)
                      }
                    >
                      {reply === comment.id
                        ? "Close thread"
                        : comment.reply_count
                          ? `View ${comment.reply_count} replies · Reply`
                          : "Reply"}
                    </button>
                    {reply === comment.id && (
                      <Replies
                        type={type}
                        id={id}
                        parent={comment}
                        key={comment.id + ":" + (location?.reply_page || 1)}
                        initialPage={
                          location?.parent_id === comment.id
                            ? location.reply_page
                            : 1
                        }
                        onPosted={reload}
                      />
                    )}
                  </Comment>
                ))
              ) : (
                <p className="discussion-empty">
                  <Icon name="messages" size={16} />
                  No comments yet. Share the next step with your team.
                </p>
              )}
            </>
          ) : (
            <div className="record-timeline">
              {data.items.length ? (
                data.items.map((event: Row) => (
                  <article key={event.id}>
                    <span className="timeline-dot" />
                    <div>
                      <h3>{event.summary}</h3>
                      <small>
                        {event.actor_name} · {timestamp(event.created_at)}
                      </small>
                      {event.changes?.filter(
                        (change: Row) =>
                          !["comment_id", "done"].includes(change.field),
                      ).length > 0 && (
                        <details>
                          <summary>View changes</summary>
                          <dl>
                            {event.changes
                              .filter(
                                (change: Row) =>
                                  !["comment_id", "done"].includes(
                                    change.field,
                                  ),
                              )
                              .map((change: Row) => (
                                <div key={change.field}>
                                  <dt>{change.field.replaceAll("_", " ")}</dt>
                                  <dd>
                                    <span>
                                      {String(change.before ?? "Not set")}
                                    </span>
                                    <Icon name="right" size={12} />
                                    <b>{String(change.after ?? "Not set")}</b>
                                  </dd>
                                </div>
                              ))}
                          </dl>
                        </details>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <Empty title="No activity recorded yet">
                  Changes made from now on will appear here.
                </Empty>
              )}
            </div>
          )}
          <Pagination pagination={data.pagination} onPage={setPage} />
        </>
      )}
      {tab === "comments" && (
        <MentionComposer
          type={type}
          id={id}
          onPosted={() => {
            if (data?.pagination) {
              const last = Math.max(
                1,
                Math.ceil((data.pagination.total + 1) / 10),
              );
              if (last !== page) {
                setPage(last);
                return;
              }
            }
            reload();
          }}
        />
      )}
    </section>
  );
}
export function NotificationBell() {
  const { data, reload } = useData("/collaboration/notifications/count");
  const { revision } = useNotifications();
  useEffect(() => {
    if (revision) void reload();
  }, [revision, reload]);
  return (
    <Link
      href="/notifications"
      className="notification-link"
      aria-label={`Notifications${data?.unread ? `, ${data.unread} unread` : ""}`}
    >
      <Icon name="bell" size={17} />
      <span>Notifications</span>
      {data?.unread > 0 && <b>{data.unread > 99 ? "99+" : data.unread}</b>}
    </Link>
  );
}
export function NotificationsPage() {
  const { params, filter } = useCrmNavigation();
  const page = Number(params.get("page") || 1);
  const { data, error, reload } = useData(
    `/collaboration/notifications?page=${page}`,
  );
  const { revision, status, refresh } = useNotifications();
  useEffect(() => {
    if (revision) void reload();
  }, [revision, reload]);
  const action = useAction();
  const mark = async (note: Row) => {
    if (note.read_at) return;
    await action.run(() =>
      api("/collaboration/notifications/" + note.id, {
        method: "PATCH",
        keepalive: true,
        body: { read: true },
      }),
    );
    reload();
    refresh();
  };
  return (
    <Panel title="Your notifications">
      <p className={"notification-connection " + status} role="status">
        <span aria-hidden="true" />
        {status === "live"
          ? "Live updates"
          : status === "offline"
            ? "You’re offline. Updates will resume when connected."
            : status === "reconnecting"
              ? "Reconnecting to live updates…"
              : "Connecting to live updates…"}
      </p>
      <Notice error>{action.error}</Notice>
      {!data ? (
        <LoadState error={error} retry={reload} />
      ) : (
        <>
          <div className="notification-list">
            {data.items.length ? (
              data.items.map((note: Row) => (
                <article className={note.read_at ? "" : "unread"} key={note.id}>
                  <Link
                    className="notification-open"
                    href={
                      recordURL(note.record_type, note.record_id) +
                      "?" +
                      new URLSearchParams({
                        from:
                          "/notifications" + (page > 1 ? "?page=" + page : ""),
                        ...(note.comment_id
                          ? { comment: note.comment_id }
                          : {}),
                      })
                    }
                    onClick={() => {
                      void mark(note);
                    }}
                    onAuxClick={(event) => {
                      if (event.button === 1) void mark(note);
                    }}
                  >
                    <Avatar name={note.actor_name} />
                    <span className="notification-copy">
                      <b>{note.title}</b>
                      <small>{timestamp(note.created_at)}</small>
                    </span>
                    <Icon name="right" size={16} />
                  </Link>
                  {!note.read_at && (
                    <Button
                      variant="secondary small"
                      onClick={() => mark(note)}
                    >
                      Mark read
                    </Button>
                  )}
                </article>
              ))
            ) : (
              <Empty title="You’re all caught up" icon="check">
                Mentions and task assignments will appear here.
              </Empty>
            )}
          </div>
          <Pagination
            pagination={data.pagination}
            onPage={(value) => filter("page", String(value))}
          />
        </>
      )}
    </Panel>
  );
}
