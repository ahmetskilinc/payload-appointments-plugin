"use client";

import { useStepNav } from "@payloadcms/ui";
import { useEffect } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../../components/ui/chart";

// Mock data for the chart
const appointmentData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  appointments: Math.floor(Math.random() * 20) + 5,
}));

const AppointmentsChartsClient: React.FC = () => {
  const { setStepNav } = useStepNav();

  useEffect(() => {
    setStepNav([
      {
        label: "Charts",
      },
    ]);
  }, [setStepNav]);
  return (
    <div className="collection-list appointments-calendar-view">
      <header className="list-header">
        <h1>Charts</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        <Card className="border-none">
          <CardHeader>
            <CardTitle>Appointments Last 30 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                appointments: {
                  label: "Appointments",
                  color: "hsl(0, 0%, 40%)",
                },
              }}
              className="h-[400px] aspect-[none]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={appointmentData}>
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <CartesianGrid stroke="#ccc" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="appointments" stroke="hsl(var(--secondary-foreground))" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="border-none">
          <CardHeader>
            <CardTitle>Appointments Last 30 Days</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                appointments: {
                  label: "Appointments",
                  color: "hsl(0, 0%, 40%)",
                },
              }}
              className="h-[400px] aspect-[none]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={appointmentData}>
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <CartesianGrid stroke="#ccc" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="appointments" stroke="hsl(var(--secondary-foreground))" strokeWidth={2} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AppointmentsChartsClient;
