import axios from 'axios';
import crypto from 'crypto';

interface PayhereNotification {
  merchant_id: string;
  order_id: string;
  payment_id: string;
  captured_amount: string;
  payhere_amount: string;
  payhere_currency: string;
  status_code: string;
  md5sig: string;
  custom_1: string;
  custom_2: string;
  status_message: string;
  method: string;
  card_holder_name: string;
  card_no: string;
  card_expiry: string;
  recurring: string;
}

interface ValidationResult {
  isValid: boolean;
  missingFields: string[];
}

async function processPaymentNotification(data: PayhereNotification) {
  // Function to validate required fields
  const validateRequiredFields = (data: PayhereNotification): ValidationResult => {
    const requiredFields = ['merchant_id', 'order_id', 'payhere_amount', 'payhere_currency', 'status_code', 'md5sig'];
    const missingFields = requiredFields.filter(field => !data[field as keyof PayhereNotification]);
    
    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  };

  // Function to calculate MD5 signature
  const calculateMD5 = (data: PayhereNotification, secretKey: string): string => {
    const stringToHash = `${data.merchant_id}${data.order_id}${data.payment_id}${data.payhere_amount}${secretKey}`;
    console.log("String to merchant_id :", data.merchant_id);
    return crypto.createHash('md5').update(stringToHash).digest('hex').toUpperCase();
  };

  // Validation
  const validationResult = validateRequiredFields(data);
  if (!validationResult.isValid) {
    console.log('Missing fields:', validationResult.missingFields);
    return;
  }

  console.log('Validation passed:', validationResult);

  // MD5 Signature verification
  const secretKey = 'your_merchant_secret'; // Replace with your actual secret key
  const localMD5 = calculateMD5(data, secretKey);
  if (localMD5 !== data.md5sig) {
    console.error('MD5 signature verification failed');
    return;
  }

  console.log('MD5 signature verified successfully');

  // Process payment status
  if (data.status_code === '2') {
    console.log('Payment successful');
    
    // Send confirmation to WordPress
    try {
      const response = await axios.post('https://your-wordpress-site.com/wp-json/your-api-endpoint', {
        orderId: data.order_id,
        status: 'completed',
      });
      
      if (response.data.success) {
        console.log('Confirmation sent to WordPress successfully');
      } else {
        console.error('Failed to send confirmation to WordPress');
      }
    } catch (error) {
      console.error('Error sending confirmation to WordPress:', error);
    }
  } else {
    console.log('Payment failed');
  }

  console.log('Payment process completed successfully');
}

// Example usage:
const paymentNotification: PayhereNotification = {
  merchant_id: '215650',
  order_id: '18426',
  payment_id: '320043928445',
  captured_amount: '20.60',
  payhere_amount: '20.60',
  payhere_currency: 'LKR',
  status_code: '2',
  md5sig: '62B546ECC9A8ACA58D6DD3AB8CD0CD27',
  custom_1: '',
  custom_2: '',
  status_message: 'Successfully received the VISA payment',
  method: 'VISA',
  card_holder_name: 'Mohammed Sadikin Mohammed Shadir',
  card_no: '************6268',
  card_expiry: '0826',
  recurring: '0',
};

// Call the function
processPaymentNotification(paymentNotification);

