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
