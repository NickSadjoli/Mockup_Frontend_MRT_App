import { stations, lines } from './mrt.json';
import createMap from './createMap';
/*
	Returns the best routes between the origin and destination.

	Arguments origin and destination are { lat, lng } objects.
	Returns an array of the best routes. You may define "best" using any reasonable metric and document your definition.

	Each route is an object which must contain a "steps" array. You may add additional properties as needed.
	Each step can represent a "walk", "ride" or "change", and must have at least the following properties:
	- { type: "walk", from: <stationId> or "origin", to: <stationId> or "destination" }
	- { type: "ride", line: <lineId>, from: <stationId>, to: <stationId> }
	- { type: "change", station: <stationId>, from: <lineId>, to: <lineId> }
	You may add additional properties as needed.

	Example:

	findRoutes({ lat: 1.322522, lng: 103.815403 }, { lat: 1.29321, lng: 103.852216 })

	should return something like:

	[
		{ steps: [
			{ type: "walk", from: "origin", to: "botanic_gardens" },
			{ type: "ride", line: "CC", from: "botanic_gardens", to: "buona_vista" },
			{ type: "change", station: "buona_vista", from: "CC", to: "EW" },
			{ type: "ride", line: "EW", from: "buona_vista", to: "bugis" },
			{ type: "walk", from: "bugis", to: "destination" }
		] },
		{ steps: [
			// worse route
		] }
	]

*/

/*  AUTHOR'S INTERPRETATION OF 'BEST ROUTE' FOR APPLICATION USAGE:
	Best route = the least amount of MRT stations that need to be traveled from origin to destination.

	Author understands that this will not be accurate since there are travel time between station that can vary
	from time to time. However due to lack of such data and other constraints, app has simplified 'best route' as
	least amount of MRT Stations.

	Also of note that Author has put a limit of 500m minimum distance between origin and destination to actually 
	have the application suggest a route to the user. In the case that the distance between origin and destination is 
	below this limit, then the app would automatically suggest an immediate walking route so that the user does not need
	to actually enter the mrt system and save costs.

	However, if distance is in range between 500m and 800m then a walking route would also be recommended as the 'best route'
	available as an option for user, should he/she be comfortable to actually still walk to the destination without needing to
	enter mrt 
*/ 



export default function findRoutes(origin, destination, requested_result) {

	/**************** List of Function definitions that will be used in the main findRoutes process below ********************/

	/* AUTHOR'S NOTE:
	   Author deliberately not putting all functions below for public access (i.e. outside of findRoutes) to mark that all 
	   functions below are only to be used internally.
	*/

	/*
	  Use Haversine function to determine actual distance between 2 points marked by longitude and latitude.
	  Referred to haversine implementation found here: https://www.movable-type.co.uk/scripts/latlong.html
	*/
	function haversine(lat1, lat2, lng1, lng2){

		function toRadians(degrees) {
	   		return degrees * Math.PI / 180;
		}
		var R = 6371e3; // metres

		var φ1 = toRadians(lat1);
		var φ2 = toRadians(lat2);
		var Δφ = toRadians(lat2-lat1);
		var Δλ = toRadians(lng2-lng1);

		var a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
		        Math.cos(φ1) * Math.cos(φ2) *
		        Math.sin(Δλ/2) * Math.sin(Δλ/2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

		var d = R * c;
		return d;
	}

	/* 
	 Javascript Implementation of DFS (Depth First Search) to find all paths possible between
	 2 nodes. Heavily referenced the Python implementation from the following:
	 https://www.geeksforgeeks.org/find-paths-given-source-destination/

	 Returns list of all possible paths from start node to end node - starting from least amount of stations to 
	 the most - given graph mapping mrt station.
	*/
	function pathfinder(start, end, visited, graph, all_paths){
		var path = [];
		var i = 0;
		//console.log(i);
		let result = pathfinder_recur(start, end, visited, graph, path, all_paths, i);
		return result;
		//console.log(all_paths)
	}

	//helper recursive function for pathfinder function above
	function pathfinder_recur(current, end, visited, graph, path, all_paths, i){
		visited[current] = true;
		path.push(current);
		var new_res = all_paths;

		if (current === end){
			let cur_path = path.slice();
			new_res[i] = cur_path;
		}
		else{

			for(var j in graph[current]["neighbors"]){
				var station = graph[current]["neighbors"][j];

				if (visited[station] === false){
					new_res = pathfinder_recur(station, end, visited, graph, path, new_res, (i+1));
				}
			}
		}

		//once you have finished traversing, will hit this point. Pop last node to allow other previous node to also form path
		var temp = path.pop(); 
		visited[current] = false;

		//return the newly updated paths library (all_paths) to replace the previous one in previous recursion
		return new_res; 
	}

	

	//checks whether there needs to be a change between 2 stations
	function needChange(c_line, next_lines){
		if(!(next_lines.includes(c_line)) ){
			return true;
		}
		return false;
	}

	//function to push a 'ride' step into cur_route object
	function pushRide(cur_route, line, start, end, stops){
		const line_color = lines[line]["color"];
		cur_route.steps.push({
				type: "ride",
				line: line,
				from: start,
				to: end,
				stops: stops,
				l_color: line_color
		});
	}

	//function to push a 'station change' step into cur_route object
	function pushChange(cur_route, station_change, line, next_line){
		const line1_color = lines[line]["color"];
		const line2_color = lines[next_line]["color"];
		cur_route.steps.push({
			type: "change",
			station: station_change,
			from: line,
			to: next_line,
			l1_color: line1_color, 
			l2_color: line2_color
		});
	}

	//function to push a 'walk' step into a cur_route object
	function pushWalk(cur_route, start, end, walk_distance){
		cur_route.steps.push({
			type: "walk",
			from: start,
			to: end,
			walk_distance: (Math.round(walk_distance* 10)/10),
		})
	}

	/*************** function definition ends here ********************/



	//preparing variables necessary for routing suggestion
	var origin_station = null;
	var dest_station = null;
	var origin_walk = null;
	var dest_walk = null;

	var visited = {};
	var all_paths = {};
	var select_paths = [];
	var limit_route = requested_result;

	//minimum distance (in m) that the app would need to allow for route recommendation
	const min_mrt = 500;

	//maximum distance (in m) the app would allow to suggest walking recommendatin to user
	const walk_max = 800;

	//calculate actual distance between the original and destination location (in meters)
	var actual_distance = haversine(origin.lat, destination.lat, origin.lng, destination.lng);
	console.log("calculated_distance", actual_distance);

	//if it turns out the 2 destinations are below minimum route requirement, better return 1 walking path instead
	if (actual_distance <= min_mrt){
		var res = [];
		var route = {steps:[]};
		pushWalk(route, 'origin', 'destination', actual_distance);
		res.push(route);
		return res;

	}

	//get mrt_map graph representation
	const mrt_map = createMap();
	console.log(mrt_map);


	//find closest station to both origin and destination points and use them as entry points to MRT system
	for (var station in stations){
		visited[station] = false;
		var station_lat = stations[station]["lat"];
		var station_lng = stations[station]["lng"];
		
		var ori_dist = haversine(origin.lat, station_lat, origin.lng, station_lng);
		var dest_dist = haversine(destination.lat, station_lat, destination.lng, station_lng);

		if (origin_walk === null) {
			origin_walk = ori_dist;
			origin_station = station;
		}
		else if (origin_walk > ori_dist) {
			origin_walk = ori_dist;
			origin_station = station;
		}

		if (dest_walk === null) {
			dest_walk = dest_dist;
			dest_station = station;
		}
		else if (dest_walk > dest_dist) {
			dest_walk = dest_dist;
			dest_station = station;
		}
	}

	//use DFS to find all possible paths from origin to destination station
	all_paths = pathfinder(origin_station, dest_station, visited, mrt_map, all_paths);

	var result = [];

	/*if distance between origin and destination points still within 800m (author determines as still 
	  acceptable walking distance), also recommend direct walk as a 'best route' solution, and reduce
	  mrt routes returned
	 */
	if ((actual_distance > min_mrt) && (actual_distance <= walk_max)){
		var route = {steps:[]};
		pushWalk(route, 'origin', 'destination', actual_distance);
		result.push(route);
		limit_route -= 1;
 	}

	//select and limit to 3 best paths for now
	var j = 0;
	for (var path in all_paths){
		select_paths.push(all_paths[path]);
		j += 1;
		if(j === limit_route){
			break;
		}
	}
	console.log("selected paths: ", select_paths);


	//randomly pick starting line for origin station
	var cur_line = mrt_map[origin_station]["line_list"][0];
	var total_paths = select_paths.length;
	for (var index = 0; index < total_paths; index++){

		var cur_route = {
			steps: []
		}
		pushWalk(cur_route, "origin", stations[origin_station]["name"], origin_walk);
		//var cur_lines = select_paths[]
		

		var start = origin_station;
		var end = null;
		var current_p = select_paths[index];

		
		var path_length = current_p.length;
		var stops = 0;

		//create total message to be pushed and returned
		for(var j = 0; j < path_length; j++){
			var current_station = current_p[j];
			var current_lines = mrt_map[current_station]["line_list"];

			//if still not at destination station
			if(j < (path_length-1)){
				
				var next_station = current_p[j+1];

				var next_lines = mrt_map[next_station]["line_list"];

				//check whether need to change lines
				if (needChange(cur_line, next_lines)){

					//if still at origin station, just change line and no need to push anything
					if (current_station === origin_station){
						for (var l in current_lines){
							if(next_lines.includes(current_lines[l])){
								cur_line = current_lines[l];
							}
						}
					}

					else{

						//if change line happens in middle though, determine next line and push message
						for (var nl in next_lines){
							if(current_lines.includes(next_lines[nl])){
								end = current_station;
								pushRide(cur_route,cur_line, stations[start]["name"], stations[end]["name"], stops);
								pushChange(cur_route, stations[end]["name"], cur_line, next_lines[nl]);

								cur_line = next_lines[nl];
								start = end;
								break;
							}
						}

					}
					stops = 0;

				}
				else{
					//only add stops if already not at origin station. If still at origin station, still counted as 0 stops!
					if(current_station !== origin_station){
						stops = stops + 1;
					}
				}
			}
			//if already at the end station, push below message instead
			else if (j === (path_length -1)){
				pushRide(cur_route, cur_line, stations[start]["name"], stations[dest_station]["name"], stops);

			}
		}
		pushWalk(cur_route, stations[dest_station]["name"], 'destination', dest_walk);

		result.push(cur_route);
	}

	return result;

}
