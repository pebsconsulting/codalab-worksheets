from django.conf import settings
from django.conf.urls import patterns, include, url
from django.contrib.sites.models import Site
from django.views.generic import TemplateView, RedirectView
from django.contrib import admin

from .. import views

urlpatterns = patterns('',
    url(r'^$', views.HomePageView.as_view(), name='home'),
    url(r'^worksheets/', include('apps.web.urls.worksheets')),
    url(r'^bundles/', include('apps.web.urls.bundles')),
    url(r'^account/', include('apps.web.urls.account')),
)
