let VKGeo = (function() {
    "use strict";

    const UPDATE_INTERVAL          = 60000;
    const DATA_TIMEOUT             = 24 * 60 * 60;
    const MIN_DEVICE_PIXEL_RATIO   = 2.0;
    const MARKER_IMAGE_SIZE        = {"width": 48, "height": 48};
    const MARKER_LABEL_SIZE        = {"width": 12, "height": 12};
    const CONTROL_PANEL_IMAGE_SIZE = {"width": 64, "height": 64};
    const CONTROL_PANEL_LABEL_SIZE = {"width": 12, "height": 18};
    const MAP_PADDING              = 48;
    const MAP_CENTER_ROTATION      = 0.0;
    const MAP_CENTER_ZOOM          = 16.0;
    const VK_ACCESS_SETTINGS       = 2048 | 2;
    const VK_REQUEST_INTERVAL      = 500;
    const VK_MAX_BATCH_SIZE        = 25;
    const VK_MAX_NOTES_GET_COUNT   = 100;
    const VK_API_V                 = "5.102";
    const DATA_NOTE_TITLE          = "VKGeo Data";
    const DEFAULT_PHOTO_100_URL    = "images/camera_100.png";

    function requestSettings() {
        VK.callMethod("showSettingsBox", VK_ACCESS_SETTINGS);
    }

    function enqueueVKApiRequest(method_name, params, callback) {
        vk_request_queue.push({
            "methodName": method_name,
            "params":     params,
            "callback":   callback
        });
    }

    function runVKRequestQueue() {
        let request = vk_request_queue.shift();

        if (request) {
            VK.api(request.methodName, request.params, request.callback);
        }

        setTimeout(runVKRequestQueue, VK_REQUEST_INTERVAL);
    }

    function createControlPanelImage(img_class, user_id, battery_status, battery_level, src, size, label_size) {
        function drawIcon() {
            if ((image === null || (image.complete && image.naturalWidth > 0)) &&
                (label === null || (label.complete && label.naturalWidth > 0))) {
                const angle   = Math.PI / 4;
                let   radius  = Math.min(size.width, size.height) / 2;
                let   context = canvas.getContext("2d");

                context.save();

                context.scale(device_pixel_ratio, device_pixel_ratio);

                context.save();

                context.beginPath();
                context.arc(size.width / 2, size.height / 2, radius, 0, 2 * Math.PI, false);
                context.clip();

                if (image) {
                    context.drawImage(image, 0, 0, size.width, size.height);
                }

                context.restore();

                if (label) {
                    context.drawImage(label, size.width  / 2 + radius * Math.sin(angle) - label_size.width  / 2,
                                             size.height / 2 + radius * Math.cos(angle) - label_size.height / 2, label_size.width,
                                                                                                                 label_size.height);
                }

                context.restore();
            }
        }

        let canvas = document.createElement("canvas");
        let image  = null;
        let label  = null;

        canvas.width           = size.width  * device_pixel_ratio;
        canvas.height          = size.height * device_pixel_ratio;
        canvas.className       = "controlPanelImage";
        canvas.style.width     = size.width  + "px";
        canvas.style.height    = size.height + "px";
        canvas.style.minWidth  = size.width  + "px";
        canvas.style.minHeight = size.height + "px";

        if (img_class === "SHOW_MARKER") {
            canvas.onclick = function() {
                let marker = marker_source.getFeatureById(user_id);

                if (marker) {
                    map_was_touched = true;
                    tracked_marker  = marker;

                    centerOnTrackedMarker();
                }
            };
        } else if (img_class === "SHOW_ALL") {
            canvas.onclick = function() {
                map_was_touched = true;
                tracked_marker  = null;

                fitMapToAllMarkers();
            };
        }

        image = document.createElement("img");

        image.crossOrigin = "anonymous";
        image.onload      = drawIcon;

        if (src.match(/camera_100\.png/)) {
            image.src = DEFAULT_PHOTO_100_URL;
        } else {
            image.src = src;
        }

        if (battery_status === "CHARGING" || battery_status === "DISCHARGING") {
            label = document.createElement("img");

            label.crossOrigin = "anonymous";
            label.onload      = drawIcon;

            if (battery_level < 25) {
                if (battery_status === "CHARGING") {
                    label.src = "images/avatar_battery_25_charging_label.png";
                } else {
                    label.src = "images/avatar_battery_25_label.png";
                }
            } else if (battery_level < 50) {
                if (battery_status === "CHARGING") {
                    label.src = "images/avatar_battery_50_charging_label.png";
                } else {
                    label.src = "images/avatar_battery_50_label.png";
                }
            } else if (battery_level < 75) {
                if (battery_status === "CHARGING") {
                    label.src = "images/avatar_battery_75_charging_label.png";
                } else {
                    label.src = "images/avatar_battery_75_label.png";
                }
            } else {
                if (battery_status === "CHARGING") {
                    label.src = "images/avatar_battery_100_charging_label.png";
                } else {
                    label.src = "images/avatar_battery_100_label.png";
                }
            }
        }

        return canvas;
    }

    function createMarkerImage(marker, update_time, src, size, label_size) {
        return new ol.style.Icon({
            "img": (function() {
                function drawIcon() {
                    if ((image === null || (image.complete && image.naturalWidth > 0)) &&
                        (label === null || (label.complete && label.naturalWidth > 0))) {
                        const angle   = Math.PI / 4;
                        let   radius  = Math.min(size.width, size.height) / 2;
                        let   context = canvas.getContext("2d");

                        context.save();

                        context.scale(device_pixel_ratio, device_pixel_ratio);

                        context.save();

                        context.beginPath();
                        context.arc(size.width / 2, size.height / 2, radius, 0, 2 * Math.PI, false);
                        context.clip();

                        if (image) {
                            context.drawImage(image, 0, 0, size.width, size.height);
                        }

                        context.restore();

                        if (label) {
                            context.drawImage(label, size.width  / 2 + radius * Math.sin(angle) - label_size.width  / 2,
                                                     size.height / 2 + radius * Math.cos(angle) - label_size.height / 2, label_size.width,
                                                                                                                         label_size.height);
                        }

                        context.restore();

                        marker.changed();
                    }
                }

                let canvas = document.createElement("canvas");
                let image  = null;
                let label  = null;

                canvas.width  = size.width  * device_pixel_ratio;
                canvas.height = size.height * device_pixel_ratio;

                image = document.createElement("img");

                image.crossOrigin = "anonymous";
                image.onload      = drawIcon;

                if (src.match(/camera_100\.png/)) {
                    image.src = DEFAULT_PHOTO_100_URL;
                } else {
                    image.src = src;
                }

                if ((new Date()).getTime() / 1000 - update_time > DATA_TIMEOUT) {
                    label = document.createElement("img");

                    label.crossOrigin = "anonymous";
                    label.onload      = drawIcon;
                    label.src         = "images/avatar_obsolete_data_label.png";
                }

                return canvas;
            })(),
            "imgSize": [size.width * device_pixel_ratio, size.height * device_pixel_ratio],
            "scale":   1.0 / device_pixel_ratio
        });
    }

    function centerOnTrackedMarker() {
        if (tracked_marker) {
            map.getView().setCenter(tracked_marker.getGeometry().getCoordinates());
            map.getView().setRotation(MAP_CENTER_ROTATION);
            map.getView().setZoom(MAP_CENTER_ZOOM);
        }
    }

    function fitMapToAllMarkers() {
        function getElementSize(elem) {
            let result = {"width": 0, "height": 0};

            if (elem.offsetWidth) {
                result.width = elem.offsetWidth;
            }
            if (elem.offsetHeight) {
                result.height = elem.offsetHeight;
            }

            return result;
        }

        let markers = marker_source.getFeatures();

        if (markers && markers.length > 0) {
            let extent = markers[0].getGeometry().getExtent();

            for (let i = 1; i < markers.length; i++) {
                ol.extent.extend(extent, markers[i].getGeometry().getExtent());
            }

            map.getView().fit(extent, {
                "padding": [MAP_PADDING,
                            MAP_PADDING + getElementSize(document.getElementById("controlPanel")).width,
                            MAP_PADDING + getElementSize(document.getElementById("adPanel")).height,
                            MAP_PADDING],
                "maxZoom": MAP_CENTER_ZOOM
            });
        }
    }

    function runPeriodicUpdate() {
        let friends_list = [];

        function showInvitationPanel() {
            document.getElementById("invitationPanelText").innerHTML = _("This app is a web companion for VKGeo Friends on Map mobile application. <a href=\"https://vkgeo.sourceforge.io\" target=\"_blank\" rel=\"noopener\">Install VKGeo on your mobile device</a> and invite friends to it so you can see each other on the map.");

            document.getElementById("invitationPanel").style.display = "flex";
        }

        function hideInvitationPanel() {
            document.getElementById("invitationPanel").style.display = "none";
        }

        function updateControlPanel(friends_map) {
            let friends_on_map = 0;

            let control_panel = document.getElementById("controlPanel");

            while (control_panel.lastChild) {
                control_panel.removeChild(control_panel.lastChild);
            }

            control_panel.appendChild(createControlPanelImage("SHOW_ALL", "", "", 0, "images/button_show_all.png", CONTROL_PANEL_IMAGE_SIZE, CONTROL_PANEL_LABEL_SIZE));

            let markers = marker_source.getFeatures();

            if (markers) {
                for (let i = 0; i < markers.length; i++) {
                    let user_id = markers[i].getId();

                    if (user_id === "") {
                        let my_image = createControlPanelImage("SHOW_MARKER", "", "", 0, my_photo_100, CONTROL_PANEL_IMAGE_SIZE, CONTROL_PANEL_LABEL_SIZE);

                        if (control_panel.firstChild && control_panel.firstChild.nextSibling) {
                            control_panel.insertBefore(my_image, control_panel.firstChild.nextSibling);
                        } else {
                            control_panel.appendChild(my_image);
                        }
                    } else if (friends_map[user_id]) {
                        control_panel.appendChild(createControlPanelImage("SHOW_MARKER", user_id, friends_map[user_id].battery_status,
                                                                                                  friends_map[user_id].battery_level,
                                                                                                  friends_map[user_id].photo_100, CONTROL_PANEL_IMAGE_SIZE,
                                                                                                                                  CONTROL_PANEL_LABEL_SIZE));

                        friends_on_map++;
                    }
                }
            }

            return (friends_on_map > 0);
        }

        function cleanupMarkers(updated_friends) {
            let markers = marker_source.getFeatures();

            if (markers) {
                let markers_to_remove = [];

                for (let i = 0; i < markers.length; i++) {
                    if (markers[i].getId() !== "" && !updated_friends[markers[i].getId()]) {
                        markers_to_remove.push(markers[i]);
                    }
                }

                for (let i = 0; i < markers_to_remove.length; i++) {
                    if (tracked_marker === markers_to_remove[i]) {
                        tracked_marker = null;
                    }

                    marker_source.removeFeature(markers_to_remove[i]);
                }
            }

            if (tracked_marker !== null) {
                centerOnTrackedMarker();
            } else if (!map_was_touched) {
                fitMapToAllMarkers();
            }
        }

        function updateFriends(data, offset) {
            if (data.response) {
                if (data.response.items) {
                    friends_list = friends_list.concat(data.response.items);

                    if (data.response.items.length > 0 && offset + data.response.items.length < data.response.count) {
                        let next_offset = offset + data.response.items.length;

                        enqueueVKApiRequest("friends.get", {
                            "fields": "photo_100",
                            "offset": next_offset,
                            "v":      VK_API_V
                        }, function(data) {
                            updateFriends(data, next_offset);
                        });
                    } else {
                        let friends_map         = {};
                        let accessible_frnd_ids = [];

                        for (let i = 0; i < friends_list.length; i++) {
                            if (friends_list[i] && typeof friends_list[i].id === "number" && isFinite(friends_list[i].id)) {
                                if (!friends_list[i].deactivated) {
                                    let user_id = friends_list[i].id.toString();

                                    friends_map[user_id] = {};

                                    if (typeof friends_list[i].first_name === "string") {
                                        friends_map[user_id].first_name = friends_list[i].first_name;
                                    } else {
                                        friends_map[user_id].first_name = "";
                                    }
                                    if (typeof friends_list[i].last_name === "string") {
                                        friends_map[user_id].last_name = friends_list[i].last_name;
                                    } else {
                                        friends_map[user_id].last_name = "";
                                    }
                                    if (typeof friends_list[i].photo_100 === "string") {
                                        friends_map[user_id].photo_100 = friends_list[i].photo_100;
                                    } else {
                                        friends_map[user_id].photo_100 = DEFAULT_PHOTO_100_URL;
                                    }

                                    friends_map[user_id].update_time    = 0;
                                    friends_map[user_id].latitude       = 0;
                                    friends_map[user_id].longitude      = 0;
                                    friends_map[user_id].battery_status = "";
                                    friends_map[user_id].battery_level  = 0;

                                    if (!friends_list[i].is_closed || friends_list[i].can_access_closed) {
                                        accessible_frnd_ids.push(friends_list[i].id);
                                    }
                                }
                            } else {
                                console.log("updateFriends() : invalid friend entry");
                            }
                        }

                        if (accessible_frnd_ids.length > 0) {
                            let notes_req_count = 0;
                            let notes_list      = [];

                            for (let i = 0; i < accessible_frnd_ids.length; i = i + VK_MAX_BATCH_SIZE) {
                                let execute_code = "return [";

                                for (let j = 0; j < VK_MAX_BATCH_SIZE && i + j < accessible_frnd_ids.length; j++) {
                                    execute_code = execute_code + "API.notes.get({\"user_id\":" + accessible_frnd_ids[i + j] + ",\"count\":" + VK_MAX_NOTES_GET_COUNT + ",\"sort\":0}).items";

                                    if (j < VK_MAX_BATCH_SIZE - 1 && i + j < accessible_frnd_ids.length - 1) {
                                        execute_code = execute_code + ",";
                                    }
                                }

                                execute_code = execute_code + "];";

                                enqueueVKApiRequest("execute", {
                                    "code": execute_code,
                                    "v":    VK_API_V
                                }, function(data) {
                                    if (data.response) {
                                        for (let i = 0; i < data.response.length; i++) {
                                            if (data.response[i]) {
                                                for (let j = 0; j < data.response[i].length; j++) {
                                                    if (data.response[i][j] && data.response[i][j].title === DATA_NOTE_TITLE) {
                                                        notes_list.push(data.response[i][j]);

                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    } else {
                                        if (data.error) {
                                            console.log("updateFriends() : execute(notes.get) request failed : " + data.error.error_msg);
                                        } else {
                                            console.log("updateFriends() : execute(notes.get) request failed : " + data);
                                        }
                                    }

                                    notes_req_count--;

                                    if (notes_req_count === 0) {
                                        let updated_friends = {};

                                        for (let i = 0; i < notes_list.length; i++) {
                                            if (notes_list[i] && typeof notes_list[i].text     === "string" &&
                                                                 typeof notes_list[i].owner_id === "number" && isFinite(notes_list[i].owner_id)) {
                                                let user_id = notes_list[i].owner_id.toString();

                                                if (friends_map[user_id]) {
                                                    let base64_regexp = /\{\{\{([^\}]+)\}\}\}/;
                                                    let regexp_result = base64_regexp.exec(notes_list[i].text);

                                                    if (regexp_result && regexp_result.length === 2) {
                                                        let user_data = null;

                                                        try {
                                                            user_data = JSON.parse(atob(regexp_result[1]));
                                                        } catch (ex) {
                                                            console.log("updateFriends() : invalid user data");
                                                        }

                                                        if (user_data && typeof user_data.update_time === "number" && isFinite(user_data.update_time) &&
                                                                         typeof user_data.latitude    === "number" && isFinite(user_data.latitude) &&
                                                                         typeof user_data.longitude   === "number" && isFinite(user_data.longitude)) {
                                                            friends_map[user_id].update_time = user_data.update_time;
                                                            friends_map[user_id].latitude    = user_data.latitude;
                                                            friends_map[user_id].longitude   = user_data.longitude;

                                                            let frnd_marker = marker_source.getFeatureById(user_id);

                                                            if (frnd_marker === null) {
                                                                frnd_marker = new ol.Feature({
                                                                    "geometry": new ol.geom.Point(ol.proj.fromLonLat([friends_map[user_id].longitude, friends_map[user_id].latitude]))
                                                                });

                                                                frnd_marker.setId(user_id);

                                                                marker_source.addFeature(frnd_marker);
                                                            } else {
                                                                frnd_marker.setGeometry(new ol.geom.Point(ol.proj.fromLonLat([friends_map[user_id].longitude, friends_map[user_id].latitude])));
                                                            }

                                                            frnd_marker.setStyle(new ol.style.Style({
                                                                "image": createMarkerImage(frnd_marker, friends_map[user_id].update_time, friends_map[user_id].photo_100, MARKER_IMAGE_SIZE, MARKER_LABEL_SIZE)
                                                            }));

                                                            frnd_marker.set("firstName",  friends_map[user_id].first_name);
                                                            frnd_marker.set("lastName",   friends_map[user_id].last_name);
                                                            frnd_marker.set("updateTime", friends_map[user_id].update_time);

                                                            if (typeof user_data.battery_status === "string" &&
                                                                typeof user_data.battery_level  === "number" && isFinite(user_data.battery_level)) {
                                                                friends_map[user_id].battery_status = user_data.battery_status;
                                                                friends_map[user_id].battery_level  = user_data.battery_level;
                                                            }

                                                            updated_friends[user_id] = true;
                                                        }
                                                    } else {
                                                        console.log("updateFriends() : invalid user data");
                                                    }
                                                }
                                            } else {
                                                console.log("updateFriends() : invalid note entry");
                                            }
                                        }

                                        cleanupMarkers(updated_friends);

                                        if (updateControlPanel(friends_map)) {
                                            hideInvitationPanel();
                                        } else {
                                            showInvitationPanel();
                                        }

                                        setTimeout(runPeriodicUpdate, UPDATE_INTERVAL);
                                    }
                                });

                                notes_req_count++;
                            }
                        } else {
                            cleanupMarkers({});

                            if (updateControlPanel({})) {
                                hideInvitationPanel();
                            } else {
                                showInvitationPanel();
                            }

                            setTimeout(runPeriodicUpdate, UPDATE_INTERVAL);
                        }
                    }
                } else {
                    cleanupMarkers({});

                    if (updateControlPanel({})) {
                        hideInvitationPanel();
                    } else {
                        showInvitationPanel();
                    }

                    setTimeout(runPeriodicUpdate, UPDATE_INTERVAL);
                }
            } else {
                if (data.error) {
                    console.log("updateFriends() : friends.get request failed : " + data.error.error_msg);
                } else {
                    console.log("updateFriends() : friends.get request failed : " + data);
                }

                setTimeout(runPeriodicUpdate, UPDATE_INTERVAL);
            }
        }

        enqueueVKApiRequest("friends.get", {
            "fields": "photo_100",
            "v":      VK_API_V
        }, function(data) {
            updateFriends(data, 0);
        });
    }

    let device_pixel_ratio = window.devicePixelRatio > MIN_DEVICE_PIXEL_RATIO ? window.devicePixelRatio : MIN_DEVICE_PIXEL_RATIO;
    let map_was_touched    = false;
    let my_photo_100       = DEFAULT_PHOTO_100_URL;
    let my_marker          = null;
    let tracked_marker     = null;
    let vk_request_queue   = [];

    let marker_source = new ol.source.Vector({
        "features": []
    });

    let marker_layer = new ol.layer.Vector({
        "source": marker_source
    });

    let map = new ol.Map({
        "target": "map",
        "layers": [
            new ol.layer.Tile({
                "source": new ol.source.OSM({
                    "url":          "https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}@2x.png",
                    "attributions": "&#169; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\" rel=\"noopener\">OpenStreetMap</a> contributors."
                })
            }),
            marker_layer
        ],
        "overlays": [
            new ol.Overlay({
                "id":          "markerTooltip",
                "element":     document.getElementById("markerTooltip"),
                "offset":      [8, 0],
                "positioning": "bottom-left"
            })
        ],
        "view": new ol.View({
            "center": ol.proj.fromLonLat([0.0, 0.0]),
            "zoom":   0
        }),
        "controls": ol.control.defaults({
            "attributionOptions": {
                "collapsible": true
            }
        })
    });

    map.on("singleclick", function(event) {
        marker_layer.getFeatures(event.pixel).then(function(features) {
            if (features && features.length > 0) {
                let feature = features[0];

                if (feature.getId()) {
                    window.open("https://vk.com/id" + feature.getId(), "_blank", "noopener");
                }
            }
        });
    });

    map.on("pointermove", function(event) {
        marker_layer.getFeatures(event.pixel).then(function(features) {
            if (features && features.length > 0) {
                let feature = features[0];

                map.getOverlayById("markerTooltip").setPosition(event.coordinate);

                document.getElementById("markerTooltipNameText").innerHTML       = escapeHtml(_("{0} {1}", feature.get("firstName"),
                                                                                                           feature.get("lastName")));
                document.getElementById("markerTooltipUpdateTimeText").innerHTML = escapeHtml(_("{0}",     (new Date(feature.get("updateTime") * 1000))
                                                                                                                .toLocaleString()));

                document.getElementById("markerTooltip").style.display = "flex";
            } else {
                document.getElementById("markerTooltip").style.display = "none";
            }
        });
    });

    map.on("dblclick", function(event) {
        map_was_touched = true;
        tracked_marker  = null;
    });

    map.on("pointerdrag", function(event) {
        map_was_touched = true;
        tracked_marker  = null;
    });

    try {
        VK.init(function() {
            function init() {
                document.getElementById("adPanel").style.display      = "flex";
                document.getElementById("controlPanel").style.display = "flex";

                VK.Widgets.Ads("adPanel", {}, {
                    "ad_unit_id":     105075,
                    "ad_unit_hash":   "498223b8d2f6d0f460567d0b69f52cfc",
                    "ad_unit_width":  260,
                    "ad_unit_height": 125,
                    "ad_unit_type":   "horizontal",
                    "ad_type":        "horizontal",
                    "ads_count":      1
                });

                runVKRequestQueue();
                runPeriodicUpdate();

                if (navigator.geolocation) {
                    navigator.geolocation.watchPosition(function(position) {
                        if (my_marker === null) {
                            enqueueVKApiRequest("users.get", {
                                "fields": "photo_100",
                                "v":      VK_API_V
                            }, function(data) {
                                if (my_marker === null) {
                                    if (data.response) {
                                        if (data.response.length === 1 && data.response[0]) {
                                            if (typeof data.response[0].photo_100 === "string") {
                                                my_photo_100 = data.response[0].photo_100;
                                            } else {
                                                my_photo_100 = DEFAULT_PHOTO_100_URL;
                                            }

                                            my_marker = new ol.Feature({
                                                "geometry": new ol.geom.Point(ol.proj.fromLonLat([position.coords.longitude, position.coords.latitude]))
                                            });

                                            my_marker.setId("");

                                            my_marker.setStyle(new ol.style.Style({
                                                "image": createMarkerImage(my_marker, (new Date()).getTime() / 1000, my_photo_100, MARKER_IMAGE_SIZE, MARKER_LABEL_SIZE)
                                            }));

                                            marker_source.addFeature(my_marker);

                                            if (typeof data.response[0].first_name === "string") {
                                                my_marker.set("firstName", data.response[0].first_name);
                                            } else {
                                                my_marker.set("firstName", "");
                                            }
                                            if (typeof data.response[0].last_name === "string") {
                                                my_marker.set("lastName", data.response[0].last_name);
                                            } else {
                                                my_marker.set("lastName", "");
                                            }

                                            my_marker.set("updateTime", (new Date()).getTime() / 1000);

                                            if (tracked_marker !== null) {
                                                centerOnTrackedMarker();
                                            } else if (!map_was_touched) {
                                                fitMapToAllMarkers();
                                            }

                                            let control_panel = document.getElementById("controlPanel");
                                            let my_image      = createControlPanelImage("SHOW_MARKER", "", "", 0, my_photo_100, CONTROL_PANEL_IMAGE_SIZE, CONTROL_PANEL_LABEL_SIZE);

                                            if (control_panel.firstChild && control_panel.firstChild.nextSibling) {
                                                control_panel.insertBefore(my_image, control_panel.firstChild.nextSibling);
                                            } else {
                                                control_panel.appendChild(my_image);
                                            }
                                        } else {
                                            console.log("init() : invalid response to users.get request");
                                        }
                                    } else {
                                        if (data.error) {
                                            console.log("init() : users.get request failed : " + data.error.error_msg);
                                        } else {
                                            console.log("init() : users.get request failed : " + data);
                                        }
                                    }
                                }
                            });
                        } else {
                            my_marker.setGeometry(new ol.geom.Point(ol.proj.fromLonLat([position.coords.longitude, position.coords.latitude])));

                            my_marker.set("updateTime", (new Date()).getTime() / 1000);

                            if (tracked_marker !== null) {
                                centerOnTrackedMarker();
                            } else if (!map_was_touched) {
                                fitMapToAllMarkers();
                            }
                        }
                    });
                }

                return true;
            }

            function showSettingsPanel() {
                document.getElementById("settingsPanelText").innerHTML   = escapeHtml(_("You should allow access to friends and notes to view location of your friends on the map."));
                document.getElementById("settingsPanelButton").innerHTML = escapeHtml(_("Settings"));

                document.getElementById("settingsPanel").style.display = "flex";
            }

            function hideSettingsPanel() {
                document.getElementById("settingsPanel").style.display = "none";
            }

            let initialized = false;

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

            let settings = (new URL(document.location)).searchParams.get("api_settings");

            if ((settings & VK_ACCESS_SETTINGS) === VK_ACCESS_SETTINGS) {
                initialized = init();
            } else {
                requestSettings();
            }
        }, function() {
            displayFatalError(_("VK initialization failed."));
        }, VK_API_V);
    } catch (ex) {
        displayFatalError(_("VK initialization failed."));

        throw ex;
    }

    return {
        "requestSettings": requestSettings
    };
})();
