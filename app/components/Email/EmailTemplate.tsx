import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
  orderId: string;
  orderTime: string;
  itemsOrdered: string[];
}

const emailStyle = {
  background: '#f0f0f0',
  padding: '16px',
  fontFamily: 'Arial, sans-serif', // Specify your desired font here
};

const containerStyle = {
  maxWidth: '600px',
  margin: '0 auto',
  background: 'white',
  borderRadius: '8px',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  padding: '24px',
};

const headingStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '16px',
};

const paragraphStyle = {
  color: '#777',
  marginBottom: '16px',
};

const hrStyle = {
  borderTop: '1px solid #ddd',
  margin: '16px 0',
};

const listStyle = {
  listStyleType: 'disc',
  marginLeft: '20px',
};

const listItemStyle = {
  marginBottom: '8px',
};

const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
  orderId,
  orderTime,
  itemsOrdered,
}) => (
  <div style={emailStyle}>
    <div style={containerStyle}>
      <h1 style={headingStyle}>
        Thank you for your order, {firstName}!
      </h1>
      <p style={paragraphStyle}>
        Your order ({orderId}) was placed on {orderTime}.
      </p>
      <hr style={hrStyle} />
      <h2 style={headingStyle}>Items Ordered:</h2>
      <ul style={listStyle}>
        {itemsOrdered.map((item, index) => (
          <li key={index} style={listItemStyle}>
            {item}
          </li>
        ))}
      </ul>
      <hr style={hrStyle} />
      <p style={paragraphStyle}>
        If you have any questions or need assistance, please contact our customer support.
      </p>
    </div>
  </div>
);

export default EmailTemplate;


// const fakeData = {
//     firstName: "John",
//     orderId: "123456",
//     orderTime: "January 27, 2024",
//     itemsOrdered: ["Product 1", "Product 2", "Product 3"],
//   };
