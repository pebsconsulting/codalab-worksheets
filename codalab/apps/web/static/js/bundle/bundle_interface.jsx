/*
TODO: replace this with WorksheetSidePanel.
*/

var Bundle = React.createClass({
    getInitialState: function(){
        return {
            "data_hash": "",
            "uuid": "",
            "hard_dependencies": [],
            "state": "ready",
            "dependencies": [],
            "host_worksheets": [],
            "group_permissions": [],
            "command": null,
            "bundle_type": "",
            "metadata": {},
            "files": {},
            "fileBrowserData": "",
            "editing": false,
            "edit_permission": false,
            "permission": 0,
            "permission_str": ''
        };
    },
    toggleEditing: function(){
        this.setState({editing: !this.state.editing});
    },
    saveMetadata: function(){
        var new_metadata = this.state.metadata;
        $('#metadata_table input').each(function(){
            var key = $(this).attr('name');
            var val = $(this).val();
            if (val.toLowerCase() === 'true' || val.toLowerCase() === 'false') {
                //  Convert string 'true'/'false' to boolean true/false
                val = (val.toLowerCase() === 'true');
            }
            new_metadata[key] = val;
        });

        console.log('------ save the bundle here ------');
        console.log('new metadata:');
        console.log(new_metadata);
        var postdata = {
            'metadata': new_metadata,
            'uuid': this.state.uuid
        };

        $.ajax({
            type: "POST",
            cache: false,
            //  /api/bundles/0x706<...>d5b66e
            url: "/rest/api" + document.location.pathname,
            contentType:"application/json; charset=utf-8",
            dataType:"json",
            data: JSON.stringify(postdata),
            success: function(data) {
                this.setState(data);
                this.setState({
                     editing:false,
                });
                $("#bundle-message").hide().removeClass('alert-danger alert');
            }.bind(this),
            error: function(xhr, status, err) {
                $("#bundle-message").html(xhr.responseText).addClass('alert-danger alert');
                $("#bundle-message").show();
            }.bind(this)
        });
    },
    componentWillMount: function() {  // once on the page lets get the bundle info
        $.ajax({
            type: "GET",
            //  /api/bundles/0x706<...>d5b66e
            url: "/rest/api" + document.location.pathname,
            dataType: 'json',
            cache: false,
            success: function(data) {
                if(this.isMounted()){
                    this.setState(data);
                }
                $("#bundle-message").hide().removeClass('alert-danger alert');
            }.bind(this),
            error: function(xhr, status, err) {
                $("#bundle-message").html(xhr.responseText).addClass('alert-danger alert');
                $("#bundle-message").show();
                $('#bundle-content').hide();
            }.bind(this)
        });
        $.ajax({
            type: "GET",
            //  /api/bundles/0x706<...>d5b66e
            url: document.location.pathname.replace('/bundles/', '/rest/api/bundles/content/') + '/', //extra slash at end means root dir
            dataType: 'json',
            cache: false,
            success: function(data) {
                console.log(data)
                this.setState({"fileBrowserData": data});
            }.bind(this),
            error: function(xhr, status, err) {
                this.setState({"fileBrowserData": ""});
                $('.bundle-file-view-container').hide();

            }.bind(this)
        });
    },

    render: function() {
        var saveButton;
        var metadata = this.state.metadata;
        var bundle_download_url = "/rest/bundle/" + this.state.uuid + "/contents/blob/";
        var bundleAttrs = [];
        var editing = this.state.editing;
        var tableClassName = 'table' + (editing ? ' editing' : '');
        var editButtonText = editing ? 'cancel' : 'edit';

        if (editing)
            saveButton = <button className="btn btn-success btn-sm" onClick={this.saveMetadata}>save</button>;

        var keys = [];
        for (var property in metadata) {
            if (metadata.hasOwnProperty(property))
                keys.push(property);
        }
        keys.sort();
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            // TODO: only allow editing on certain keys; needs to be passed in from Python.
            bundleAttrs.push(<BundleAttr key={k} index={k} val={metadata[k]} editing={editing} />);
        }

        var dependencies_table = [];
        if (this.state.dependencies.length) {
            this.state.dependencies.forEach(function(dep, i) {
                var dep_bundle_url = "/bundles/" + dep.parent_uuid;
                dependencies_table.push(
                    <tr>
                        <td>
                            {dep.child_path}
                        </td>
                        <td>
                            {dep.parent_name}(<a href={dep_bundle_url}>{dep.parent_uuid}</a>){dep.parent_path ? '/' + dep.parent_path : ''}
                        </td>
                    </tr>
                );
            }) // end of foreach

            var dependencies_html = (
                <div className="row">
                    <div className="col-sm-10">
                        <div className="dependencies-table">
                            <table id="dependencies_table" >
                                <thead>
                                    <tr>
                                        <th>Path</th>
                                        <th>Target</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dependencies_table}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            );
        }

        var stdout_html = '';
        if(this.state.stdout) {
            //had to add span since react elm must be wrapped
            stdout_html = (
                <span>
                    <h3>Stdout</h3>
                    <div className="bundle-meta">
                        <pre>
                            {this.state.stdout}
                        </pre>
                    </div>
                </span>
            );
        }
        var stderr_html = '';
        if(this.state.stderr) {
            //had to add span since react elm must be wrapped
            stderr_html = (
                <span>
                    <h3>Stderr</h3>
                    <div className="bundle-meta">
                        <pre>
                            {this.state.stderr}
                        </pre>
                    </div>
                </span>
            );
        }
        /// ------------------------------------------------------------------
        var fileBrowser = this.state.uuid ? (
                <FileBrowser
                    bundle_uuid={this.state.uuid} />
            ) : null;

        /// ------------------------------------------------------------------
        var edit = ''
        if(this.state.edit_permission){
            edit = (
                <button className="btn btn-primary btn-sm" onClick={this.toggleEditing}>
                    {editButtonText}
                </button>
            )
        }
        /// ------------------------------------------------------------------
        var host_worksheets_html = ''
        if(this.state.host_worksheets.length){
            var host_worksheets_url = ''
            host_worksheets_rows = []
            this.state.host_worksheets.forEach(function(worksheet, i){
                host_worksheets_url = "/worksheets/" + worksheet.uuid;
                host_worksheets_rows.push(
                    <tr>
                        <td>
                            {worksheet.name}
                        </td>
                        <td>
                            <a href={host_worksheets_url}>{worksheet.uuid}</a>
                        </td>
                    </tr>
                );
            }) // end of foreach
            host_worksheets_html = (
                        <div className="row">
                            <div className="col-sm-10">
                                <div className="dependencies-table">
                                    <table id="dependencies_table" >
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>UUID</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {host_worksheets_rows}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
            )
        }

        return (
            <div className="bundle-tile">
                <div className="bundle-header">
                    <div className="row">
                        <div className="col-sm-6">
                            <h2 className="bundle-name bundle-icon-sm bundle-icon-sm-indent">
                                {this.state.metadata.name}
                            </h2>
                            <em> Owner: {this.state.owner_name}</em>
                        </div>
                        <div className="col-sm-6">
                            <a href={bundle_download_url} className="bundle-download btn btn-default btn-sm" alt="Download Bundle">
                                Download <span className="glyphicon glyphicon-download-alt"></span>
                            </a>
                            <div className="bundle-uuid">{this.state.uuid}</div>
                        </div>
                    </div>
                </div>
                <p>
                    {this.state.metadata.description}
                </p>
                    <div className="metadata-table">
                        <table>
                            <tr>
                                <th width="33%">
                                    State
                                </th>
                                <td>
                                    {this.state.state}
                                </td>
                            </tr>
                            <tr>
                                <th width="33%">
                                    Command
                                </th>
                                <td>
                                    {this.state.command || "<none>"}
                                </td>
                            </tr>
                             <tr>
                                <th width="33%">
                                    Data Hash
                                </th>
                                <td>
                                    {this.state.data_hash || "<none>"}
                                </td>
                            </tr>
                        </table>
                    </div>

                {dependencies_html ? <h3> Dependencies</h3> : null}
                {dependencies_html ? dependencies_html : null}

                <div className="row">
                    <div className="col-sm-10">
                        {stdout_html}
                        {stderr_html}
                    </div>
                </div>

                <div className="bundle-file-view-container">
                    {this.state.fileBrowserData.contents ? fileBrowser : null}
                </div>

                <h3>
                    Metadata
                    {edit}
                    {saveButton}
                </h3>
                <div className="row">
                    <div className="col-sm-6">
                        <em>Permission: {this.state.permission_str}</em>
                        <div className="metadata-table">
                            <table id="metadata_table" className={tableClassName}>
                                <tbody>
                                    {bundleAttrs}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {host_worksheets_html ? <h3>Host Worksheets</h3> : null}
                {host_worksheets_html ? host_worksheets_html : null}
            </div>
        );
    }
});

var BundleAttr = React.createClass({
    render: function(){
        var defaultVal = this.props.val;
        if(this.props.index !== 'description' && !this.props.editing){
            return (
                <tr>
                    <th width="33%">
                        {this.props.index}
                    </th>
                    <td>
                        {defaultVal}
                    </td>
                </tr>
            );
        } else if(this.props.editing){
            return (
                <tr>
                    <th width="33%">
                        {this.props.index}
                    </th>
                    <td>
                        <input className="form-control" name={this.props.index} type="text" defaultValue={defaultVal} />
                    </td>
                </tr>
            )
        }else {
            return false;
        }
    }
});


React.render(<Bundle />, document.getElementById('bundle-content'));
