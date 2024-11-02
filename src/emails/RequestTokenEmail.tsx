import {
	Body,
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
import { Customer } from "../types";

interface Props {
	customer: Customer;
	otp: string;
}

export const Email = ({ customer, otp }: Props) => (
	<Html>
		<Head />
		<Preview>Here's your one time passcode.</Preview>
		<Tailwind>
			<Body>
				<Container className="outline-neutral-300 bg-white outline-[1px] outline">
					<Section className="p-6">
						<Text className="my-0">Payload Appointments</Text>
					</Section>
					<Hr className="border-neutral-300 my-0" />
					<Section className="p-6">
						<Text className="mt-0">Hi {customer.firstName},</Text>
						<Heading className="text-[18px]">
							Your one time passcode
						</Heading>
						<Container className="bg-neutral-200  p-6 rounded-sm my-6">
							<Text className="m-0">{otp}</Text>
						</Container>
					</Section>
					<Hr className="border-neutral-300 my-0" />
					<Section className="p-6 bg-neutral-100 text-neutral-500 my-0 text-center">
						<Text className="m-0 mb-2">
							This email was intended for {customer.firstName}{" "}
							{customer.lastName}. If you are not this person
							contact us immediately.
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

export const RenderedEmail = (data: Props) => {
	return render(<Email {...data} />);
};
