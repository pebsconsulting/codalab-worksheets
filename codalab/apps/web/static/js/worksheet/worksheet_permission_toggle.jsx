var WorksheetPermissionToggle = React.createClass({
    getInitialState: function() {
        return {};
    },

    render: function() {
        var setPublicPermission = function(e) {

            var newPermissionValue = (e.target.value === 'none') ? 0 : 1;

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
                            id: self.props.ws.uuid,
                          },
                        },
                        group: {
                          data: {
                            type: 'groups',
                            id: data.data.id,
                          },
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
              var bundleJsons = bundleUuids.map(function(elem) {
                return {
                  type: 'bundle-permissions',
                  attributes: {
                    permission: newPermissionValue,
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
            
        }.bind(this);

        var publicGroupHasPermssionFlag = publicGroupHasPermission(this.props.ws);
        var publicClass;
        var privateClass;
        if (publicGroupHasPermssionFlag) {
          publicClass = 'active';
          privateClass = '';
        } else {
          publicClass = '';
          privateClass = 'active';
        }

        var privacyOptions = [
          {
            value: 'read',
            display: 'Public',
          },
          {
            value: 'none',
            display: 'Private',
          },
        ];

        return (
          <span className="select-public edit-features"> 
            <select className="soflow" value={publicGroupPermission(this.props.ws)} onChange={setPublicPermission}>
              {privacyOptions.map(function(elem) {
                return (
                  <option value={elem.value}>{elem.display}</option>
                )
              })}
            </select>
          </span>
        );
    }
});
