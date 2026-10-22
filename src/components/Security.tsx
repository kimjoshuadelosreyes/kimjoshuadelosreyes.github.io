import Link from "next/link";

/**
 * Security — access control enforced in the database.
 *
 * Written as a design statement for the Funded Prop Traders build. It is
 * NOT read from that codebase: the roles, policies and tests below are a
 * representative design and must be checked against the real build before the
 * site is published.
 */
const ROLES = ["admin", "editor", "firm_rep", "trader"];

export default function Security() {
  return (
    <section id="security" data-od-id="security">
      <div className="shell rail pt-[clamp(24px,3vw,48px)] pb-[clamp(56px,7vw,110px)]">
        <div>
          <p className="eyebrow">Security</p>
          <p className="rail-index">Better Auth · Supabase RLS</p>
        </div>
        <div>
          <h2 className="h2">Access control, enforced in the database.</h2>
          <p className="sec-copy mt-[clamp(16px,2vw,28px)]">
            On{" "}
            <Link href="/work/funded-prop-traders" className="underline underline-offset-2 hover:text-electric">
              Funded Prop Traders
            </Link>
            , Better Auth handles sessions and stamps a role on every user, and Supabase row-level security decides what that role can touch, so a bug in the app cannot grant access the database refuses. Traders read published reviews and edit only their own submissions. Firm representatives see and reply to reviews of their own firm only, and can never change a score. Editors moderate and publish, and only admins manage roles. The signed-in user&rsquo;s token is passed through to Supabase, so requests run under their policies; the service role is kept to server-side jobs. The policies are tested by signing in as each role and asserting that every forbidden read and write is refused.
          </p>
          <ul className="sec-roles" aria-label="Roles">
            {ROLES.map((r) => (
              <li key={r}>{r}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
