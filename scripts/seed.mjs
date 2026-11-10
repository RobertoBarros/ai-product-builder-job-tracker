// Seeds a demo user with sample job applications and tasks.
//
// Usage:  npm run seed
//
// Reads from .env:
//   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
//   SEED_USER_EMAIL, SEED_USER_PASSWORD
//
// Requires "Confirm email" to be OFF in Supabase (Authentication → Sign In / Providers → Email).
// Running it again resets the demo user's data to this list.
// Companies are real; the applications, dates and notes are made up.

import { createClient } from "@supabase/supabase-js";

const {
  NEXT_PUBLIC_SUPABASE_URL: url,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key,
  SEED_USER_EMAIL: email,
  SEED_USER_PASSWORD: password,
} = process.env;

for (const [name, value] of Object.entries({
  NEXT_PUBLIC_SUPABASE_URL: url,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key,
  SEED_USER_EMAIL: email,
  SEED_USER_PASSWORD: password,
})) {
  if (!value) {
    console.error(`Missing ${name} in .env`);
    process.exit(1);
  }
}

/** Date `n` days before today, as YYYY-MM-DD. Negative n = in the future. */
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const applications = [
  {
    company: "Nubank",
    position: "Senior Product Manager — Credit Card",
    status: "interviewing",
    applied_on: daysAgo(21),
    notes: "Referred by a former colleague. Recruiter screen went well; next is the product case interview.",
    tasks: [
      { title: "Prepare product case (credit limit increase flow)", due_date: daysAgo(-3) },
      { title: "Review Nubank's latest earnings report", due_date: daysAgo(-2) },
      { title: "Recruiter screen", due_date: daysAgo(14), done: true },
    ],
  },
  {
    company: "Mercado Livre",
    position: "Product Manager — Mercado Pago",
    status: "applied",
    applied_on: daysAgo(9),
    notes: "Applied through the careers site. Role is hybrid in Osasco.",
    tasks: [{ title: "Follow up with recruiter on LinkedIn", due_date: daysAgo(-4) }],
  },
  {
    company: "iFood",
    position: "Senior Software Engineer — Logistics",
    status: "offer",
    applied_on: daysAgo(45),
    notes: "Offer received. Compare total compensation with other processes before answering.",
    tasks: [
      { title: "Reply to offer", due_date: daysAgo(-5) },
      { title: "Ask about remote work policy", due_date: daysAgo(-1) },
      { title: "System design interview", due_date: daysAgo(20), done: true },
      { title: "Final interview with engineering manager", due_date: daysAgo(12), done: true },
    ],
  },
  {
    company: "QuintoAndar",
    position: "Product Designer",
    status: "rejected",
    applied_on: daysAgo(60),
    notes: "Rejected after portfolio review. Feedback: show more research and metrics in case studies.",
    tasks: [{ title: "Update portfolio with research process", due_date: daysAgo(-14) }],
  },
  {
    company: "Stone",
    position: "Data Analyst — Risk",
    status: "interviewing",
    applied_on: daysAgo(18),
    notes: "Take-home SQL challenge sent. Deadline is one week.",
    tasks: [
      { title: "Finish SQL take-home challenge", due_date: daysAgo(-2) },
      { title: "Practice explaining past fraud-detection project", due_date: daysAgo(-6) },
    ],
  },
  {
    company: "VTEX",
    position: "Frontend Engineer (React)",
    status: "applied",
    applied_on: daysAgo(4),
    notes: "Remote role. Stack: React, TypeScript, GraphQL.",
    tasks: [],
  },
  {
    company: "PicPay",
    position: "Product Owner — Payments",
    status: "withdrawn",
    applied_on: daysAgo(40),
    notes: "Withdrew: role required 5 days a week in the office.",
    tasks: [],
  },
  {
    company: "Stripe",
    position: "Solutions Engineer, LATAM",
    status: "interviewing",
    applied_on: daysAgo(25),
    notes: "Interviews in English. Next round is a technical presentation.",
    tasks: [
      { title: "Build demo for technical presentation", due_date: daysAgo(-7) },
      { title: "Read Stripe API docs on Payment Intents", due_date: daysAgo(-3) },
      { title: "Hiring manager call", due_date: daysAgo(10), done: true },
    ],
  },
  {
    company: "Shopify",
    position: "Senior Product Manager, Checkout",
    status: "applied",
    applied_on: daysAgo(12),
    notes: "Fully remote. Applied with tailored resume focused on checkout conversion.",
    tasks: [{ title: "Check application status", due_date: daysAgo(-9) }],
  },
  {
    company: "GitLab",
    position: "Backend Engineer, Ruby on Rails",
    status: "rejected",
    applied_on: daysAgo(70),
    notes: "Rejected after technical interview.",
    tasks: [],
  },
  {
    company: "Spotify",
    position: "Product Manager, Podcast Discovery",
    status: "applied",
    applied_on: daysAgo(2),
    notes: "",
    tasks: [{ title: "Ask a contact at Spotify for a referral", due_date: daysAgo(-1) }],
  },
  {
    company: "Hotmart",
    position: "AI Product Manager",
    status: "interviewing",
    applied_on: daysAgo(15),
    notes: "Focus on LLM features for creators. Prepare examples of AI products shipped.",
    tasks: [
      { title: "Prepare AI product portfolio examples", due_date: daysAgo(-4) },
      { title: "Culture fit interview", due_date: daysAgo(5), done: true },
    ],
  },
];

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function logIn() {
  const signIn = await supabase.auth.signInWithPassword({ email, password });
  if (signIn.data.session) {
    console.log(`Logged in as existing user ${email}`);
    return;
  }

  const signUp = await supabase.auth.signUp({ email, password });
  if (signUp.error) throw new Error(`Sign up failed: ${signUp.error.message}`);
  if (!signUp.data.session) {
    throw new Error(
      'User created but not logged in. Turn OFF "Confirm email" in Supabase ' +
        "(Authentication → Sign In / Providers → Email), confirm or delete this user, then run again.",
    );
  }
  console.log(`Created user ${email}`);
}

async function main() {
  await logIn();

  // Start fresh: deleting applications also deletes their tasks.
  const { data: { user } } = await supabase.auth.getUser();
  const del = await supabase.from("applications").delete().eq("user_id", user.id);
  if (del.error) throw new Error(`Could not clear old data: ${del.error.message}`);

  let taskCount = 0;
  for (const { tasks, ...application } of applications) {
    const { data, error } = await supabase
      .from("applications")
      .insert({ ...application, notes: application.notes || null })
      .select("id")
      .single();
    if (error) throw new Error(`Could not add ${application.company}: ${error.message}`);

    if (tasks.length) {
      const rows = tasks.map((t) => ({
        title: t.title,
        due_date: t.due_date,
        done: t.done ?? false,
        application_id: data.id,
      }));
      const res = await supabase.from("tasks").insert(rows);
      if (res.error) throw new Error(`Could not add tasks for ${application.company}: ${res.error.message}`);
      taskCount += tasks.length;
    }
  }

  console.log(`Seeded ${applications.length} applications and ${taskCount} tasks.`);
  await supabase.auth.signOut();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
