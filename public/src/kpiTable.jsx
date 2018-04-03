import React from 'react';
import ReactTable from 'react-table';
import {CSVLink} from 'react-csv';
import {Row, Col} from 'react-bootstrap';

const stringCol = ['Player', 'Team', 'Season', 'Game Date', 'Location', 'Opponent', 'Result'];

export default class KpiTable extends React.Component {
    constructor () {
        super();
    }

    getRegularHeaders(colNames, showHeaderFlag) {
        return colNames.map(
            key => {
                let res =
                    {
                        'Header': showHeaderFlag ? key : '',
                        'accessor': key,
                        'headerClassName': "panel-title",
                        'style': {textAlign: 'center'},
                        'Cell': row => (
                            <span style={{
                                fontSize: 14}}>
                                {row.value}
                            </span>
                        ),

                    };

                if (!stringCol.includes(key)) {
                    res.sortMethod = (a, b) => {
                        if (!a) a = 0;
                        if (!b) b = 0;
                        return Number.parseFloat(a) > Number.parseFloat(b) ? 1 : -1;
                    };
                }

                return res;}
        )
    }

    render() {
        const headers = this.props.colNames ? this.getRegularHeaders(this.props.colNames, true) : [];

        const coloredHeaders = this.props.colorEncodedColNames ? this.props.colorEncodedColNames.map(
            key => (
                {
                'Header': key,
                'accessor': key,
                'headerClassName': "panel-title",
                'style': {textAlign: 'center'},
                    'sortMethod': (a, b) => {
                        if (!a) a = 0;
                        if (!b) b = 0;
                        return Number.parseFloat(a) > Number.parseFloat(b) ? 1 : -1;
                    },
                'Cell': row => (
                    <span style={{
                        color: row.original[key + ' Color'] ? row.original[key + ' Color'] : 'black',
                        fontWeight: (!row.original[key + ' Color'] || row.original[key + ' Color'] === 'black') ? 'normal' : 'bold',
                        fontSize: (!row.original[key + ' Color'] || row.original[key + ' Color'] === 'black') ? 14 : 16}}>
                        {row.value}
                    </span>
                ),

            })
        ) : [];

        const coloredCellHeaders = this.props.cellColorEncodedColNames ? this.props.cellColorEncodedColNames.map(
            key => (
                {
                    'Header': key,
                    'accessor': key,
                    'headerClassName': "panel-title",
                    'style': {textAlign: 'center'},
                    'sortMethod': (a, b) => {
                        if (!a) a = 0;
                        if (!b) b = 0;
                        return Number.parseFloat(a) > Number.parseFloat(b) ? 1 : -1;
                    },
                    'Cell': row => (
                        <div style={{
                            backgroundColor: row.original[key + ' Color'] === -1 ?
                                null : 'rgba(254, 67, 101, ' + row.original[key + ' Color'] + ')'}}>
                        {row.value ? row.value : ''}
                    </div>
                    ),
                    

                })
        ) : [];


        return (

            <div>
                <Row className="btn-panel-single">
                    <CSVLink data={this.props.exportData ? this.props.exportData : this.props.data}
                             filename={this.props.csvFileName}
                             className="btn btn-panel btn-cardinal-orange"
                             target="_blank">CSV</CSVLink>

                    {this.props.exportedQuarterData ?
                        <CSVLink data={this.props.exportedQuarterData ? this.props.exportedQuarterData : [{}]}
                                 filename={this.props.subTableFileName}
                                 className="btn btn-panel btn-cardinal-orange"
                                 target="_blank">Quarter CSV</CSVLink> : null

                    }
                </Row>
                <ReactTable
                    data={this.props.data}
                    showPaginationBottom={true}
                    columns={headers.concat(coloredHeaders).concat(coloredCellHeaders)}
                    defaultPageSize={this.props.defaultPageSize ? this.props.defaultPageSize : 15}
                    showPagination={this.props.showPagination}
                    pageSizeOptions={[5, 10, 15, 20, 25, 50, 100]}
                    className="-striped -highlight"
                    defaultSorted={this.props.defaultSortId ? [
                        {
                            id: this.props.defaultSortId,
                            desc: true
                        }
                    ] : []}
                    noDataText="data not found"
                    SubComponent={this.props.subTables ? row => {

                        let subTableData = this.props.subTables[row.original['Game Date']];
                        let cols = Object.keys(subTableData[0]);
                        return (
                            <div className="margin-bottom-10px">
                                <ReactTable
                                    data={subTableData}
                                    showPaginationBottom={false}
                                    defaultPageSize={subTableData.length}
                                    showPagination={false}
                                    columns={this.getRegularHeaders(cols, false)}
                                    noDataText="quarter level data not found"
                                    SubComponent={row => {return 'Quarter-level data for Period ' + row.original['Period']}}
                                />
                            </div>

                        )
                    } : null}
                />
            </div>


        )
    }
}