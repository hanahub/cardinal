const leftItems = [
    {eventKey: 0, url: "#", iconName: "id-card-o", itemName: "Player"},
    {eventKey: 1, url: "#", iconName: "users", itemName: "Team"},
    {eventKey: 2, url: "#", iconName: "line-chart", itemName: "Visualization"},
    {
        eventKey: 3,
        type: 'dropdown',
        iconName: "bar-chart",
        itemName: "Report",
        menuItems: [
            {eventKey: 3.0, linkName: 'Training', url: '#'},
            {eventKey: 3.1, linkName: 'Prediction', url: '#'},
            {eventKey: 3.2, linkName: 'Performance', url: '#'},
            {eventKey: 3.3, linkName: 'N-games', url: '#'},
            {eventKey: 3.4, linkName: 'Top-player', url: '#'},
            {eventKey: 3.5, linkName: 'Top-player position', url: '#'}]
    },
];

const leftItemForLeague = [
    {eventKey: 0, url: "#", iconName: "users", itemName: "Team"},
];

const rightItems = [
    {eventKey: 0, url: "/profile", iconName: "user-circle", itemName: "Profile"},
    {eventKey: 1, iconName: "sign-out", itemName: "Logout", type: 'functional'}];

function updateLeftItemUrl(leftItems, teamId) {
    leftItems[0].url = '/team/' + teamId + '/player';
    leftItems[1].url = '/team/' + teamId;
    leftItems[2].url = '/team/' + teamId + '/visualization';
    leftItems[3].menuItems[0].url = '/team/' + teamId + '/training_report';
    leftItems[3].menuItems[1].url = '/team/' + teamId + '/prediction_report';
    leftItems[3].menuItems[2].url = '/team/' + teamId + '/cardinal_report';
    leftItems[3].menuItems[3].url = '/team/' + teamId + '/ngames_report';
    leftItems[3].menuItems[4].url = '/team/' + teamId + '/top_player_report';
    leftItems[3].menuItems[5].url = '/team/' + teamId + '/top_player_position';

    return leftItems;

}

function updateLeftItemForLeagueUrl(leftItems, teamId) {

    leftItems[0].url = '/team/' + teamId;
    return leftItems;

}

function checkAlphanumeric(e) {
    let i = 0, len = e.length, code = '';

    if (len <= 0) return false;

    for (i = 0; i < len; i++) {
        code = e.charCodeAt(i);
        if (!(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123)) { // lower alpha (a-z)
            return false;
        }
    }
    return true;

}

export const Util = {
    leftItems: leftItems,
    leftItemForLeague: leftItemForLeague,
    rightItems: rightItems,
    updateLeftItemUrl: updateLeftItemUrl,
    updateLeftItemForLeagueUrl: updateLeftItemForLeagueUrl,
    checkAlphanumeric: checkAlphanumeric
}