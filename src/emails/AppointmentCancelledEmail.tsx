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
} from '@react-email/components';
import { render } from '@react-email/render';
import { Appointment } from '../types';
import {
  formatDateInTimezone,
  formatTimeRangeInTimezone,
  getTimezoneAbbreviation,
} from '../utilities/formatDate';

interface Props {
  doc?: Appointment;
  timezone?: string;
}

export const Email = ({ doc, timezone = 'UTC' }: Props) => {
  const customerFirstName = doc?.customer?.firstName || doc?.guestCustomer?.firstName;
  const customerLastName = doc?.customer?.lastName || doc?.guestCustomer?.lastName;
  const tzAbbr = doc?.start ? getTimezoneAbbreviation(doc.start, timezone) : '';

  return (
    <Html>
      <Head />
      <Preview>Your appointment has been cancelled</Preview>
      <Tailwind>
        <Body>
          <Container className="outline-neutral-300 bg-white outline-[1px] outline">
            <Section className="p-6">
              <Text className="my-0">Payload Appointments</Text>
            </Section>
            <Hr className="border-neutral-300 my-0" />
            <Section className="p-6">
              <Text className="mt-0">Hi {customerFirstName},</Text>
              <Heading className="text-[18px]">
                Your appointment with {doc?.host?.firstName} has been cancelled
              </Heading>
              <Container className="bg-neutral-200 p-6 rounded-sm my-6">
                <Text className="m-0 line-through text-neutral-500">
                  Time:{' '}
                  <span className="font-bold">
                    {doc?.start && doc?.end
                      ? `${formatTimeRangeInTimezone(doc.start, doc.end, timezone)} ${tzAbbr}`
                      : ''}
                  </span>
                </Text>
                <Text className="line-through text-neutral-500">
                  Date:{' '}
                  <span className="font-bold">
                    {doc?.start ? formatDateInTimezone(doc.start, timezone) : ''}
                  </span>
                </Text>
                <Text className="line-through text-neutral-500">
                  Service:{' '}
                  <span className="font-bold">
                    {doc?.services?.map((service) => service.title).join(', ')}
                  </span>
                </Text>
                <Text className="m-0 line-through text-neutral-500">
                  Host: <span className="font-bold">{doc?.host?.preferredNameAppointments}</span>
                </Text>
              </Container>
              <Text>If you did not request this cancellation, please contact us immediately.</Text>
              <Hr className="border-neutral-300" />
              <Text className="mb-0">
                Regards,
                <br />
                Your Payload team
              </Text>
            </Section>
            <Hr className="border-neutral-300 my-0" />
            <Section className="p-6 bg-neutral-100 text-neutral-500 my-0 text-center">
              <Text className="m-0 mb-2">
                This email was intended for {customerFirstName} {customerLastName}. If you are not
                this person contact us immediately.
              </Text>
              <Text className="m-0">
                Please contact us if you have any questions. (If you reply to this email, we won't
                be able to see it.)
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export const RenderedEmail = (data: Props) => {
  return render(<Email {...data} />);
};
