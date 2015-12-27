"""
Provide a template to define local configuration settings. Make a copy of this
file named 'local.py' and set appropriate values for the settings.
"""
from base import DevBase
from default import *
from configurations import Settings

import sys
from os.path import dirname, abspath, join
from pkgutil import extend_path
import codalab

class Dev(DevBase):
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

    # Bundle service location.
    BUNDLE_SERVICE_URL = "http://localhost:2800"
    BUNDLE_SERVICE_CODE_PATH = "../../../../codalab-cli/"
    sys.path.append(join(dirname(abspath(__file__)), BUNDLE_SERVICE_CODE_PATH))
    codalab.__path__ = extend_path(codalab.__path__, codalab.__name__)

    DATABASES = {
        'default': {
            # Default: use sqlite3 (easy but not scalable)
            'ENGINE': 'django.db.backends.sqlite3', # Simple database
            'NAME': 'codalab.sqlite3',              # Path to database file

            # Use MySQL (preferred solution)
            #'ENGINE': 'django.db.backends.mysql', # Alternatives to 'mysql': 'postgresql_psycopg2', 'mysql', 'oracle'
            #'NAME': 'codalab_website',            # Name of the database.
            #'USER': 'someuser',
            #'PASSWORD': 'somepassword',
            #'HOST': 'someserver',                 # Empty for localhost through domain sockets or '127.0.0.1' for localhost through TCP.
            #'PORT': '',                           # Set to empty string for default.
        }
    }
