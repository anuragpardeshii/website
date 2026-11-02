"use client";
import {
  Button,
  Field,
  Notice,
  api,
  values,
  useAction,
  type Row,
} from "@sleektech/ui";
export function RoleForm({
  job,
  onCancel,
  onSaved,
}: {
  job: Row;
  onCancel: () => void;
  onSaved: (job: Row) => void | Promise<void>;
}) {
  const action = useAction();
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        const result = await action.run(() =>
          api("/talent/jobs" + (job.id ? "/" + job.id : ""), {
            method: job.id ? "PATCH" : "POST",
            body: values(event.currentTarget),
          }),
        );
        if (result) await onSaved(result);
      }}
    >
      <Notice error>{action.error}</Notice>
      <div className="form-grid">
        <Field
          label="Job title"
          name="title"
          required
          minLength={3}
          defaultValue={job.title}
        />
        <Field
          label="Department"
          name="department"
          required
          defaultValue={job.department || "Engineering"}
        />
        <Field
          label="Location"
          name="location"
          required
          defaultValue={job.location || "India"}
        />
        <Field label="Working arrangement">
          <select name="work_mode" defaultValue={job.work_mode || "Remote"}>
            {["Remote", "Hybrid", "On-site"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>
        <Field label="Employment type">
          <select
            name="employment_type"
            defaultValue={job.employment_type || "Full-time"}
          >
            {["Full-time", "Part-time", "Contract", "Internship"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>
        <Field
          label="Compensation range (optional)"
          name="salary"
          defaultValue={job.salary}
          placeholder="e.g. ₹18–25 LPA"
        />
        <Field label="About the role" wide required>
          <textarea
            name="description"
            required
            minLength={40}
            defaultValue={job.description}
            rows={5}
            placeholder="Describe the work, ownership and impact of this role."
          />
        </Field>
        <Field label="What you will bring" wide required>
          <textarea
            name="requirements"
            required
            minLength={20}
            defaultValue={job.requirements}
            rows={4}
            placeholder="List relevant capabilities and experience, one per line."
          />
        </Field>
        <Field label="Publication status">
          <select name="status" defaultValue={job.status || "Draft"}>
            {["Draft", "Published", "Closed"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </Field>
      </div>
      <div className="form-actions">
        <Button variant="secondary" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={action.busy}>
          Save role
        </Button>
      </div>
    </form>
  );
}
