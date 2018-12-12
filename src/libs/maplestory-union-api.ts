// Node modules.
import fetch from 'node-fetch';

const apiURL = 'https://tw.event.beanfun.com/mapleStory/E20170713/Default.aspx/GetSearchRank';

const getJobName = (jobName: string, jobID: number) => {
    switch (jobID) {
        case 532:
            return '重砲指揮官';
        case 15512:
            return '亞克';
        default:
            return jobName;
    }
}

// serverID = 6 : 殺人鯨伺服器
export async function getCharData(charName: string, serverID = '6') {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
            Type: '1',
            Name: charName,
            serverID: serverID,
        }),
    };
    const res = await fetch(apiURL, options);
    const data = await res.text();

    try {
        const { d: raw } = JSON.parse(data);
        const { data: charDataRaw } = JSON.parse(raw);
        const charData = JSON.parse(charDataRaw)[0];

        return {
            name: charData.CharacterName,
            job: getJobName(charData.JobName, charData.Job),
            avatarURL: charData.Avatar_CharacterLookURL,
            level: charData.Level,
            unionLevel: charData.UnionLevel,
            importTime: charData.ImportTime,
        }
    } catch (e) {
        return undefined;
    }
}
