"use client"
import React from "react";
import { useState } from "react";
import Link from "next/link";
import { PinIcon, CheckCircle2 } from "lucide-react";
import ContactBg from "./ContactBg";
import contactContent from "@/content/contact.json";
import { apiUrl } from "@/lib/api";

interface ContactTextAreaProps {
  row: any;
  placeholder: string;
  name: string;
  defaultValue?: string;
  value?: string; // Add value prop
  onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}
interface ContactInputBoxProps {
  type: string;
  placeholder: string;
  name: string;
  value?: string; // Add value prop
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Contact = () => {

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    details: ""
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };


  async function handleSubmit(event: any) {
    event.preventDefault();

    const formDataToSend = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      details: formData.details
    };
    // console.log("Form Data:", formDataToSend);

    const response = await fetch(apiUrl('/wp-json/contact-form/v1/submit'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    // Handle the response
    const responseData = await response.json();
    if (response.ok) {
      // Success: Handle successful submission
      // console.log(responseData); // Log the response data
      // Show success message or redirect user
    } else {
      // Error: Handle submission error
      console.error(responseData); // Log the error response
      // Show error message to the user
    }

    setShowSuccessMessage(true);

    setTimeout(() => {
      setShowSuccessMessage(false)
    }, 5000)
  };

  return (
    <>
      <section className="relative z-10 overflow-hidden bg-white py-20 dark:bg-dark lg:py-[120px]">
        <div className="container">
          <div className="-mx-4 flex flex-wrap lg:justify-between">
            <div className="w-full px-4 lg:w-1/2 xl:w-6/12">
              <div className="mb-12 max-w-[570px] lg:mb-0">
                <span className="mb-4 block text-xl font-semibold text-primaryColor">
                  Contact Us
                </span>
                <h2 className="mb-6 text-[32px] font-bold uppercase text-dark dark:text-white sm:text-[40px] lg:text-[36px] xl:text-[40px]">
                  GET IN TOUCH WITH US
                </h2>

                <div className="mb-8 flex w-full max-w-[570px]">
                  <div className="mr-6 flex h-[60px] w-full max-w-[60px] items-center justify-center overflow-hidden rounded bg-primary/5 text-primary sm:h-[70px] sm:max-w-[70px]">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 32 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M30.6 11.8002L17.7 3.5002C16.65 2.8502 15.3 2.8502 14.3 3.5002L1.39998 11.8002C0.899983 12.1502 0.749983 12.8502 1.04998 13.3502C1.39998 13.8502 2.09998 14.0002 2.59998 13.7002L3.44998 13.1502V25.8002C3.44998 27.5502 4.84998 28.9502 6.59998 28.9502H25.4C27.15 28.9502 28.55 27.5502 28.55 25.8002V13.1502L29.4 13.7002C29.6 13.8002 29.8 13.9002 30 13.9002C30.35 13.9002 30.75 13.7002 30.95 13.4002C31.3 12.8502 31.15 12.1502 30.6 11.8002ZM13.35 26.7502V18.5002C13.35 18.0002 13.75 17.6002 14.25 17.6002H17.75C18.25 17.6002 18.65 18.0002 18.65 18.5002V26.7502H13.35ZM26.3 25.8002C26.3 26.3002 25.9 26.7002 25.4 26.7002H20.9V18.5002C20.9 16.8002 19.5 15.4002 17.8 15.4002H14.3C12.6 15.4002 11.2 16.8002 11.2 18.5002V26.7502H6.69998C6.19998 26.7502 5.79998 26.3502 5.79998 25.8502V11.7002L15.5 5.4002C15.8 5.2002 16.2 5.2002 16.5 5.4002L26.3 11.7002V25.8002Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div className="w-full">
                    <h4 className="mb-4 text-xl font-bold text-primaryColor">
                      Our Locations & contact
                    </h4>
                    <div className="space-y-6">
                      {contactContent.locations.map((location) => (
                        <div
                          key={location.name}
                          className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-6 transition-all duration-300 hover:border-primaryColor hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
                        >
                          <div className="absolute -right-2 -top-2 h-20 w-20 rotate-12 transform bg-primaryColor/10 transition-transform group-hover:scale-150" />
                          <p className="relative mb-3 flex items-center text-base font-medium text-neutral-900 dark:text-neutral-100">
                            <PinIcon className="mr-3 h-5 w-5 text-primaryColor" />
                            {location.name}
                          </p>
                          <div className="relative ml-8 space-y-2">
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                              {location.addressLine1}<br />
                              {location.addressLine2}
                            </p>
                            <div className="flex flex-col space-y-1">
                              {location.phones.map((phone) => (
                                <Link
                                  key={phone.tel}
                                  href={`tel:${phone.tel}`}
                                  className="inline-flex items-center text-base text-primaryColor transition-colors hover:text-primary-700"
                                >
                                  {phone.display}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>


                <div className="mb-8 flex w-full max-w-[370px]">
                  <div className="mr-6 flex h-[60px] w-full max-w-[60px] items-center justify-center overflow-hidden rounded bg-primary/5 text-primary sm:h-[70px] sm:max-w-[70px]">
                    <svg
                      width="32"
                      height="32"
                      viewBox="0 0 32 32"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M28 4.7998H3.99998C2.29998 4.7998 0.849976 6.1998 0.849976 7.9498V24.1498C0.849976 25.8498 2.24998 27.2998 3.99998 27.2998H28C29.7 27.2998 31.15 25.8998 31.15 24.1498V7.8998C31.15 6.1998 29.7 4.7998 28 4.7998ZM28 7.0498C28.05 7.0498 28.1 7.0498 28.15 7.0498L16 14.8498L3.84998 7.0498C3.89998 7.0498 3.94998 7.0498 3.99998 7.0498H28ZM28 24.9498H3.99998C3.49998 24.9498 3.09998 24.5498 3.09998 24.0498V9.2498L14.8 16.7498C15.15 16.9998 15.55 17.0998 15.95 17.0998C16.35 17.0998 16.75 16.9998 17.1 16.7498L28.8 9.2498V24.0998C28.9 24.5998 28.5 24.9498 28 24.9498Z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div className="w-full">
                    <h4 className="mb-1 text-xl font-bold text-primaryColor">
                      Email Address
                    </h4>
                    <p className="text-base text-body-color dark:text-dark-6">
                      <Link href={`mailto:${contactContent.email}`}>
                        {contactContent.email}
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full px-4 lg:w-1/2 xl:w-5/12">
              <div className="relative rounded-lg bg-white p-8 shadow-lg dark:bg-dark-2 sm:p-12">
                {
                  showSuccessMessage ? (
                    <div>
                      <p className="flex flex-col items-center gap-y-3.5 text-xl font-bold text-primaryColor mb-6 text-center">
                        <CheckCircle2 className="text-center w-8 h-8" />
                        Just confirming that we got your message. We&apos;re on it.
                      </p>
                      <div>
                        <ContactBg />
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      <ContactInputBox
                        type="text"
                        name="name"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={handleChange}
                      />
                      <ContactInputBox
                        type="text"
                        name="email"
                        placeholder="Your Email"
                        value={formData.email}
                        onChange={handleChange}
                      />
                      <ContactInputBox
                        type="text"
                        name="phone"
                        placeholder="Your Phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                      <ContactTextArea
                        row="6"
                        placeholder="Your Message"
                        name="details"
                        defaultValue=""
                        value={formData.details}
                        onChange={handleChange}
                      />
                      <div>
                        <button
                          type="submit"
                          className="w-full rounded border border-primary bg-primaryColor p-3 text-white transition hover:bg-opacity-90"
                        >
                          Send Message
                        </button>
                      </div>
                    </form>
                  )}
                <div>
                  <ContactBg />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;

const ContactTextArea: React.FC<ContactTextAreaProps> = ({
  row,
  placeholder,
  name,
  defaultValue,
  onChange
}) => {
  return (
    <>
      <div className="mb-6">
        <textarea
          rows={row}
          placeholder={placeholder}
          name={name}
          className="w-full resize-none rounded border border-stroke px-[14px] py-3 text-base text-body-color outline-none focus:border-primary dark:border-dark-3 dark:bg-dark dark:text-dark-6"
          defaultValue={defaultValue}
          onChange={onChange}
        />
      </div>
    </>
  );
};


const ContactInputBox: React.FC<ContactInputBoxProps> = ({ type, placeholder, name, value, onChange }) => {
  return (
    <>
      <div className="mb-6">
        <input
          type={type}
          placeholder={placeholder}
          name={name}
          className="w-full rounded border border-stroke px-[14px] py-3 text-base text-body-color outline-none focus:border-primary dark:border-dark-3 dark:bg-dark dark:text-dark-6"
          value={value}
          onChange={onChange}
        />
      </div>
    </>
  );
};
