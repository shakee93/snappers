import { Resend } from "resend";
import EmailTemplate from "@/components/global/ui/Email/EmailTemplate";
// Initialize the Resend instance with your API key
const resend = new Resend("re_gq8K6rg5_6g41qckEAmjexiattAiZoHiz");

const FAKEDATA = {
  firstName: "John",
  orderId: "123456",
  orderTime: "January 27, 2024",
  itemsOrdered: ["Product 1", "Product 2", "Product 3"],
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const [email, name, orderId] = ["email", "name", "orderId"].map((field) =>
      formData.get(field)
    );

    if (!email || !name) {
      return new Response(
        JSON.stringify({ error: "Email or Password Required." }),
        {
          status: 400,
        }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "delivered@resend.dev",
      subject: "Thank you for checkout",
      react: EmailTemplate(FAKEDATA) as React.ReactElement,
    //   html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
    });

    if (error) {
      return Response.json({ error });
    }

    return Response.json({ data });
  } catch (error) {
    return Response.json({ error });
  }
}
export async function GET(req: Request) {
  return Response.json({ message: "hello" });
}
