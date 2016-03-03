'''
This file contains utilities specific to worksheets.
'''
import random
from django.conf import settings
from apps.web.bundles import BundleService

def get_worksheets(request_user, limit=3):
    '''
    Get worksheets to display on the front page.
    Keep only |worksheet_uuids|.
    '''
    service = BundleService(request_user)

    # Select good high-quality worksheets and randomly choose some
    list_worksheets = service.search_worksheets(['tag=paper,software,data'])
    list_worksheets = random.sample(list_worksheets, min(limit, len(list_worksheets)))

    # Always put home worksheet in
    list_worksheets = service.search_worksheets(['name=home']) + list_worksheets

    # Reformat
    list_worksheets = [(val['uuid'], val.get('title') or val['name'], val['name'], val['owner_name']) for val in list_worksheets]

    return list_worksheets
