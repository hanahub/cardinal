import React from 'react';
import Loader from 'react-loader-advanced';
import {ClipLoader} from "react-spinners";

class PageLoader extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Loader show={this.props.show}
                    backgroundStyle={{
                        backgroundColor: "#fff",
                        position: "fixed",
                        left: 0,
                        top: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 100,
                        height: "100%",
                        width: "100%"}}
                    message={
                        <ClipLoader
                            className="center"
                            size={45}
                            color={'#F4783B'}
                            loading={true}
                        />
                    }>
                {this.props.children}
            </Loader>
        )
    }
}

export default PageLoader;