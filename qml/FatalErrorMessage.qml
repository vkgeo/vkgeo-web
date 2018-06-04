import QtQuick 2.9

Rectangle {
    id:           fatalErrorMessage
    anchors.fill: parent
    color:        "transparent"

    property string errorText: ""

    Rectangle {
        anchors.fill:    parent
        anchors.margins: 8
        color:           "white"
        radius:          8
        border.width:    2
        border.color:    "steelblue"

        Text {
            anchors.verticalCenter: parent.verticalCenter
            anchors.left:           parent.left
            anchors.right:          parent.right
            anchors.leftMargin:     2
            anchors.rightMargin:    2
            text:                   fatalErrorMessage.errorText
            color:                  "black"
            font.pointSize:         12
            font.family:            "Helvetica"
            font.bold:              true
            horizontalAlignment:    Text.AlignHCenter
            wrapMode:               Text.Wrap
        }
    }
}
