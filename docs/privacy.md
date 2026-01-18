# Privacy Policy

**Lead Autopilot** is designed with privacy as a core principle. This document explains what data is collected, where it's stored, and how you can control it.

## Summary

- ✅ **100% Local Storage**: All data stays on your device
- ✅ **No External Servers**: Zero network requests for data
- ✅ **No Analytics**: We don't track your usage
- ✅ **No Accounts**: No login, no user profiles
- ✅ **Full Data Control**: Export, import, or delete anytime

## What Data is Stored

Lead Autopilot stores the following data types in your browser's localStorage:

### 1. Lead Information

**Purpose**: Track contacts and their journey through your sales pipeline

**Data Collected**:
- Full name (required)
- Email address (optional)
- Phone number (optional)
- Source (optional, e.g., "Website", "Referral")
- Service intent (optional, e.g., "Beach vacation")
- Budget range (optional)
- Timeline (optional)
- Notes (optional)
- Stage (required, e.g., "New", "Contacted", "Qualified")
- Created/updated timestamps

### 2. Activities

**Purpose**: Log interactions with leads

**Data Collected**:
- Activity type (note, call, email, SMS, status change)
- Activity description/body
- Associated lead ID
- Timestamp

### 3. Tasks

**Purpose**: Track follow-up actions

**Data Collected**:
- Task title
- Due date
- Status (todo/done)
- Associated lead ID
- Optional: channel (email/SMS/call), template ID

### 4. Templates

**Purpose**: Provide reusable communication scripts

**Data Collected**:
- Template name
- Channel (email/SMS/call)
- Subject line (email only)
- Body text
- Tags (optional)

### 5. Cadence Policies

**Purpose**: Define follow-up automation rules

**Data Collected**:
- Policy name
- List of rules (day offset, channel, template ID, title)

## Where Data is Stored

### Browser localStorage

All data is stored in your web browser's localStorage under the key:

```
lead-autopilot-workspace-v1
```

**Location**:
- **Chrome/Edge**: `C:\Users\[username]\AppData\Local\[Browser]\User Data\Default\Local Storage`
- **Firefox**: `C:\Users\[username]\AppData\Roaming\Mozilla\Firefox\Profiles\[profile]\storage\default`
- **Safari**: `~/Library/Safari/LocalStorage`

**Storage Limits**:
- Most browsers: 5-10 MB per domain
- Data persists until you clear browser data or manually delete it

### No Server Storage

Lead Autopilot **does not**:
- Send data to external servers
- Store data in the cloud
- Use remote databases
- Sync data across devices

## What Data is Shared

### Zero Data Sharing

Lead Autopilot **does not**:
- Share your data with third parties
- Sell your data
- Send analytics or telemetry
- Use tracking pixels or cookies (beyond essential browser cookies)
- Make network requests to external APIs

### No Authentication

There are no user accounts, which means:
- No email addresses collected
- No passwords stored
- No OAuth tokens
- No session tracking

## Your Data Rights

### 1. Access Your Data

**Export Workspace**:
1. Navigate to Settings
2. Click "Export Workspace"
3. Download a JSON file with all your data

The exported file contains everything in human-readable JSON format.

### 2. Delete Your Data

**Clear All Data**:
1. Navigate to Settings
2. Click "Clear All Data"
3. Confirm deletion (two-step confirmation)

This permanently removes all data from localStorage.

**Browser Clear**:
You can also clear data via your browser:
- Chrome: Settings → Privacy → Clear browsing data → Cookies and site data
- Firefox: Settings → Privacy → Clear Data → Site Data
- Safari: Preferences → Privacy → Manage Website Data

### 3. Data Portability

**Import/Export**:
- Export: Download JSON file anytime
- Import: Upload JSON file to restore data
- Format: Open standard (JSON), readable by any tool

**Use Cases**:
- Backup your data
- Move to another browser
- Migrate to another device
- Archive old workspaces

## Data Security

### Client-Side Only

Since all data is stored locally:
- **No server breaches**: There's no server to hack
- **No unauthorized access**: Only you can access your browser's localStorage
- **No network interception**: Data never travels over the network

### Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| **Device theft** | Use full-disk encryption (BitLocker, FileVault) |
| **Malware** | Keep antivirus updated; avoid suspicious extensions |
| **Browser extensions** | Review permissions; use reputable extensions only |
| **Shared computers** | Use browser profiles; log out of machine when done |
| **Data loss** | Export regularly (backups) |

### Recommendations

1. **Regular Backups**: Export your workspace weekly
2. **Secure Device**: Use OS-level password protection
3. **Private Browsing**: Don't use if you need data to persist
4. **Browser Updates**: Keep browser up-to-date for security patches

## Children's Privacy

Lead Autopilot is intended for business use by adults (18+). We do not knowingly collect data from children under 13.

## Third-Party Services

### None Used

Lead Autopilot does **not** integrate with:
- Google Analytics
- Facebook Pixel
- Hotjar or similar tools
- Any third-party APIs (including AI services)

### Future Integrations

If we add optional integrations (e.g., email OAuth), we will:
1. Make them clearly opt-in
2. Update this privacy policy
3. Notify users via release notes
4. Provide granular permission controls

## Changes to This Policy

We may update this privacy policy to reflect changes in the application. Updates will be:
- Documented in git commit history
- Announced in release notes
- Effective immediately upon deployment

**Last Updated**: January 18, 2026

## Contact & Questions

This is an open-source project. For privacy questions or concerns:

1. **GitHub Issues**: [github.com/YOUR_USERNAME/lead-to-booking-autopilot/issues](https://github.com/YOUR_USERNAME/lead-to-booking-autopilot/issues)
2. **Code Review**: Inspect the source code directly
3. **Self-Host**: Deploy your own instance for maximum control

## Transparency

### Open Source

The entire codebase is open-source, which means:
- You can verify there are no hidden tracking scripts
- You can audit data storage logic
- You can build and deploy your own version
- You can see exactly what the app does with your data

### Verifiable Claims

To verify our privacy claims:

1. **No Network Requests**:
   - Open browser DevTools (F12)
   - Go to Network tab
   - Use the app
   - Observe: Only local resources loaded (no external requests)

2. **No Cookies**:
   - Open DevTools → Application → Cookies
   - Observe: No tracking cookies set

3. **localStorage Only**:
   - Open DevTools → Application → Local Storage
   - Observe: All data under `lead-autopilot-workspace-v1` key

## Compliance

### GDPR (Europe)

Lead Autopilot is GDPR-compliant by design:
- ✅ No personal data processing on servers
- ✅ No data transfers to third parties
- ✅ Full user control (export, delete)
- ✅ No consent needed (no data collection)
- ✅ Transparent storage location

### CCPA (California)

California residents have rights under CCPA:
- ✅ Right to know: Documented in this policy
- ✅ Right to delete: "Clear All Data" button
- ✅ Right to opt-out of sale: We don't sell data
- ✅ Right to non-discrimination: Not applicable (no accounts)

### Other Regulations

The app's local-first architecture makes it compliant with most privacy laws worldwide, as there is no "data controller" beyond the user themselves.

---

**Privacy by Design**: Lead Autopilot is built on the principle that your data is yours, and yours alone.
