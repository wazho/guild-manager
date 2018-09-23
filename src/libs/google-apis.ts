import * as fs from 'fs';
import * as readline from 'readline';
import { promisify } from 'util';
import { google } from 'googleapis';
import { googleApis } from '../config';

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
    avatarURL?: string;
    job?: string;
}

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
async function authorize(credentials: any, callback: any) {
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
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
async function readUsers() {
    const sheets = google.sheets({
        version: 'v4',
        auth: googleApis.apiKey,
    });

    const getValues = promisify(sheets.spreadsheets.values.get);

    try {
        const res = await getValues({
            spreadsheetId: googleApis.spreadsheetId,
            range: `${googleApis.sheetName}!A2:J`,
        });

        const rows: string[][] = res.data.values;
        const users: IProfile[] = rows.map((row) => ({
            charName: row[0],
            displayName: row[1],
            status: row[2],
            manager: row[3],
            lineID: row[4],
            pictureURL: row[5],
            avatarURL: row[6],
            job: row[7],
            firstCreated: row[8],
            lastUpdated: row[9],
        }));
    
        return users;
    } catch (err) {
        return [];
    }
}

async function insertUser(profile: IProfile, callback: any, auth: any) {
    const sheets = google.sheets({
        version: 'v4',
        auth,
    });

    // Avoid duplicate user be added.
    const users = await readUsers();
    const found = users.find((user) => user.lineID === profile.lineID);

    if (found) {
        return callback('ERR_USER_ALREADY_EXIST');
    }

    const appendValues = promisify(sheets.spreadsheets.values.append);

    try {
        const res = await appendValues({
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
                        '會員',
                        profile.manager,
                        profile.lineID,
                        profile.pictureURL,
                        profile.avatarURL,
                        profile.job,
                        (new Date).toLocaleString(),
                        (new Date).toLocaleString(),
                    ]
                ]
            },
        });

        return callback(null);
    } catch (err) {
        return callback('ERR_APPEND_VALUES');
    }
}

export const addUser = (profile: IProfile, callback: any) =>
    authorize(credentials, insertUser.bind(null, profile, callback));

export const getUsers = readUsers;
