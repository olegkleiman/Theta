import React from "react";
import * as firebase from 'firebase';
import { Button, Alert, Progress } from 'reactstrap';


class ConfirmAndUpload extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      uploading: false,
      validating: false,
      uploadMessage: undefined,
      validationMessage: undefined,
      uploadPercent: 0,
      validationPercent:0,
      downloadURL: ""
    }
  }

  componentDidMount() {
    this.setState({
      storageRef: firebase.storage().ref()

    });
  }


  uploadFile =(e) =>{
      var self = this
      var uploadTask = this.state.storageRef.child('images/' + this.props.file.name).put(this.props.file, this.props.metadata);
      // Listen for state changes, errors, and completion of the upload.
      uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, // or 'state_changed'
        function(snapshot) {
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case firebase.storage.TaskState.PAUSED: // or 'paused'
              console.log('Upload is paused');
              self.setState({
                uploadPercent: progress,
                uploadMessage: "Upload is paused"
              })
              break;
            case firebase.storage.TaskState.RUNNING: // or 'running'
              console.log('Upload is running');
              self.setState({
                uploadPercent: progress,
                uploadMessage: "Upload is running"
              })
              break;
          }
          if (progress - self.state.uploadPercent > 5) {
            self.setState({
              uploadPercent: progress
            })
          }
        }, function(error) {


        switch (error.code) {
          case 'storage/unauthorized':
            console.log('unauthorized');
            self.setState({
              uploadPercent: 0,
              uploading: false,
              uploadMessage: "unauthorized"
            })
            break;

          case 'storage/canceled':
            console.log('canceled');
            self.setState({
              uploadPercent: 0,
              uploading: false,
              uploadMessage: "canceled"
            })
            break;

          case 'storage/unknown':
            console.log('Unknown error');
            self.setState({
              uploadPercent: 0,
              uploading: false,
              uploadMessage: "unknown"
            })
            break;
        }
        self.setState({
          uploadPercent: 0,
          uploading: false
        })
      }, function() {
        self.setState({
          validating: true,
          downloadURL: uploadTask.snapshot.downloadURL,
          uploading: 100,
          uploadMessage: "Upload completed successfully"
        })
      })
      this.setState({
        uploadPercent: 0,
        uploading: true
      });
  }

  handleRequestClose = () =>{
    this.setState({
      uploadMessage: undefined
    })
  }

  validateFile = () => {

  }
  render()
  {
    return (<div>
              <Button onClick={::this.uploadFile}>Upload</Button>
                {this.state.uploadMessage && <div>
                  <Alert color="success">
                     {this.state.uploadMessage}
                   </Alert>
                </div>}
                {this.state.uploading && <div>
                                <Progress animated color="success" value={this.state.uploadPercent} />
                              </div>}
                {this.state.validationMessage && <div>
                  <Alert color="success">
                     {this.state.validationMessage}
                   </Alert>
                </div>}
                {this.state.validating && <div>
                                <Progress animated color="success" value={this.state.validationPercent} />
                              </div>}
            </div>)
  }
}


export default ConfirmAndUpload
