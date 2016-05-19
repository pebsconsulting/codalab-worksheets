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


class ResetView(TemplateView):
    """
    Request password reset.
    """
    template_name = 'web/account/reset.html'


class ResetSentView(TemplateView):
    """
    Password reset sent message.
    """
    template_name = 'web/account/reset_sent.html'


class ResetVerifiedView(TemplateView):
    """
    Password reset form after reset code is verified.
    """
    template_name = 'web/account/reset_verified.html'


class ResetCompleteView(TemplateView):
    """
    Password reset complete message.
    """
    template_name = 'web/account/reset_complete.html'


class ChangeEmailView(TemplateView):
    """
    Request email change.
    """
    template_name = 'web/account/changeemail.html'


class ChangeEmailSentView(TemplateView):
    """
    Email change verification sent message.
    """
    template_name = 'web/account/changeemail_sent.html'


class ProfileView(TemplateView):
    """
    Account profile edit page.
    """
    template_name = 'web/account/profile.html'
