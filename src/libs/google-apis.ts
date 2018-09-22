import * as fs from 'fs';
import * as readline from 'readline';
import { google } from 'googleapis';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
const content = fs.readFileSync('./credentials.json', { encoding: 'utf-8'});
const credentials = JSON.parse(content)
// Authorize a client with credentials, then call the Google Sheets API.
interface IProfile {
    charName: string;
    displayName: string;
    manager: string;
    lineID: string;
    pictureURL: string;
}

export const addUser = (profile: IProfile) => authorize(credentials, insertUser.bind(null, profile));
// authorize(credentials, listMajors);

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials: any, callback: any) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    try {
        const token = fs.readFileSync(TOKEN_PATH, { encoding: 'utf-8'});
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    } catch (e) {
        getNewToken(oAuth2Client, callback);
    }
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client: any, callback: any) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err: any, token: any) => {
            if (err) return console.error('Error while trying to retrieve access token', err);
            oAuth2Client.setCredentials(token);
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            callback(oAuth2Client);
        });
    });
}

/**
 * Prints the names and majors of students in a sample spreadsheet:
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listMajors(auth: any) {
    const sheets = google.sheets({ version: 'v4', auth: 'AIzaSyDODbcPAYSRM5Hc1A7idaKpsSw9SlTlWVE' });

    sheets.spreadsheets.values.get({
        spreadsheetId: '17vy4xTlfBe0YZeRB2DygK22KJpCZW27reoEUl46TX7g',
        range: 'members!A1:F',
    }, (err: any, res: any) => {
        if (err) return console.log('The API returned an error: ' + err);
        const rows = res.data.values;
        if (rows.length) {
            // Print columns A and E, which correspond to indices 0 and 4.
            rows.map((row: any) => {
                console.log(`${row}`);
            });
        } else {
            console.log('No data found.');
        }
    });
}


function insertUser(profile: IProfile, auth: any) {
    const sheets = google.sheets({ version: 'v4', auth });

    sheets.spreadsheets.values.append({
        auth,
        spreadsheetId: '17vy4xTlfBe0YZeRB2DygK22KJpCZW27reoEUl46TX7g',
        range: 'A1',
        includeValuesInResponse: false,
        insertDataOption: 'INSERT_ROWS',
        responseDateTimeRenderOption: 'FORMATTED_STRING',
        responseValueRenderOption: 'UNFORMATTED_VALUE',
        valueInputOption: 'RAW',
        resource: {
            'values': [
                [
                    profile.charName,
                    profile.displayName,
                    '一般會員',
                    profile.manager,
                    profile.lineID,
                    profile.pictureURL,
                    '',
                    (new Date).toLocaleString(),
                    (new Date).toLocaleString(),
                ]
            ]
        },
    }, (err: any, response: any) => {
        if (err) {
            console.error(err);
            return;
        }
    });
}
