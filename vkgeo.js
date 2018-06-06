const UPDATE_INTERVAL     = 60000;
const LOCATION_TIMEOUT    = 12 * 60 * 60;
const VK_ACCESS_SETTINGS  = 2048 | 2;
const VK_REQUEST_INTERVAL = 500;
const VK_MAX_BATCH_SIZE   = 25;
const VK_API_V            = "5.78";
const DATA_NOTE_TITLE     = "VKGeo Data";

function escapeHtml(string) {
    let text = document.createTextNode(string);
    let div  = document.createElement("div");

    div.appendChild(text);

    return div.innerHTML;
}

function requestSettings() {
    VK.callMethod("showSettingsBox", VK_ACCESS_SETTINGS);
}

function createMarkerImage(marker, update_time, src, size) {
    return new ol.style.Icon({
        "img": (function() {
            function drawIcon() {
                if ((image === null || (image.complete && image.naturalWidth !== 0)) &&
                    (label === null || (label.complete && label.naturalWidth !== 0))) {
                    const angle   = Math.PI / 4;
                    let   radius  = Math.min(size[0], size[1]) / 2;
                    let   context = canvas.getContext("2d");

                    context.save();

                    context.beginPath();
                    context.arc(size[0] / 2, size[1] / 2, radius, 0, 2 * Math.PI, false);
                    context.clip();

                    if (image !== null) {
                        context.drawImage(image, 0, 0, size[0], size[1]);
                    }

                    context.restore();

                    if (label !== null) {
                        context.drawImage(label, size[0] / 2 + radius * Math.sin(angle) - label.width  / 2,
                                                 size[1] / 2 + radius * Math.cos(angle) - label.height / 2);
                    }

                    marker.changed();
                }
            }

            let canvas = document.createElement("canvas");
            let image  = null;
            let label  = null;

            canvas.width  = size[0];
            canvas.height = size[1];

            image = document.createElement("img");

            image.crossOrigin = "anonymous";
            image.onload      = drawIcon;

            if (src.match(/camera_50\.png/)) {
                image.src = "images/camera_50.png";
            } else {
                image.src = src;
            }

            if ((new Date()).getTime() / 1000 > update_time + LOCATION_TIMEOUT) {
                label = document.createElement("img");

                label.crossOrigin = "anonymous";
                label.onload      = drawIcon;
                label.src         = "images/obsolete_location_label.png";
            }

            return canvas;
        })(),
        "imgSize": size
    });
}

function fitMapToAllMarkers() {
    let markers = marker_source.getFeatures();

    if (markers !== null && markers.length > 0) {
        let extent = markers[0].getGeometry().getExtent();

        for (let i = 1; i < markers.length; i++) {
            ol.extent.extend(extent, markers[i].getGeometry().getExtent());
        }

        map.getView().fit(extent, {
            "padding": [32, 32, 32, 32]
        });
    }
}

function runPeriodicUpdate() {
    let notes_req_count = 0;
    let friends_list    = [];
    let friends_map     = {};
    let notes_list      = [];

    function updateFriends(data, offset) {
        if (data.hasOwnProperty("response")) {
            if (data.response !== null && data.response.items !== null) {
                friends_list = friends_list.concat(data.response.items);

                if (offset + data.response.items.length < data.response.count) {
                    setTimeout(function() {
                        VK.api("friends.get", {
                            "fields": "photo_50",
                            "offset": offset + data.response.items.length,
                            "v":      VK_API_V
                        }, function(data) {
                            updateFriends(data, offset + data.response.items.length);
                        });
                    }, VK_REQUEST_INTERVAL);
                } else {
                    for (let i = 0; i < friends_list.length; i = i + VK_MAX_BATCH_SIZE) {
                        let code = "var result = [];";

                        for (let j = 0; j < VK_MAX_BATCH_SIZE; j++) {
                            if (i + j < friends_list.length) {
                                friends_map[friends_list[i + j].id.toString()] = friends_list[i + j];

                                code = code + "result.push(API.notes.get({\"user_id\": " + friends_list[i + j].id + ", \"count\": 100}).items);";
                            }
                        }

                        code = code + "return result;"

                        setTimeout(function() {
                            VK.api("execute", {
                                "code": code,
                                "v":    VK_API_V
                            }, function(data) {
                                if (data.hasOwnProperty("response")) {
                                    if (data.response !== null) {
                                        for (let i = 0; i < data.response.length; i++) {
                                            if (data.response[i] !== null) {
                                                for (let j = 0; j < data.response[i].length; j++) {
                                                    if (data.response[i][j].title === DATA_NOTE_TITLE) {
                                                        notes_list.push(data.response[i][j]);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    if (data.hasOwnProperty("error")) {
                                        console.log("updateFriends() : execute(notes.get) request failed : " + data.error.error_msg);
                                    } else {
                                        console.log("updateFriends() : execute(notes.get) request failed : " + data);
                                    }
                                }

                                notes_req_count--;

                                if (notes_req_count === 0) {
                                    let updated_friends = {};

                                    for (let i = 0; i < notes_list.length; i++) {
                                        let user_id = notes_list[i].owner_id.toString();

                                        if (friends_map.hasOwnProperty(user_id)) {
                                            let base64_regexp = /\{\{\{([^\}]+)\}\}\}/;
                                            let regexp_result = base64_regexp.exec(notes_list[i].text);

                                            if (regexp_result !== null && regexp_result.length === 2) {
                                                let user_data = null;

                                                try {
                                                    user_data = JSON.parse(atob(regexp_result[1]));
                                                } catch (err) {
                                                    console.log("updateFriends() : invalid user data");
                                                }

                                                if (user_data !== null) {
                                                    let frnd_marker = marker_source.getFeatureById(user_id);

                                                    if (frnd_marker === null) {
                                                        frnd_marker = new ol.Feature({
                                                            "geometry": new ol.geom.Point(ol.proj.fromLonLat([user_data.longitude, user_data.latitude]))
                                                        });

                                                        frnd_marker.setId(user_id);

                                                        frnd_marker.setStyle(new ol.style.Style({
                                                            "image": createMarkerImage(frnd_marker, user_data.update_time, friends_map[user_id].photo_50, [48, 48])
                                                        }));

                                                        marker_source.addFeature(frnd_marker);
                                                    } else {
                                                        frnd_marker.setGeometry(new ol.geom.Point(ol.proj.fromLonLat([user_data.longitude, user_data.latitude])));

                                                        frnd_marker.setStyle(new ol.style.Style({
                                                            "image": createMarkerImage(frnd_marker, user_data.update_time, friends_map[user_id].photo_50, [48, 48])
                                                        }));
                                                    }

                                                    updated_friends[user_id] = true;
                                                }
                                            } else {
                                                console.log("updateFriends() : invalid user data");
                                            }
                                        }
                                    }

                                    let markers = marker_source.getFeatures();

                                    if (markers !== null) {
                                        let markers_to_remove = [];

                                        for (let i = 0; i < markers.length; i++) {
                                            if (markers[i].getId() !== "" && !updated_friends.hasOwnProperty(markers[i].getId())) {
                                                markers_to_remove.push(markers[i]);
                                            }
                                        }

                                        for (let i = 0; i < markers_to_remove.length; i++) {
                                            marker_source.removeFeature(markers_to_remove[i]);
                                        }
                                    }

                                    if (!map_was_touched) {
                                        fitMapToAllMarkers();
                                    }
                                }
                            });
                        }, VK_REQUEST_INTERVAL * i / VK_MAX_BATCH_SIZE);

                        notes_req_count++;
                    }
                }
            } else {
                let markers = marker_source.getFeatures();

                if (markers !== null) {
                    let markers_to_remove = [];

                    for (let i = 0; i < markers.length; i++) {
                        if (markers[i].getId() !== "") {
                            markers_to_remove.push(markers[i]);
                        }
                    }

                    for (let i = 0; i < markers_to_remove.length; i++) {
                        marker_source.removeFeature(markers_to_remove[i]);
                    }
                }

                if (!map_was_touched) {
                    fitMapToAllMarkers();
                }
            }
        } else {
            if (data.hasOwnProperty("error")) {
                console.log("updateFriends() : friends.get request failed : " + data.error.error_msg);
            } else {
                console.log("updateFriends() : friends.get request failed : " + data);
            }
        }
    }

    VK.api("friends.get", {
        "fields": "photo_50",
        "v":      VK_API_V
    }, function(data) {
        updateFriends(data, 0);
    });

    setTimeout(runPeriodicUpdate, UPDATE_INTERVAL);
}

let map_was_touched = false;
let my_marker       = null;

let marker_source = new ol.source.Vector({
    "features": []
});

let map = new ol.Map({
    "target": "map",
    "layers": [
        new ol.layer.Tile({
            "source": new ol.source.OSM()
        }),
        new ol.layer.Vector({
            "source": marker_source
        })
    ],
    "view": new ol.View({
        "center": ol.proj.fromLonLat([0.0, 0.0]),
        "zoom":   0
    })
});
map.on("singleclick", function(event) {
    map.forEachFeatureAtPixel(event.pixel, function(feature, layer) {
        if (feature.getId() !== null && feature.getId() !== "") {
            window.open("https://vk.com/id" + feature.getId());
        }
    });
});
map.on("dblclick", function(event) {
    map_was_touched = true;
});
map.on("pointerdrag", function(event) {
    map_was_touched = true;
});

VK.init(function() {
    function init(settings) {
        runPeriodicUpdate();

        if ("geolocation" in navigator) {
            navigator.geolocation.watchPosition(function(position) {
                if (my_marker === null) {
                    VK.api("users.get", {
                        "fields": "photo_50",
                        "v":      VK_API_V
                    }, function(data) {
                        if (data.hasOwnProperty("response")) {
                            if (data.response !== null && data.response.length === 1) {
                                my_marker = new ol.Feature({
                                    "geometry": new ol.geom.Point(ol.proj.fromLonLat([position.coords.longitude, position.coords.latitude]))
                                });

                                my_marker.setId("");

                                my_marker.setStyle(new ol.style.Style({
                                    "image": createMarkerImage(my_marker, (new Date()).getTime() / 1000, data.response[0].photo_50, [48, 48])
                                }));

                                marker_source.addFeature(my_marker);

                                if (!map_was_touched) {
                                    fitMapToAllMarkers();
                                }
                            }
                        } else {
                            if (data.hasOwnProperty("error")) {
                                console.log("init() : users.get request failed : " + data.error.error_msg);
                            } else {
                                console.log("init() : users.get request failed : " + data);
                            }
                        }
                    });
                } else {
                    my_marker.setGeometry(new ol.geom.Point(ol.proj.fromLonLat([position.coords.longitude, position.coords.latitude])));
                }
            });
        }

        return true;
    }

    function showSettingsPanel() {
        document.getElementById("settingsPanelText").innerHTML   = escapeHtml(_("You should allow access to friends and notes to view location of your friends on the map."));
        document.getElementById("settingsPanelButton").innerHTML = escapeHtml(_("Settings"));

        document.getElementById("settingsPanel").style.display = "block";
    }

    function hideSettingsPanel() {
        document.getElementById("settingsPanel").style.display = "none";
    }

    let initialized = false;
    let settings    = (new URL(document.location)).searchParams.get("api_settings");

    VK.addCallback("onSettingsChanged", function(settings) {
        if ((settings & VK_ACCESS_SETTINGS) === VK_ACCESS_SETTINGS) {
            hideSettingsPanel();

            if (!initialized) {
                initialized = init();
            }
        } else {
            showSettingsPanel();
        }
    });
    VK.addCallback("onSettingsCancel", function() {
        showSettingsPanel();
    });

    if ((settings & VK_ACCESS_SETTINGS) === VK_ACCESS_SETTINGS) {
        initialized = init();
    } else {
        requestSettings();
    }
}, function() {
    displayFatalError(_("VK initialization failed."));
}, VK_API_V);
