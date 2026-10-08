import Link from "next/link";
import { Mail, MapPin, Phone, Truck } from "lucide-react";
import contactContent from "@/content/contact.json";
import ContactForm from "@/components/contact/ContactForm";
import { siteConfig } from "@/site.config";

const locationAccents = ["#EBF3EF"];

interface ContactPageContentProps {
  formspreeId: string;
}

const ContactPageContent = ({ formspreeId }: ContactPageContentProps) => {
  const email = contactContent.email;
  const { primaryPhone, primaryPhoneDisplay, whatsapp } = siteConfig.contact;
  const pageIntro =
    "pageIntro" in contactContent && contactContent.pageIntro
      ? contactContent.pageIntro
      : null;
  const registeredOffice =
    "registeredOffice" in contactContent ? contactContent.registeredOffice : null;

  return (
    <section className="-mb-20 bg-white px-4 py-14 md:px-6 md:py-20 lg:py-24">
      <header className="mx-auto mb-10 max-w-[1368px] text-center md:mb-12">
        <p className="text-sm font-semibold text-header-green">Contact Us</p>
        <h1 className="mt-2 font-albra text-3xl font-semibold leading-tight text-[#092412] sm:text-4xl md:text-5xl">
          Get in touch with us
        </h1>
        {pageIntro ? (
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 md:text-lg">
            {pageIntro}
          </p>
        ) : null}
      </header>

      <div className="mx-auto grid max-w-[1368px] grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        {/* Contact info */}
        <div>
          <div className="flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-header-cream text-header-green">
              <Truck className="h-6 w-6" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-bold text-header-green md:text-xl">
                Delivery &amp; support
              </h2>
              <div className="mt-5 space-y-4">
                {contactContent.locations.map((location, index) => (
                  <article
                    key={location.name}
                    style={{
                      backgroundColor:
                        locationAccents[index % locationAccents.length],
                    }}
                    className="relative overflow-hidden rounded-xl border border-[#E8E8E8] p-5"
                  >
                    <div className="absolute -right-3 -top-3 h-16 w-16 rotate-12 bg-header-green/10" />
                    <p className="relative flex items-center gap-2 text-base font-bold text-[#092412]">
                      <MapPin
                        className="h-5 w-5 shrink-0 text-header-green"
                        aria-hidden
                      />
                      {location.name}
                    </p>
                    <div className="relative mt-3 space-y-2 pl-7">
                      <p className="text-sm leading-relaxed text-neutral-600">
                        {location.addressLine1}
                        <br />
                        {location.addressLine2}
                      </p>
                      <div className="flex flex-col gap-1">
                        {location.phones.map((phone) => (
                          <Link
                            key={phone.tel}
                            href={`tel:${phone.tel}`}
                            className="text-sm font-semibold text-header-green hover:underline"
                          >
                            {phone.display}
                          </Link>
                        ))}
                      </div>
                      {"hours" in location && location.hours?.length ? (
                        <ul className="mt-2 space-y-0.5 text-sm text-neutral-600">
                          {location.hours.map((line) => (
                            <li key={line}>{line}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
              {registeredOffice &&
              registeredOffice.label &&
              registeredOffice.addressLine1 ? (
                <p className="mt-4 text-sm text-neutral-500">
                  <span className="font-semibold text-neutral-700">
                    {registeredOffice.label}:
                  </span>{" "}
                  {registeredOffice.addressLine1} {registeredOffice.addressLine2}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-header-cream text-header-green">
              <Phone className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <h2 className="text-lg font-bold text-header-green md:text-xl">
                Phone &amp; WhatsApp
              </h2>
              <Link
                href={`tel:${primaryPhone}`}
                className="mt-1 inline-block text-base font-semibold text-header-green hover:underline"
              >
                {primaryPhoneDisplay}
              </Link>
              <Link
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block text-sm text-neutral-600 hover:text-header-green hover:underline"
              >
                Chat on WhatsApp
              </Link>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-header-cream text-header-green">
              <Mail className="h-6 w-6" aria-hidden />
            </div>
            <div>
              <h2 className="text-lg font-bold text-header-green md:text-xl">
                Email
              </h2>
              <Link
                href={`mailto:${email}`}
                className="mt-1 inline-block text-base text-neutral-700 hover:text-header-green hover:underline"
              >
                {email}
              </Link>
            </div>
          </div>
        </div>

        {/* Form - vertically centred beside contact info on desktop */}
        <div className="w-full lg:self-center">
          <ContactForm formspreeId={formspreeId} />
        </div>
      </div>
    </section>
  );
};

export default ContactPageContent;
