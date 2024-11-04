"use client";

import { CalendarDays, ChevronDown, ChevronUp } from "lucide-react";
import { links } from "../lib/links";
import Link from "next/link";
import { useConfig } from "@payloadcms/ui";

export default function AppointmentDashboard() {
  const {
    config: {
      routes: { admin: adminRoute },
    },
  } = useConfig();
  return (
    <>
      <div className="dashboard__group">
        <div className="dashboard__card-list">
          <AppointmentCard title="Appointments Yesterday" count={12} change={1} increased={false} />
          <AppointmentCard title="Appointments Today" count={15} change={2} increased={true} />

          <AppointmentCard title="Appointments Tomorrow" count={18} change={3} increased={true} />
        </div>
      </div>
      <div className="dashboard__group">
        <div className="dashboard__card-list">
          {links.map((link) => (
            <Link
              key={link.url}
              href={adminRoute + link.url}
              className="card card--has-onclick"
              style={{
                display: "flex",
                flexDirection: "column",
                textDecoration: "none",
              }}
            >
              <p className="card__title">{link.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

function AppointmentCard({ title, count, change, increased }: { title: string; count: number; change: number; increased: boolean }) {
  return (
    <div className="card card--has-onclick" style={{ display: "flex", flexDirection: "column", cursor: "auto" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <p className="card__title">{title}</p>
        <CalendarDays className="text-muted-foreground" style={{ height: "16px", width: "16px" }} />
      </div>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{}}>
            <p style={{ fontSize: "20px", fontWeight: "bold" }}>{count}</p>
            <p style={{ fontSize: "10px" }}>appointments</p>
          </div>
          <div
            style={{
              color: increased ? "rgb(22 163 74)" : "rgb(220 38 38)",
            }}
            className={`flex items-center ${increased ? "text-green-600" : "text-red-600"}`}
          >
            {increased ? <ChevronUp style={{ height: "16px", width: "16px" }} /> : <ChevronDown style={{ height: "16px", width: "16px" }} />}
            <span className="text-sm">{change}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
