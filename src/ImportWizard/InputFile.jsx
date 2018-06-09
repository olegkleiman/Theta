import React from 'react';
import XLSX from 'xlsx';
import * as firebase from 'firebase';
import {Button} from 'reactstrap';

// const getFileRef = (wsRef) => {
//   var arr = wsRef.split(":");
//   return arr[1];
// }

// const get_header_row = (sheet) => {
//     var headers = [];
//     var range = XLSX.utils.decode_range(sheet['!ref']);
//     var C, R = range.s.r;
//     for(C = range.s.c; C <= range.e.c; ++C) {
//         var cell = sheet[XLSX.utils.encode_cell({c:C, r:R})]
//
//         var hdr = "UNKNOWN " + C;
//         if(cell && cell.t) hdr = XLSX.utils.format_cell(cell);
//
//         headers.push(hdr);
//     }
//     return headers;
// }

class InputFile extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      files:[]
    }
    this.id=0;
  }

  // componentDidMount() {
  //
  //   this.setState({
  //     storageRef: firebase.storage().ref(),
  //     dbRef:  firebase.firestore().collection(" ument_types")
  //
  //   });
  // }

  fileSelected = (event) => {
      event.preventDefault()
      let filesAdded = event.dataTransfer ? event.dataTransfer.files : event.target.files
      if (this.props.multiple === false && filesAdded.length > 1) {
        filesAdded = [filesAdded[0]]
      }

      let files = []
      for (let i = 0; i < filesAdded.length; i++) {
        let file = filesAdded[i]
        file.id = 'files-' + this.id++
        file.extension = this.fileExtension(file)
        file.sizeReadable = this.fileSizeReadable(file.size)
        if (file.type && this.mimeTypeLeft(file.type) === 'image') {
          file.preview = {
            type: 'image',
            url: window.URL.createObjectURL(file)
          }
        } else {
          file.preview = {
            type: 'file'
          }
        }
        if (this.state.files.length + files.length >= this.props.maxFiles) {
          this.onError({
            code: 4,
            message: 'maximum file count reached'
          }, file)
          break
        }
          files.push(file)
      }
      this.setState({
        files: this.props.multiple === false
          ? files
          : [...this.state.files, ...files]
      }, () => {
        var self = this
        var files = this.state.files;
        if (!files || files.length == 0) return;
        var fileReader = new FileReader();
        fileReader.onload = function (e) {
          var filename = files[0].name;
          var binary = "";
          var bytes = new Uint8Array(e.target.result);
          var length = bytes.byteLength;
          for (var i = 0; i < length; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          var wb = XLSX.read(binary, {type: 'binary', cellDates:true});
          // var ws = wb.Sheets[wb.SheetNames[0]];
          // ws['!ref'] = self.props.doc.metadata.start_cell + ":" + getFileRef(ws['!ref']);
          // var header = get_header_row(ws);

          self.setState({
            wb: wb,
            // header: header
          },() =>{
            self.updateParent();
          })
        };
        fileReader.readAsArrayBuffer(files[0]);
      })
    }

    fileExtension (file) {
      let extensionSplit = file.name.split('.')
      if (extensionSplit.length > 1) {
        return extensionSplit[extensionSplit.length - 1]
      } else {
        return 'none'
      }
    }

    filesRemoveOne (fileToRemove) {
      this.setState({
        files: this.state.files.filter(file => file.id !== fileToRemove.id)
      }, () => {
        //this.props.onChange.call(this, this.state.files)
      })
    }

    removeFiles () {
      this.setState({
        files: []
      }, () => {
        //this.props.onChange.call(this, this.state.files)
      })
    }
    fileSizeReadable (size) {
      if (size >= 1000000000) {
        return Math.ceil(size / 1000000000) + 'GB'
      } else if (size >= 1000000) {
        return Math.ceil(size / 1000000) + 'MB'
      } else if (size >= 1000) {
        return Math.ceil(size / 1000) + 'kB'
      } else {
        return Math.ceil(size) + 'B'
      }
    }

    mimeTypeLeft (mime) {
      return mime.split('/')[0]
    }

    fileSizeAcceptable (file) {
  if (file.size > this.props.maxFileSize) {
    this.onError({
      code: 2,
      message: file.name + ' is too large'
    }, file)
    return false
  } else if (file.size < this.props.minFileSize) {
    this.onError({
      code: 3,
      message: file.name + ' is too small'
    }, file)
    return false
  } else {
    return true
  }
}
  updateParent(){
    this.props.onChange(this.state.files, this.state.wb/*, this.state.header*/)
  }
  render()
  {
    return (<div>
                <input type='file'onChange={this.fileSelected}
                                   accept={this.props.doc.metadata.contentType}/>


                 {
                   this.state.files.length > 0
                   ? <div className='files-list'>
                     <ul>{this.state.files.map((file) =>
                       <li className='files-list-item' key={file.id}>
                         <div className='files-list-item-preview'>
                           {file.preview.type === 'image'
                           ? <img className='files-list-item-preview-image' src={file.preview.url} />
                           : <div className='files-list-item-preview-extension'>{file.extension}</div>}
                         </div>
                         <div className='files-list-item-content'>
                           <div className='files-list-item-content-item files-list-item-content-item-1'>{file.name}</div>
                           <div className='files-list-item-content-item files-list-item-content-item-2'>{file.sizeReadable}</div>
                         </div>
                         <div
                           id={file.id}
                           className='files-list-item-remove'
                           onClick={this.filesRemoveOne.bind(this, file)}
                         />
                       </li>
                     )}</ul>
                   </div>
                   : null
                 }
            </div>)
  }
}

export default InputFile
