// Put your Bing Maps API Key here:
var bingMapsKey = 'API_KEY_HERE';
var bingMapsLinkWithKey = 'https://www.bing.com/api/maps/mapcontrol?callback=initMap&key=' + bingMapsKey;

// Need to add the script tag (that has the key attached to the link) to the HTML DOM
document.write('<script async defer src="'+ bingMapsLinkWithKey + '"><\/script>');
