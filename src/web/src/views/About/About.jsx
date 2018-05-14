import React from "react";
//import { Grid } from "material-ui";

//import { RegularCard, Table, ItemGrid } from "components";

class About extends React.Component {
    render() {
        return (
            <div>
                <div>
                    Full Cycle Mining Controller
                </div>
                <div>
                    Source code is at <a target="_blank" rel="noopener noreferrer" href="http://github.com/dfoderick/fullcycle.git">GitHub</a>
                </div>
                <div>
                    Project page <a target="_blank" rel="noopener noreferrer" href="https://dfoderick.github.io/fullcycle/">GitHub</a>
                </div>
                <div>
                    <a target="_blank" rel="noopener noreferrer" href="https://github.com/dfoderick/fullcycle/wiki">Wiki</a>
                </div>
                <div>
                    Author David Foderick dfoderick@gmail.com
                </div>

                <div>
                    Dashboard theme provided by Creative Tim
                </div>
                <p>
                <span>
                    &copy; {1900 + new Date().getYear()}{" "}
                    <a href="http://www.creative-tim.com" >
                    Creative Tim
                    </a>, made with love for a better web
                </span>
                </p>


            </div>
        );
    }    
}

export default About;
