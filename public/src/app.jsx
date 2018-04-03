import React from 'react';
import ReactDOM from 'react-dom';

import Container from './container.jsx';
import TeamDashBoard from './teamDashBoard.jsx';
import PlayerDashBoard from './playerDashBoard.jsx';
import appRoutes from './appRoutes.jsx';

// import createBrowserHistory from 'history/createBrowserHistory';

// const history = createBrowserHistory();

const App = (props) => (
        <Container>
            {appRoutes}
        </Container>
);


const contentNode = document.getElementById('contents');
ReactDOM.render(<App />, contentNode);

if (module.hot) {
    module.hot.accept();
}