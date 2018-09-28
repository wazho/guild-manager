// Node modules.
import * as fs from 'fs';
import { promisify } from 'util';
import { google } from 'googleapis';
// Local modules.
import { googleApis } from '../config';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const TOKEN_PATH = 'token.json';

// Load client secrets from a local file.
const content = fs.readFileSync('./credentials.json', { encoding: 'utf-8' });
const credentials = JSON.parse(content);

// Authorize a client with credentials, then call the Google Sheets API.
interface IProfile {
    charName: string;
    displayName: string;
    status: '公會長' | '副會長' | '會員' | '離會會員';
    manager: string;
    lineID: string;
    pictureURL: string;
    avatarURL?: string;
    job?: string;
    firstCreated?: string;
    lastUpdated?: string;
}

interface ISocialData {
    lineID: string;
    displayName: string;
    pictureURL?: string;
    encodedToken: string;
    firstCreated?: string;
    lastUpdated?: string;
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
        const token = fs.readFileSync(TOKEN_PATH, { encoding: 'utf-8' });
        oAuth2Client.setCredentials(JSON.parse(token));
        callback(oAuth2Client);
    } catch (err) {
        throw {
            errorCode: 'ERR_ACCESS_TOKEN_FAIL',
            error: err,
        };
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

    callback(authUrl);
}


function _initialize(credentials: any, callback: any) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    getNewToken(oAuth2Client, callback);
}

function _generateToken(code: string) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    oAuth2Client.getToken(code, (err: any, token: any) => {
        if (err) {
            return console.error('Error while trying to retrieve access token', err);
        }

        // Store the token to disk for later program executions.
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
    });
}

async function _getUsers() {
    const sheets = google.sheets({
        version: 'v4',
        auth: googleApis.apiKey,
    });

    const getValues = promisify(sheets.spreadsheets.values.get);

    try {
        const res = await getValues({
            spreadsheetId: googleApis.spreadsheetId,
            range: `${googleApis.memberSheetName}!A2:J`,
        });

        const rows: string[][] = res.data.values;
        const users: IProfile[] = rows.map((row) => ({
            charName: row[0],
            displayName: row[1],
            status: row[2] as any,
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

async function _addUser(profile: IProfile, social: ISocialData, callback: any, auth: any) {
    const sheets = google.sheets({
        version: 'v4',
        auth,
    });

    // Avoid duplicate user be added.
    const users = await _getUsers();
    const found = users.find((user) => user.lineID === profile.lineID);

    if (found) {
        return callback('ERR_USER_ALREADY_EXIST');
    }

    const appendValues = promisify(sheets.spreadsheets.values.append);

    try {
        const res = await appendValues({
            auth,
            spreadsheetId: googleApis.spreadsheetId,
            range: `${googleApis.memberSheetName}!A2`,
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
                        profile.status,
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

        const res2 = await appendValues({
            auth,
            spreadsheetId: googleApis.spreadsheetId,
            range: `${googleApis.lineProfileSheetName}!A2`,
            includeValuesInResponse: false,
            insertDataOption: 'INSERT_ROWS',
            responseDateTimeRenderOption: 'FORMATTED_STRING',
            responseValueRenderOption: 'UNFORMATTED_VALUE',
            valueInputOption: 'RAW',
            resource: {
                'values': [
                    [
                        social.lineID,
                        social.displayName,
                        social.pictureURL,
                        social.encodedToken,
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

async function _getLineProfiles() {
    const sheets = google.sheets({
        version: 'v4',
        auth: googleApis.apiKey,
    });

    const getValues = promisify(sheets.spreadsheets.values.get);

    try {
        const res = await getValues({
            spreadsheetId: googleApis.spreadsheetId,
            range: `${googleApis.lineProfileSheetName}!A2:F`,
        });

        const rows: string[][] = res.data.values;
        const socialDatas: ISocialData[] = rows.map((row) => ({
            lineID: row[0],
            displayName: row[1],
            pictureURL: row[2] as any,
            encodedToken: row[3],
            firstCreated: row[4],
            lastUpdated: row[5],
        }));

        return socialDatas;
    } catch (err) {
        return [];
    }
}

async function _updateLineProfile(rowNum: number, social: ISocialData, callback: any, auth: any) {
    const sheets = google.sheets({
        version: 'v4',
        auth,
    });

    const updateValues = promisify(sheets.spreadsheets.values.update);

    try {
        // Update sheet line_profiles.
        const res = await updateValues({
            auth,
            spreadsheetId: googleApis.spreadsheetId,
            range: `${googleApis.lineProfileSheetName}!A${rowNum}:F`,
            includeValuesInResponse: false,
            responseDateTimeRenderOption: 'FORMATTED_STRING',
            responseValueRenderOption: 'UNFORMATTED_VALUE',
            valueInputOption: 'RAW',
            resource: {
                'values': [
                    [
                        undefined,           // LINE ID, won't replace. 
                        social.displayName,
                        social.pictureURL,
                        undefined,           // Encoded token.
                        undefined,           // First create time.
                        (new Date).toLocaleString(), // Last update time.
                    ]
                ]
            },
        });

        // Update sheet members.
        const res2 = await updateValues({
            auth,
            spreadsheetId: googleApis.spreadsheetId,
            range: `${googleApis.memberSheetName}!B${rowNum}:J`,
            includeValuesInResponse: false,
            responseDateTimeRenderOption: 'FORMATTED_STRING',
            responseValueRenderOption: 'UNFORMATTED_VALUE',
            valueInputOption: 'RAW',
            resource: {
                'values': [
                    [
                        social.displayName,
                        undefined,           // Status.
                        undefined,           // Manager.
                        undefined,           // LINE ID.
                        social.pictureURL,
                        undefined,           // Avatar URL.
                        undefined,           // Job of character.
                        undefined,           // First create time.
                        (new Date).toLocaleString(), // Last update time.
                    ]
                ]
            },
        });

        return callback(null);
    } catch (err) {
        return callback('ERR_UPDATE_VALUES');
    }
}

export const initialize = (errorHandler: any) =>
    authorize(credentials, () => null)
        .catch((e) => _initialize(credentials, errorHandler));

export const generateToken = async (code: string) =>
    authorize(credentials, () => null)
        .catch((e) => _generateToken(code));

export const addUser = (profile: IProfile, social: ISocialData, errorHandler: any) =>
    authorize(credentials, _addUser.bind(null, profile, social, errorHandler))
        .catch(errorHandler);

export const updateLineProfile = (rowNum: number, social: ISocialData, errorHandler: any) =>
    authorize(credentials, _updateLineProfile.bind(null, rowNum, social, errorHandler))
        .catch(errorHandler);

export const getUsers = _getUsers;

export const getLineProfiles = _getLineProfiles;

export const findUser = async (lineID: string) => {
    const users = await _getUsers();
    const found = users.find((user) => user.lineID === lineID);
    return found;
};
