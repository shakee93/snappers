import React, { FC } from "react";
import Link from "next/link";
import UserDetails from "@/app/components/Account/UserDetails";
import { getClient } from "@/graphql/apollo-ssr";
import { gql } from "@apollo/client";
// import { GET_ACCOUNT_DETAILS } from "@/graphql/defs/auth";


export interface CommonLayoutProps {
  children?: React.ReactNode;
}

// export const GET_ACCOUNT_DETAILS = gql`
//   query getAccountDetails($id: ID = "Y3VzdG9tZXI6NQ==") {
//     customer(id: $id) {
//       email
//       displayName
//       billing {
//         address1
//         phone
//         email
//       }
//       metaData(multiple: true) {
//         key
//         value
//         id
//       }
//       username
//       id
//     }
//   }
// `;


const CommonLayout: FC<CommonLayoutProps> =  ({ children }) => {

  // const getAccountDetails = async () => {
  //   const { data, error } = await getClient().query({
  //     query: GET_ACCOUNT_DETAILS,
  //   });
  //   console.log("data: ", data);
  //   console.log("error: ", error);

  //   return
  // }

  // getAccountDetails();

  return (
    <div className="nc-CommonLayoutProps container">
      <div className="mt-14 sm:mt-20">
        <div className="max-w-4xl mx-auto">
          <UserDetails />
          <hr className="mt-10 border-slate-200 dark:border-slate-700"></hr>

          <div className="flex space-x-8 md:space-x-14 overflow-x-auto hiddenScrollbar">
            {[
              {
                name: "Account info",
                link: "/account",
              },
              {
                name: "Save lists",
                link: "/account-savelists",
              },
              {
                name: " My order",
                link: "/account-my-order",
              },
              {
                name: "Change password",
                link: "/account-change-password",
              },
              {
                name: "Change Billing",
                link: "/account-billing",
              },
            ].map((item, index) => (
              <Link
                key={index}
                href={item.link}
                className={`block py-5 md:py-8 border-b-2 border-transparent flex-shrink-0  text-sm sm:text-base ${true
                    ? "border-primary-500 font-medium text-slate-900 dark:text-slate-200"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <hr className="border-slate-200 dark:border-slate-700"></hr>
        </div>
      </div>
      <div className="max-w-4xl mx-auto pt-14 sm:pt-26 pb-24 lg:pb-32">
        {children}
      </div>
    </div>
  );
};

export default CommonLayout;
