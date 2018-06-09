import React from 'react';
import { TabContent,
         TabPane,
         Nav,
         NavItem,
         NavLink,
         Card,
         Button,
         CardTitle,
         CardText,
         Row,
         Col } from 'reactstrap';
import classnames from 'classnames';
import Confirm from "./Confirm.jsx"
import XLSX from 'xlsx';

const getFileRef = (wsRef) => {
  var arr = wsRef.split(":");
  return arr[1];
}

const get_header_row = (sheet) => {
    var headers = [];
    var range = XLSX.utils.decode_range(sheet['!ref']);
    var C, R = range.s.r;
    for(C = range.s.c; C <= range.e.c; ++C) {
        var cell = sheet[XLSX.utils.encode_cell({c:C, r:R})]

        var hdr = "UNKNOWN " + C;
        if(cell && cell.t) hdr = XLSX.utils.format_cell(cell);

        headers.push(hdr);
    }
    return headers;
}

export default class SheetTab extends React.Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.objectCreated = this.objectCreated.bind(this);
    this.state = {
      objects: [],
      activeTab: "1"
    };
  }

componentDidMount(){

  var sheets = this.props.expectedSheets;
  var tabsInfo = sheets.map((sheet) => {
    var name = sheet.name;
    var ws = this.props.wb.Sheets[name];
    ws['!ref'] = sheet.start_cell + ":" + getFileRef(ws['!ref']);
    var headers = get_header_row(ws);
    var columns = sheet.columns
    return {name, ws, columns, headers };
  })
  this.setState({
    tabsInfo
  })
}

  toggle(tab) {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  objectCreated(obj){
    this.state.objects.push(obj);
    if (this.state.objects.length === this.props.expectedSheets.length) {
      this.setState({
        isConfirm: true
      })
    }
  }

  prepareJson(){
    this.props.onCreateObject(this.state.objects)
  }

  render() {
    return (
      <div>
        <Nav tabs>
          {this.state.tabsInfo && this.state.tabsInfo.map((val, index) =>
              (<NavItem key={index}>
                <NavLink
                  className={classnames({ active: this.state.activeTab ===  (index + 1).toString()})}
                  onClick={() => { this.toggle(index.toString()); }}
                >
                  {val.name}
                </NavLink>
              </NavItem>)
            )}

        </Nav>
        <TabContent activeTab={this.state.activeTab}>
          {this.state.tabsInfo && this.state.tabsInfo.map((val, index) =>
            (<TabPane tabId={(index + 1).toString()} key={index}>
                <Confirm  ws={val.ws}
                          availableColumn={val.headers}
                          columns={val.columns}
                          onCreateObject={this.objectCreated}/>
             </TabPane>)
           )}
        </TabContent>
        <Button  onClick={::this.prepareJson} >Confirm</Button>
      </div>
    );
  }
}
