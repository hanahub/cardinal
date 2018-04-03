import React from 'react';
import {Panel} from 'react-bootstrap';

export default class CollapsiblePanel extends React.Component {

    constructor() {
        super();
        this.state = {
            open: true
        };
    }


    render () {

        const title = (
            <h5 className="panel-title">{this.props.header}</h5>
        );
        const output = this.props.collapsible ? (
            <Panel onClick={()=> this.setState({ open: !this.state.open })}
                   header={title}
                   collapsible
                   expanded={this.state.open}>
                {this.props.children}
            </Panel>
        ) : (<Panel header={title}>{this.props.children}</Panel>);
        return output
    }


}