import QtQuick 2.0

Rectangle {
    id:           controlPanel
    anchors.fill: parent
    color:        "white"
    border.width: 2
    border.color: "steelblue"

    Timer {
        interval:         60000
        repeat:           true
        triggeredOnStart: true
        running:          true

        property int notesReqCount: 0

        property var friendsList:   null
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
                        notesList = [];

                        for (var i = 0; i < friendsList.length; i = i + 25) {
                            var code = "var result = [];";

                            for (var j = 0; j < 25; j++) {
                                if (i + j < friendsList.length) {
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
                                                    notesList = notesList.concat(data.response[i][j]);
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

                                            friendsList = null;
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
                    notesList   = null;

                    if (data.hasOwnProperty("error")) {
                        console.log("friends.get : invalid response : " + data.error.error_msg);
                    } else {
                        console.log("friends.get : invalid response : " + data);
                    }
                }
            }

            if (friendsList === null && notesList === null) {
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
