# Pickup Type Implementation Guide

## How Data is Sent in GraphQL

The pickup type data is sent to WordPress/WooCommerce through the `checkout` mutation in the following ways:

### 1. Shipping Method (`shippingMethod`)

```typescript
const shippingMethod = {
  methodId: pickupType ? "pickup_location:0" : "wbs:0dd3bc79_weight_based_shipping",
  methodTitle: pickupType ? pickupLabels[pickupType] : "Weight Based Shipping",
  total: pickupType ? "0" : shippingTotal
}
```

**GraphQL Input:**
```graphql
input: {
  shippingMethod: {
    methodId: "pickup_location:0"
    methodTitle: "Store" | "Uber" | "Pick Me"
    total: "0"
  }
}
```

### 2. Shipping Address (`shipping`)

When a pickup type is selected, the shipping address fields are populated with the pickup label:

```typescript
const shippingDetails = pickupType ? {
  ...transformAddress(formData.deliveryAddress),
  address1: pickupLabels[pickupType],  // "Store", "Uber", or "Pick Me"
  address2: "",
  city: pickupLabels[pickupType],       // Same as address1
  state: "",
  postcode: "",
} : transformAddress(formData.deliveryAddress);
```

**GraphQL Input:**
```graphql
input: {
  shipping: {
    address1: "Store" | "Uber" | "Pick Me"
    city: "Store" | "Uber" | "Pick Me"
    address2: ""
    state: ""
    postcode: ""
    country: "LK"
    firstName: "..."
    phone: "..."
  }
}
```

### 3. Customer Note (`customerNote`)

The pickup type is also included in the customer note as HTML:

```typescript
const customerNoteHTML = `
  <p><strong>Customer Email:</strong> ${email}</p>
  <p><strong>Phone Number:</strong> ${phone}</p>
  ${pickupType ? `<p><strong>Pickup Location:</strong> ${pickupLabels[pickupType]}</p>` : ""}
`;
```

**GraphQL Input:**
```graphql
input: {
  customerNote: "<p><strong>Pickup Location:</strong> Store</p>"
}
```

## Current Implementation

### Frontend Code Location:
- **Component**: `app/checkout/DeliveryAddress.tsx`
- **State Management**: `app/checkout/page.tsx`
- **GraphQL Mutation**: `graphql/defs/order.ts` (CHECKOUT mutation)

### Pickup Types:
- `"store"` → Display: "Store"
- `"uber"` → Display: "Uber"
- `"pickme"` → Display: "Pick Me"

## Backend WordPress/WooCommerce Changes Needed

### Option 1: Use Order Meta Data (Recommended)

Add the pickup type as order meta data so it can be easily queried and displayed:

#### 1. Add Meta Data to Checkout Input

**Frontend Change** (`app/checkout/page.tsx` around line 484):

**Current Code:**
```typescript
metaData: [
  {
    key: "payhere_order_id",
    value: payherPaymentID ?? "",
  },
],
```

**Updated Code:**
```typescript
metaData: [
  {
    key: "payhere_order_id",
    value: payherPaymentID ?? "",
  },
  // Add pickup type meta data
  ...(pickupType ? [{
    key: "_pickup_type",
    value: pickupType  // "store", "uber", or "pickme"
  }] : [])
],
```

#### 2. WordPress Backend - Save Meta Data

The WooCommerce GraphQL plugin should automatically save meta data, but you may need to ensure it's whitelisted:

**In WordPress (functions.php or custom plugin):**
```php
// Allow pickup_type meta data to be saved
add_filter('woocommerce_graphql_order_meta_data_keys', function($keys) {
    $keys[] = '_pickup_type';
    return $keys;
});
```

#### 3. Display in Admin Order Details

**WordPress Admin (functions.php or custom plugin):**
```php
// Display pickup type in order admin
add_action('woocommerce_admin_order_data_after_shipping_address', function($order) {
    $pickupType = $order->get_meta('_pickup_type');
    if ($pickupType) {
        $pickupLabels = [
            'store' => 'Store',
            'uber' => 'Uber',
            'pickme' => 'Pick Me'
        ];
        $label = $pickupLabels[$pickupType] ?? $pickupType;
        echo '<p><strong>Pickup Type:</strong> ' . esc_html($label) . '</p>';
    }
});
```

### Option 2: Parse from Shipping Method Title

If you don't want to add meta data, you can parse the pickup type from the shipping method title:

**WordPress Backend:**
```php
// Get pickup type from shipping method title
add_action('woocommerce_admin_order_data_after_shipping_address', function($order) {
    $shippingMethod = $order->get_shipping_method();
    
    // Check if it's a pickup method
    if (strpos($shippingMethod, 'Store') !== false) {
        echo '<p><strong>Pickup Type:</strong> Store</p>';
    } elseif (strpos($shippingMethod, 'Uber') !== false) {
        echo '<p><strong>Pickup Type:</strong> Uber</p>';
    } elseif (strpos($shippingMethod, 'Pick Me') !== false) {
        echo '<p><strong>Pickup Type:</strong> Pick Me</p>';
    }
});
```

### Option 3: Use Shipping Address Fields

Since the pickup type is stored in `address1` and `city` fields, you can check those:

**WordPress Backend:**
```php
// Check shipping address for pickup type
add_action('woocommerce_admin_order_data_after_shipping_address', function($order) {
    $address1 = $order->get_shipping_address_1();
    $city = $order->get_shipping_city();
    
    $pickupTypes = ['Store', 'Uber', 'Pick Me'];
    if (in_array($address1, $pickupTypes) && $address1 === $city) {
        echo '<p><strong>Pickup Type:</strong> ' . esc_html($address1) . '</p>';
    }
});
```

## Email Notifications

To include pickup type in order emails:

**WordPress (functions.php or custom plugin):**
```php
// Add pickup type to order emails
add_action('woocommerce_email_order_details', function($order, $sent_to_admin, $plain_text, $email) {
    $pickupType = $order->get_meta('_pickup_type');
    if ($pickupType) {
        $pickupLabels = [
            'store' => 'Store',
            'uber' => 'Uber',
            'pickme' => 'Pick Me'
        ];
        $label = $pickupLabels[$pickupType] ?? $pickupType;
        echo '<p><strong>Pickup Type:</strong> ' . esc_html($label) . '</p>';
    }
}, 10, 4);
```

## GraphQL Query to Retrieve Pickup Type

If you add meta data, you can query it via GraphQL:

```graphql
query GetOrder($id: ID!) {
  order(id: $id) {
    metaData {
      key
      value
    }
  }
}
```

Then filter for `key: "_pickup_type"` to get the pickup type value.

## Summary

**Current State:**
- Pickup type is sent via `shippingMethod.methodTitle`, `shipping.address1/city`, and `customerNote`
- No dedicated meta data field exists yet

**Recommended Backend Changes:**
1. Add `_pickup_type` to `metaData` array in checkout mutation
2. Whitelist the meta key in WordPress
3. Display pickup type in admin order details
4. Include pickup type in email notifications

**Minimal Changes (If you can't modify GraphQL):**
- Parse pickup type from shipping method title or shipping address fields
- Display in admin and emails using the parsing logic
