import json

from configurations import importer
if not importer.installed:
    importer.install()

from configurations import Settings
from configurations.utils import uppercase_attributes
import os, sys, pkgutil, subprocess
from os.path import abspath, basename, dirname, join, normpath
import json
import codalab

class Base(Settings):
    # Load config file
    config_path = os.path.join(os.getenv('HOME'), '.codalab', 'website-config.json')
    if not os.path.exists(config_path):
        raise RuntimeError('Configuration file does not exist: %s' % config_path)
    config = json.loads(open(config_path).read())

    SETTINGS_DIR = os.path.dirname(os.path.abspath(__file__))
    PROJECT_APP_DIR = os.path.dirname(SETTINGS_DIR)
    PROJECT_DIR = os.path.dirname(PROJECT_APP_DIR)
    ROOT_DIR = os.path.dirname(PROJECT_DIR)
    DEBUG = False
    TEMPLATE_DEBUG = DEBUG

    COMPILE_LESS = True # less -> css already done (true) or less.js to compile it on render (false)

    LOCAL_MATHJAX = False # see prep_for_offline
    LOCAL_ACE_EDITOR = False # see prep_for_offline

    DOMAIN_NAME = 'localhost'
    SERVER_NAME = os.environ.get('CONFIG_SERVER_NAME', 'localhost')
    PORT = os.environ.get('CONFIG_HTTP_PORT', 8000)
    MAINTENANCE_MODE = os.environ.get('MAINTENANCE_MODE', 0)

    STARTUP_ENV = {
        'DJANGO_CONFIGURATION': os.environ['DJANGO_CONFIGURATION'],
        'DJANGO_SETTINGS_MODULE': os.environ['DJANGO_SETTINGS_MODULE'],
        'NEW_RELIC_CONFIG_FILE': '%s/newrelic.ini' % PROJECT_DIR,
    }

    SSL_PORT = config.get('SSL_PORT')
    SSL_CERTIFICATE = config.get('SSL_CERTIFICATE')
    SSL_CERTIFICATE_KEY = config.get('SSL_CERTIFICATE_KEY')
    SSL_ALLOWED_HOSTS = config.get('SSL_ALLOWED_HOSTS')

    # For config_gen
    CONFIG_GEN_TEMPLATES_DIR = os.path.join(PROJECT_DIR, 'config', 'templates')
    CONFIG_GEN_GENERATED_DIR = os.path.join(PROJECT_DIR, 'config', 'generated')

    DJANGO_ROOT = dirname(dirname(abspath(__file__)))
    SITE_ROOT = dirname(DJANGO_ROOT)

    VIRTUAL_ENV = os.environ.get('VIRTUAL_ENV', None)

    AUTH_USER_MODEL = 'authenz.ClUser'

    # Keep in sync with codalab-cli
    CODALAB_VERSION = '0.1.1'

    BUNDLE_SERVICE_URL = 'http://localhost:2800'
    # Bundle service location.
    # Eventually, want to get rid of this.
    BUNDLE_SERVICE_CODE_PATH = abspath(join(dirname(abspath(__file__)), '..', '..', '..', '..', 'codalab-cli'))
    sys.path.append(BUNDLE_SERVICE_CODE_PATH)
    codalab.__path__ = pkgutil.extend_path(codalab.__path__, codalab.__name__)

    LOGS_PATH = abspath(join(dirname(abspath(__file__)), '..', '..', '..', '..', 'logs'))

    DATABASES = {
        'default': {
            # Default: use sqlite3 (easy but not scalable)
            'ENGINE': 'django.db.backends.sqlite3', # Simple database
            'NAME': 'codalab.sqlite3',              # Path to database file

            # Use MySQL (preferred solution - specify in the config file)
            #'ENGINE': 'django.db.backends.mysql', # Alternatives to 'mysql': 'postgresql_psycopg2', 'mysql', 'oracle'
            #'NAME': 'codalab_website',            # Name of the database.
            #'USER': 'someuser',
            #'PASSWORD': 'somepassword',
            #'HOST': 'someserver',                 # Empty for localhost through domain sockets or '127.0.0.1' for localhost through TCP.
            #'PORT': '',                           # Set to empty string for default.
        }
    }
    if 'database' in config:
        DATABASES['default'] = config['database']

    # For generating OAuth key (see bundle_server_config.json)
    BUNDLE_DB_NAME = config.get('BUNDLE_DB_NAME')
    BUNDLE_DB_USER = config.get('BUNDLE_DB_USER')
    BUNDLE_DB_PASSWORD = config.get('BUNDLE_DB_PASSWORD')
    BUNDLE_AUTH_URL = config.get('BUNDLE_AUTH_URL')

    NEW_RELIC_KEY = config.get('NEW_RELIC_KEY')

    # Hosts/domain names that are valid for this site; required if DEBUG is False
    # See https://docs.djangoproject.com/en/1.5/ref/settings/#allowed-hosts
    ALLOWED_HOSTS = config.get('ALLOWED_HOSTS', [])

    # Email Configuration
    if 'email' in config:
        EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
        EMAIL_HOST = config['email']['host']
        EMAIL_HOST_USER = config['email']['user']
        EMAIL_HOST_PASSWORD = config['email']['password']
        EMAIL_PORT = 587
        EMAIL_USE_TLS = True
        DEFAULT_FROM_EMAIL = 'CodaLab <noreply@codalab.org>'
        SERVER_EMAIL = 'noreply@codalab.org'
    else:
        EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

    ADMINS = []
    if 'django' in config:
        ADMINS.append(('Admin', config['django']['admin-email']))
    MANAGERS = ADMINS

    ############################################################

    # Local time zone for this installation. Choices can be found here:
    # http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
    # although not all choices may be available on all operating systems.
    # In a Windows environment this must be set to your system time zone.
    TIME_ZONE = 'UTC'

    # Language code for this installation. All choices can be found here:
    # http://www.i18nguy.com/unicode/language-identifiers.html
    LANGUAGE_CODE = 'en-us'

    # If you set this to False, Django will make some optimizations so as not
    # to load the internationalization machinery.
    USE_I18N = True

    # If you set this to False, Django will not format dates, numbers and
    # calendars according to the current locale.
    USE_L10N = True

    # If you set this to False, Django will not use timezone-aware datetimes.
    USE_TZ = True

    # Absolute filesystem path to the directory that will hold user-uploaded files.
    # Example: "/var/www/example.com/media/"
    MEDIA_ROOT = os.path.join(PROJECT_DIR, 'media')

    # URL that handles the media served from MEDIA_ROOT. Make sure to use a
    # trailing slash.
    # Examples: "http://example.com/media/", "http://media.example.com/"
    MEDIA_URL = '/media/'

    # Absolute path to the directory static files should be collected to.
    # Don't put anything in this directory yourself; store your static files
    # in apps' "static/" subdirectories and in STATICFILES_DIRS.
    # Example: "/var/www/example.com/static/"
    STATIC_ROOT = os.path.join(PROJECT_DIR, 'static')

    # URL prefix for static files.
    # Example: "http://example.com/static/", "http://static.example.com/"
    STATIC_URL = '/static/'

    # Additional locations of static files
    STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    )

    # List of finder classes that know how to find static files in
    # various locations.
    STATICFILES_FINDERS = (
        'django.contrib.staticfiles.finders.AppDirectoriesFinder',
        'django.contrib.staticfiles.finders.FileSystemFinder',
        #'django.contrib.staticfiles.finders.DefaultStorageFinder',
        'compressor.finders.CompressorFinder',
    )

    # Make this unique, and don't share it with anybody.
    SECRET_KEY = config.get('django', {}).get('secret-key', '+3_81$xxm9@3p5*wo3qpm7-4i2ixc8y4dl7do$p3-y63ynhxob')

    # List of callables that know how to import templates from various sources.
    TEMPLATE_LOADERS = (
        'django.template.loaders.filesystem.Loader',
        'django.template.loaders.app_directories.Loader',
        #'django.template.loaders.eggs.Loader',
    )

    MIDDLEWARE_CLASSES = (
        'django.middleware.common.CommonMiddleware',
        'django.contrib.sessions.middleware.SessionMiddleware',
        'django.middleware.csrf.CsrfViewMiddleware',
        'django.contrib.auth.middleware.AuthenticationMiddleware',
        'django.contrib.messages.middleware.MessageMiddleware',
    )

    ROOT_URLCONF = 'codalab.urls'

    # Python dotted path to the WSGI application used by Django's runserver.
    WSGI_APPLICATION = 'codalab.wsgi.application'

    TEMPLATE_DIRS = (
        # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
        # Always use forward slashes, even on Windows.
        # Don't forget to use absolute paths, not relative paths.
        os.path.join(PROJECT_DIR,'templates'),
    )

    TEMPLATE_CONTEXT_PROCESSORS = Settings.TEMPLATE_CONTEXT_PROCESSORS + (
        "allauth.account.context_processors.account",
        "allauth.socialaccount.context_processors.socialaccount",
        "codalab.context_processors.app_version_proc",
        "apps.web.context_processors.beta",
        "django.core.context_processors.request",
        "codalab.context_processors.common_settings",
    )

    AUTHENTICATION_BACKENDS = (
        "django.contrib.auth.backends.ModelBackend",
        "allauth.account.auth_backends.AuthenticationBackend",
        'guardian.backends.ObjectPermissionBackend',
    )

    INSTALLED_APPS = (
        # Standard django apps
        'django.contrib.auth',
        'django.contrib.contenttypes',
        'django.contrib.sessions',
        'django.contrib.sites',
        'django.contrib.messages',
        'django.contrib.staticfiles',
        'django.contrib.admin',
        'django.contrib.humanize',

        # Analytics app that works with many services - IRJ 2013.7.29
        'analytical',
        'rest_framework',

        # This is used to manage the HTML page hierarchy for the competition
        'mptt',

        # TODO: Document the need for these
        'django_config_gen',
        'compressor',
        'django_js_reverse',
        'guardian',
        'captcha',
        'bootstrapform',

        # Storage API
        'storages',

        # Migration app
        'south',

        # Django Nose !!Important!! This needs to come after South.
        'django_nose',

        # CodaLab apps
        'apps.authenz',
        'apps.api',
        'apps.web',
        'apps.common',

        # Authentication app, enables social authentication
        'allauth',
        'allauth.account',
        'allauth.socialaccount',
        'tinymce',
        'oauth2_provider',

        # Search
        'haystack'
    )

    ACCOUNT_ADAPTER = ("apps.authenz.adapter.CodalabAccountAdapter")

    OPTIONAL_APPS = []
    INTERNAL_IPS = []

    OAUTH2_PROVIDER = {
        'OAUTH2_VALIDATOR_CLASS': 'apps.authenz.oauth.Validator',
        'ACCESS_TOKEN_EXPIRE_SECONDS': 60 * 60 * 24 * 30,  # 30 days
    }

    # Authentication configuration
    LOGIN_REDIRECT_URL = '/'
    ANONYMOUS_USER_ID = -1
    ACCOUNT_AUTHENTICATION_METHOD = 'username_email'
    ACCOUNT_EMAIL_REQUIRED = True
    ACCOUNT_USERNAME_REQUIRED = True
    ACCOUNT_EMAIL_VERIFICATION = 'mandatory'
    ACCOUNT_SIGNUP_FORM_CLASS = 'apps.authenz.forms.CodalabSignupForm'

    # Django Analytical configuration
    #GOOGLE_ANALYTICS_PROPERTY_ID = 'UA-42847758-1'

    # Compress Configuration
    COMPRESS_PRECOMPILERS = (
        ('text/less', 'lessc {infile} {outfile}'),
        ('text/typescript', 'tsc {infile} --out {outfile}'),
    )

    REST_FRAMEWORK = {
        'DEFAULT_RENDERER_CLASSES': (
            'rest_framework.renderers.JSONRenderer',
        ),
    }

    SOUTH_MIGRATION_MODULES = {
        'captcha': 'captcha.south_migrations',
    }

    #HAYSTACK_CONNECTIONS = {
    #    'default': {
    #        'ENGINE': 'haystack.backends.solr_backend.SolrEngine',
    #        'URL': 'http://127.0.0.1:8983/solr'
    #        # ...or for multicore...
    #        # 'URL': 'http://127.0.0.1:8983/solr/mysite',
    #    },
    #}

    HAYSTACK_CONNECTIONS = {
    'default': {
        'ENGINE': 'haystack.backends.simple_backend.SimpleEngine',
        },
    }

    # Added for catching certain parts on competitions side
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
            'LOCATION': '127.0.0.1:11211',
        }
    }

    # A sample logging configuration. The only tangible logging
    # performed by this configuration is to send an email to
    # the site admins on every HTTP 500 error when DEBUG=False.
    # See http://docs.djangoproject.com/en/dev/topics/logging for
    # more details on how to customize your logging configuration.
    LOGGING = {
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'simple': {
                'format': '%(asctime)s %(levelname)s %(message)s'
            },
        },
        'filters': {
            'require_debug_false': {
                '()': 'django.utils.log.RequireDebugFalse'
            }
        },
        'handlers': {
            'console': {
                'level': 'DEBUG',
                'class': 'logging.StreamHandler',
                'formatter': 'simple',
                'stream': sys.stdout
            },
            'mail_admins': {
                'level': 'ERROR',
                'filters': ['require_debug_false'],
                'class': 'django.utils.log.AdminEmailHandler'
            }
        },
        'loggers': {
            'django': {
                'handlers': ['console'],
                'level': 'INFO',
                'propagate': True,
            },
            'django.request': {
                'handlers': ['mail_admins'],
                'level': 'ERROR',
                'propagate': True,
            },
            'codalab': {
                'handlers': ['console'],
                'level': 'INFO'
            },
            'codalabtools': {
                'handlers': ['console'],
                'level': 'INFO'
            },
            'apps': {
                'handlers': ['console'],
                'level': 'INFO'
            }
        }
    }

    @classmethod
    def pre_setup(cls):
        if hasattr(cls,'OPTIONAL_APPS'):
            for a in cls.OPTIONAL_APPS:
                try:
                    __import__(a)
                except ImportError as e:
                    print e
                else:
                    cls.INSTALLED_APPS += (a,)
        if hasattr(cls, 'EXTRA_MIDDLEWARE_CLASSES'):
            cls.MIDDLEWARE_CLASSES += cls.EXTRA_MIDDLEWARE_CLASSES
        cls.STARTUP_ENV.update({ 'CONFIG_HTTP_PORT': cls.PORT,
                                 'CONFIG_SERVER_NAME': cls.SERVER_NAME })
        if cls.SERVER_NAME not in cls.ALLOWED_HOSTS:
            cls.ALLOWED_HOSTS.append(cls.SERVER_NAME)

    @classmethod
    def post_setup(cls):
        if not hasattr(cls,'PORT'):
            raise AttributeError("PORT environmenment variable required")
        if not hasattr(cls,'SERVER_NAME'):
            raise AttributeError("SERVER_NAME environment variable required")

############################################################

class Dev(Base):
    OPTIONAL_APPS = ('debug_toolbar','django_extensions',)
    INTERNAL_IPS = ('127.0.0.1',)
    DEBUG = True
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.dummy.DummyCache',
        }
    }
    # EXTRA_MIDDLEWARE_CLASSES = ('debug_toolbar.middleware.DebugToolbarMiddleware',)
    DEBUG_TOOLBAR_CONFIG = {
        'SHOW_TEMPLATE_CONTEXT': True,
        'ENABLE_STACKTRACES' : True,
    }
    # Increase amount of logging output in Dev mode.
    for logger_name in ('codalab', 'apps'):
        Base.LOGGING['loggers'][logger_name]['level'] = 'DEBUG'

class Prod(Base):
    pass

# Types of deployment
__all__ = ['Dev', 'Prod']
