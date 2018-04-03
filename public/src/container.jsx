import React from 'react';
import PropTypes from 'prop-types';

export default class Container extends React.Component {

    render() {
        return this.props.children;
    }
}

Container.childContextTypes = {
    initialState: PropTypes.object,
};

Container.propTypes = {
    children: PropTypes.object.isRequired,
    initialState: PropTypes.object,
};