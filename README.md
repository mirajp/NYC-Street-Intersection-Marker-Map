# NYC Street Intersection Marker Map
A Google Map that uses a [Fusion Table Layer](https://support.google.com/fusiontables/answer/2527132?hl=en&topic=2573107&ctx=topic "Fusion Table tutorial") to display NYC Street Intersections. A companion csv file is used to display (private) additional information when the corresponding marker is clicked. The csv is read using [AlaSQL](https://github.com/agershun/alasql "AlaSQL Git Repo"); this library also makes querying for marker data fast and easy.

*Note: some of lat/lng pairs for NYC street intersections may be inaccurate (mismatched), and many may be missing (they were extracted using Google Maps API Text Search on a list of Street Intersections which had its own inaccuracies/issues).

[Click here to go to the Google Maps API doc page for Fusion Tables layers](https://developers.google.com/maps/documentation/javascript/examples/layer-fusiontables-simple "Google Maps API: Fusion Tables")

[Click here to see the interactive map with all the markers](https://rawgit.com/mirajp/NYC-Street-Intersection-Marker-Map/master/xstreet_markersmap.html "View the map")

The picture below shows what the infowindow looks like when a marker from the Fusion Table Layer is clicked and data for that latitude/longitude is found in the source csv file (e.g. intersectionlatlngs.csv):
![Infowindow contents from csv](https://raw.githubusercontent.com/mirajp/NYC-Street-Intersection-Marker-Map/master/lib/WhenMarkerFound.png "Infowindow contents from csv")

The picture below shows what the infowindow looks like when a marker from the Fusion Table Layer is clicked and data for that latitude/longitude is NOT found in the source csv file (the contents for the infowindow are formatted based on the set template in the Google Fusion Table):
![Infowindow contents from fusion table](https://raw.githubusercontent.com/mirajp/NYC-Street-Intersection-Marker-Map/master/lib/WhenMarkerNotFound.png "Infowindow contents from fusion table")
