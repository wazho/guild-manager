
# Requirements

## LINE Login settings

1. Go to LINE developer https://developers.line.me/
2. Add new provider or use exist provider
3. Create new channel > LINE Login
4. [tab] App settings > Enter your **Callback URL** same with in `./src/config.ts`
5. [tab] Channel settings > Paste **Channel ID** and **Channel secret** in `./src/config.ts`


## Google APIs settings

### API keys

Quick access (readonly) to Google spreadsheet without other auth by using API keys.

1. Go to Google APIs https://console.developers.google.com/
2. New Project (if you don't have anyone)
3. Select your project > Credentials
4. Create credentials > API key > Restrict key
5. [tab] Application restrictions > None (dev) / HTTP referrers (prod)
6. [tab] API restrictions > Google Sheets API > Save
7. Copy and paste the key to **apiKey** in `./src/config-default.ts`
8. Go to Google Drive https://www.google.com/drive/
9. Create an spreadsheet, then copy ID and sheet in `./src/config-default.ts`
10. Rename `./src/config-default.ts` to `./src/config.ts`

### OAuth 2.0 client IDs

Offline access to your spreadsheet. Notice to protect your `credentials`, it has complete permission for your Google Spreadsheet.

1. Follow above, create another credential > OAuth client ID > Other
2. Click icon **Download JSON** of this row
3. Move this file to `./credentials.json`


# Launching

## Run web server

```shell
$ yarn
$ yarn start
# Visit http://localhost:3000
```

## Initial your environment

Visit http://localhost:3000/system/init to finish it.
