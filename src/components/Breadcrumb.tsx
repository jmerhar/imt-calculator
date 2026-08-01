import { Fragment } from "react";
import { Link } from "react-router-dom";

export interface Crumb {
  label: string;
  /** Omit on the last (current) crumb, which renders as plain text. */
  to?: string;
}

/** A visible breadcrumb trail, mirroring the page's BreadcrumbList JSON-LD. */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="breadcrumb" aria-label="breadcrumb">
      {items.map((c, i) => (
        <Fragment key={i}>
          {i > 0 && <span aria-hidden="true"> / </span>}
          {c.to ? <Link to={c.to}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
        </Fragment>
      ))}
    </nav>
  );
}
