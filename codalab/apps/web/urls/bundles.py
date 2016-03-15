from django.conf.urls import patterns, url
from apps.web import views

urlpatterns = patterns('',
    url(r'^(?P<uuid>[-A-Za-z0-9_]+)/$', views.BundleDetailView.as_view(), name="bundle_detail"),
)
