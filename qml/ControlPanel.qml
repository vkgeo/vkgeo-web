import QtQuick 2.9

Rectangle {
    id:           controlPanel
    anchors.fill: parent
    color:        "white"
    border.width: 2
    border.color: "steelblue"

    ListView {
        id:              friendsListView
        anchors.fill:    parent
        anchors.margins: 4
        spacing:         1

        model: ListModel {
            id: friendsListModel
        }

        delegate: Rectangle {
            width:  friendsListView.width
            height: 100
            color:  "red"

            Text {
                anchors.centerIn: parent
                text:             lastName
            }
        }
    }

    Timer {
        interval:         60000
        repeat:           true
        triggeredOnStart: true
        running:          true

        property int notesReqCount: 0

        property var friendsList:   null
        property var friendsMap:    null
        property var notesList:     null

        onTriggered: {
            function loadFriends(data, offset) {
                if (data.hasOwnProperty("response")) {
                    friendsList = friendsList.concat(data.response.items);

                    if (offset + data.response.items.length < data.response.count) {
                        setTimeout(function() {
                            VK.api("friends.get", {
                                "fields": "photo_50,photo_100",
                                "offset": offset + data.response.items.length,
                                "v":      VK_API_V
                            }, function(data) {
                                loadFriends(data, offset + data.response.items.length);
                            });
                        }, 500);
                    } else {
                        friendsMap = {};
                        notesList  = [];

                        for (var i = 0; i < friendsList.length; i = i + 25) {
                            var code = "var result = [];";

                            for (var j = 0; j < 25; j++) {
                                if (i + j < friendsList.length) {
                                    friendsMap[friendsList[i + j].id.toString()] = friendsList[i + j];

                                    code = code + "result.push(API.notes.get({\"user_id\": " + friendsList[i + j].id + ", \"count\": 100}).items);";
                                }
                            }

                            code = code + "return result;"

                            function execute(code) {
                                setTimeout(function() {
                                    VK.api("execute", {
                                        "code": code,
                                        "v":    VK_API_V
                                    }, function(data) {
                                        if (data.hasOwnProperty("response")) {
                                            for (var i = 0; i < data.response.length; i++) {
                                                for (var j = 0; j < data.response[i].length; j++) {
                                                    if (data.response[i][j].title === DATA_NOTE_TITLE) {
                                                        notesList.push(data.response[i][j]);
                                                    }
                                                }
                                            }
                                        } else {
                                            if (data.hasOwnProperty("error")) {
                                                console.log("execute(notes.get) : invalid response : " + data.error.error_msg);
                                            } else {
                                                console.log("execute(notes.get) : invalid response : " + data);
                                            }
                                        }

                                        notesReqCount--;

                                        if (notesReqCount === 0) {
                                            console.log(notesList);

                                            friendsListModel.clear();

                                            for (var k = 0; k < notesList.length; k++) {
                                                var user_id = notesList[k].owner_id.toString();

                                                if (friendsMap.hasOwnProperty(user_id)) {
                                                    var frnd = {};

                                                    frnd.userId      = user_id;
                                                    frnd.firstName   = friendsMap[user_id].first_name;
                                                    frnd.lastName    = friendsMap[user_id].last_name;
                                                    frnd.photoUrl    = friendsMap[user_id].photo_50;
                                                    frnd.bigPhotoUrl = friendsMap[user_id].photo_100;

                                                    friendsListModel.append(frnd);
                                                }
                                            }

                                            friendsList = null;
                                            friendsMap  = null;
                                            notesList   = null;
                                        }
                                    });
                                }, 500 * i / 25);
                            };
                            execute(code);

                            notesReqCount++;
                        }
                    }
                } else {
                    friendsList = null;
                    friendsMap  = null;
                    notesList   = null;

                    if (data.hasOwnProperty("error")) {
                        console.log("friends.get : invalid response : " + data.error.error_msg);
                    } else {
                        console.log("friends.get : invalid response : " + data);
                    }
                }
            }

            if (friendsList === null) {
                friendsList = [];

                VK.api("friends.get", {
                    "fields": "photo_50,photo_100",
                    "v":      VK_API_V
                }, function(data) {
                    loadFriends(data, 0);
                });
            }
        }
    }
}
