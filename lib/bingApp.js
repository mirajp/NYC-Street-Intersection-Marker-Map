var map, infobox;
var infoboxTemplate = '<div class="custom-infobox">\
    <a class="infobox-close" href="javascript:closeInfobox()" data-tag="SDK.Infobox.CloseBtn" style="">\
            <img class="infobox-close-img" src="data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjE0cHgiIHdpZHRoPSIxNHB4IiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2ZXJzaW9uPSIxLjEiPjxwYXRoIGQ9Ik03LDBDMy4xMzQsMCwwLDMuMTM0LDAsN2MwLDMuODY3LDMuMTM0LDcsNyw3YzMuODY3LDAsNy0zLjEzMyw3LTdDMTQsMy4xMzQsMTAuODY3LDAsNywweiBNMTAuNSw5LjVsLTEsMUw3LDhsLTIuNSwyLjVsLTEtMUw2LDdMMy41LDQuNWwxLTFMNyw2bDIuNS0yLjVsMSwxTDgsN0wxMC41LDkuNXoiLz48L3N2Zz4=" alt="close infobox" />\
    </a>\
    <div class="title">{title}</div>{description}</div>';

// Columns' order should be: [BOROUGH, CROSS-STREET NAME, LINK, LATITUDE, LONGITUDE]
var columnIndex = -1;
var boroughColumn = ++columnIndex, crossStreetNameColumn = ++columnIndex,
    linkColumn = ++columnIndex, latitudeColumn = ++columnIndex, longitudeColumn = ++columnIndex;

function addPushpinsFromCsv(filename) {
    var csvFile = filename || 'intersectionlatlngs.csv';
    
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", csvFile, true);
    rawFile.onreadystatechange = function () {
        if(rawFile.readyState === 4 && (rawFile.status === 200 || rawFile.status == 0) && rawFile.responseText.length) {
            console.log('Loaded csv! Now adding pushpins...');
        
            var allText = rawFile.responseText;
            var rows = allText.split('\n');
            rows.shift(); // Pop off the header row
            var numPushpins = rows.length;

            for (var i = 0; i < numPushpins; i++) {
                // Split comma-separated string into expected array - paying heed to commas inside quoted fields
                addPushpinFromRow(rows[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g), i);
            }
            console.log('Finished adding ' + numPushpins.toString() + ' pushpins!');
        }
    }
    rawFile.onerror = function(e) {
        console.error('Error loading csv from the path provided', e);
    };
    rawFile.send(null);
}   
    
function addPushpinFromRow(row, i) {
    if (!row || row.length < columnIndex) {
        return;
    }
    var latitude = row[latitudeColumn];
    var longitude = row[longitudeColumn];
    var pinTitle = row[crossStreetNameColumn];
    var pinDescription = '<a href="' + row[linkColumn] + '" target="_blank">Click here</a>';
    var pinOptions = {
        color: getPinColorFromBorough(row[boroughColumn]),
    };
    var pin = new Microsoft.Maps.Pushpin({
        latitude: latitude,
        longitude: longitude,
    }, pinOptions);

    // Store some metadata with the pushpin.
    pin.metadata = {
        title: pinTitle,
        description: pinDescription
    };
    
    // Add a click event handler to the pushpin.
    Microsoft.Maps.Events.addHandler(pin, 'click', pushpinClicked);

    // Add pushpin to the map.
    map.entities.push(pin);
}

function closeInfobox() {
    infobox.setOptions({
        visible: false
    });
}

function getPinColorFromBorough(borough) {
    switch (borough.toLowerCase()) {
        case 'manhattan':
            return 'blue';
        case 'brooklyn':
            return 'green';
        case 'bronx':
            return 'orange';
        case 'queens':
            return 'red';
        default:
            return 'purple';
    }
}

function initMap() {
    var initalCenter = { latitude: 40.782361, longitude: -73.965784 }; // Central Park
    var mapOptions = {
        minZoom: 15,
        showDashboard: true,
        showMapTypeSelector: false,
        showZoomButtons: true,
    };
    var viewOptions = {
        center: initalCenter,
        mapTypeId: Microsoft.Maps.MapTypeId.raod,
        zoom: 16,
    };
        
    map = new Microsoft.Maps.Map('#map', mapOptions);
    map.setView(viewOptions);

    Microsoft.Maps.loadModule('Microsoft.Maps.AutoSuggest', {
        callback: function() {
            var autoSuggestOptions = {
                maxResults: 5
            };
            var manager = new Microsoft.Maps.AutosuggestManager(autoSuggestOptions);
            manager.attachAutosuggest('#searchbox', '#searchbox-container', moveToSelection);
        },
        errorCallback: function(e) {
            console.error('Error loading AutoSuggest:', e);
        },
        credentials: 'Ap0AObt84NcDaUThCeWOj52ZqUHv6k4TJhjLibR-DghC-semgoj-0uPbIi8r0E4j'
    });
    
    // Create an infobox at the center of the map but don't show it.
    infobox = new Microsoft.Maps.Infobox(map.getCenter(), {
        visible: false,
        zIndex: 1
    });
    // Assign the infobox to a map instance.
    infobox.setMap(map);
    Microsoft.Maps.Events.addHandler(map, 'click', closeInfobox);

    addPushpinsFromCsv();
}

function moveToSelection(selectedResult) {
    //Show the suggestion as a pushpin and center map over it.
    map.setView({ center: selectedResult.location, bounds: selectedResult.bestView });
}

function pushpinClicked(e) {
    // Make sure the infobox has metadata to display.
    if (e.target.metadata) {
        // Set the infobox options with the metadata of the pushpin.
        var title = e.target.metadata.title;
        var description = e.target.metadata.description;
        infobox.setOptions({
            location: e.target.getLocation(),
            htmlContent: infoboxTemplate.replace('{title}', title).replace('{description}', description),
            visible: true
        });
    }
}
