# Edit Event Modal - API Requirements (Simple Version)

## Overview
EditEventModal has 2 tabs where users can update event data:
1. **Event Details Tab** - Update basic event information
2. **Suppliers Tab** - View current suppliers and add new ones with packages

---

## Tab 1: Event Details Update

### API Endpoint
**PUT** `/api/events/:eventId`

### Payload Example
```json
{
  "name": "Updated Event Name",
  "description": "Updated description",
  "startDate": "2025-10-23T04:30:00.000Z",
  "endDate": "2025-10-23T08:30:00.000Z",
  "location": {
    "address": "New Address",
    "city": "New City"
  },
  "category": "corporate",
  "isPublic": true,
  "ticketInfo": {
    "availableTickets": 100,
    "priceRange": {
      "min": 50,
      "max": 200
    }
  }
}
```

### What Backend Needs to Do:
1. Validate user is the event producer
2. Update the event fields
3. Return updated event with populated suppliers

---

## Tab 2: Suppliers Update (WITH PACKAGES)

### API Endpoint
**PUT** `/api/events/:eventId`

### Payload Example - Adding New Supplier with Package
```json
{
  "suppliers": [
    {
      "supplierId": "68da835b99a74445eb643c25",
      "services": [
        {
          "serviceId": "68db66b5d5b05f8870961597",
          "selectedPackageId": "68db670fd5b05f8870961626",
          "packageDetails": {
            "name": "Premium Package",
            "description": "Full service music package",
            "price": 5000,
            "features": ["DJ", "Sound System", "Lighting"],
            "duration": 8
          },
          "requestedPrice": 5000,
          "notes": "Selected for music service",
          "priority": "medium"
        }
      ]
    }
  ]
}
```

### What Backend Needs to Do:

1. **Receive suppliers array** with package details
2. **Store package information** in event document:
   ```javascript
   {
     selectedPackageId: "package_id",  // String (from service.packages array)
     packageDetails: {
       name: "Premium Package",
       description: "Full service",
       price: 5000,
       features: ["Feature 1", "Feature 2"],
       duration: 8
     }
   }
   ```

3. **Return populated event** with:
   - Full supplier details (name, email, phone)
   - Full service details (title, description, packages array)
   - Package details stored in the event

---

## Key Points for Backend

### 1. Package Fields are OPTIONAL
```javascript
// Service can have package OR not
{
  serviceId: "service_id",
  // WITH package
  selectedPackageId: "package_id",
  packageDetails: { /* package info */ },
  requestedPrice: 5000
}

// OR WITHOUT package
{
  serviceId: "service_id",
  requestedPrice: 2000,
  notes: "Custom service"
}
```

### 2. Package Details Structure
```javascript
packageDetails: {
  name: String,        // Required if packageDetails exists
  description: String, // Required if packageDetails exists
  price: Number,       // Required if packageDetails exists
  features: [String],  // Required (can be empty array)
  duration: Number     // Optional
}
```

### 3. Validation Rules
- If `selectedPackageId` provided → `packageDetails` MUST be provided
- If `packageDetails` provided → `selectedPackageId` MUST be provided
- Both or neither (they go together)

---

## Response Format Needed

```json
{
  "success": true,
  "message": "Event updated successfully",
  "data": {
    "_id": "event_id",
    "name": "Event Name",
    "suppliers": [
      {
        "_id": "supplier_entry_id",
        "supplierId": {
          "_id": "supplier_id",
          "name": "Supplier Name",
          "email": "supplier@example.com",
          "phone": "1234567890"
        },
        "serviceId": {
          "_id": "service_id",
          "title": "Music Service",
          "category": "music",
          "price": {
            "amount": 700,
            "currency": "ILS"
          },
          "packages": [
            {
              "_id": "package_id",
              "name": "Premium Package",
              "price": 5000,
              "features": ["DJ", "Sound"],
              "duration": 8
            }
          ]
        },
        "selectedPackageId": "package_id",
        "packageDetails": {
          "name": "Premium Package",
          "description": "Full service",
          "price": 5000,
          "features": ["DJ", "Sound"],
          "duration": 8
        },
        "requestedPrice": 5000,
        "status": "pending",
        "priority": "medium"
      }
    ]
  }
}
```

---

## Summary

### Frontend Sends:
1. **Event Details Tab:** Basic event info (name, date, location, etc.)
2. **Suppliers Tab:** Suppliers array with optional package details

### Backend Must:
1. Accept `selectedPackageId` and `packageDetails` in services array
2. Store package details as snapshot (don't reference)
3. Return populated event with full supplier/service/package data
4. Handle optional package fields (backward compatible)

### Package Data Flow:
```
User selects package in UI
  ↓
Frontend stores: selectedPackageId + packageDetails
  ↓
PUT /api/events/:id with suppliers array
  ↓
Backend saves package snapshot
  ↓
Backend returns populated event
  ↓
Frontend displays package details in Suppliers tab
```

That's it! Simple and straightforward.
