"""
Package containing the CodaLab client tools.
"""

import json
import logging
import multiprocessing
import os
import yaml
import time

from Queue import Empty

class BaseConfig(object):
    """
    Defines a base class for loading configuration values from a YAML-formatted file.
    """
    def __init__(self, filename='.codalabconfig'):
        self._filename = filename
        paths_searched = [self._filename]
        if not os.path.exists(self._filename):
            self._filename = os.path.join(os.getcwd(), filename)
            paths_searched.append(self._filename)
            if not os.path.exists(self._filename):
                self._filename = os.path.join(os.path.expanduser("~"), filename)
                paths_searched.append(self._filename)
            if not os.path.exists(self._filename):
                msg = "Config file not found. Searched for:\n" + "\n".join(paths_searched)
                raise EnvironmentError(msg)

        with open(self._filename, "r") as f:
            self.info = yaml.load(f)

    def getFilename(self):
        """Returns the full name of the configuration file."""
        return self._filename

    def getLoggerDictConfig(self):
        """Gets Dict config for logging configuration."""
        return self.info['logging'] if 'logging' in self.info else None
