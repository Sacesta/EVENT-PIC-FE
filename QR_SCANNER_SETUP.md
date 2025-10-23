# QR Code Scanner - Frontend Setup Guide

## Overview

This guide shows you how to integrate the QR code scanner into your producer dashboard to scan and verify tickets at events.

## What You Get

✅ **Camera-based QR scanning** - Uses device camera (phone, tablet, or laptop webcam)
✅ **Instant verification** - Real-time ticket validation via API
✅ **Visual feedback** - Clear success/error messages
✅ **Attendee details** - Shows all ticket information
✅ **One-click check-in** - Easy check-in process
✅ **Mobile-friendly** - Works on all devices

## Files Created

```
pic-fe/src/components/
├── QRScannerModal.tsx           # Main scanner component (ready to use!)
└── QRScannerUsageExample.tsx    # Integration example
```

## Installation

### 1. Install Dependencies

Already installed! The `html5-qrcode` package is now in your project.

```bash
npm install html5-qrcode  # Already done ✓
```

### 2. Environment Variables

Make sure your `.env` file has the API URL:

```env
VITE_API_URL=http://localhost:5000
```

Or update the `QRScannerModal.tsx` file if you use a different env var name.

## How to Use

### Basic Integration (3 Steps)

**Step 1: Import the component**
```typescript
import QRScannerModal from './components/QRScannerModal';
```

**Step 2: Add state to control the modal**
```typescript
const [showScanner, setShowScanner] = useState(false);
```

**Step 3: Add a button and render the modal**
```typescript
// Button to open scanner
<button onClick={() => setShowScanner(true)}>
  Scan QR Code
</button>

// Modal (renders when showScanner is true)
{showScanner && (
  <QRScannerModal
    eventId={yourEvent._id}
    eventName={yourEvent.name}
    onClose={() => setShowScanner(false)}
  />
)}
```

That's it! 🎉

### Full Example

Here's a complete component with the scanner integrated:

```typescript
import { useState } from 'react';
import QRScannerModal from './components/QRScannerModal';

const ProducerEventPage = () => {
  const [showScanner, setShowScanner] = useState(false);

  // Your event data (from API or props)
  const event = {
    _id: '673a1b2c3d4e5f6g7h8i9j0k',
    name: 'Summer Music Festival 2024',
    startDate: '2024-08-15T18:00:00.000Z'
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{event.name}</h1>

      {/* Scan Button */}
      <button
        onClick={() => setShowScanner(true)}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
      >
        📱 Scan QR Code
      </button>

      {/* Scanner Modal */}
      {showScanner && (
        <QRScannerModal
          eventId={event._id}
          eventName={event.name}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};

export default ProducerEventPage;
```

## How It Works

### User Flow

```
1. Producer clicks "Scan QR Code" button
   ↓
2. Camera modal opens
   ↓
3. Producer points camera at attendee's QR code
   ↓
4. Scanner reads QR code automatically
   ↓
5. API verifies ticket validity
   ↓
6. Shows attendee details + check-in button
   ↓
7. Producer clicks "Check In Now"
   ↓
8. Attendee marked as checked in ✓
   ↓
9. Scanner ready for next person
```

### What the Scanner Shows

**For Valid Tickets:**
- ✅ Green success banner
- Attendee name, email, phone
- Booking reference
- Ticket type and quantity
- Special requirements (if any)
- "Check In Now" button

**For Already Checked-In Tickets:**
- ⚠️ Yellow warning banner
- "Already Checked In" message
- Check-in timestamp
- Attendee details
- "Scan Next Ticket" button

**For Invalid Tickets:**
- ❌ Red error banner
- Error message (e.g., "Ticket cancelled", "Invalid booking")
- "Scan Again" button

## Camera Permissions

### First Use

The browser will ask for camera permission when you first open the scanner:

**Chrome/Edge:**
```
Allow "yourwebsite.com" to access your camera?
[Block] [Allow]
```

**Safari/iOS:**
```
"Website" Would Like to Access the Camera
[Don't Allow] [OK]
```

Click **Allow/OK** to use the scanner.

### If Permission is Denied

Users can manually enable camera access:

**Chrome:**
1. Click the camera icon in address bar
2. Change to "Allow"
3. Refresh page

**Safari:**
1. Settings → Safari → Camera
2. Change to "Allow"
3. Refresh page

**Mobile:**
- Settings → Safari/Chrome → Camera Access → Allow

## Features

### Built-in Features

✅ **Flashlight Toggle** - Turn on flash in low light (if device supports)
✅ **Zoom Slider** - Zoom camera for small QR codes (if device supports)
✅ **Auto-focus** - Camera focuses automatically
✅ **Continuous Scanning** - Scans in real-time (10 fps)
✅ **Error Handling** - Clear error messages for all scenarios
✅ **Loading States** - Shows loading during verification
✅ **Sound Feedback** - Optional success/error sounds
✅ **Responsive Design** - Works on mobile, tablet, desktop

### Security Features

🔒 **Authentication Required** - Producer must be logged in
🔒 **Event Authorization** - Producer must own the event
🔒 **Double Verification** - Checks booking reference, event ID, attendee ID
🔒 **Status Validation** - Prevents cancelled/refunded tickets
🔒 **Duplicate Prevention** - Detects already checked-in tickets

## API Integration

The scanner automatically handles all API calls:

### 1. Verify QR Code
```
POST /api/attendees/verify-qr
Headers: { Authorization: "Bearer <token>" }
Body: { qrCode: "..." }
```

### 2. Check In Attendee
```
PUT /api/attendees/:attendeeId/check-in
Headers: { Authorization: "Bearer <token>" }
```

**Authentication:**
The scanner uses `localStorage.getItem('token')` for the JWT token. Update this line if you store the token differently:

```typescript
// In QRScannerModal.tsx, line ~78 and ~120
const token = localStorage.getItem('token');

// Change to your auth method:
const token = sessionStorage.getItem('authToken');
// or
const token = yourAuthService.getToken();
// or
const token = useAuth().token;
```

## Customization

### Change Colors

Update the Tailwind classes in `QRScannerModal.tsx`:

```typescript
// Primary color (currently #031760)
className="bg-gradient-to-r from-[#031760] to-[#31A7FF]"

// Change to your brand color:
className="bg-gradient-to-r from-[#YOUR_COLOR] to-[#YOUR_ACCENT]"
```

### Change Scanner Settings

```typescript
// In QRScannerModal.tsx, line ~33
const scanner = new Html5QrcodeScanner(
  'qr-reader',
  {
    fps: 10,              // Change: Scans per second (1-60)
    qrbox: { width: 250, height: 250 }, // Change: Scanner box size
    aspectRatio: 1.0,     // Change: Camera aspect ratio
    showTorchButtonIfSupported: true,   // Toggle flashlight
    showZoomSliderIfSupported: true,    // Toggle zoom
  },
  false // Set to true for debug logging
);
```

### Add Sound Effects

1. Add sound files to your `public/sounds/` folder:
   - `success.mp3` - Plays on successful scan
   - `error.mp3` - Plays on error

2. Sounds are optional - if files don't exist, the scanner still works.

### Custom Styling

The component uses Tailwind CSS. You can customize any styles:

```typescript
// Example: Change button style
<button className="bg-green-600 hover:bg-green-700 ...">
  Check In Now
</button>

// Change to:
<button className="bg-purple-600 hover:bg-purple-700 ...">
  Check In Now
</button>
```

## Testing

### Test with a Real Ticket

1. Register for an event (use BookTicketModal)
2. Check email for PDF ticket
3. Open PDF on phone or print it
4. Login as producer
5. Click "Scan QR Code"
6. Point camera at QR code
7. Verify attendee details appear
8. Click "Check In Now"
9. Verify success message

### Test Without Real QR Code

Use this test QR data (replace IDs with real ones from your database):

```javascript
{
  "bookingReference": "BK-ABC123-XYZ789",
  "eventId": "673a1b2c3d4e5f6g7h8i9j0k",
  "attendeeId": "673a1b2c3d4e5f6g7h8i9j0l",
  "email": "test@example.com",
  "ticketQuantity": 2
}
```

Generate QR code at: https://www.qr-code-generator.com/
- Paste the JSON
- Print or display on another device
- Scan it

### Test Error Cases

1. **Invalid QR Code**
   - Scan any random QR code
   - Should show "Invalid ticket"

2. **Already Checked In**
   - Scan same ticket twice
   - Should show "Already Checked In" warning

3. **Wrong Event**
   - Try scanning ticket for different event
   - Should show "Not authorized"

## Troubleshooting

### Camera Not Working

**Problem:** Camera doesn't open or shows black screen

**Solutions:**
1. Check camera permissions in browser settings
2. Make sure another app isn't using the camera
3. Try a different browser
4. On mobile: Use Safari (iOS) or Chrome (Android)
5. Make sure you're using HTTPS (camera requires secure connection)

### QR Code Not Scanning

**Problem:** Scanner doesn't detect QR code

**Solutions:**
1. Make sure QR code is well-lit
2. Hold steady - don't move too much
3. Try zooming in/out with the slider
4. Make sure QR code fills most of the frame
5. Clean camera lens
6. Increase brightness on device showing QR code

### "Invalid Ticket" Error

**Problem:** Valid ticket shows as invalid

**Check:**
1. Is producer logged in?
2. Does producer own this event?
3. Is booking reference correct?
4. Has ticket been cancelled?
5. Check backend logs for actual error

### API Errors

**Problem:** "Failed to verify ticket" error

**Check:**
1. Is backend server running?
2. Is API URL correct in env vars?
3. Is JWT token valid and not expired?
4. Check browser console for error details
5. Check network tab for failed requests

## Mobile Considerations

### iOS Safari

- Works perfectly on iPhone and iPad
- Requires iOS 11+ for camera access
- QR scanning works with both front and rear cameras
- Flashlight toggle available on devices with flash

### Android Chrome

- Works on all Android devices with camera
- Better QR detection than iOS
- Flashlight toggle available
- Can use external USB cameras

### Desktop/Laptop

- Works with built-in webcams
- Also works with external USB cameras
- Flashlight not available (no flash on webcams)
- Zoom slider may not work on all webcams

## Best Practices

### For Producers

1. **Test before event** - Try scanning a test ticket
2. **Good lighting** - Use well-lit check-in area
3. **Stable internet** - Need connection for verification
4. **Charged device** - Keep phone/tablet charged
5. **Backup plan** - Have manual attendee list ready

### For Attendees

1. **Charge phone** - If showing digital ticket
2. **Print backup** - Have PDF printout just in case
3. **Increase brightness** - Makes QR code easier to scan
4. **Arrive early** - Allow time for check-in

### For Developers

1. **Handle errors gracefully** - Don't let failures break check-in
2. **Log everything** - Keep track of scan attempts
3. **Add analytics** - Track check-in patterns
4. **Optimize for speed** - Fast scanning = happy attendees
5. **Test on real devices** - Desktop testing isn't enough

## Advanced Usage

### Multiple Events

If producer manages multiple events:

```typescript
const [selectedEvent, setSelectedEvent] = useState(null);

// Event selector
<select onChange={(e) => setSelectedEvent(events[e.target.value])}>
  {events.map((event, index) => (
    <option key={event._id} value={index}>{event.name}</option>
  ))}
</select>

// Scanner with selected event
{showScanner && selectedEvent && (
  <QRScannerModal
    eventId={selectedEvent._id}
    eventName={selectedEvent.name}
    onClose={() => setShowScanner(false)}
  />
)}
```

### Auto-Refresh Stats

Refresh attendee count after check-in:

```typescript
const handleCloseScanner = () => {
  setShowScanner(false);
  // Refresh event statistics
  fetchEventStats(eventId);
};

<QRScannerModal
  eventId={event._id}
  eventName={event.name}
  onClose={handleCloseScanner}
/>
```

### Custom Success Actions

Add custom logic after check-in:

```typescript
// Modify checkInAttendee function in QRScannerModal.tsx
const checkInAttendee = async (attendeeId: string) => {
  // ... existing check-in code ...

  if (data.success) {
    // Custom action: Send notification
    await sendCheckInNotification(attendeeId);

    // Custom action: Update dashboard
    onAttendeeCheckedIn?.({
      attendeeId,
      timestamp: new Date()
    });
  }
};
```

## Performance Tips

1. **Limit FPS on low-end devices**
   ```typescript
   fps: navigator.hardwareConcurrency > 4 ? 10 : 5
   ```

2. **Reduce scanner box size for faster scanning**
   ```typescript
   qrbox: { width: 200, height: 200 } // Smaller = faster
   ```

3. **Close scanner when not in use**
   - Camera uses battery and CPU
   - Always close modal when done

## Browser Compatibility

| Browser | Desktop | Mobile | Notes |
|---------|---------|--------|-------|
| Chrome | ✅ | ✅ | Best performance |
| Safari | ✅ | ✅ | iOS 11+ required |
| Firefox | ✅ | ✅ | Works well |
| Edge | ✅ | ✅ | Same as Chrome |
| Opera | ✅ | ✅ | Works fine |
| IE 11 | ❌ | ❌ | Not supported |

## Security Notes

1. **HTTPS Required** - Browsers require HTTPS for camera access (except localhost)
2. **Token Expiry** - Handle expired JWT tokens gracefully
3. **Event Authorization** - Backend validates producer owns event
4. **Rate Limiting** - Consider adding rate limits to verification endpoint
5. **Offline Mode** - Scanner needs internet connection (no offline support)

## FAQ

**Q: Can multiple producers scan for the same event?**
A: Yes! Multiple producers can scan simultaneously.

**Q: What if internet connection is lost?**
A: Scanning won't work. Consider adding offline mode in future.

**Q: Can I scan multiple QR codes at once?**
A: No, one at a time. But check-in is very fast (~2 seconds per person).

**Q: Does it work in dark environments?**
A: Yes, use the flashlight toggle if device has flash.

**Q: Can I customize the scanner UI?**
A: Yes! It's all Tailwind CSS - customize as needed.

**Q: What data does the QR code contain?**
A: Booking reference, event ID, attendee ID, email, and ticket quantity (all non-sensitive data).

## Support

- **Documentation**: See [TICKET_SYSTEM.md](../pic-backend/TICKET_SYSTEM.md) in backend
- **API Reference**: Check backend routes in `routes/attendees.js`
- **Component Code**: `src/components/QRScannerModal.tsx`
- **Example Usage**: `src/components/QRScannerUsageExample.tsx`

---

**Ready to Use!** 🚀

The scanner is fully functional and ready to integrate into your producer dashboard. Just import the component and add it to your event pages!
