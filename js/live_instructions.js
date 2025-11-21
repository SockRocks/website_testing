var routeStarted = false;
var route = [];
var full_route;
/* The main function to call to begin live navigation
when started: 
    - will track user's location
    - serve next instruction based on closest node
    - will read tts instructions
    - will update graphical display: tron line shrinks with user's route and user's location on map is updated
*/
// while I'm not at destination
// get my location
// get closest node id
// look at next node
// get next instruction (left/right/straight/elevator/entrance)
// display it + speak it (optional)
// sleep for a period and then refresh


// use long + lat to approximate direction:
/*
    Calculate angle between line connecting two nodes and the line normal (straight ahead to cur node):
        - depending on interval angle falls in say left/right/slight left/right/ straight

    if next node is a door/elevator give special instructions
*/

// create interval function:
/*
Refresh map (called every ~30 s)
Update user's map position

if (hasRoute){
    Update tron line according to position

    if current position is at destination, then clear tron line
    and set hasRoute to false and route_started to false
}

if (route_started){
    Update on screen instructions
    Narrate instructions
}
*/

function update_route(pos) {
    // get nearest node in the route
    // get distance from it
    // delete all edges before the closest node
    // draw an edge from the current pos to nearest node

    let nearest = get_nearest_coord(pos, full_route);
    // next we'll iterate through the longs and lats in the tron line
    // find the long + lat equal to the closest node
    // delete all points before that one
    // and then draw a line from the user's position to that last point
    // problem is that we need node ahead of user which doesn't happen if the user is closer to the previous node

    // new strat:
    // go through initial tron line long and lats
    // find top 2 closest coords
    // return the one with the higher index
    // draw a line from the current coords to the returned coord
    let modified = full_route.slice(nearest, full_route.length);
    let newPt = {lat:pos[1], lng:pos[0]};
    modified.unshift(newPt);
    __tronLayer.setLatLngs(modified);
}

// longitudes are usually around -76
function map_refresh(e) {
    console.log("Lat", e.latlng.lat, "Lng", e.latlng.lng);

    /*

39.09237410132065
lng
: 
-76.53810024261476

    */
    let pos = [e.latlng.lng, e.latlng.lat];
    /*pos = [full_route[4].lng, full_route[4].lat];
    pos = [-76.53810024261476 + .4 , 39.09237410132065 + .4]*/

    if (route.length > 0) {

        update_route(pos, route);
    }


}
// cur pos ~ 1763757175911
// coords: [-76.53791785240175, 39.0926364005514]
let cur = "1763757175911";
let target = "1763757191244"; // up on shakespeare
route = A_star(cur, target);
tron_line(route);
full_route = __tronLayer.getLatLngs();
nav_map.on("locationfound", map_refresh)