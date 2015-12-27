import csv
import datetime
import json
import mimetypes
import os
import StringIO
import sys
import traceback
import yaml
import zipfile

from os.path import splitext

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.contrib.sites.models import Site
from django.core.cache import cache
from django.core.exceptions import ImproperlyConfigured
from django.core.exceptions import ObjectDoesNotExist
from django.core.exceptions import PermissionDenied
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.core.servers.basehttp import FileWrapper
from django.core.urlresolvers import reverse, reverse_lazy
from django.db.models import Q
from django.forms.formsets import formset_factory
from django.http import Http404
from django.http import HttpResponse, HttpResponseRedirect, HttpResponseBadRequest
from django.http import StreamingHttpResponse
from django.shortcuts import render_to_response, render
from django.template import RequestContext, loader
from django.utils.decorators import method_decorator
from django.utils.html import strip_tags
from django.views.generic import View, TemplateView, DetailView, ListView, FormView, UpdateView, CreateView, DeleteView
from django.views.generic.detail import SingleObjectMixin
from django.views.generic.edit import FormMixin

from mimetypes import MimeTypes

from apps.web.bundles import BundleService
from apps.common.worksheet_utils import get_worksheets

from extra_views import CreateWithInlinesView, UpdateWithInlinesView, InlineFormSet, NamedFormsetsMixin
from extra_views import generic

User = get_user_model()

############################################################
# General: template views


class HomePageView(TemplateView):
    template_name = "web/index.html"

    def get_context_data(self, **kwargs):
        context = super(HomePageView, self).get_context_data(**kwargs)
        context['worksheets'] = get_worksheets(self.request.user)
        return context

class LoginRequiredMixin(object):
    @method_decorator(login_required)
    def dispatch(self, *args, **kwargs):
        return super(LoginRequiredMixin, self).dispatch(*args, **kwargs)

class UserSettingsView(LoginRequiredMixin, UpdateView):
    template_name = "web/my/settings.html"
    model = User
    success_url = "/my/settings/"

    def get_object(self, queryset=None):
        return self.request.user

class WorksheetLandingView(TemplateView):
    """
    When we land on the worksheets page, we want to serve.
    """
    template_name = 'web/worksheets/detail.html'
    def get(self, request, *args, **kwargs):
        # Jump to a worksheet based on uuid or name:
        # - /worksheets/?uuid=
        # - /worksheets/?name=
        # - 'home' worksheet
        requested_ws = request.GET.get('uuid', request.GET.get('name', 'home'))
        if requested_ws:
            service = BundleService(request.user)
            try:
                uuid = service.get_worksheet_uuid(requested_ws)
                return HttpResponseRedirect(reverse('ws_view', kwargs={'uuid': uuid}))
            except Exception, e:  # UsageError
                print 'Unable to get worksheet:', e
                pass

        return HttpResponseRedirect(reverse("ws_list"))

class WorksheetListView(TemplateView):
    """
    Displays worksheets as a list.
    """
    template_name = 'web/worksheets/index.html'
    def get_context_data(self, **kwargs):
        context = super(WorksheetListView, self).get_context_data(**kwargs)
        return context

class WorksheetDetailView(TemplateView):
    """
    Show information about a worksheet.
    Displays details of a worksheet.
    """
    template_name = 'web/worksheets/detail.html'
    def get_context_data(self, **kwargs):
        context = super(WorksheetDetailView, self).get_context_data(**kwargs)
        service = BundleService(self.request.user)
        uuid = kwargs.get('uuid', None)

        # Just call to get the title.
        # TODO: later we call worksheet again to get the contents.
        # Can we avoid calling get_worksheet_info twice?
        try:
            worksheet_info = service.basic_worksheet(uuid)
            context['worksheet_uuid'] = worksheet_info['uuid']
            context['worksheet_title'] = worksheet_info.get('title', worksheet_info.get('name', ''))
        except:
            pass
        return context

class BundleDetailView(TemplateView):
    """
    Displays details for a bundle.
    """
    template_name = 'web/bundles/detail.html'
    def get_context_data(self, **kwargs):
        context = super(BundleDetailView, self).get_context_data(**kwargs)
        uuid = kwargs.get('uuid')
        service = BundleService(self.request.user)
        bundle_info = service.get_bundle_info(uuid)
        if bundle_info:
            context['bundle'] = bundle_info
            context['bundle_title'] = bundle_info.get('metadata', {}).get('name', '')
        else:
            context['error'] = 'Invalid or inaccessible bundle uuid: ' + uuid
        return context

def BundleDownload(request, uuid):
    '''
    Return a stream with the contents of the bundle (zip file if necessary).
    This is the same code as BundleFileContentApi.
    '''
    service = BundleService(request.user)
    stream, name, content_type = service.read_target((uuid, ''))
    response = StreamingHttpResponse(stream, content_type=content_type)
    response['Content-Disposition'] = 'filename="%s"' % name
    return response
