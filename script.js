 var currentResults = [];
    // default filter for when the page first loads
    var defaultFilter = ['Beaches', 'Childrens Play Areas', 'Community Centers', 'Gardens', 'General Attractions', 'Museums and Galleries', 'Parks', 'Picnic Sites', 'Playfields', 'Pools', ];

    // set of data we can use to filter city_feature
    var filterableSet = ['Basketball Courts', 'Beaches', 'Childrens Play Areas', 'Community Centers', 'Computer/Media Center', 'Environmental Learning  Centers', 'Family Support Center', 'Farmers Markets', 'Firepits', 'Fishing', 'Gardens', 'General Attractions', 'Heritage Trees', 'Landmarks', 'Libraries', 'Museums and Galleries', 'Neighborhood Service Centers', 'Off Leash Areas', 'Parks', 'Picnic Sites', 'Playfields', 'Pools', 'Public Art', 'Public Spaces', 'Seattle Center', 'Tennis Courts', 'Viewpoints', 'Wading Pools', 'Waterfront'];

    var mymap = L.map('map').setView([47.6062, -122.335167], 13);
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> Data by Socrata'
    }).addTo(mymap);

    // create a separate layer for our markers for easy cleanup
    var markersLayer = new L.FeatureGroup();
    mymap.addLayer(markersLayer);

    // // 
    // $('.thumbnails').css("height", function(index) {
    //         return $(document).height();
    //     }
    // );
    var filterControls = L.control({
            position: 'topright'
        }

    );
    filterControls.onAdd = function(map) {
        var div = L.DomUtil.create('div', 'filter-controls');
        div.innerHTML = '<div class="btn-group"><button type="button" id="allfilter" class="btn btn-success">All</button><button type="button" id="parksfilter" class="btn btn-primary">Parks</button><button type="button" id="more-filter" class="btn btn-danger">More</button></div>' + generateFilterHtml();
        div.onmousedown = div.ondblclick = onmouseover = L.DomEvent.stopPropagation;
        L.DomEvent.disableScrollPropagation(div);
        L.DomEvent.disableClickPropagation(div);
        return div;
    }

    ;
    filterControls.addTo(mymap);

    // geolocation control
    var geoControls = L.control({
            position: 'bottomright'
        }

    );
    geoControls.onAdd = function(map) {
        var div = L.DomUtil.create('div', 'geo-controls');
        div.innerHTML = '<button id="locate-btn" type="button" class="btn btn-default"><span class="glyphicon glyphicon-map-marker" aria-hidden="true"></span></button>';
        div.onmousedown = div.ondblclick = onmouseover = L.DomEvent.stopPropagation;
        L.DomEvent.disableScrollPropagation(div);
        L.DomEvent.disableClickPropagation(div);
        return div;
    }

    ;
    geoControls.addTo(mymap);
    $(document).on("click", "#locate-btn", function() {
        mymap.locate({
            setView: true,
            watch: false
        });
    });

    function fetchResults(filters) {
        $.getJSON("https://data.seattle.gov/resource/3c4b-gdxv.json?$where=city_feature IN ('" + filters.join("','") + "')", function(json) {
            $('#poi-listings').empty();
            // remove any existing markers
            markersLayer.clearLayers();
            currentResults = [];
            for (var key in json) {
                currentResults[key] = json[key];
                //if (key > 100) break;
                var marker = L.marker([json[key].latitude, json[key].longitude]).addTo(markersLayer).on('click', markerClicked);
                marker.index = key;
                marker.bindPopup("<b>" + (json[key].common_name ? json[key].common_name : '') + "</b><br>" + (json[key].address ? json[key].address : '') + '<br>' + '<a target="_blank" href="https://maps.google.com?daddr=' + (json[key].address ? json[key].address : (json[key].common_name ? json[key].common_name : '')) + ', Seattle, WA">Directions</a>' + (json[key].website ? ' | <a target="_blank" href="' + json[key].website + '">Details</a>' : ''));
                currentResults[key].marker = marker;
                if ($(document).width() > 801) {
                    $('#poi-listings').append(' <li result-index="' + key + '"><div class="ribbon">' + json[key].city_feature + '</div><div class="thumbnail" style="padding: 0"><div class="caption"><h2>' + (json[key].common_name ? json[key].common_name : '') + '</h2><p>' + (json[key].address ? json[key].address + '<br>' : '') + 'Seattle, WA</p><div class="links"><a target="_blank" href="https://maps.google.com?daddr=' + (json[key].address ? json[key].address : (json[key].common_name ? json[key].common_name : '')) + ', Seattle, WA">Directions</a>' + (json[key].website ? ' | <a target="_blank" href="' + json[key].website + '">Details</a>' : '') + '</div></div></div></li>');
                } //<div style="padding:4px"><img alt="300x200" style="width: 100%" src="' + getImage(json[key]) +'"></div>
            }
        });
    }

    // function getImage(object) {
    //     if (object.city_feature == 'Parks') {
    //         return 'park.jpg';
    //     } else if (object.city_feature == 'Pools') {
    //         return 'pool.jpg';
    //     } else if (object.city_feature == 'Museums and Galleries') {
    //         return 'museum.jpg';
    //     } else if (object.city_feature == 'General Attractions') {
    //         return 'general.jpg';
    //     } else if (object.city_feature == 'Basketball Courts') {
    //         return 'basketball.jpg';
    //     } else if (object.city_feature == 'Playfields') {
    //         return 'fields.jpg';
    //     } else if (object.city_feature == 'Picnic Sites') {
    //         return 'picnic.jpg';
    //     } else if (object.city_feature == 'Childrens Play Areas') {
    //         return 'playarea.jpg';
    //     } else if (object.city_feature == 'Community Centers') {
    //         return 'communitycenter.jpg';
    //     } else if (object.city_feature == 'Gardens') {
    //         return 'garden.jpg';
    //     } else {
    //         return 'http://placehold.it/200x150';
    //     }
    // }

    // this function exits early if we are dealing with screen sizes that hide the results pane
    // otherwise, it will add a selected class to the thumbnail we just selectedd, as well as scroll to it
    function markerClicked(e) {
        if ($(document).width() <= 801) return;
        console.log(this.index);
        $("[result-index='" + this.index + "']").find(".caption").addClass("selected");
        var scrollTo = $("[result-index='" + this.index + "']");
        var thumbContainer = $('#results');
        thumbContainer.animate({
            scrollTop: scrollTo.offset().top - thumbContainer.offset().top + thumbContainer.scrollTop()
        }, 2000);
    }

    function generateFilterHtml() {
        var html = '<ul id="filter-list" >';
        for (key in filterableSet) {
            html += '<li><input type="checkbox" value="' + filterableSet[key] + '"' + ($.inArray(filterableSet[key], defaultFilter) > -1 ? 'checked' : '') + '>' + filterableSet[key] + '</li>';
        }
        html += '</ul>';
        return html;
    }

    $(document).on("click", "#filter-list input", function() {
            fetchResults(getFilterValues());
        }

    );
    $(document).on("click", "#parksfilter", function() {
            $('#filter-list input').each(function() {
                if (this.value == 'Parks') {
                    $(this).prop('checked', true);
                } else {
                    $(this).prop('checked', false);
                }
            });
            fetchResults(['Parks']);
        }

    );
    $(document).on("click", "#allfilter", function() {

            var confirmAll = confirm("Selecting all may load a lot of data. Continue?");
            if (confirmAll == true) {
                $('#filter-list input').each(function() {
                    $(this).prop('checked', true);
                });
                fetchResults(filterableSet);
            }

        }

    );

    function getFilterValues() {
        var checkedValues = [];
        $('#filter-list input:checked').each(function() {
            checkedValues.push(this.value);
        });
        return checkedValues;
    }

    $(document).on("click", "#more-filter", function() {
            $('#filter-list').toggle();
        }

    );

    function onMapClick(e) {
        $('#filter-list').hide();
    }

    mymap.on('click', onMapClick);
    $(document).on("mouseenter", "#poi-listings li", function() {
        var index = $(this).attr("result-index");
        currentResults[index].marker.openPopup();
        mymap.panTo(new L.LatLng(currentResults[index].latitude, currentResults[index].longitude));
    });
    fetchResults(defaultFilter);