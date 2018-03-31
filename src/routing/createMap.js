import { stations, lines } from './mrt.json';

/* 
	Returns Map representing the MRT station lines available in Singapore.
	Graph assumed to have equal weighting for all edges connecting between 2 nodes/vertices (in this case stations),
	due to lack of information on travel time etc. Hence, assumed all trips have equal travel times.

	Summary: All stations are treated as vertices, with all edges having equal weights.
*/

function listNodes(){
	var graph = {};
	for (var station in stations){
		graph[station] = {
			neighbors:[],
			line_list:[],
		};
	}
	//console.log(graph);
	return graph;
}

export default function createMap(){
	const station_graph = listNodes();

	for (var line in lines){
		var routes = lines[line]["route"];
		//console.log(line, routes, station_graph[routes[0]]);
		var len = routes.length;
		for (var i = 0; i < len; i++){
			
			/*
			if(routes[i] === "city_hall"){

				//console.log( (routes[i] in station_graph[routes[i+1]]), routes[i], routes[i+1]);
				console.log( (station_graph[routes[i+1]].includes(routes[i])), routes[i], routes[i+1] );
				console.log( station_graph[routes[i+1]]);
			}
			*/

			/*
			//if using object for edge connections
			if ( !(station_graph[routes[i]].includes(routes[i+1])) ){
				station_graph[routes[i]].push(routes[i+1]); 
			}
			if (!(station_graph[routes[i+1]].includes[routes[i]] )){
				station_graph[routes[i+1]].push(routes[i]); 
			}
			*/
			//console.log(station_graph[routes[i]]["lines"]);
			if(!(station_graph[routes[i]]["line_list"].includes(line)) ){
				station_graph[routes[i]]["line_list"].push(line);
			}
			if (i === (len-1)){
				break;
			}
			
			//if ( !(routes[i+1] in station_graph[routes[i]].neighbors) ){
			if ( !(station_graph[routes[i]]["neighbors"].includes(routes[i+1])) ){
				station_graph[routes[i]]["neighbors"].push(routes[i+1]); 
				//station_graph[routes[i]].neighbors[routes[i+1]] = 1;
				//station_graph[routes[i]].lines.push(line);
			}

			//if (!(routes[i] in station_graph[routes[i+1]])){
			if( !(station_graph[routes[i+1]]["neighbors"].includes(routes[i])) ){
			 	station_graph[routes[i+1]]["neighbors"].push(routes[i]);
				//station_graph[routes[i+1]][routes[i]]= 1;
				//station_graph[routes[i+1]].lines.push(line);
			}
		}
	}
	
	/*
	var station_graph = []
	for (var station in stations){
		if 
	}
	*/
	return station_graph;

}