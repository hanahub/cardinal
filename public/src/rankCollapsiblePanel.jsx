import React from 'react';
import CollapsiblePanel from './collapsiblePanel.jsx';
import ProgressBar from 'react-progressbar.js';

export default class RankCollapsiblePanel extends React.Component {
    constructor () {
        super()
    }

    render () {

        const options = {
            strokeWidth: 10,
            color: this.props.color,
            trailColor: '#eee',
            trailWidth: 10,
            easing: 'easeInOut',
            duration: 1400,
            svgStyle: null,
            text: {
                value: '',
                alignToBottom: true
            },
        };

        const containerStyle = {
            padding: '0 5px 0px 5px',
            margin: '11.486% auto',
            width: '100%'
        };

        return (
            <CollapsiblePanel collapsible={true} header={this.props.header}>
                <ProgressBar.SemiCircle
                    progress={this.props.reverseRank ? (this.props.total - this.props.rank) / this.props.total : this.props.rank / this.props.total}
                    text={this.props.rank + ' / ' + this.props.total}
                    options={options}
                    containerStyle={containerStyle}
                    initialAnimate={true} />
            </CollapsiblePanel>
        )

    }

}
