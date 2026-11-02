"use client";
import { useEffect, useId, useRef, useState } from "react";
import {
  Button,
  Icon,
  Loading,
  Notice,
  SearchBox,
  useData,
  type Row,
} from "@sleektech/ui";
export function Pagination({
  pagination,
  onPage,
}: {
  pagination?: Row;
  onPage: (page: number) => void;
}) {
  if (!pagination || !pagination.total) return null;
  const { page, pages, total, limit } = pagination;
  return (
    <nav className="pagination" aria-label="Pagination">
      <span>
        {total
          ? `${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total}`
          : "No records"}
      </span>
      {pages > 1 && (
        <div>
          <Button
            variant="secondary small"
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
          >
            Previous
          </Button>
          <span>
            Page {page} of {pages}
          </span>
          <Button
            variant="secondary small"
            disabled={page >= pages}
            onClick={() => onPage(page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </nav>
  );
}
export function DebouncedSearch({
  value,
  onChange,
  placeholder = "Search by name…",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    setDraft(value);
    if (timer.current) clearTimeout(timer.current);
  }, [value]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  return (
    <SearchBox
      value={draft}
      placeholder={placeholder}
      onChange={(next) => {
        setDraft(next);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => onChange(next.slice(0, 80)), 300);
      }}
    />
  );
}
export function useDebounced<T>(value: T, delay = 300) {
  const [result, setResult] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setResult(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return result;
}
export function LoadState({
  error,
  retry,
}: {
  error?: string;
  retry: () => void;
}) {
  return error ? (
    <div className="record-load-error">
      <Notice error>{error}</Notice>
      <Button variant="secondary" onClick={retry}>
        Try again
      </Button>
    </div>
  ) : (
    <Loading />
  );
}
export function ReferencePicker({
  label,
  value,
  onChange,
  kind = "people",
  required = false,
}: {
  label: string;
  value: Row | null;
  onChange: (item: Row | null) => void;
  kind?: "people" | "customers" | "leads";
  required?: boolean;
}) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const term = useDebounced(query);
  const path = kind === "people" ? "/collaboration/people" : "/crm/" + kind;
  const { data, error } = useData(
    open && term.length >= 2
      ? `${path}?q=${encodeURIComponent(term)}&limit=8`
      : null,
  );
  const items: Row[] = data?.items || [];
  const select = (item: Row) => {
    onChange(item);
    setOpen(false);
    setQuery("");
    setActive(0);
  };
  return (
    <div
      className="field reference-picker"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node))
          setOpen(false);
      }}
    >
      <label htmlFor={id}>{label}</label>
      <div className="reference-input">
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={open ? id + "-options" : undefined}
          aria-autocomplete="list"
          aria-activedescendant={
            open && items[active] ? id + "-" + active : undefined
          }
          autoComplete="off"
          required={required}
          value={open ? query : value?.company || value?.name || ""}
          placeholder="Type at least two letters…"
          maxLength={80}
          onFocus={() => {
            setQuery(value?.company || value?.name || query);
            setOpen(true);
          }}
          onChange={(event) => {
            setQuery(event.target.value);
            setActive(0);
            if (value) onChange(null);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActive((index) => Math.min(index + 1, items.length - 1));
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActive((index) => Math.max(0, index - 1));
            }
            if (event.key === "Enter" && open && items[active]) {
              event.preventDefault();
              select(items[active]);
            }
          }}
        />
        {value && (
          <button
            type="button"
            className="text-button"
            aria-label={"Clear " + label.toLowerCase()}
            onClick={() => {
              onChange(null);
              setQuery("");
              setOpen(false);
            }}
          >
            Clear
          </button>
        )}
      </div>
      {open && (
        <div
          className="suggestions"
          id={id + "-options"}
          role="listbox"
          aria-label={label + " suggestions"}
        >
          {items.map((item, index) => (
            <button
              type="button"
              role="option"
              aria-selected={index === active}
              id={id + "-" + index}
              key={item.id}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => select(item)}
            >
              <b>{item.company || item.name}</b>
              <small>{item.email || item.name}</small>
            </button>
          ))}
          {!items.length && (
            <p>
              {error ||
                (term.length < 2
                  ? "Type at least two letters."
                  : data
                    ? "No matching records."
                    : "Searching…")}
            </p>
          )}
          <button
            type="button"
            className="text-button"
            onClick={() => setOpen(false)}
          >
            Close suggestions
          </button>
        </div>
      )}
    </div>
  );
}
export const fullDate = (value: any) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "Not set";
export const timestamp = (value: any) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(value))
    : "Not recorded";
export function Facts({ items }: { items: [string, any][] }) {
  return (
    <dl className="record-facts horizontal">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>
            {value === null || value === undefined || value === ""
              ? "Not added"
              : value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
export function Description({
  label,
  children,
}: {
  label: string;
  children: any;
}) {
  return (
    <section className="record-description record-prose">
      <h2>{label}</h2>
      <p>{children || "No details added yet."}</p>
    </section>
  );
}
export const recordURL = (type: string, id: string) =>
  type === "briefs"
    ? `/leads/${id}/brief`
    : `/${type === "messages" ? "communications" : type}/${id}`;
