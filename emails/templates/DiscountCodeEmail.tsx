import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "";
}

export type DiscountCodeEmailProps = {
  fullName: string;
  discountCode: string;
};

export function DiscountCodeEmail({ fullName, discountCode }: DiscountCodeEmailProps) {
  const firstName = fullName.trim().split(/\s+/)[0] || "there";

  return (
    <Html>
      <Head />
      <Preview>Your 20% founding member offer is reserved, {firstName}.</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {siteUrl() && (
            <Img
              src={`${siteUrl()}/detox-logo.png`}
              alt="Detox Daily"
              height="48"
              style={styles.logo}
            />
          )}

          <Heading style={styles.heading}>You&apos;re on the list, {firstName}.</Heading>

          <Text style={styles.text}>
            Thanks for joining the Detox Daily waitlist. Your 20% founding member offer is
            reserved — here&apos;s your code:
          </Text>

          <Section style={styles.codeBox}>
            <Text style={styles.codeLabel}>YOUR DISCOUNT CODE</Text>
            <Text style={styles.code}>{discountCode}</Text>
          </Section>

          <Text style={styles.text}>
            Save it — you&apos;ll enter it at checkout for 20% off plus free delivery on your
            first week, the moment we launch in Lahore. This code is unique to you and can be
            used once.
          </Text>

          <Hr style={styles.hr} />

          <Text style={styles.footer}>
            Fresh protein bowls, vibrant salads and detox drinks — prepared daily and delivered
            across Lahore.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default DiscountCodeEmail;

const styles = {
  body: {
    backgroundColor: "#F8F4EB",
    fontFamily: "Georgia, 'Times New Roman', serif",
    padding: "40px 0",
  },
  container: {
    backgroundColor: "#FCFBF8",
    borderRadius: "24px",
    border: "1px solid rgba(183,190,149,0.45)",
    maxWidth: "480px",
    margin: "0 auto",
    padding: "36px 40px 40px",
  },
  logo: { marginBottom: "24px" },
  heading: {
    color: "#123323",
    fontSize: "24px",
    fontWeight: 700,
    margin: "0 0 16px",
  },
  text: {
    color: "#5F6558",
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "0 0 16px",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  codeBox: {
    backgroundColor: "#E9EEDD",
    borderRadius: "16px",
    padding: "20px",
    textAlign: "center" as const,
    margin: "24px 0",
  },
  codeLabel: {
    color: "#5F6558",
    fontSize: "11px",
    fontWeight: 600,
    letterSpacing: "1.4px",
    margin: "0 0 8px",
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
  code: {
    color: "#0B4F37",
    fontSize: "28px",
    fontWeight: 700,
    letterSpacing: "2px",
    margin: 0,
    fontFamily: "'Courier New', monospace",
  },
  hr: { borderColor: "rgba(183,190,149,0.45)", margin: "32px 0 20px" },
  footer: {
    color: "#97998C",
    fontSize: "13px",
    lineHeight: "1.5",
    margin: 0,
    fontFamily: "'Helvetica Neue', Arial, sans-serif",
  },
};
