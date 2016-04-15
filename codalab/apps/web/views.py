import json
from django.views.generic import TemplateView

############################################################
# General: template views


class HomePageView(TemplateView):
    template_name = "web/index.html"


class WorksheetDetailView(TemplateView):
    """
    Show information about a worksheet.
    Displays details of a worksheet.
    """
    template_name = 'web/worksheets/detail.html'


class BundleDetailView(TemplateView):
    """
    Displays details for a bundle.
    """
    template_name = 'web/bundles/detail.html'


class LoginView(TemplateView):
    """
    Login prompt.
    """
    template_name = 'web/account/login.html'


class SignupView(TemplateView):
    """
    Signup prompt.
    """
    template_name = 'web/account/signup.html'


class SignupSuccessView(TemplateView):
    """
    Signup success text.
    """
    template_name = 'web/account/signup_success.html'


class VerifySuccessView(TemplateView):
    """
    Verify success text.
    """
    template_name = 'web/account/verify_success.html'


class VerifyErrorView(TemplateView):
    """
    Verify error text.
    """
    template_name = 'web/account/verify_error.html'


class ProfileView(TemplateView):
    """
    Account profile edit page.
    """
    template_name = 'web/account/profile.html'
