import React from 'react';
import ReactTable from 'react-table';
import XLSX from 'xlsx';

const getObject = (sheet, row) => {
	var H = [];
	Object.keys(row).forEach((h) => {
    if (h != 'id') {
  		if(!row.hasOwnProperty(h)) return;
  		H[+row[h]] = h;
    }
	});
	var s2jopts = {
		range: XLSX.utils.decode_range(sheet['!ref']),
		header:H
	};
  // s2jopts.s.r++
	var json = XLSX.utils.sheet_to_json(sheet, s2jopts);

	return json;

}


const CommandButton = ({
  onExecute, icon, text, hint, color,
}) => (
  <button
    className="btn btn-link"
    style={{ padding: 11 }}
    onClick={(e) => {
      onExecute();
      e.stopPropagation();
    }}
    title={hint}
  >
    <span className={color || 'undefined'}>
      {icon ? <i className={`oi oi-${icon}`} style={{ marginRight: text ? 5 : 0 }} /> : null}
      {text}
    </span>
  </button>
);

const commandComponentProps = {
  edit: {
    icon: 'pencil',
    hint: 'Edit row',
    color: 'text-warning',
  },
  commit: {
    icon: 'check',
    hint: 'Save changes',
    color: 'text-success',
  },
  cancel: {
    icon: 'x',
    hint: 'Cancel changes',
    color: 'text-danger',
  },
};
const getRowId = row => row.id;
const Command = ({ id, onExecute }) => (
  <CommandButton
    {...commandComponentProps[id]}
    onExecute={onExecute}
  />
);



export default class Confirm extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      rows:[],
      rowChanges: {},

    };


    this.changeRowChanges = rowChanges => this.setState({ rowChanges });
    this.commitChanges = ({changed }) => {
      let { rows } = this.state;
      if (changed) {
        rows = rows.map(row => (changed[row.id] ? { ...row, ...changed[row.id] } : row));
      }
      this.setState({ rows });
    };
  }

  componentDidMount() {
    if (this.state.rows.length == 0) {
      var row = {};
      row["id"] = 123;
      var findAll = true;
      this.props.columns.forEach( col => {
        var i = this.props.availableColumn.indexOf(col.title);
        if (i != -1) {
          row[col.name] = i;
        }
        else {
          row[col.name] = '';
          findAll = false;
        }
      })
      var func = null;
      if (findAll) {
        func = () => { this.prepareJson(); };
      }
      this.setState({
        rows: [row]
      }, func);
    }
  }

  Cell = (props) => {
    let {value} = props
    let style = (value === '') ? {'background-color': "red"}: null;
    return <Table.Cell  {...props} value={this.props.availableColumn[value]} />;
  };

  EditCell = ({column, value, onValueChange,}) => {
    var availableColumnValues = this.props.availableColumn;
    return <td
      style={{
        verticalAlign: 'middle',
        padding: 1,
      }}
    >
      <select
        className="form-control"
        style={{ width: '100%', textAlign: column.align }}
        value={value}
        onChange={e => onValueChange(e.target.value)}
      >
        {availableColumnValues.map((val, index) => <option key={index} value={index}>{val}</option>)}
      </select>
    </td>
  };

  prepareJson(){
    var row = this.state.rows[0];
    var jsonObs = getObject(this.props.ws, row)
    this.props.onCreateObject(jsonObs);
  }

  render() {
    const { rows, rowChanges } = this.state;

    return (
      <Card>
        <ReactTable
          data={rows}
          columns={this.props.columns}
          />
      </Card>
    );
  }
}
