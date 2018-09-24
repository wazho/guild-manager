export const webAppURL = process.env.WEB_APP_URL || 'http://localhost';
export const port = process.env.PORT || 3000;

/**
 * Step 1: Go to LINE developer https://developers.line.me/
 * Step 2: Add new provider or use exist provider
 * Step 3: Create new channel > LINE Login
 * Step 4: [tab] App settings > Enter your 'Callback URL' same with below
 * Step 5: [tab] Channel settings > Paste 'Channel ID' and 'Channel secret' below
 */
export const lineChannel = {
    channelID: process.env.LINE_CHANNEL_ID,
    channelSecret: process.env.LINE_CHANNEL_SECRET,
    callbackURL: process.env.LINE_CALLBACK_URL,
};

/**
 * Step 1: Go to Google APIs https://console.developers.google.com/
 * Step 2: New Project (if you don't have anyone)
 * Step 3: Select your project > Credentials
 * Step 4: Create credentials > API key > Restrict key
 * Step 5: [tab] Application restrictions > None (dev) / HTTP referrers (prod)
 * Step 6: [tab] API restrictions > Google Sheets API > Save
 * Step 7: Copy and paste the key to 'apiKey' below
 * Step 8: Go to Google Drive https://www.google.com/drive/
 * Step 9: Create an spreadsheet, then copy ID and sheet below
 */
export const googleApis = {
    apiKey: process.env.GOOGLE_APIS_API_KEY,
    spreadsheetId: process.env.GOOGLE_APIS_SPREADSHEET_ID,
    sheetName: process.env.GOOGLE_APIS_SHEET_NAME,
};
