from django.conf.urls import patterns
from django.conf.urls import url

from .. import views

urlpatterns = patterns('',
    url(r'^(?P<uuid>[A-Za-z0-9]+)/$', views.WorksheetDetailView.as_view(), name='ws_view'),
)
