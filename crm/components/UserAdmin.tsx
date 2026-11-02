"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Avatar,
  Badge,
  Button,
  Field,
  Notice,
  Panel,
  PasswordField,
  Empty,
  api,
  useData,
  useAction,
  type Row,
} from "@sleektech/ui";
import { RecordPage } from "./RecordPage";
import { useCrmNavigation } from "./crm-navigation";
import {
  DebouncedSearch,
  Pagination,
  LoadState,
  Facts,
  fullDate,
} from "./crm-ui";
const roles = ["super_admin", "admin", "sales", "recruiter", "candidate"];
export function UserAdmin({ currentUser }: { currentUser: Row }) {
  const { id, params, filter, backHref, href } = useCrmNavigation();
  const query = new URLSearchParams();
  for (const key of ["page", "q", "role"])
    if (params.get(key)) query.set(key, params.get(key)!);
  const { data, error, reload } = useData(
    id ? "/admin/users/" + id : "/admin/users?" + query,
  );
  const action = useAction();
  const [editing, setEditing] = useState(false);
  const [reset, setReset] = useState<Row | null>(null);
  if (id) {
    if (!data) return <LoadState error={error} retry={reload} />;
    const user = data.user,
      self = user.id === currentUser.id;
    return (
      <RecordPage
        title={user.name}
        subtitle={user.email}
        backHref={backHref}
        eyebrow="USER ADMINISTRATION"
        actions={
          !editing && (
            <Button
              onClick={() => {
                action.setError("");
                setEditing(true);
              }}
            >
              Edit user
            </Button>
          )
        }
      >
        <Notice error>{action.error}</Notice>
        <Notice>{action.notice}</Notice>
        {editing ? (
          <form
            className="form-stack"
            onSubmit={async (event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const values = Object.fromEntries(new FormData(form));
              const result = await action.run(
                () =>
                  api("/admin/users/" + id, {
                    method: "PATCH",
                    body: {
                      name: values.name,
                      role: values.role || user.role,
                      disabled: self ? false : values.status === "disabled",
                      version: user.version || 1,
                      current_password: values.current_password,
                    },
                  }),
                "User access updated.",
              );
              if (result) {
                form.reset();
                setEditing(false);
                await reload();
              }
            }}
          >
            <div className="form-grid">
              <Field
                label="Full name"
                name="name"
                required
                minLength={2}
                maxLength={100}
                defaultValue={user.name}
              />
              <Field
                label="Role"
                hint={
                  self
                    ? "Your own super-admin access is protected."
                    : "Access changes revoke this user’s existing sessions."
                }
              >
                <select name="role" defaultValue={user.role} disabled={self}>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Account status">
                <select
                  name="status"
                  defaultValue={user.disabled ? "disabled" : "active"}
                  disabled={self}
                >
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </Field>
              <PasswordField
                label="Your current password"
                name="current_password"
                required
                maxLength={128}
                autoComplete="current-password"
              />
            </div>
            <div className="form-actions">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditing(false);
                  action.setError("");
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={action.busy}>
                Save user
              </Button>
            </div>
          </form>
        ) : (
          <Facts
            items={[
              ["Name", user.name],
              ["Email", user.email],
              ["Role", user.role.replaceAll("_", " ")],
              [
                "Account status",
                <Badge>{user.disabled ? "Disabled" : "Active"}</Badge>,
              ],
              ["Joined", fullDate(user.created_at)],
              ["Last updated", fullDate(user.updated_at)],
            ]}
          />
        )}
        {!editing && (
          <section className="reset-management">
            <h2>Password recovery</h2>
            <p>
              Generate a one-time link valid for 30 minutes. A successful reset
              signs the user out of all sessions.
            </p>
            <form
              className="form-stack"
              onSubmit={async (event) => {
                event.preventDefault();
                const form = event.currentTarget;
                const result = await action.run(
                  () =>
                    api(`/admin/users/${id}/reset-link`, {
                      method: "POST",
                      body: {
                        current_password: new FormData(form).get(
                          "current_password",
                        ),
                      },
                    }),
                  "Reset link created. It has not been sent.",
                );
                if (result) {
                  setReset(result);
                  form.reset();
                }
              }}
            >
              <PasswordField
                label="Confirm your password"
                name="current_password"
                autoComplete="current-password"
                required
                maxLength={128}
              />
              <Button disabled={action.busy || user.disabled} type="submit">
                Generate reset link
              </Button>
            </form>
            {reset && (
              <div className="reset-link">
                <Field
                  label="One-time password reset link"
                  readOnly
                  value={reset.url}
                  onFocus={(event: any) => event.target.select()}
                />
                <small>
                  Expires {new Date(reset.expires_at).toLocaleString()}
                </small>
                <Button
                  variant="secondary"
                  onClick={() =>
                    action.run(async () => {
                      if (!navigator.clipboard)
                        throw new Error("Select and copy the link above.");
                      await navigator.clipboard.writeText(reset.url);
                    }, "Reset link copied.")
                  }
                >
                  Copy reset link
                </Button>
              </div>
            )}
          </section>
        )}
      </RecordPage>
    );
  }
  return (
    <Panel title="Users & access">
      <div className="toolbar">
        <DebouncedSearch
          value={params.get("q") || ""}
          onChange={(value) => filter("q", value)}
          placeholder="Search user names or emails…"
        />
        <select
          aria-label="Filter users by role"
          value={params.get("role") || ""}
          onChange={(event) => filter("role", event.target.value)}
        >
          <option value="">All roles</option>
          {roles.map((role) => (
            <option key={role} value={role}>
              {role.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>
      {!data ? (
        <LoadState error={error} retry={reload} />
      ) : (
        <>
          {data.items.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th scope="col" className="table-actions">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((user: Row) => (
                    <tr key={user.id}>
                      <td>
                        <Link
                          className="cell-button"
                          href={href("/users/" + user.id)}
                        >
                          <Avatar name={user.name} />
                          <b>{user.name}</b>
                        </Link>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.role.replaceAll("_", " ")}</td>
                      <td>
                        <Badge>{user.disabled ? "Disabled" : "Active"}</Badge>
                      </td>
                      <td>{fullDate(user.created_at)}</td>
                      <td className="table-actions">
                        <Link
                          className="table-view"
                          prefetch={false}
                          href={href("/users/" + user.id)}
                          aria-label={`View ${user.name}`}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty title="No matching users">
              Try another name, email or role.
            </Empty>
          )}
          <Pagination
            pagination={data.pagination}
            onPage={(page) => filter("page", String(page))}
          />
        </>
      )}
    </Panel>
  );
}
