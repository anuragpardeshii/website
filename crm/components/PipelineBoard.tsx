"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  GripVertical,
  ArrowRight,
  Check,
  RefreshCw,
  LayoutList,
  LockKeyhole,
} from "lucide-react";
import { api, Avatar, Notice, money, useData, type Row } from "@sleektech/ui";
import { DebouncedSearch, LoadState } from "./crm-ui";
import { useCrmNavigation } from "./crm-navigation";

const stages = ["New", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];
const colors: Record<string, string> = {
  New: "#73839b",
  Qualified: "#3164db",
  Proposal: "#7661c9",
  Negotiation: "#b17b25",
  Won: "#26866b",
  Lost: "#8a7380",
};
type Column = {
  stage: string;
  items: Row[];
  total: number;
  value: number;
  page: number;
  limit: number;
};
type Move = { lead: Row; target: string };

function previewMove(columns: Column[], { lead, target }: Move): Column[] {
  return columns.map((column) =>
    column.stage === lead.stage
      ? {
          ...column,
          items: column.items.filter((item) => item.id !== lead.id),
          total: column.total - 1,
          value: column.value - lead.value,
        }
      : column.stage === target
        ? {
            ...column,
            items: [{ ...lead, stage: target }, ...column.items],
            total: column.total + 1,
            value: column.value + lead.value,
          }
        : column,
  );
}

function Opportunity({
  lead,
  busy,
  saving,
  href,
  onMove,
}: {
  lead: Row;
  busy: boolean;
  saving: boolean;
  href: string;
  onMove: (lead: Row, stage: string) => void;
}) {
  const locked = lead.stage === "Won";
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } =
    useDraggable({
      id: lead.id,
      data: { lead },
      disabled: busy || locked,
    });
  return (
    <article
      ref={setNodeRef}
      className={
        "opportunity-card" +
        (isDragging ? " is-dragging" : "") +
        (saving ? " is-saving" : "")
      }
      data-lead-id={lead.id}
      aria-busy={saving}
    >
      <div className="opportunity-title">
        <Link
          id={"opportunity-" + lead.id}
          href={href}
          draggable={false}
          className="opportunity-link"
        >
          {lead.company}
        </Link>
        {!locked && (
          <button
            {...attributes}
            {...listeners}
            ref={setActivatorNodeRef}
            type="button"
            className="drag-handle"
            aria-label={"Drag " + lead.company}
            aria-describedby="pipeline-instructions"
            disabled={busy}
            onKeyDown={(event) => {
              if (["Enter", " "].includes(event.key)) {
                event.preventDefault();
                document.getElementById("move-" + lead.id)?.focus();
              }
            }}
          >
            <GripVertical size={16} aria-hidden="true" />
          </button>
        )}
      </div>
      <p className="opportunity-contact">{lead.name}</p>
      <strong className="opportunity-value">{money(lead.value)}</strong>
      <p className="opportunity-next">
        <ArrowRight size={13} aria-hidden="true" />
        <span>{lead.next_action || "No next step set"}</span>
      </p>
      <footer>
        <span className="opportunity-owner" title={lead.owner || "Unassigned"}>
          <Avatar name={lead.owner || "Unassigned"} />
          <span>{lead.owner || "Unassigned"}</span>
        </span>
        {locked ? (
          <span className="opportunity-won">
            <LockKeyhole size={11} aria-hidden="true" /> Customer
          </span>
        ) : (
          <select
            id={"move-" + lead.id}
            value={lead.stage}
            disabled={busy}
            aria-label={"Move " + lead.company + " to stage"}
            onChange={(event) => onMove(lead, event.target.value)}
          >
            {stages.map((stage) => (
              <option
                key={stage}
                disabled={stage === "Won" && lead.stage === "Lost"}
              >
                {stage}
              </option>
            ))}
          </select>
        )}
      </footer>
    </article>
  );
}

function StageColumn({
  column,
  active,
  pending,
  busy,
  loading,
  onMore,
  onMove,
  href,
}: {
  column: Column;
  active: Row | null;
  pending: Move | null;
  busy: boolean;
  loading: boolean;
  onMore: () => void;
  onMove: (lead: Row, stage: string) => void;
  href: (path: string) => string;
}) {
  const disabled = active?.stage === "Lost" && column.stage === "Won";
  const { setNodeRef, isOver } = useDroppable({ id: column.stage, disabled });
  return (
    <section
      ref={setNodeRef}
      className={
        "pipeline-column" +
        (isOver ? " is-over" : "") +
        (active && disabled ? " drop-disabled" : "")
      }
      style={{ "--stage-color": colors[column.stage] } as CSSProperties}
      aria-label={column.stage + " opportunities"}
      data-stage={column.stage}
    >
      <header className="pipeline-column-heading">
        <div>
          <h2>
            <span aria-hidden="true" />
            {column.stage}
          </h2>
          <span className="pipeline-count">{column.total}</span>
        </div>
        <p>
          {money(column.value)}
          <span>
            {column.stage === "Won"
              ? "Closed revenue"
              : column.stage === "Lost"
                ? "Closed lost"
                : "Pipeline value"}
          </span>
        </p>
      </header>
      <div className="pipeline-cards">
        {column.items.map((lead) => (
          <Opportunity
            key={lead.id}
            lead={lead}
            busy={busy}
            saving={pending?.lead.id === lead.id}
            href={href("/leads/" + lead.id)}
            onMove={onMove}
          />
        ))}
        {!column.items.length && (
          <div className="pipeline-empty">
            {active && !disabled ? "Drop opportunity here" : "No opportunities"}
          </div>
        )}
        {column.items.length < column.total && (
          <button
            type="button"
            className="pipeline-more"
            disabled={busy || loading}
            onClick={onMore}
          >
            {loading
              ? "Loading…"
              : `Load more · ${column.total - column.items.length} remaining`}
          </button>
        )}
      </div>
      <div className="pipeline-column-note">
        {column.stage === "Won"
          ? "Moving here creates a customer"
          : `${column.items.length} of ${column.total} shown`}
      </div>
    </section>
  );
}

export function PipelineBoard() {
  const { params, filter, href } = useCrmNavigation();
  const q = params.get("q") || "";
  const selectedStage = stages.includes(params.get("stage") || "")
    ? params.get("stage")!
    : "";
  const { data, error, reload, loading } = useData(
    "/crm/pipeline?" + new URLSearchParams({ q, limit: "12" }),
  );
  const [extra, setExtra] = useState<{ source: Row | null; columns: Column[] }>(
    { source: null, columns: [] },
  );
  const [active, setActive] = useState<Row | null>(null);
  const [pending, setPending] = useState<Move | null>(null);
  const [message, setMessage] = useState("");
  const [failure, setFailure] = useState("");
  const [loadingStage, setLoadingStage] = useState("");
  const [focusId, setFocusId] = useState<string | null>(null);
  const mutation = useRef(false);
  const currentData = useRef(data);
  const board = useRef<HTMLDivElement>(null);
  const requests = useRef(new Set<AbortController>());
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );
  useEffect(() => {
    currentData.current = data;
  }, [data]);
  useEffect(
    () => () => {
      for (const request of requests.current) request.abort();
    },
    [],
  );
  useEffect(() => {
    if (focusId && !pending && data) {
      const target =
        document.getElementById("opportunity-" + focusId) || board.current;
      target?.focus({ preventScroll: true });
      target?.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: "instant",
      });
      setFocusId(null);
    }
  }, [focusId, pending, data]);
  const columns: Column[] =
    extra.source === data && data ? extra.columns : data?.columns || [];
  const displayed = pending ? previewMove(columns, pending) : columns;
  const total = displayed.reduce((count, column) => count + column.total, 0);
  const open = displayed.filter(
    (column) => !["Won", "Lost"].includes(column.stage),
  );
  const openValue = open.reduce((sum, column) => sum + column.value, 0);
  const busy = !!pending || loading;

  async function move(lead: Row, target: string) {
    if (
      mutation.current ||
      loadingStage ||
      loading ||
      target === lead.stage ||
      lead.stage === "Won"
    )
      return;
    mutation.current = true;
    setFailure("");
    setMessage("");
    setPending({ lead, target });
    try {
      await api(`/crm/pipeline/${lead.id}/stage`, {
        method: "PATCH",
        body: { stage: target, expected_version: lead.version || 1 },
      });
      setMessage(
        `${lead.company} moved from ${lead.stage} to ${target}.${target === "Won" ? " Customer created." : ""}`,
      );
    } catch (error: any) {
      setFailure(`Could not move ${lead.company}. ${error.message}`);
    } finally {
      // Reconcile even after network failures: the server may have committed a move.
      await reload();
      setPending(null);
      setFocusId(lead.id);
      mutation.current = false;
    }
  }
  async function more(column: Column) {
    if (busy || mutation.current || loadingStage) return;
    setLoadingStage(column.stage);
    setFailure("");
    const source = data;
    const controller = new AbortController();
    requests.current.add(controller);
    try {
      const result = await api(
        `/crm/pipeline/stages/${encodeURIComponent(column.stage)}?` +
          new URLSearchParams({
            q,
            page: String(column.page + 1),
            limit: String(column.limit),
          }),
        { signal: controller.signal },
      );
      if (currentData.current !== source) return;
      setExtra({
        source,
        columns: columns.map((item) =>
          item.stage === column.stage
            ? {
                ...item,
                total: result.pagination.total,
                page: result.pagination.page,
                items: [
                  ...item.items,
                  ...result.items.filter(
                    (record: Row) =>
                      !item.items.some((old) => old.id === record.id),
                  ),
                ],
              }
            : item,
        ),
      });
    } catch (error: any) {
      if (!controller.signal.aborted) setFailure(error.message);
    } finally {
      requests.current.delete(controller);
      setLoadingStage("");
    }
  }
  function drop(event: DragEndEvent) {
    setActive(null);
    if (event.over && event.active.data.current?.lead)
      void move(event.active.data.current.lead, String(event.over.id));
  }
  return (
    <section className="pipeline-workspace" aria-label="Opportunity pipeline">
      <fieldset className="pipeline-toolbar" disabled={busy || !!loadingStage}>
        <DebouncedSearch
          value={q}
          onChange={(value) => {
            if (!mutation.current) filter("q", value);
          }}
          placeholder="Search contacts or companies…"
        />
        <div className="pipeline-tools">
          <select
            className="compact-select"
            aria-label="Filter pipeline stage"
            value={selectedStage}
            onChange={(event) => filter("stage", event.target.value)}
          >
            <option value="">All stages</option>
            {stages.map((stage) => (
              <option key={stage}>{stage}</option>
            ))}
          </select>
          <button
            className="pipeline-refresh"
            aria-label="Refresh pipeline"
            type="button"
            onClick={() => void reload()}
          >
            <RefreshCw size={15} aria-hidden="true" />
          </button>
          <Link className="pipeline-list-link" href="/leads">
            <LayoutList size={15} aria-hidden="true" /> List view
          </Link>
        </div>
      </fieldset>
      <div className="pipeline-summary">
        <span>
          <strong>{money(openValue)}</strong> open pipeline{" "}
          <span className="pipeline-summary-divider">/</span> {total}{" "}
          {q ? "matching " : ""}opportunities
        </span>
        <span className="pipeline-save-state" role="status" aria-live="polite">
          {pending ? (
            "Saving stage…"
          ) : message ? (
            <>
              <Check size={14} aria-hidden="true" />
              {message}
            </>
          ) : (
            "Changes save automatically"
          )}
        </span>
      </div>
      <p id="pipeline-instructions" className="sr-only">
        Drag using the grip, or use each opportunity’s stage selector. Press
        Escape to cancel a drag. Won creates a customer; converted opportunities
        stay Won.
      </p>
      <Notice error>{failure}</Notice>
      {!data ? (
        <LoadState error={error} retry={reload} />
      ) : (
        <DndContext
          id="sales-pipeline"
          sensors={sensors}
          collisionDetection={pointerWithin}
          onDragStart={(event) => {
            setActive(event.active.data.current?.lead || null);
            setMessage("");
          }}
          onDragEnd={drop}
          onDragCancel={() => {
            setActive(null);
            setMessage("Move cancelled. Stage unchanged.");
          }}
          accessibility={{
            screenReaderInstructions: {
              draggable:
                "Use the stage selector to move this opportunity without dragging.",
            },
            announcements: {
              onDragStart: ({ active }) =>
                `Moving ${active.data.current?.lead.company}.`,
              onDragOver: ({ over }) =>
                over ? `Over ${over.id}.` : "Outside a stage.",
              onDragEnd: ({ over }) =>
                over ? `Saving move to ${over.id}.` : "Move cancelled.",
              onDragCancel: () => "Move cancelled.",
            },
          }}
        >
          <div
            ref={board}
            className="pipeline-scroll"
            tabIndex={0}
            role="region"
            aria-label="Pipeline stages. Scroll horizontally to see all stages."
          >
            <div
              className={
                "pipeline-board" + (selectedStage ? " single-stage" : "")
              }
            >
              {displayed
                .filter(
                  (column) => !selectedStage || column.stage === selectedStage,
                )
                .map((column) => (
                  <StageColumn
                    key={column.stage}
                    column={column}
                    active={active}
                    pending={pending}
                    busy={busy || !!loadingStage}
                    loading={loadingStage === column.stage}
                    onMore={() => void more(column)}
                    onMove={(lead, stage) => void move(lead, stage)}
                    href={href}
                  />
                ))}
            </div>
          </div>
          <DragOverlay dropAnimation={null}>
            {active && (
              <div className="opportunity-card drag-preview">
                <strong>{active.company}</strong>
                <p>{active.name}</p>
                <b>{money(active.value)}</b>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      )}
    </section>
  );
}
