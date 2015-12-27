"""
Defines a context processor which populates the request's context with parameters
controlling the visibility of features on the site pages.
"""
from django.conf import settings

def beta(request):
    return { }
