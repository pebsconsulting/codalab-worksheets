from django.conf.urls import patterns, include, url
from django.contrib.auth.decorators import login_required

from apps.web import views

urlpatterns = patterns(
    '',
    # User settings
    url(r'^settings/', views.UserSettingsView.as_view(), name='user_settings')
)
