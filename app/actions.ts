"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error?: string; message?: string };

export async function signUpAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  if (!email || password.length < 8 || !fullName) return { error: "Enter your name, a valid email and a password with at least 8 characters." };
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email, password, options: { data: { full_name: fullName }, emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback?next=/onboarding` }
    });
    if (error) return { error: error.message };
    if (!data.session) return { message: "Check your email to confirm your account. After confirmation, you'll be guided to set up your company." };
  } catch (e) { return { error: e instanceof Error ? e.message : "Unable to create account." }; }
  redirect("/onboarding");
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
  } catch (e) { return { error: e instanceof Error ? e.message : "Unable to sign in." }; }
  redirect("/dashboard");
}

export async function createCompanyAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const currency = String(formData.get("currency") ?? "").trim().toUpperCase();
  const businessType = String(formData.get("businessType") ?? "").trim();
  if (!name || !country || !/^[A-Z]{3}$/.test(currency) || !businessType) return { error: "Complete all company details and choose a valid currency." };
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return { error: "Please sign in again before creating your company." };
    const { data: existing, error: lookupError } = await supabase.from("companies").select("id").eq("owner_id", user.id).limit(1).maybeSingle();
    if (lookupError) return { error: lookupError.message };
    if (existing) redirect("/dashboard");
    const { error } = await supabase.from("companies").insert({
      name, country, base_currency: currency, business_type: businessType, owner_id: user.id
    });
    if (error) return { error: error.message };
  } catch (e) { return { error: e instanceof Error ? e.message : "Unable to save company." }; }
  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}