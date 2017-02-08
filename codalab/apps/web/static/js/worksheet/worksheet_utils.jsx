// See worker.formatting in codalab-cli
function renderDuration(s) {
  // s: number of seconds
  // Return a human-readable string.
  // Example: 100 => "1m40s", 10000 => "2h46m"
  var m = Math.floor(s / 60);
  if (m == 0)
    return s;

  s -= m * 60;
  var h = Math.floor(m / 60);
  if (h == 0)
    return m + 'm' + s + 's';

  m -= h * 60;
  var d = Math.floor(h / 24);
  if (d == 0)
    return h + 'h' + m + 'm';

  h -= d * 24;
  var y = Math.floor(d / 365);
  if (y == 0)
    return d + 'd' + h + 'h';

  d -= y * 365;
  return y + 'y' + d + 'd';
}

function renderSize(size) {
  // size: number of bytes
  // Return a human-readable string.
  var units = ['', 'k', 'm', 'g', 't'];
  for (var i = 0; i < units.length; i++) {
    var unit = units[i];
    if (size < 100 && size !== Math.floor(size))
      return (Math.round(size * 10) / 10.0) + unit;
    if (size < 1024)
      return Math.round(size) + unit;
    size /= 1024.0
  }
}

function render_permissions(state) {
  // Render permissions:
  // - state.permission_str (what user has)
  // - state.group_permissions (what other people have)
  
  function permissionToClass(permission) {
    var mapping = {
      read: 'ws-permission-read',
      all: 'ws-permission-all'
    };

    if (mapping.hasOwnProperty(permission)) {
      return mapping[permission];
    }

    console.error('Invalid permission:', permission);
    return '';
  }

  function wrapPermissionInColorSpan(permission) {
    return (
      <span className={permissionToClass(permission)}>
        {permission}
      </span>
    );
  }

  return (
    <div>
      you({wrapPermissionInColorSpan(state.permission_str)})
      {
        (state.group_permissions || []).map(
          function(perm) {
            return (
              <span>
                {' ' + perm.group_name}({wrapPermissionInColorSpan(perm.permission_str)})
              </span>
            );
          }
        )
      }
    </div>
  );
}

function shorten_uuid(uuid) {
  return uuid.slice(0, 8);
}

function keepPosInView(pos) {
  var navbarHeight = parseInt($('body').css('padding-top'));
  var viewportHeight = Math.max($(".ws-container").innerHeight() || 0);

  // How far is the pos from top of viewport?
  var distanceFromTopViewPort = pos - navbarHeight;

  if (distanceFromTopViewPort < 0 || distanceFromTopViewPort > viewportHeight * 0.8) {
    // If pos is off the top of the screen or it is more than 80% down the screen,
    // then scroll so that it is at 25% down the screen.
    // Where is the top of the element on the page and does it fit in the
    // the upper fourth of the page?
    var scrollTo = $(".ws-container").scrollTop() + pos - navbarHeight - (viewportHeight * 0.25);
    $(".ws-container").stop(true).animate({scrollTop: scrollTo}, 50);
  }
}

// Whether an interpreted item changed - used in shouldComponentUpdate.
function worksheetItemPropsChanged(props, nextProps) {
  /*console.log('worksheetItemPropsChanged',
      props.active != nextProps.active,
      props.focused != nextProps.focused,
      props.subFocusIndex != nextProps.subFocusIndex,
      props.version != nextProps.version);*/
  return props.active != nextProps.active ||
         props.focused != nextProps.focused ||
         (nextProps.focused && props.subFocusIndex != nextProps.subFocusIndex) ||
         props.version != nextProps.version;
}

// given an array of arguments, return a shell-safe command
function buildTerminalCommand(args) {
  var ret = [];
  args.forEach(function(s) {
    if (/[^A-Za-z0-9_\/:=-]/.test(s)) {
      s = "'"+s.replace(/'/g,"'\\''") + "'";
      s = s.replace(/^(?:'')+/g, '') // unduplicate single-quote at the beginning
           .replace(/\\'''/g, "\\'" ); // remove non-escaped single-quote if there are enclosed between 2 escaped
    }
    ret.push(s);
  });
  return ret.join(' ');
}

function createAlertText(requestURL, responseText, solution) {
  var alertText = "request failed: " + requestURL;
  if (responseText) {
    alertText += "\n\nserver response: " + responseText;
  }
  if (solution) {
    alertText += "\n\npotential solution: " + solution;
  }
  return alertText;
}


// the five functions below are used for uplading files on the web. Some of them are the same as some functions on the CLI.
const ARCHIVE_EXTS = ['.tar.gz', '.tgz', '.tar.bz2', '.zip', '.gz'];
const NOT_NAME_CHAR_REGEX = /[^a-zA-Z0-9_\.\-]/ig;
const BEGIN_NAME_REGEX = /[a-zA-Z_]/ig;

// same as shorten_name in /lib/spec_util.py
function shortenName(name) {
  if (name.length <= 32) {
    return name;
  } else {
    return name.substring(0, 15) + '..' + name.substring(name.length-15);
  }
}

// same as path_is_archive in /lib/zip_util.py
function pathIsArchive(name) {
  for (var i = 0; i < ARCHIVE_EXTS.length; i++) {
    if (name.endsWith(ARCHIVE_EXTS[i])) {
      return true;
    }
  }
  return false;
}

// same as strip_archive_ext in /lib/zip_util.py
function stripArchiveExt(name) {
  for (var i = 0; i < ARCHIVE_EXTS.length; i++) {
    if (name.endsWith(ARCHIVE_EXTS[i])) {
      return name.substring(0, name.length - ARCHIVE_EXTS[i].length);
    }
  }
  return name;
}

function getArchiveExt(name) {
  for (var i = 0; i < ARCHIVE_EXTS.length; i++) {
    if (name.endsWith(ARCHIVE_EXTS[i])) {
      return name.substring(name.length - ARCHIVE_EXTS[i].length);
    }
  }
  return "";
}

// same as create_default_name in /lib/spec_util.py
function createDefaultBundleName(name) {
  name = stripArchiveExt(name);
  name = name.replace(NOT_NAME_CHAR_REGEX, '-');
  name = name.replace(/\-+/ig, '-'); // Collapse '---' => '-'
  var beginChar = name.charAt(0);
  if (!beginChar.match(BEGIN_NAME_REGEX)) {
    name = '_' + name;
  }
  name = shortenName(name);
  return name;
}

function getDefaultBundleMetadata(name) {
  return {
    "data": [
      {
        "attributes": {
          "bundle_type": "dataset",
          "metadata": {
            "description": "",
            "license": "",
            "name": createDefaultBundleName(name),
            "source_url": "",
            "tags": []
          }
        },
        "type": "bundles"
      }
    ]
  };
}
