from django.conf.urls import patterns, url
from apps.web import views

urlpatterns = patterns(
    '',
    url(r'login$', views.LoginView.as_view(), name="account_login"),
    url(r'signup$', views.SignupView.as_view(), name="account_signup"),
    url(r'signup/success$', views.SignupSuccessView.as_view(), name="account_signup_success"),
    url(r'verify/success$', views.VerifySuccessView.as_view(), name="account_verify_success"),
    url(r'verify/error$', views.VerifyErrorView.as_view(), name="account_verify_error"),
)
