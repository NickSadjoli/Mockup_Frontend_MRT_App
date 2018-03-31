import React, { Component } from 'react';
import { Grid, Row, Col, ListGroup, ListGroupItem } from 'react-bootstrap';
import findRoutes from '../routing/findRoutes';
//import createMap from '../routing/createMap';
import './App.css';
import '../css/flat-ui/flat-ui.css';

// This is only a placeholder to demonstrate the Google Maps API.
// You should reorganize and improve it.

class Spacer extends Component{
    render(){
        return(
            <div className="row">
                {'\u00A0'}
            </div>
        );
    }
}

class Origin extends Component{
    render(){
        return (
                <div className="input-group"> 
                    <div className="input-group-prepend col-2" style={{float: "right"}}>
                        From:
                    </div>
                    <input id='origin' className="form-control col-10" placeholder="Start" type="text"/>
                </div>
        );
    }
}

class Destination extends Component{
    render(){
        var space = '\u00A0';
        return (
                <div className="input-group"> 
                    <div className="input-group-prepend col-2" style={{float: "right"}}> 
                        To:
                    </div>
                    <input id='destination' className="form-control col-10" placeholder="End" type="text"/>
                </div>
        );
    }
}

class ResultLimit extends Component{
    render(){
        var space = '\u00A0';
        return(
            <div className="row float-right"> 
                <div className="input-group"> 
                    <div className="input-group-prepend col-5" style={{float: "right"}}>
                            Limit to:
                    </div>
                    <input id="resultlimit" className="form-control col-7 " placeholder="default: 3" onKeyPress={this.props.onKeyPress} type="text" />
                </div>
            </div>
        );
    }
}

class ResultBox extends Component{
    constructor(props){
        super(props);
        this.state = {
            view: "collapsed"
        };
        //this.onClick = this.onClick
        //console.log("route num:", this.props.index, this.props.route);
    }
    changeView(){
        console.log(this.state);
        const cur_view = this.state.view;
        console.log(cur_view);
        if (cur_view === "collapsed"){
            this.setState({
                view: "detailed"
            });
        }
        else if (cur_view === "detailed"){
            this.setState({
                view: "collapsed"
            });
        }
        console.log(this.state.view); 
    }
    render(){
        const steps = this.props.route.steps;
        const cur_view = this.state.view;
        const idx = this.props.index;
        var space = '\u00A0';
        
            if(cur_view === "collapsed"){
                var init_walk = ""
                var route = steps.map((step, idx) => {
                    if (step.type == "walk"){
                        if (idx == 0){
                            init_walk = "Start by walking " + step.walk_distance.toString() + "m to " + step.to;
                        }
                        var cur_key = this.props.index.toString() + "collapsed" + idx.toString();
                        if (idx === (steps.length-1)){
                            return(
                                <div key={cur_key} style={{display: "inline-block"}}>  
                                    <i className="material-icons">directions_walk</i>
                                </div>
                            );
                        }

                        else return (

                            <div key={cur_key} style={{display: "inline-block"}}>  
                                <i className="material-icons">directions_walk</i>
                                <i className="material-icons">trending_flat</i>
                                {space}
                            </div>
                        );   
                    }
                    else if (step.type === "ride"){
                        var line = step.line;
                        var cur_key = this.props.index.toString() + "collapsed" + idx.toString();
                        return (
                            //<div key={cur_key} style={{display:"inline-block"}}>
                            <div key={cur_key} style={{display: "inline-block"}}> 
                                    <div className="linesquare" style={{background: step.l_color}}>
                                        {line}
                                    </div>
                                    <div style={{display: "inline-block"}}> 
                                         {space}<i className="material-icons">trending_flat</i>{space}
                                    </div>
                                
                            </div>
                            
 
                            
                        );
                    }
                    else if(step.type === "change"){
                        var line1 = step.from;
                        var cur_key = this.props.index.toString() + "collapsed" + idx.toString();
                        return (
                            //<div key={cur_key} style={{display: "inline-block"}}>
                            <div key={cur_key} style={{display: "inline-block"}}>
                                    <div className="linesquare" style={{background: step.l1_color}}>
                                        {line1}
                                    </div>
                                    <div style={{display: "inline-block"}}> 
                                        {space}<i className="material-icons">transfer_within_a_station</i>{space}
                                    </div>
                            </div>

                        );
                    }
                });

                return(
                    <div className="col resultBox" onClick={() => this.changeView()}>
                            <div className="container">
                                <div className="row">
                                    Recommended Route # {(this.props.index + 1)}
                                </div>
                                <div className="row" style={{fontSize: 24,display:"inline-block"}}>
                                    {route}
                                </div>
                                <div className="row" style={{fontSize: 20}}> {init_walk} </div>
                            </div>
                    
                    </div>
                );
            }
            else if (cur_view === "detailed"){

                var route = steps.map((step, idx) => {
                    if (step.type == "walk"){
                        //console.log(step);
                        var dist = step.walk_distance;
                        var dest = step.to;
                        var cur_key = this.props.index.toString() + "detailed" + idx.toString();
                        if (idx == 0){
                            return (
                                <div className="row walkline" key={cur_key}>
                                    <i className="material-icons">directions_walk</i> Start by walking {dist}m to {dest}
                                </div>
                            );   
                        }
                        else{
                            return (
                                <div className="row walkline" key={cur_key}>
                                    <i className="material-icons">directions_walk</i> Walk {dist}m to {dest}
                                </div>
                            );
                        }
                        
                    }
                    else if (step.type === "ride"){
                        var line = step.line;
                        var cur_key = this.props.index.toString() + "detailed" + idx.toString();
                        var start = step.from;
                        var end = step.to;
                        var stops = step.stops;
                        let message;
                        if (stops == 0){
                            message = start + " > "+ end;
                        }
                        else{
                            message = start + " > (After " + stops.toString() + " stop(s) ) > "+ end;
                        }

                        return (
                            <div className="row" key={cur_key}>
                                <div className="col">
                                    <div style={{display: "inline-block"}}>
                                        On line: {space}
                                    </div>

                                    <div className="linesquare" style={{background: step.l_color}}>
                                        {line}
                                    </div>
                                    <div style={{display: "inline-block"}}>
                                        {space}
                                    </div>
                                    <div style={{display: "inline-block"}}>
                                        {message}
                                    </div>
                                </div>
                            </div>

                        );
                    }
                    else if(step.type === "change"){
                        var line1 = step.from;
                        var line2 = step.to;
                        var cur_key = this.props.index.toString() + "detailed" + idx.toString();
                        return (
                            <div className="row" key = {cur_key}>
                                <div className="col">
                                    <div style={{display: "inline-block"}}>
                                        Change from:{space}
                                    </div>
                                    <div className="linesquare" style={{background: step.l1_color}}>
                                        {line1}
                                    </div>
                                    <div style={{display: "inline-block"}}> 
                                        {space}To:{space}
                                    </div>
                                    <div className="linesquare" style={{background: step.l2_color}}>
                                        {line2}
                                    </div>
                                </div>
                            </div>
                            //<div key={cur_key} style={{display: 'inline-block'}}>
                                    
                            //</div>
                        );
                    }
                });

                return(
                    <div className="col resultBox" onClick={()=>this.changeView()}>
                            Recommended Route # {(this.props.index + 1)}
                            <div className="col" style={{fontSize: 20}}>
                                {route}
                            </div>
                        
                    </div>
                );
        }

        
    }
}

class Results extends Component{

    render(){
        const cur_res = this.props.result;
        const resBoxes = cur_res.map( (route, index) =>
            <div className="row" key={index.toString()}>
                <ResultBox
                    index={index}
                    route={route}
                />
            </div>
        );
        //console.log((typeof cur_res[0]) !== "undefined");
        if((typeof cur_res[0]) !== "undefined"){
            return(
                <div className="container"> 
                    <p className="h5">
                        Suggested Routes:
                    </p>

                    <div className="container ">
                            {resBoxes}
                    </div>
                </div>
            );
        }
        else{
            return(
                <div>
                </div>
            );
        }
        
    }
}

class App extends Component {
    constructor(props){
        super(props);

        this.state = {
            origin : {
                lat: 0,
                lng: 0,
            },
            destination : {
                lat:0,
                lng:0,
            },
            result: [],
            reslimit: 3,

        };

        this.handleKeyPress = this.handleKeyPress.bind(this);

    }
    componentDidMount() {
        setTimeout(() => {

            //use autocomplete instead to restrict to region of Singapore only
            const { Autocomplete } = window.google.maps.places;

            //restricts any possible autocomplete suggestion to within Singapore only 
            const options = { 
                componentRestrictions: {country: 'sg'}
            };

            var originSearch = new Autocomplete(document.getElementById('origin'), options);
            var destSearch = new Autocomplete(document.getElementById('destination'), options);
            

            // if using Autocomplete API
            originSearch.addListener('place_changed', () => {
                var place = originSearch.getPlace();
                //console.log(place.geometry);
                if (place.geometry === undefined){
                    window.alert("You have entered an invalid location! Please enter suggested location from Autocomplete of Application instead!");
                    return;
                }
                const location = place.geometry.location.toJSON();
                console.log(location);
                
                this.setState({
                    origin: {
                        lat: location.lat,
                        lng: location.lng,
                    }
                });
                

            });

            destSearch.addListener('place_changed', () => {
                var destplace = destSearch.getPlace();
                if (destplace.geometry === undefined){
                    window.alert("You have entered an invalid location! Please enter suggested location from Autocomplete of Application instead!");
                    return;
                }
                const destlocation = destplace.geometry.location.toJSON();
                console.log(destlocation);
                
                this.setState({
                    destination: {
                        lat: destlocation.lat,
                        lng: destlocation.lng,
                    }
                });
                

            });
            
            
            
        }, 100);
        /*
        const mrt_tree = 
        this.setState()
        */
    }

    updateResult(){
        //get current limit set by user and save it to the state of app in next render cycle.;
        var reslimit = parseInt(document.getElementById('resultlimit').value);
        console.log(reslimit);

        if (isNaN(reslimit)) {
            reslimit = 3;        
        }

        this.setState({
            reslimit: reslimit,
        });
        
        const res = findRoutes(this.state.origin, this.state.destination, reslimit);
        console.log("recommended steps", res);
        this.setState({
            origin: this.state.origin,
            destination: this.state.destination,
            result: res
        }, ()=> console.log(this.state));
        
    }

    handleKeyPress(event){
        var input = document.getElementById('resultlimit');

        if(!((event.charCode >= 48 && event.charCode <= 57) || (event.key === 'Enter'))){
            window.alert("Please input numerical value for number of routes!");
            event.preventDefault();
            input.value = "";
        }

        
    }

    render() {

        const result = this.state.result;
        var empty_space = '\u00A0';
        return (
            <div id='app' className="App-container container">
                
                <div className="row h3">
                        MRT Route Finder Application
                </div>
                <Spacer />
                <div className="upperbox container">
                    <div className="row">
                        <div className="col">
                            <div className="row">
                                <Origin />
                            </div>
                            <div className="row">
                                <Destination />
                            </div>
                            <div className="row">
                                <div className="col-5 col-sm-5 col-md-6 col-lg-6">
                                    {empty_space}
                                </div>
                                <div className="col-4 col-sm-5 col-md-4 col-lg-5">
                                    <ResultLimit
                                        onKeyPress={this.handleKeyPress} 
                                    />
                                </div>
                                <div className="col-3 col-sm-2 col-md-2 col-lg-1 ">
                                    <div className="row float-right">
                                            <button type="button" className="btn btn-primary" onClick={() => this.updateResult()}> Search </button>
                                    </div>
                                </div>


                            </div>
                            
                        </div>
                    </div>
                </div>
                <Results
                    result={result}
                />
                <Spacer />
            </div>
        )
    }

}

export default App;
