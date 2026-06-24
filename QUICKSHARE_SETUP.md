# QuickShare - File Transfer App Setup Guide

QuickShare is a web application + Chrome extension that enables instant file transfer between your PC and phone using QR codes or numeric codes, inspired by Huawei SuperHub.

## Features

- 🔄 **Bi-directional file transfer** - Send files from PC to phone and vice versa
- 📱 **QR Code & Numeric Codes** - Share connection via QR code or 6-digit numeric code
- 📦 **Up to 5MB files** - Perfect for quick document and image sharing
- ⏱️ **15-minute sessions** - Auto-expiring sessions for security
- 🌐 **Web-based** - No app installation needed on phone
- 🔌 **Chrome Extension** - Quick access from your desktop
- 💾 **Cloud relay** - Uses Vercel Blob for temporary storage

## Architecture

### Components

1. **Web Application** (`app/page.tsx`, `app/transfer/[sessionId]/page.tsx`)
   - Home page to create or join sessions
   - Transfer interface with QR code, numeric code, and file list
   - Real-time file polling (5-second intervals)

2. **Chrome Extension** (`public/manifest.json`, `public/popup.html`, `public/popup.js`)
   - Lightweight popup showing QR code and numeric code
   - Quick access to create new sessions
   - Displays file count and session time remaining

3. **Backend API** (`app/api/`)
   - Session management (create, validate)
   - File upload/download with Vercel Blob
   - Real-time file listing

4. **Session Manager** (`lib/session-manager.ts`)
   - In-memory session store
   - Auto-expiring sessions
   - File tracking

## Installation & Setup

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Vercel Blob integration enabled
- Chrome browser

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Setup Environment Variables

The app requires `BLOB_READ_WRITE_TOKEN` from Vercel Blob. This should be automatically set up in your Vercel project.

### 3. Run Development Server

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`

### 4. Load Chrome Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `/public` folder from the project directory
5. The QuickShare icon should now appear in your Chrome extensions

## Usage

### On Desktop (PC)

1. **Create a Session:**
   - Click the QuickShare extension icon in Chrome
   - A new session is automatically created
   - You'll see a QR code and 6-digit numeric code

2. **Share with Phone:**
   - Send the 6-digit code to your phone user
   - Or have them scan the QR code with their phone camera

3. **Upload Files:**
   - Click in the upload area or drag files
   - Max 5MB per file
   - Files appear in the shared list

### On Phone (Mobile Browser)

1. **Join a Session:**
   - Visit the link from the QR code
   - OR manually navigate to the app and enter the 6-digit code in "Join Session"

2. **Upload Files:**
   - Tap the upload area
   - Select files from your phone
   - Files appear instantly on the PC

3. **Download Files:**
   - See files uploaded by the PC
   - Tap the download button
   - File downloads to your phone

## API Endpoints

### Session Management

- `POST /api/session/create` - Create a new session
  - Returns: `{ id, code, createdAt, expiresAt, files }`

- `POST /api/session/validate` - Validate session by ID or code
  - Body: `{ id?: string, code?: string }`
  - Returns: `{ id, code, expiresAt, fileCount }`

### File Operations

- `POST /api/upload` - Upload a file
  - Headers: `x-session-id`
  - Body: FormData with `file` field
  - Returns: `{ id, name, size, mimeType, blobUrl, uploadedAt }`

- `GET /api/files` - Get all files in a session
  - Headers: `x-session-id`
  - Returns: `{ files: FileRecord[] }`

- `POST /api/download` - Get download link for a file
  - Headers: `x-session-id`, `x-file-id`
  - Returns: `{ url, name }`

- `DELETE /api/files` - Delete a file
  - Headers: `x-session-id`, `x-file-id`
  - Returns: `{ success: true }`

## Session Details

- **Duration:** 15 minutes
- **Auto-cleanup:** Expired sessions are removed periodically
- **Code Format:** 6-digit numeric code (000000-999999)
- **In-Memory Storage:** Sessions stored in-memory (not persisted across server restarts)

## File Handling

- **Max Size:** 5MB per file
- **Storage:** Vercel Blob (temporary)
- **Auto-Delete:** Files deleted when:
  - Session expires (15 minutes)
  - User manually deletes the file
- **Access:** Private (authentication token required)

## Deploying to Production

### On Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Vercel will automatically detect Next.js and configure build settings
4. Add `BLOB_READ_WRITE_TOKEN` to environment variables
5. Deploy!

### Using Custom Domain

1. Add your custom domain in Vercel project settings
2. Update `APP_URL` in `public/popup.js` to your production URL
3. The extension popup will automatically use the production URL

### Extension Distribution

To distribute the extension:

1. Package the extension from the `/public` folder
2. Create a `.zip` file containing:
   - `manifest.json`
   - `popup.html`
   - `popup.js`
   - `background.js`
   - `icons/` folder
3. Upload to [Chrome Web Store](https://chrome.google.com/webstore/devconsole/)

## Troubleshooting

### Extension Won't Load

- Check that `manifest.json` is in the root of the `/public` folder
- Verify Chrome version supports Manifest v3
- Check browser console for errors

### QR Code Not Showing

- Verify the app URL is accessible
- Check network connectivity
- Clear browser cache and reload

### Files Not Uploading

- Verify file size is under 5MB
- Check that `BLOB_READ_WRITE_TOKEN` is properly set
- Check Vercel logs for upload errors

### Session Expired

- Sessions automatically expire after 15 minutes
- Create a new session to continue transferring files

### Extension Storage Issues

- The extension stores sessions in `chrome.storage.local`
- This persists across popup opens but is cleared when data is deleted
- Clear extension storage in Chrome settings if issues occur

## Security Considerations

- Sessions are stored in-memory and not persisted
- Files are stored with private access in Vercel Blob
- Numeric codes are 6-digit random numbers
- QR codes expire with their sessions (15 minutes)
- No user authentication required (URL-based access control)
- Consider adding rate limiting in production

## Future Enhancements

- WebSocket support for real-time updates
- Persistent session storage (with TTL)
- User authentication and account management
- File compression before upload
- Batch file transfers
- Custom session duration options
- Password-protected sessions
- File preview before download

## Support

For issues or feature requests, please check the troubleshooting section or file an issue in your repository.
