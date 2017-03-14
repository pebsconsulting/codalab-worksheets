var WorksheetPermissionToggle = React.createClass({
    getInitialState: function() {
        return {
        };
    },

    render: function() {
        // TODO Add code that governs the functionality of the select
        // Uses this.props.ws.info.group_permissions.public --> check if this is right?
      // Hit the API: /rest/api/worksheet-permissions/ with a POST request with the following params:
      // worksheet: UUID, group: UUID, permission: 0, 1, 2
      // TODO refactor into new file or component
        var selectDisplay = function(permission_str) {
            if (permission_str === 'all') {
                return 'All: Everyone can see and change this worksheet';
            } else if (permission_str === 'read') {
                return 'Read: Everyone can see, but not change, this worksheet';
            } else if (permission_str === 'none') {
                return 'None: Not publically viewable';
            } else {
                console.error('Invalid permission: permission string: ' + permission);
                return;
            }
        }.bind(this);

        var publicGroupPermission = function() {
            var info = this.props.ws.info;
            if (info) {
                var group_permissions = info.group_permissions;
                for (var m = 0; m < group_permissions.length; m++) {
                    var group_permission = group_permissions[m];
                    if (group_permission.group_name === 'public') {
                        return group_permission.permission_str;
                    }
                }
                // didn't find the public group in the permissions
                // so permission is 'none'
                return 'none';
            }
            return null;
        }.bind(this);

        var publicGroupHasPermission = function() {
          if (publicGroupPermission() === 'none') {
            return false;
          } else { // 'read' or 'none'
            return true;
          }
        };

        var setPublicPermission = function(e) {
            var getPublicGroupIndex = function(worksheet) {
              var group_permissions = worksheet.info.group_permissions;
              for (var m = 0; m < group_permissions.length; m++) {
                var groupPermission = group_permissions[m];
                if (groupPermission.group_name === 'public') {
                  return m;
                }
              }
              return -1;
            };

            // Since this function is called after the toggle is clicked, the value will be 'on'
            // if the current worksheet permission is 'none'
          /*
            var eventValueToPermissionValue = function(value) {
                if (value === 'on') {
                    return 1;
                } else if (value === 'off') {
                    return 0;
                } else {
                    console.error('Invalid toggle state');
                    return;
                }
            };
            var currentPermissionValue = eventValueToPermissionValue(e.target.value);
            var newPermissionValue = currentPermissionValue == 0 ? 1 : 0;
            */
            var newPermissionValue = getPublicGroupIndex(this.props.ws) === -1 ? 1 : 0;
            e.preventDefault();

            var self = this;

            var first = $.ajax({
              url: '/rest/groups/public',
              type: 'GET',
              contentType: 'application/json',
            });

            var second = first.then(function(data, textStatus, jqXHR) {
              var worksheetData = {
                  data: [{
                      type: 'worksheet-permissions',
                      attributes: {
                        permission: newPermissionValue,
                      },
                      relationships: {
                        worksheet: {
                          data: {
                            type: 'worksheets',
                            id: self.props.ws.uuid
                          }
                        },
                        group: {
                          data: {
                            type: 'groups',
                            id: data.data.id
                          }
                        },
                      },
                  }]
              };
              return $.ajax({
                  url: '/rest/worksheet-permissions',
                  type: 'POST',
                  contentType: 'application/json',
                  data: JSON.stringify(worksheetData),
              });
            });
            
            var third = second.then(function (data, textStatus, jqXHR) {
               // return index of public group, -1 if not present

                var publicGroupIndex = getPublicGroupIndex(self.props.ws);
                if (publicGroupIndex != -1) {
                  // removing public access
                  self.props.removePermission(publicGroupIndex);
                } else {
                  // adding public access
                  self.props.addPermission(data.data[0].relationships.group.data.id, 'public', 1); // 1 is read permission
                }

                var bundleData = {data: []};
                return $.ajax({
                  url: '/rest/bundles?keywords=host_worksheet=' + self.props.ws.uuid,
                  type: 'GET',
                  contentType: 'application/json',
                });
            })
            
            var fourth = $.when(first, third).then(function(resultOne, resultTwo) {
              var dataOne = resultOne[0];
              var dataTwo = resultTwo[0];
              var bundleUuids = [];
              for (var m = 0; m < dataTwo.data.length; m++) {
                var item = dataTwo.data[m];
                // user must have all permission on the bundle to change public group access
                if (item.attributes.permission_spec === 'all') { 
                  bundleUuids.push(item.id);
                }
              }
              // TODO
              var bundleJsons = bundleUuids.map(function(elem) {
                return {
                  type: 'bundle-permissions',
                  attributes: {
                    permission: newPermissionValue
                  },
                  relationships: {
                    bundle: {
                      data: {
                        type: 'bundles',
                        id: elem,
                      },
                    },
                    group: {
                      data: {
                        type: 'groups',
                        id: dataOne.data.id,
                      },
                    },
                  },
                };
              });
              var bundleData = {
                data: bundleJsons
              };
              return $.ajax({
                url: '/rest/bundle-permissions',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(bundleData)
              });
            });
            

//            $.ajax({
//                url: '/rest/worksheet-permissions',
//                type: 'POST',
//                contentType: 'application/json',
//                data: JSON.stringify(worksheetData),
//                success: onSuccess,
//                error: onError,
//            });
        }.bind(this);

        return (
          <span className="select-public"> 
            {publicGroupPermission()}
            Public: {/* TODO should only render this if the user has all privileges on the worksheet*/}
            <label className="switch">
              <input type="checkbox" checked={publicGroupHasPermission()} onChange={setPublicPermission}/>
              <div className={"slider round"}></div>
            </label>
          </span>
        );
    }
});
