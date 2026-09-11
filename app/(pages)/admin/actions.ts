"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin, requireCoordinator } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ROLES, type FormState, type Role, type Spec } from "@/lib/types";
import { istInputToIso } from "@/lib/utils";

// Every action checks the role first for a clean redirect, but the database is
// the real gate: RLS and the SECURITY DEFINER functions refuse anyone else.

class Invalid extends Error {}

function text(f: FormData, key: string) {
  const v = String(f.get(key) ?? "").trim();
  return v === "" ? null : v;
}

function required(f: FormData, key: string, label: string) {
  const v = text(f, key);
  if (!v) throw new Invalid(`${label} is required.`);
  return v;
}

function whole(f: FormData, key: string, label: string) {
  const v = text(f, key);
  if (v === null) throw new Invalid(`${label} is required.`);
  const n = Number(v);
  if (!Number.isInteger(n) || n < 0) throw new Invalid(`${label} must be a whole number, 0 or more.`);
  return n;
}

function optionalWhole(f: FormData, key: string, label: string) {
  return text(f, key) === null ? null : whole(f, key, label);
}

function checked(f: FormData, key: string) {
  return f.get(key) === "on";
}

function link(f: FormData, key: string, label: string) {
  const v = text(f, key);
  if (!v) return null;
  try {
    if (["http:", "https:"].includes(new URL(v).protocol)) return v;
  } catch {}
  throw new Invalid(`${label} must be a full link starting with https://`);
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseSpecs(value: string | null): Spec[] {
  if (!value) return [];
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const at = line.indexOf(":");
      if (at < 1) throw new Invalid(`Specs: "${line}" needs the form "Label: value".`);
      return { label: line.slice(0, at).trim(), value: line.slice(at + 1).trim() };
    });
}

function validate<T>(build: () => T): T | FormState {
  try {
    return build();
  } catch (e) {
    if (e instanceof Invalid) return { error: e.message };
    throw e;
  }
}

async function write(table: string, id: string | null, row: Record<string, unknown>) {
  const supabase = await createClient();
  const query = id ? supabase.from(table).update(row).eq("id", id) : supabase.from(table).insert(row);
  const { data, error } = await query.select("id");
  if (error) return error.code === "23505" ? "That code or slug is already used by another entry." : error.message;
  // RLS filters instead of erroring, so a refused write looks like zero rows.
  if (!data?.length) return "Nothing was saved. Your account may not have permission.";
  return null;
}

async function remove(table: string, id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from(table).delete().eq("id", id).select("id");
  if (error) {
    throw new Error(error.code === "23503" ? "This is still referenced elsewhere and cannot be deleted." : error.message);
  }
  if (!data?.length) throw new Error("Nothing was deleted. Your account may not have permission.");
}

function done(path: string): never {
  revalidatePath("/", "layout");
  redirect(path);
}

const isState = (v: unknown): v is FormState => typeof v === "object" && v !== null && "error" in v;

// ---- events ----------------------------------------------------------------
export async function saveEvent(_: FormState, f: FormData): Promise<FormState> {
  await requireCoordinator();
  const row = validate(() => ({
    title: required(f, "title", "Title"),
    starts_at: istInputToIso(required(f, "starts_at", "Start")),
    ends_at: istInputToIso(text(f, "ends_at")),
    location: text(f, "location"),
    description: text(f, "description"),
    link_url: link(f, "link_url", "Link"),
    published: checked(f, "published"),
  }));
  if (isState(row)) return row;

  const error = await write("events", text(f, "id"), row);
  if (error) return { error };
  done("/admin/events");
}

export async function deleteEvent(id: string) {
  await requireCoordinator();
  await remove("events", id);
  done("/admin/events");
}

// ---- projects --------------------------------------------------------------
export async function saveProject(_: FormState, f: FormData): Promise<FormState> {
  await requireCoordinator();
  const row = validate(() => {
    const title = required(f, "title", "Title");
    return {
      title,
      slug: slugify(text(f, "slug") ?? title),
      subtitle: text(f, "subtitle"),
      body: text(f, "body"),
      tags: (text(f, "tags") ?? "").split(",").map((t) => t.trim()).filter(Boolean),
      mentors: text(f, "mentors"),
      image_url: text(f, "image_url"),
      year: optionalWhole(f, "year", "Year"),
      sort_order: optionalWhole(f, "sort_order", "Order") ?? 0,
      published: checked(f, "published"),
    };
  });
  if (isState(row)) return row;

  const error = await write("projects", text(f, "id"), row);
  if (error) return { error };
  done("/admin/projects");
}

export async function deleteProject(id: string) {
  await requireCoordinator();
  await remove("projects", id);
  done("/admin/projects");
}

// ---- inventory -------------------------------------------------------------
export async function saveItem(_: FormState, f: FormData): Promise<FormState> {
  await requireCoordinator();
  const parsed = validate(() => {
    const qty_total = whole(f, "qty_total", "Total");
    const qty_available = whole(f, "qty_available", "Available");
    if (qty_available > qty_total) throw new Invalid("Available cannot be more than the total.");
    return {
      row: {
        code: required(f, "code", "Code").toUpperCase(),
        name: required(f, "name", "Name"),
        variant: text(f, "variant"),
        category: required(f, "category", "Category"),
        description: text(f, "description"),
        specs: parseSpecs(text(f, "specs")),
        bench_only: checked(f, "bench_only"),
      },
      qty_total,
      qty_available,
    };
  });
  if (isState(parsed)) return parsed;
  const { row, qty_total, qty_available } = parsed;

  const id = text(f, "id");
  if (!id) {
    const error = await write("items", null, { ...row, qty_total, qty_available });
    if (error) return { error };
    done("/admin/inventory");
  }

  // Stock never goes through a plain UPDATE; set_item_stock takes the row lock.
  const error = await write("items", id, row);
  if (error) return { error };
  const supabase = await createClient();
  const { error: stockError } = await supabase.rpc("set_item_stock", {
    p_item: id,
    p_total: qty_total,
    p_available: qty_available,
  });
  if (stockError) return { error: stockError.message };
  done("/admin/inventory");
}

export async function deleteItem(id: string) {
  await requireCoordinator();
  await remove("items", id);
  done("/admin/inventory");
}

// ---- people ----------------------------------------------------------------
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

export async function saveMember(_: FormState, f: FormData): Promise<FormState> {
  await requireCoordinator();
  const row = validate(() => ({
    full_name: required(f, "full_name", "Name"),
    role_label: required(f, "role_label", "Role"),
    department: text(f, "department"),
    linkedin_url: link(f, "linkedin_url", "LinkedIn"),
    github_url: link(f, "github_url", "GitHub"),
    profile_url: link(f, "profile_url", "Institute profile"),
    email: text(f, "email"),
    sort_order: optionalWhole(f, "sort_order", "Order") ?? 0,
    is_alumni: checked(f, "is_alumni"),
    is_placeholder: checked(f, "is_placeholder"),
    photo_url: text(f, "photo_url"),
  }));
  if (isState(row)) return row;

  const photo = f.get("photo");
  if (photo instanceof File && photo.size > 0) {
    if (!photo.type.startsWith("image/")) return { error: "The photo must be an image file." };
    if (photo.size > MAX_PHOTO_BYTES) return { error: "Keep photos under 4 MB." };

    const supabase = await createClient();
    const ext = (photo.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const path = `members/${crypto.randomUUID()}.${ext || "jpg"}`;
    const { error } = await supabase.storage.from("media").upload(path, photo, { contentType: photo.type });
    if (error) return { error: `Photo upload failed: ${error.message}` };
    row.photo_url = supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
  }

  const error = await write("members", text(f, "id"), row);
  if (error) return { error };
  done("/admin/people");
}

export async function deleteMember(id: string) {
  await requireCoordinator();
  await remove("members", id);
  done("/admin/people");
}

// ---- users -----------------------------------------------------------------
export async function setRole(_: FormState, f: FormData): Promise<FormState> {
  const viewer = await requireAdmin();
  const id = text(f, "id");
  const role = text(f, "role") as Role | null;
  if (!id || !role || !ROLES.includes(role)) return { error: "Pick a role." };
  if (id === viewer.id) return { error: "You can't change your own role." };

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_user_role", { p_user: id, p_role: role });
  if (error) return { error: error.message };
  revalidatePath("/admin/users");
  return {};
}
