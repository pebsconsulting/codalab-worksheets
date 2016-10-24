const PROGRESS_BAR_ID = "progressbar-";
const PROGRESS_LABEL_ID = "progressbar-label-";
var BundleUploader = React.createClass({
  getInitialState: function() {
    // Maintain a table of the currently uploading bundles.
    // The `uploading` table maps from arbitrary string keys to Web API File objects.
    return {
      uploading: {}
    };
  },
  addUploading: function(file, bundleUuid) {
    // Append new file to table of uploading bundles
    var key = String(Math.floor(Math.random() * 10000000));
    var entry = {};
    entry[key] = {
      'file': file,
      'uuid': bundleUuid
    };
    this.setState({uploading: _.extend(entry, this.state.uploading)});
    return key;
  },
  clearUploading: function(key) {
    // Delete entry from table of uploading bundles
    var newUploading = _.clone(this.state.uploading);
    delete newUploading[key];
    this.setState({uploading: newUploading});
  },
  updateProgress:function(key, newProgress) {
    var newUploading = _.clone(this.state.uploading);
    newUploading[key].progress = newProgress;
    this.setState({uploading: newUploading});
  },
  getQueryParams: function(filename) {
    var formattedFilename = createDefaultBundleName(filename);
    var queryParams = {
      'finalize': 1,
      'filename': pathIsArchive(filename) ? formattedFilename + getArchiveExt(filename) : formattedFilename,
      'unpack': pathIsArchive(filename) ? 1 : 0,
    }
    return $.param(queryParams);
  },
  uploadBundle: function (e) {
    e.stopPropagation();
    e.preventDefault();
    $(this.refs.button.getDOMNode()).blur();

    var file = this.refs.fileDialog.getDOMNode().files[0];
    if (!file) {
      return;
    }
    this.refs.fileDialog.getDOMNode().value = null;
    var createBundleData = getDefaultBundleMetadata(file.name);
    var self = this;
    $.ajax({
      url: '/rest/bundles?worksheet=' + this.props.ws.info.uuid,
      data: JSON.stringify(createBundleData),
      contentType: 'application/json',
      type: 'POST',
      success: function (data, status, jqXHR) {
        var bundleUuid = data.data[0].id;
        var fileEntryKey = this.addUploading(file.name, bundleUuid);
        var progressbar = $("#" + PROGRESS_BAR_ID + bundleUuid);
        var progressLabel = $("#" + PROGRESS_LABEL_ID + bundleUuid);
        progressbar.progressbar({
          value: 0,
          max: 100,
          create: function() {
            progressLabel.text("Uploading " + file.name + ".\n" + "0% completed.");
          },
          change: function() {
            progressLabel.text("Uploading " + file.name + ".\n" + progressbar.progressbar("value") + "% completed.");
          },
          complete: function() {
            progressLabel.text("Waiting for server to finish processing bundle.");
          }
        });
        var reader = new FileReader();
        reader.onload = function() {
          var arrayBuffer = this.result,
              bytesArray = new Uint8Array(arrayBuffer);
          var url = '/rest/bundles/' + bundleUuid + '/contents/blob/?' + self.getQueryParams(file.name);
          $.ajax({
             url: url,
             type: 'PUT',
             contentType: 'application/octet-stream',
             data: new Blob([bytesArray]),
             processData: false,
             xhr: function() {
               var xhr = new window.XMLHttpRequest();
               xhr.upload.addEventListener("progress", function(evt) {
                 if (evt.lengthComputable) {
                   var percentComplete = parseInt(evt.loaded / evt.total * 100);
                   progressbar.progressbar("value", percentComplete);
                 }
               }, false);
               return xhr;
             },
             success: function (data, status, jqXHR) {
               self.clearUploading(fileEntryKey);
               self.props.refreshWorksheet();
             },
             error: function (jqHXR, status, error) {
               self.clearUploading(fileEntryKey);
               alert(createAlertText(this.url, jqHXR.responseText, "refresh and try again."));
             }
          });
        }
        reader.readAsArrayBuffer(file);
      }.bind(this),
      error: function (jqHXR, status, error) {
        alert(createAlertText(this.url, jqHXR.responseText));
      }.bind(this)
    });
  },
  openFileDialog: function (e) {
    e.stopPropagation();
    e.preventDefault();

    // Artificially "clicks" on the hidden file input element.
    $(this.refs.fileDialog.getDOMNode()).trigger('click');
  },
  render: function () {
    var uploadButton = (
      <Button
        text='Upload'
        type='primary'
        handleClick={this.openFileDialog}
        className="active"
        id="upload-bundle-button"
        ref="button"
        flexibleSize={true}
      />
    );
    return (
      <div className='inline-block'>
        {uploadButton}
        <div id="bundle-upload-form" tabIndex="-1" aria-hidden="true">
          <form name="uploadForm" encType="multipart/form-data" method="post">
            <input id="uploadInput" type="file" ref="fileDialog" name="file" onChange={this.uploadBundle} />
          </form>
        </div>

        <div id="bundle-upload-progress-bars">
          {_.mapObject(this.state.uploading, function(value, key) {
            var bundleUuid = value.uuid;
            return (
              <div id={PROGRESS_BAR_ID + bundleUuid} className='progressbar'><div id={PROGRESS_LABEL_ID + bundleUuid} className='progress-label'></div></div>
            );
          })}
        </div>

      </div>
    );
  }
});
