from django.conf.urls import patterns, url
from apps.web import views

urlpatterns = patterns(
    '',
    url(r'login$', views.LoginView.as_view(), name="account_login"),
    url(r'signup$', views.SignupView.as_view(), name="account_signup"),
    url(r'signup/success$', views.SignupSuccessView.as_view(), name="account_signup_success"),
    url(r'verify/success$', views.VerifySuccessView.as_view(), name="account_verify_success"),
    url(r'verify/error$', views.VerifyErrorView.as_view(), name="account_verify_error"),
    url(r'reset$', views.ResetView.as_view(), name="account_reset"),
    url(r'reset/sent$', views.ResetSentView.as_view(), name="account_reset_sent"),
    url(r'reset/verified$', views.ResetVerifiedView.as_view(), name="account_reset_verified"),
    url(r'reset/complete$', views.ResetCompleteView.as_view(), name="account_reset_complete"),
    url(r'profile$', views.ProfileView.as_view(), name="account_profile"),
)
