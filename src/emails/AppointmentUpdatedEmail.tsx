import {
	Body,
	Button,
	Container,
	Head,
	Heading,
	Hr,
	Html,
	Preview,
	Section,
	Tailwind,
	Text,
} from "@react-email/components";
import { render } from "@react-email/render";
import moment from "moment";
import { Appointment } from "../types";

interface Props {
	doc?: Appointment;
}

export const Email = ({ doc }: Props) => (
	<Html>
		<Head />
		<Preview>Your appointment has been updated!</Preview>
		<Tailwind>
			<Body>
				<Container className="outline-neutral-300 bg-white outline-[1px] outline">
					<Section className="p-6">
						<Text className="my-0">Payload Appointments</Text>
					</Section>
					<Hr className="border-neutral-300 my-0" />
					<Section className="p-6">
						<Text className="mt-0">
							Hi {doc?.customer.firstName},
						</Text>
						<Heading className="text-[18px]">
							Your appointment with {doc?.host.firstName} has been
							updated
						</Heading>
						<Container className="bg-neutral-200  p-6 rounded-sm my-6">
							<Text className="m-0">
								New time:{" "}
								<span className="font-bold">
									{moment(doc?.start).format("HH:mm")} -{" "}
									{moment(doc?.end).format("HH:mm")}
								</span>
							</Text>
							<Text>
								New date:{" "}
								<span className="font-bold">
									{moment(doc?.start).format("MMMM Do YYYY")}
								</span>
							</Text>
							<Text>
								Service{doc?.services.length! > 1}:{" "}
								<span className="font-bold">
									{doc?.services
										.map((service) => service.title)
										.join(", ")}
								</span>
							</Text>
							<Text className="m-0">
								Host:{" "}
								<span className="font-bold">
									{doc?.host.prefferedName}
								</span>
							</Text>
						</Container>
						<Hr className="border-neutral-300" />
						<Button href="https://linear.app">
							Reschedule
						</Button>{" "}
						<Button href="https://linear.app">Cancel</Button>
						<Hr className="border-neutral-300" />
						<Text className="mb-0">
							Regard,
							<br />
							Your Payload team
						</Text>
					</Section>
					<Hr className="border-neutral-300 my-0" />
					<Section className="p-6 bg-neutral-100 text-neutral-500 my-0 text-center">
						<Text className="m-0 mb-2">
							This email was intended for{" "}
							{doc?.customer.firstName} {doc?.customer.lastName}.
							If you are not this person contact us immediately.
						</Text>
						<Text className="m-0">
							Please contact us if you have any questions. (If you
							reply to this email, we won't be able to see it.)
						</Text>
					</Section>
				</Container>
			</Body>
		</Tailwind>
	</Html>
);

Email.PreviewProps = {
	doc: {
		appointmentType: "appointment",
		customer: {
			dob: moment().toString(),
			email: "ahmet@icloud.com",
			firstName: "Ahmet",
			id: "1",
			lastName: "K",
			username: "Ahmet",
		},
		start: moment().add(+1, "hours").toString(),
		end: moment().add(+2, "hours").toString(),
		host: {
			firstName: "John",
			lastName: "Smith",
			prefferedName: "JON",
			id: "2",
		},
		id: "3",
		services: [
			{ title: "HAIRCUT", description: "", duration: 60, id: "2" },
		],
	},
} as Props;

// export default Email;

export const RenderedEmail = (data: Props) => {
	return render(<Email {...data} />);
};
