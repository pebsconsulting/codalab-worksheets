from rest_framework import routers

from django.conf.urls import patterns, url
from django.conf import settings

from . import views

router = routers.DefaultRouter(trailing_slash=False)

urlpatterns = router.urls

urlpatterns += (
    url(r'^worksheets/$', views.WorksheetsListApi.as_view(), name='api_worksheets'),
    url(r'^worksheets/add/$', views.WorksheetsAddApi.as_view(), name='api_worksheets_add'),
    url(r'^worksheets/delete/$', views.WorksheetsDeleteApi.as_view(), name='api_worksheets_delete'),
    url(r'^worksheets/search/$', views.WorksheetsSearchApi.as_view(), name='api_worksheet_search'),
    url(r'^worksheets/get_uuid/$', views.WorksheetsGetUUIDApi.as_view(), name='api_worksheet_get_uuid'),
    url(r'^worksheets/bundle_list/$', views.WorksheetsGetBundleListApi.as_view(), name='api_worksheet_bundle_list'),
    url(r'^worksheets/command/$', views.WorksheetsCommandApi.as_view(), name='api_worksheets_command'),
    url(r'^worksheets/(?P<uuid>[A-Za-z0-9]+)/$', views.WorksheetContentApi.as_view(), name='api_worksheet_content'),

    url(r'^bundles/content/(?P<uuid>[A-Za-z0-9]+)/$', views.BundleContentApi.as_view(), name='api_bundle_content'),
    url(r'^bundles/content/(?P<uuid>[A-Za-z0-9]+)/(?P<path>.*)/$', views.BundleContentApi.as_view(), name='api_bundle_content'),
    url(r'^bundles/filecontent/(?P<uuid>[A-Za-z0-9]+)/(?P<path>.*)$', views.BundleFileContentApi.as_view(), name='api_bundle_filecontent'),
    url(r'^bundles/search/$', views.BundleSearchApi.as_view(), name='api_bundle_search'),
    url(r'^bundles/get_uuid/$', views.BundleGetUUIDApi.as_view(), name='api_bundle_get_uuid'),
    url(r'^bundles/upload/$', views.BundleUploadApi.as_view(), name='api_bundle_upload'),
    url(r'^bundles/(?P<uuid>[A-Za-z0-9]+)/$', views.BundleInfoApi.as_view(), name='api_bundle_info'),

    url(r'^chatbox/$', views.ChatBoxApi.as_view(), name='api_chat_box'),
)
