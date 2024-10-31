"use client";

import { ListHeader, useStepNav } from "@payloadcms/ui";
import { useEffect } from "react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "../../components/ui/chart";

// Mock data for the chart
const appointmentData = Array.from({ length: 30 }, (_, i) => ({
	date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000)
		.toISOString()
		.split("T")[0],
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
			<ListHeader heading="Charts" />
			<ChartContainer
				config={{
					appointments: {
						label: "Appointments",
						color: "hsl(var(--primary))",
					},
				}}
				className="h-[300px]"
			>
				<ResponsiveContainer width="100%" height="100%">
					<LineChart data={appointmentData}>
						<XAxis
							dataKey="date"
							stroke="#888888"
							fontSize={12}
							tickLine={false}
							axisLine={false}
						/>
						<YAxis
							stroke="#888888"
							fontSize={12}
							tickLine={false}
							axisLine={false}
							tickFormatter={(value) => `${value}`}
						/>
						<ChartTooltip content={<ChartTooltipContent />} />
						<Line
							type="monotone"
							dataKey="appointments"
							strokeWidth={2}
							activeDot={{ r: 8 }}
						/>
					</LineChart>
				</ResponsiveContainer>
			</ChartContainer>
		</div>
	);
};

export default AppointmentsChartsClient;
