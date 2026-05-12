import React from "react";
import Link from "next/link";
import { Metadata } from "next/types";


export const metadata: Metadata = {
  title: "terms and conditions",
};


const PageTerm = () => {
  return (
    <div
      className="overflow-hidden relative scroll-smooth"
      data-nc-id="Pageterms"
    >
      <div className="container py-10 lg:py-10 space-y-16 lg:space-y-28">
        <div className="py-8">
          <h1 className="text-3xl !leading-tight font-semibold text-neutral-900 md:text-4xl xl:text-5xl dark:text-neutral-100 pb-6">
            Terms and Conditions.
          </h1>


          {/* Warranty & Return Policy section */}
          <section id="warranty-return-policy" className="mb-8 scroll-mt-32">
            <h2 className="text-3xl font-semibold mb-4">
              Warranty & Return Policy
            </h2>

            {/* Return Policy */}
            <h3 className="text-xl font-semibold mb-2">Return & Exchange Policy</h3>
            <p className="mb-4 leading-8">
              Goods once sold cannot be returned or exchanged under any circumstances.
            </p>

            {/* Warranty Terms */}
            <h3 className="text-xl font-semibold mb-2 mt-6">Warranty Terms</h3>
            <ul className="list-disc pl-5 mb-4 leading-8">
              <li>
                <strong>Repairs only</strong> — No replacements will be provided.
              </li>
              <li>
                The product must be presented with the <strong>original box, cables, and all accessories</strong> to claim warranty.
              </li>
              <li>
                AppleCare or manufacturer warranty claims may take a <strong>minimum of 45 days</strong> to process.
              </li>
              <li>
                Warranty processing time depends on the <strong>availability of spare parts and shipping schedules</strong>.
              </li>
            </ul>

            {/* Warranty Exclusions */}
            <h3 className="text-xl font-semibold mb-2 mt-6">Warranty Does Not Cover</h3>
            <p className="mb-4 leading-8">
              The following conditions and damages are <strong>not covered</strong> under warranty:
            </p>
            <ul className="list-disc pl-5 mb-4 leading-8">
              <li>Liquid or water damage</li>
              <li>Display or display line issues</li>
              <li>Touch panel faults</li>
              <li>Charging port damage</li>
              <li>Burn marks</li>
              <li>Drops or physical damage</li>
              <li>Power fluctuations</li>
              <li>No-power issues</li>
              <li>Improper usage or misuse</li>
              <li>Products used outside normal domestic conditions</li>
            </ul>

            {/* Display Warranty Note */}
            <h3 className="text-xl font-semibold mb-2 mt-6">Display Warranty</h3>
            <p className="mb-4 leading-8">
              Display warranty covers <strong>7 days</strong> to check the device for any manufacturing defects.
            </p>

            <p className="mb-4 leading-8">
              For complete warranty information, please visit our{" "}
              <Link href="/warranty-terms" className="text-blue-500">
                Warranty Terms
              </Link>{" "}
              page.
            </p>
          </section>

          {/* Shipping & Delivery section */}
          <section id="shipping-delivery" className="mb-8 scroll-mt-32">
            <h2 className="text-3xl font-semibold mb-4">Shipping & Delivery</h2>
            <p className="mb-6 leading-8">
              At this time, GQMobile ships within Sri Lanka.
            </p>
          </section>

          {/* Third-Party Delivery section (PickMe / Uber Flash) */}
          <section id="third-party-delivery" className="mb-8 scroll-mt-32">
            <h2 className="text-3xl font-semibold mb-4">
              PickMe & Uber Flash Delivery
            </h2>
            <p className="mb-4 leading-8">
              When a customer chooses to receive their order through a
              third-party on-demand delivery service such as{" "}
              <strong>PickMe Flash</strong> or{" "}
              <strong>Uber Flash</strong>, the customer
              acknowledges and agrees to the terms set out in this section.
            </p>
            <p className="mb-4 leading-8">
              GQ Mobiles only acts as the sender handing the package over to the
              rider arranged by the customer. Once the package is handed over to
              the rider, the order leaves our possession and our delivery
              responsibility ends.
            </p>
            <p className="mb-4 leading-8">
              By selecting PickMe Flash, Uber Flash, or any similar third-party
              courier service, the{" "}
              <strong>customer takes full responsibility</strong>{" "}
              for the package, including:
            </p>
            <ul className="list-disc pl-5 mb-4 leading-8">
              <li>
                Loss, theft, or misplacement of the package after it is handed
                to the rider.
              </li>
              <li>
                Any damage to the device or its packaging that occurs during
                transit by the third-party rider.
              </li>
              <li>
                Delivery delays, incorrect delivery addresses, or failed
                deliveries caused by the third-party service or the rider.
              </li>
              <li>
                Disputes regarding the condition of the package on arrival, as
                we are unable to verify handling once the rider has collected
                the order.
              </li>
            </ul>
            <p className="mb-4 leading-8">
              We strongly recommend customers inspect the package and device in
              the rider’s presence at the point of delivery. GQ Mobiles will not
              be liable for any claims relating to loss, theft, or damage that
              occur after a third-party rider has accepted the package on the
              customer’s behalf.
            </p>
            <p className="mb-4 leading-8">
              Payment for the third-party delivery service (PickMe Flash, Uber
              Flash, etc.) is settled directly between the customer and the
              service provider and is not part of the order total paid to GQ
              Mobiles.
            </p>
          </section>

          {/* Welcome section */}
          <section id="welcome" className="mb-6 scroll-mt-32">
            <h3 className="text-xl font-semibold mb-2">
              Welcome to GQ Mobiles!
            </h3>
            <p className="mb-4 leading-8">
              These terms and conditions outline the rules and regulations for
              the use of GQ Mobiles’s Website, located at{" "}
              <Link href={"https://gqmobiles.lk"}> https://gqmobiles.lk.</Link>
              By accessing this website, we assume you accept these terms and
              conditions. Do not continue to use GQ Mobiles if you do not agree
              to take all of the terms and conditions stated on this page.
            </p>
            <p className="mb-4 leading-8">
              Your access to and use of the Service is conditioned on your
              acceptance of and compliance with these Terms. These Terms apply
              to all visitors, users, and others who access or use the Service.
              By accessing or using the Service, you agree to be bound by these
              Terms. If you disagree with any part of the terms, then you may
              not access the Service.
            </p>
            <p className="mb-4 leading-8">
              The following terminology applies to these Terms and Conditions,
              Privacy Statement and Disclaimer Notice and all Agreements:
              “Client”, “You” and “Your” refers to you, the person who logs on
              this website and complies with the Company’s terms and conditions.
              “The Company”, “Ourselves”, “We”, “Our” and “Us”, refers to our
              Company. “Party”, “Parties”, or “Us”, refers to both the Client
              and ourselves. All terms refer to the offer, acceptance, and
              consideration of payment necessary to undertake the process of our
              assistance to the Client in the most appropriate manner for the
              express purpose of meeting the Client’s needs in respect of the
              provision of the Company’s stated services, in accordance with and
              subject to, prevailing law of Netherlands. Any use of the above
              terminology or other words in the singular, plural,
              capitalization, and/or he/she or they, are taken as
              interchangeable and therefore as referring to the same.
            </p>
          </section>

          {/* Cookies section */}
          <section id="cookies" className="mb-6 scroll-mt-32">
            <h3 className="text-xl font-semibold mb-2">Cookies</h3>
            <p className="mb-4 leading-8">
              We employ the use of cookies. By accessing GQ Mobiles, you agree
              to use cookies in agreement with the GQ Mobiles’s Privacy Policy.
            </p>
            <p className="mb-4 leading-8">
              Most interactive websites use cookies to let us retrieve the
              user’s details for each visit. Cookies are used by our website to
              enable the functionality of certain areas to make it easier for
              people visiting our website. Some of our affiliate/advertising
              partners may also use cookies.
            </p>
          </section>

          {/* License section */}
          <section id="license" className="mb-6 scroll-mt-32">
            <h3 className="text-xl font-semibold mb-2">License</h3>
            <p className="mb-4 leading-8">
              Unless otherwise stated, GQ Mobiles and/or its licensors own the
              intellectual property rights for all material on GQ Mobiles. All
              intellectual property rights are reserved. You may access this
              from GQ Mobiles for your own personal use subjected to
              restrictions set in these terms and conditions.
            </p>
            <ul className="list-disc pl-5 mb-4 leading-8 ml-4">
              <li>Republish material from GQ Mobiles</li>
              <li>Sell, rent or sub-license material from GQ Mobiles</li>
              <li>Reproduce, duplicate or copy material from GQ Mobiles</li>
              <li>Redistribute content from GQ Mobiles</li>
              <li>This Agreement shall begin on the date hereof.</li>
            </ul>
            <p className="mb-4 leading-8">
              Parts of this website offer an opportunity for users to post and
              exchange opinions and information in certain areas of the website.
              GQ Mobiles does not filter, edit, publish, or review Comments
              prior to their presence on the website. Comments do not reflect
              the views and opinions of GQ Mobiles, its agents, and/or
              affiliates. Comments reflect the views and opinions of the person
              who posts their views and opinions. To the extent permitted by
              applicable laws, GQ Mobiles shall not be liable for the Comments
              or for any liability, damages, or expenses caused and/or suffered
              as a result of any use of and/or posting of and/or appearance of
              the Comments on this website.
            </p>
            <p className="mb-4 leading-8">
              GQ Mobiles reserves the right to monitor all Comments and to
              remove any Comments which can be considered inappropriate,
              offensive, or causes a breach of these Terms and Conditions.
            </p>
            <p className="mb-4 leading-8">You warrant and represent that:</p>
            <ul className="list-disc pl-5 mb-4 leading-8 ml-4">
              <li>
                You are entitled to post the Comments on our website and have
                all necessary licenses and consents to do so;
              </li>
              <li>
                The Comments do not invade any intellectual property right,
                including without limitation copyright, patent, or trademark of
                any third party;
              </li>
              <li>
                The Comments do not contain any defamatory, libelous, offensive,
                indecent, or otherwise unlawful material which is an invasion of
                privacy;
              </li>
              <li>
                The Comments will not be used to solicit or promote business or
                custom or present commercial activities or unlawful activity.
              </li>
            </ul>
            <p className="mb-4 leading-8">
              You hereby grant GQ Mobiles a non-exclusive license to use,
              reproduce, edit, and authorize others to use, reproduce, and edit
              any of your Comments in any and all forms, formats, or media.
            </p>
          </section>

          {/* Hyperlinking section */}
          <section id="hyperlinking" className="mb-6 scroll-mt-32">
            <h2 className="text-3xl font-semibold mb-4">
              Hyperlinking to our Content
            </h2>
            <p className="mb-4 leading-8">
              The following organizations may link to our Website without
              prior written approval:
            </p>
            <ul className="list-disc pl-5 mb-4 leading-8">
              <li>Government agencies;</li>
              <li>Search engines;</li>
              <li>News organizations;</li>
              <li>
                Online directory distributors may link to our Website in the
                same manner as they hyperlink to the Websites of other listed
                businesses; and
              </li>
              <li>
                System-wide Accredited Businesses except soliciting non-profit
                organizations, charity shopping malls, and charity fundraising
                groups which may not hyperlink to our Web site.
              </li>
            </ul>
            <p className="mb-4 leading-8">
              These organizations may link to our home page, to publications,
              or to other Website information so long as the link: (a) is not
              in any way deceptive; (b) does not falsely imply sponsorship,
              endorsement, or approval of the linking party and its products
              and/or services; and (c) fits within the context of the linking
              party’s site.
            </p>
            <p className="mb-4 leading-8">
              We may consider and approve other link requests from the
              following types of organizations:
            </p>
            <ul className="list-disc pl-5 mb-4 leading-8">
              <li>
                Commonly-known consumer and/or business information sources;
              </li>
              <li>Dot.com community sites;</li>
              <li>Associations or other groups representing charities;</li>
              <li>Online directory distributors;</li>
              <li>Internet portals;</li>
              <li>Accounting, law and consulting firms; and</li>
              <li>Educational institutions and trade associations.</li>
            </ul>
            <p className="mb-4 leading-8">
              We will approve link requests from these organizations if we
              decide that: (a) the link would not make us look unfavorably to
              ourselves or to our accredited businesses; (b) the organization
              does not have any negative records with us; (c) the benefit to
              us from the visibility of the hyperlink compensates the absence
              of GQ Mobiles; and (d) the link is in the context of general
              resource information.
            </p>
            <p className="mb-4 leading-8">
              These organizations may link to our home page so long as the
              link: (a) is not in any way deceptive; (b) does not falsely
              imply sponsorship, endorsement or approval of the linking party
              and its products or services; and (c) fits within the context of
              the linking party’s site.
            </p>
            <p className="mb-4 leading-8">
              If you are one of the organizations listed in paragraph 2 above
              and are interested in linking to our website, you must inform us
              by sending an e-mail to GQ Mobiles. Please include your name,
              your organization name, contact information as well as the URL
              of your site, a list of any URLs from which you intend to link
              to our Website, and a list of the URLs on our site to which you
              would like to link. Wait 2-3 weeks for a response.
            </p>
            <p className="mb-4 leading-8">
              Approved organizations may hyperlink to our Website as follows:
            </p>
            <ul className="list-disc pl-5 mb-4 leading-8">
              <li>By use of our corporate name; or</li>
              <li>
                By use of the uniform resource locator being linked to; or
              </li>
              <li>
                By use of any other description of our Website being linked to
                that makes sense within the context and format of content on
                the linking party’s site.
              </li>
            </ul>
            <p className="mb-4 leading-8">
              No use of GQ Mobiles’s logo or other artwork will be allowed for
              linking absent a trademark license agreement.
            </p>
          </section>

          {/* iFrames section */}
          <section id="iframes" className="mb-6 scroll-mt-32">
            <h2 className="text-3xl font-semibold mb-4">iFrames</h2>
            <p className="mb-4 leading-8">
              Without prior approval and written permission, you may not
              create frames around our Webpages that alter in any way the
              visual presentation or appearance of our Website.
            </p>
          </section>

          {/* Content Liability section */}
          <section id="content-liability" className="mb-6 scroll-mt-32">
            <h2 className="text-3xl font-semibold mb-4">Content Liability</h2>
            <p className="mb-4 leading-8">
              We shall not be held responsible for any content that appears on
              your Website. You agree to protect and defend us against all
              claims that are rising on your Website. No link(s) should appear
              on any Website that may be interpreted as libelous, obscene, or
              criminal, or which infringes, otherwise violates, or advocates
              the infringement or other violation of, any third party rights.
            </p>
          </section>

          {/* Your Privacy section */}
          <section id="your-privacy" className="mb-6 scroll-mt-32">
            <h2 className="text-3xl font-semibold mb-4">Your Privacy</h2>
            <p className="mb-4 leading-8">
              Please read{" "}
              <Link href="/privacy" className="text-blue-500">
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          {/* Copyright section */}
          <section id="copyright" className="mb-6 scroll-mt-32">
            <h2 className="text-3xl font-semibold mb-4">Copyright</h2>
            <p className="mb-4 leading-8">
              All content appearing on this Web site is the property of:
              GQMOBILE Company. Address
            </p>
          </section>

          {/* Trademarks section */}
          <section id="trademarks" className="mb-6 scroll-mt-32">
            <h2 className="text-3xl font-semibold mb-4">Trademarks</h2>
            <p className="mb-4 leading-8">
              All brand, product, service, and process names appearing on this
              Web site are trademarks of their respective holders. Reference
              to or use of a product, service, or process does not imply
              recommendation, approval, affiliation, or sponsorship of that
              product, service, or process by GQMobile.
            </p>
          </section>

          {/* Use Of Site section */}
          <section id="use-of-site" className="mb-6 scroll-mt-32">
            <h2 className="text-3xl font-semibold mb-4">Use Of Site</h2>
            <p className="mb-4 leading-8">
              This site may contain other proprietary notices and copyright
              information, the terms of which must be observed and followed.
              Information on this site may contain technical inaccuracies or
              typographical errors. Information, including product pricing and
              availability, may be changed or updated without notice. GQMobile
              reserves the right to refuse service, terminate accounts, and/or
              cancel orders in its discretion, including, without limitation,
              if GQMobile-Shop believes that customer conduct violates
              applicable law or is harmful to the interests of GQMobile.
            </p>
          </section>

          {/* Reservation of Rights section */}
          <section id="reservation-of-rights" className="mb-6 scroll-mt-32">
            <h2 className="text-3xl font-semibold mb-4">
              Reservation of Rights
            </h2>
            <p className="mb-4 leading-8">
              We reserve the right to request that you remove all links or any
              particular link to our Website. You approve to immediately remove
              all links to our Website upon request. We also reserve the right
              to amend these terms and conditions and its linking policy at any
              time. By continuously linking to our Website, you agree to be
              bound to and follow these linking terms and conditions.
            </p>
          </section>

          {/* Removal of links section */}
          <section id="removal-of-links" className="mb-6 scroll-mt-32">
            <h2 className="text-3xl font-semibold mb-4">
              Removal of links from our website
            </h2>
            <p className="mb-4 leading-8">
              If you find any link on our Website that is offensive for any
              reason, you are free to contact and inform us at any moment. We
              will consider requests to remove links but we are not obligated to
              do so or to respond to you directly.
            </p>
          </section>

          {/* Disclaimer section */}
          <section id="disclaimer" className="mb-6 scroll-mt-32">
            <h2 className="text-3xl font-semibold mb-4">Disclaimer</h2>
            <p className="mb-4 leading-8">
              To the maximum extent permitted by applicable law, we exclude all
              representations, warranties, and conditions relating to our
              website and the use of this website.
            </p>
            <p className="mb-4 leading-8">Nothing in this disclaimer will:</p>
            <ul className="list-disc pl-5 mb-4 leading-8">
              <li>
                limit or exclude our or your liability for death or personal
                injury;
              </li>
              <li>
                limit or exclude our or your liability for fraud or fraudulent
                misrepresentation;
              </li>
              <li>
                limit any of our or your liabilities in any way that is not
                permitted under applicable law; or
              </li>
              <li>
                exclude any of our or your liabilities that may not be excluded
                under applicable law.
              </li>
            </ul>
            <p className="mb-4 leading-8">
              The limitations and prohibitions of liability set in this Section
              and elsewhere in this disclaimer: (a) are subject to the preceding
              paragraph; and (b) govern all liabilities arising under the
              disclaimer, including liabilities arising in contract, in tort,
              and for breach of statutory duty.
            </p>
            <p className="mb-4 leading-8">
              As long as the website and the information and services on the
              website are provided free of charge, we will not be liable for any
              loss or damage of any nature.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PageTerm;
