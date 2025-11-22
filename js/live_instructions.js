var routeStarted = true;
var route = [];
var full_route;
var cur_coords, prev_coords = null;
const ARRIVED_DIST = 3; // meters away from ending node that we say the user has arrived

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
    // takes position as an array [long, lat]
    // new strat:
    // go through initial tron line long and lats
    // find top 2 closest coords
    // return the one with the higher index
    // draw a line from the current coords to the returned coord
    let nearest = get_nearest_coord(pos, full_route);
    let modified = full_route.slice(nearest, full_route.length);
    let newPt = { lat: pos[1], lng: pos[0] };
    modified.unshift(newPt);
    __tronLayer.setLatLngs(modified);
}

function make_vec(coord1, coord2) {
    // makes a vec out of a pair or coordinates
    return [coord2[0] - coord1[0], coord2[1] - coord1[1]]
}

function dot_prod(v1, v2) {
    // calculates dot product between vectors
    return v1[0] * v2[0] + v1[1] * v2[1];
}

function cross_product(v1, v2){
    // cross product of two 2d vectors

    return [0, 0, v1[0] * v2[1] - v1[1] * v2[0]]
}
function direction(v1, v2) {
    // calculate angle in degrees between two vectors
    let k = cross_product(v1, v2)[2];

    let direction;
    if(Math.abs(k) < 1){
        direction = "Straight";
    }else if(k >= 1){
        direction = "Left";
    }else if(k <= -1){
        direction = "Right";
    }

    return direction;
}

function check_arrays_equal(arr1, arr2){
    if(arr1.length != arr2.length)
        return false;

    for(let i = 0; i < arr1.length; i++){
        if(arr1[i] != arr2[i])
            return false;
    }
    return true;
}
function get_next_instruction(pos) {

    // returns a string representing the next instruction
    let v1 = make_vec(prev_coords, cur_coords);

    let final = full_route[full_route.length - 1] // get final point
    let final_coords = sphere_to_cart([final.lng, final.lat]);
    let diff = get_distance(cur_coords, final_coords);
 
    if (diff < ARRIVED_DIST)
        return "Arrived";

    let index = get_nearest_coord(pos, full_route);
    let nearest = full_route[index];


    index = check_arrays_equal([nearest.lng, nearest.lat],[pos[0], pos[1]]) ? index + 1 : index; // if we happen to be at the current line point look ahead to the next one
    nearest = full_route[index];
    nearest = [nearest.lng, nearest.lat];
    nearest = sphere_to_cart(nearest);

    let v2 = make_vec(cur_coords, nearest);

    return direction(v1, v2);

}

function update_instruction(pos) {
    // updates the instructions on screen
    let nxt_instruc = get_next_instruction(pos);

    document.getElementById("instruc").innerText = "Instruction:" + nxt_instruc;

    if (nxt_instruc == "Arrived")
        return true;

    return false;
    // html update logic
}

// longitudes are usually around -76
function map_refresh(e) {
    //console.log("Lat", e.latlng.lat, "Lng", e.latlng.lng);
    console.log("All parts:", full_route);


    let pos = [e.latlng.lng, e.latlng.lat]; // get current position

    // TESTING
    //pos = [full_route[6].lng, full_route[6].lat];
    //prev_coords = sphere_to_cart([full_route[5].lng, full_route[5].lat])

    prev_coords = cur_coords;
    cur_coords = sphere_to_cart(pos);
    
    /*
    pos = [-76.53810024261476 + .4 , 39.09237410132065 + .4]*/

    if (route.length > 0) {
        update_route(pos, route);
    } 
    if (prev_coords && cur_coords && routeStarted && !check_arrays_equal(prev_coords, cur_coords)) {
        let finished = update_instruction(pos)

        route = finished ? [] : route;
        routeStarted = !finished;
    }


}
// cur pos ~ 1763757175911
// coords: [-76.53791785240175, 39.0926364005514]

let cur = "1763757175911";
let target = "1763757191244"; // up on shakespeare
route = A_star(cur, target);
tron_line(route);


full_route = __tronLayer.getLatLngs(); // this will be set right after generation
routeStarted = true; // same with this
console.log(direction([1,0], [1,1]));
nav_map.on("locationfound", map_refresh)