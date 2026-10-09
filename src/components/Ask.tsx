import { mailTo } from "@/lib/content";
import Icon from "./Icons";

/**
 * The in-section way out. Every section ends on one of these, so a reader who
 * is convinced half-way down the page does not have to scroll to the end to act
 * on it. The subject line is written from what they were looking at.
 *
 * `link` is the quiet inline form for use inside a panel or a caption; `button`
 * is the full button for the end of a section.
 */
export default function Ask({
  subject,
  children,
  as = "link",
  id,
}: {
  subject: string;
  children: React.ReactNode;
  as?: "link" | "button";
  id?: string;
}) {
  return (
    <a
      href={mailTo(subject)}
      className={as === "button" ? "btn btn--primary" : "ask-cta"}
      data-od-id={id}
      data-ask
    >
      {children}
      <Icon name="arrow" className="arrow-ic" />
    </a>
  );
}
