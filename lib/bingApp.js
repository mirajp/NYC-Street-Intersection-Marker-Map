var map, infobox;
var infoboxTemplate = '<div class="custom-infobox">' +
    '<div class="title">{title}</div>{description}</div>';

// Columns' order should be: [BOROUGH, CROSS-STREET NAME, LINK, LATITUDE, LONGITUDE]
var columnIndex = -1;
var boroughColumn = ++columnIndex, crossStreetNameColumn = ++columnIndex,
    linkColumn = ++columnIndex, latitudeColumn = ++columnIndex, longitudeColumn = ++columnIndex;

function addPushpinFromRow(row) {
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
    // loadMarkerLinks();
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
    
    // Create an infobox at the center of the map but don't show it.
    infobox = new Microsoft.Maps.Infobox(map.getCenter(), {
        visible: false,
    });
    // Assign the infobox to a map instance.
    infobox.setMap(map);
    addMarkerDataFromSqliteDb();
}

function addMarkerDataFromSqliteDb(sqliteDbPath, tableName) {
    var dbPath = sqliteDbPath || 'intersectionlatlngs.sqlite';
    var tblName = tableName || 'MarkerData';
    // sql.js must be imported via script tag before this function is called
    var sql = window.SQL;

    var xhr = new XMLHttpRequest();
    xhr.open('GET', dbPath, true);
    xhr.responseType = 'arraybuffer';

    xhr.onload = function(e) {
        console.log('Loaded sqlite db! Now adding pushpins...');
        var response = e.target.response;
        var uInt8Array = new Uint8Array(response);
        var db = new SQL.Database(uInt8Array);
        var contents = db.exec('SELECT * FROM ' + tblName);
        if (!contents || !contents.length || !contents[0].values) {
            console.error('Could not fetch results from the sqlite db! Contents look like:', contents,
            'Expected an array with an object in the 0th index that has a key/value pair named "values"');
            return;
        }

        // contents is like: [{columns:['col1','col2',...], values:[[first row], [second row], ...]}]
        // Columns' order should be: [BOROUGH, CROSS-STREET NAME, LINK, LATITUDE, LONGITUDE]
        var values = contents[0].values;
        var numPushpins = values.length;
        for (var i = 0; i < numPushpins; i++) {
            addPushpinFromRow(values[i]);
        }
        console.log('Finished adding ' + numPushpins.toString() + ' pushpins!');
    };
    xhr.onerror = function(error) {
        console.error('Error loading the sqlite db from the path provided', error);
    };
    xhr.send();
}
