'use strict';

const bossList = [
    '困難威爾',
    '困難露希妲',
    '困難史烏',
    '困難戴米安',
    '普通威爾',
    '普通露希妲',
];

class TeamsManagement extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentGroup: bossList[0],
            members: props.members,
        };
    }

    handleSortable() {
        const { currentGroup, members } = this.state;

        const updatedMembers = [];

        const teamElements = document.querySelectorAll('[data-teamname]');
        const teamHasMemberElements = [...teamElements].filter((e) => [...e.querySelectorAll('[data-charname]')].length);
        const teamList = [...new Set(teamHasMemberElements.map(({ dataset }) => dataset.teamname))];

        const updatedTeamNameMapping = {};
        teamList.forEach((teamName, i) => { updatedTeamNameMapping[teamName] = String(i + 1) });

        teamElements.forEach((teamElement) =>
            teamElement.querySelectorAll('[data-charname]').forEach((char, i) =>
                updatedMembers.push({
                    charName: char.dataset.charname,
                    groupName: teamElement.dataset.groupname,
                    teamName: updatedTeamNameMapping[teamElement.dataset.teamname],
                    memberOrdering: String(i + 1),
                })
            )
        );

        members.forEach((member) => {
            member.groups.forEach((team, i) => {
                const { charName } = member;
                const [groupName, teamName, ordering] = team;

                if (currentGroup === groupName) {
                    // Remove the old no matter that he/she was team member first.
                    member.groups.splice(i, 1);
                    // Add the player to new team.
                    const found = updatedMembers.find((m) => m.charName === charName && m.groupName === currentGroup);
                    found && (member.groups.push([found.groupName, found.teamName, found.memberOrdering]));
                }
            });
        });

        // This is hacking, must clean all first.
        this.setState({ members: [] }, () => this.setState({ members }));
    }

    componentDidMount() {
        this.handleSortable = this.handleSortable.bind(this);

        const sortable = document.getElementById('teams-panel');
        sortable.addEventListener('stop', this.handleSortable);
    }

    componentDidUpdate() {
        // Clean the reamings of new team block.
        const newTeamMemberElements = document.querySelectorAll('[data-teamname=new] [data-charname]');
        newTeamMemberElements.forEach((e) => e.remove());
    }

    render() {
        const { currentGroup, members } = this.state;

        const groups = {};
        members.forEach((member) =>
            member.groups.forEach((group) => {
                const [groupName, teamName, ordering] = group;
                !groups[groupName] && (groups[groupName] = {});
                // !groups[groupName][teamName] && (groups[groupName][teamName] = []);
                // groups[groupName][teamName].push(member);
                !groups[groupName][teamName] && (groups[groupName][teamName] = {});
                groups[groupName][teamName][ordering] = member;
            })
        );

        const teams = groups[currentGroup] || [];

        return (
            <div className='uk-section uk-position-center-left uk-position-center-right'>
                <div className='content uk-container uk-container-xsmall'>
                    <h2 className='uk-heading-line uk-text-center'
                        children={`王團隊員管理`}
                    />

                    <div className='uk-margin'>
                        <select className='uk-select' onChange={(e) => this.setState({ currentGroup: e.target.value })}>
                            {bossList.map((groupName, i) =>
                                <option key={i} children={groupName} />
                            )}
                        </select>
                    </div>

                    <ul id='teams-panel' className='uk-child-width-1-2@s' uk-grid='true'>
                        {Object.keys(teams).map((teamName, i) =>
                            <li key={i} data-groupname={currentGroup} data-teamname={teamName}>
                                <h4 children={`${currentGroup} - ${teamName} 團`} />
                                <div uk-sortable='group: player; handle: .uk-sortable-handle-player'>
                                    {Object.values(teams[teamName]).map((member, i) =>
                                        <PlayerCard key={i} member={member} />
                                    )}
                                </div>
                                <div className='uk-margin'>
                                    <div className='player-card uk-card-default uk-card-body uk-card-small uk-grid-small uk-flex-center' uk-grid='true'>
                                        <a href='#' uk-icon='icon: plus; ratio: 1.5' />
                                    </div>
                                </div>
                            </li>
                        )}
                        <li data-groupname={currentGroup} data-teamname={`new`}>
                            <h4 children={`新隊伍`} />
                            <div uk-sortable='group: player; handle: .uk-sortable-handle-player'>
                                <div className='uk-margin'>
                                    <div className='player-card uk-card-default uk-card-body uk-card-small uk-grid-small uk-flex-center' uk-grid='true'>
                                        <a href='#' uk-icon='icon: plus; ratio: 1.5' />
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        );
    }
}

class PlayerCard extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { member } = this.props;

        return (
            <div className='uk-margin' data-charname={member.charName}>
                <div className='player-card uk-card-default uk-card-body uk-card-small uk-grid-small uk-flex-middle' uk-grid='true'>
                    <button className='uk-alert-close' type='button' uk-close='true' />
                    <div className='uk-sortable-handle-player avatar uk-width-auto'>
                        <img className='uk-border-rounded'
                            onDragStart={() => false}
                            src={member.avatarURL}
                            onError={(e) => e.target.src='/assets/images/default-avatar.png'}
                        />
                    </div>
                    <div className='uk-width-expand'>
                        <div className='character-name'
                            children={member.charName}
                        />
                        <div className='character-joblevel'>
                            {member.job
                                ? <React.Fragment>
                                    <span className='character-job'
                                        children={member.job}
                                    />
                                    <span className='character-level'
                                        children={`Lv.${member.level}`}
                                    />
                                </React.Fragment>
                                : <span className='character-job'
                                    children={`未知`}
                                />
                            }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
