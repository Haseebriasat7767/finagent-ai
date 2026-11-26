"use client";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { loginAction, type ActionState } from "../actions";
const initial: ActionState = {};
function Submit(){const {pending}=useFormStatus();return <button disabled={pending} className="w-full rounded-full bg-[#087e5b] py-4 text-xs font-bold text-white disabled:opacity-60">{pending?"Signing in…":"Log in"}</button>}
export default function Login(){
 const [state,action]=useFormState(loginAction,initial);
 return <main className="grid min-h-screen place-items-center bg-[#f7faf7] px-5"><div className="w-full max-w-md rounded-3xl border border-[#e5ece6] bg-white p-8"><Link href="/" className="text-lg font-extrabold">finagent<span className="text-[#087e5b]">.ai</span></Link><h1 className="mt-10 text-2xl font-extrabold">Welcome back.</h1><p className="mt-2 text-sm text-[#829087]">Log in to your company workspace.</p><form action={action} className="mt-7 space-y-4"><label className="block text-xs font-semibold">Work email<input name="email" required type="email" autoComplete="email" className="mt-2 w-full rounded-xl border border-[#dfe8e1] px-4 py-3.5 text-sm"/></label><label className="block text-xs font-semibold">Password<input name="password" required type="password" autoComplete="current-password" className="mt-2 w-full rounded-xl border border-[#dfe8e1] px-4 py-3.5 text-sm"/></label><Submit/></form>{state.error&&<p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-xs text-red-700">{state.error}</p>}<p className="mt-6 text-center text-xs text-[#829087]">New here? <Link href="/signup" className="font-bold text-[#087e5b]">Create an account</Link></p></div></main>
}