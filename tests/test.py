# -*- coding: utf-8 -*-
"""End-to-end Selenium Testing

These tests use Selenium WebDriver to automate common user actions on the codalab
front end and test that they work as expected.

Usage:
    venv/bin/python tests/test.py

When prompted follow prompt
"""
import getpass
import random
import string
import unittest
from datetime import datetime

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support import expected_conditions as ec
from selenium.webdriver.support.ui import WebDriverWait


class BasicTest(unittest.TestCase):
    """Main class that houses all the tests

    Attributes:
        driver (webdriver): the selenium webdriver that runs the tests.
    """

    TIMEOUT_SECONDS = 10
    UPLOAD_TIMEOUT_SECONDS = 60
    WORKSHEET_UUID_XPATH = '//*[@id="panel_content"]/table/tbody/tr[1]/td'
    WORKSHEET_NAME_XPATH = '//*[@id="panel_content"]/table/tbody/tr[2]/td'
    WORKSHEET_ITEM_XPATH = '//*[@id="worksheet_items"]/div/div/table/tbody/tr[%d]'
    BUNDLE_UUID_XPATH = '//*[@id="panel_content"]/div/table/tbody/tr[1]/td'
    BUNDLE_NAME_XPATH = '//*[@id="panel_content"]/div/table/tbody/tr[2]/td/a'
    BUNDLE_CONTENTS_XPATH = '//*[@id="panel_content"]/div[3]/div/div[2]'
    BUNDLE_STDOUT_XPATH = '//*[@id="panel_content"]/div[3]/div/div[1]'
    DEFAULT_HOST = 'http://localhost:8000'

    def setUp(self):
        """Sets up the webdriver to run firefox. Can be changed later"""
        self.driver = webdriver.Firefox()

        # Prompt user for connection details
        self.host = raw_input('Host [%s]: ' % self.DEFAULT_HOST) or self.DEFAULT_HOST
        self.username = raw_input('Username on %s: ' % self.host)
        self.password = getpass.getpass('Password: ')

        # Generate a random name for a worksheet
        entropy = ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(5))
        self.worksheet_suffix = 'testing-' + entropy
        self.worksheet = self.username + '-' + self.worksheet_suffix
        self.worksheet_uuid = None  # set below

        self.bundles_created = []

    def step1_title(self):
        """Tests that the title of the page is as expected"""
        self.driver.get(self.host)
        self.assertEqual(
            'CodaLab - Home',
            self.driver.title)

    # SKIPPED
    def _skipped_step2_sign_up(self):
        """Tests that users can sign up as expected"""
        self.driver.get(self.host)
        self.driver.find_element_by_partial_link_text("Sign Up").click()
        WebDriverWait(self.driver, self.TIMEOUT_SECONDS).until(
            ec.presence_of_element_located((By.ID, 'id_email')))
        self.driver.find_element_by_id('id_email').send_keys('abc%s@abc.com' % self.entropy)
        self.driver.find_element_by_id('id_login').send_keys(self.username)
        self.driver.find_element_by_id('id_firstname').send_keys('John')
        self.driver.find_element_by_id('id_lastname').send_keys('Doe')
        self.driver.find_element_by_id('id_affiliation').send_keys('Stanford University')
        self.driver.find_element_by_id('id_password').send_keys(self.password)
        self.driver.find_element_by_id('id_password_confirm').send_keys(self.password)
        self.driver.find_element_by_xpath('//*[@id="signup_form"]/button').click()
        WebDriverWait(self.driver, self.TIMEOUT_SECONDS).until(ec.title_contains('Signup Success'))
        raw_input("Press enter once you have verified the email.")

    def step3_login(self):
        """Log the test user in"""
        self.driver.get(self.host)
        self.driver.find_element_by_partial_link_text("Sign In").click()
        WebDriverWait(self.driver, self.TIMEOUT_SECONDS).until(
            ec.presence_of_element_located((By.ID, 'id_login')))
        self.driver.find_element_by_id('id_login').send_keys(self.username)
        self.driver.find_element_by_id('id_password').send_keys(self.password)
        self.driver.find_element_by_css_selector(".btn").click()
        WebDriverWait(self.driver, self.TIMEOUT_SECONDS).until(
            ec.presence_of_element_located((By.CLASS_NAME, 'jumbotron')))

    def step4_create_new_worksheet(self):
        """Tests that users are able to create a new worksheet"""
        self.driver.find_element_by_partial_link_text('My Dashboard').click()
        WebDriverWait(self.driver, self.TIMEOUT_SECONDS).until(
            ec.presence_of_element_located((By.PARTIAL_LINK_TEXT, 'New Worksheet')))
        self.driver.find_element_by_partial_link_text('New Worksheet').click()
        WebDriverWait(self.driver, self.TIMEOUT_SECONDS).until(
            ec.visibility_of_element_located((By.ID, 'new-worksheet-input')))
        self.driver.find_element_by_id('new-worksheet-input').send_keys(self.worksheet_suffix)
        self.driver.find_element_by_partial_link_text('Create').click()
        WebDriverWait(self.driver, self.TIMEOUT_SECONDS).until(
            ec.presence_of_element_located((By.CLASS_NAME, 'empty-worksheet')))
        self.assertEquals(
            self.driver.find_element_by_xpath(self.WORKSHEET_NAME_XPATH).text,
            self.worksheet)
        self.worksheet_uuid = self.driver.find_element_by_xpath(self.WORKSHEET_UUID_XPATH).text

    def get_testing_worksheet(self):
        """Internal function that navigates to the new testing worksheet"""
        self.driver.get('{0.host}/worksheets/{0.worksheet_uuid}/'.format(self))

    def step5_upload_file(self):
        """Tests that we can upload a.txt and b.txt"""
        self.get_testing_worksheet()
        self.driver.find_element_by_partial_link_text("Upload").click()
        print "Go to the browser window and select file codalab-worksheets/tests/a.txt " + \
              "to upload (timeout in %d seconds)." % self.UPLOAD_TIMEOUT_SECONDS
        WebDriverWait(self.driver, self.UPLOAD_TIMEOUT_SECONDS).until(
            ec.text_to_be_present_in_element((By.ID, 'worksheet_items'), 'a.txt'))

        self.driver.find_element_by_partial_link_text("Upload").click()
        print "Go to the browser window and select file codalab-worksheets/tests/b.txt " + \
              "to upload (timeout in %d seconds)." % self.UPLOAD_TIMEOUT_SECONDS
        WebDriverWait(self.driver, self.UPLOAD_TIMEOUT_SECONDS).until(
            ec.text_to_be_present_in_element((By.ID, 'worksheet_items'), 'b.txt'))

        # Click on row for a.txt (first item)
        self.driver.find_element_by_xpath(self.WORKSHEET_ITEM_XPATH % 1).click()
        WebDriverWait(self.driver, self.TIMEOUT_SECONDS).until(
            ec.text_to_be_present_in_element((By.XPATH, self.BUNDLE_NAME_XPATH), 'a.txt'))
        self.assertEqual(
            self.driver.find_element_by_xpath(self.BUNDLE_CONTENTS_XPATH).text,
            'hello\nworld')
        self.bundles_created.append(
            self.driver.find_element_by_xpath(self.BUNDLE_UUID_XPATH).text
        )

        # Click on row for b.txt (second item)
        self.driver.find_element_by_xpath(self.WORKSHEET_ITEM_XPATH % 2).click()
        WebDriverWait(self.driver, self.TIMEOUT_SECONDS).until(
            ec.text_to_be_present_in_element((By.XPATH, self.BUNDLE_NAME_XPATH), 'b.txt'))
        self.assertEqual(
            self.driver.find_element_by_xpath(self.BUNDLE_CONTENTS_XPATH).text,
            '4\n3\n2\n1')
        self.bundles_created.append(
            self.driver.find_element_by_xpath(self.BUNDLE_UUID_XPATH).text
        )

    def step6_run_bundle(self):
        """Tests that we can create a run bundle using the interface"""
        self.get_testing_worksheet()

        # Open run creation modal
        new_run_button = self.driver.find_element_by_partial_link_text("New Run")
        new_run_button.click()
        WebDriverWait(self.driver, self.TIMEOUT_SECONDS).until(
            ec.visibility_of_element_located((By.ID, 'run-bundle-terminal-command')))

        # Configure the run and submit it
        self.driver.find_element_by_id('run-bundle-terminal-command')\
            .send_keys('date; echo hello')
        self.driver.find_element_by_partial_link_text("Run").click()

        # Wait until panel reloads with the right bundle info and bundle is ready
        WebDriverWait(self.driver, self.TIMEOUT_SECONDS).until(
            ec.presence_of_element_located((By.CLASS_NAME, 'state-ready')))

        # Check correctness of content
        self.assertEqual(
            self.driver.find_element_by_xpath(self.BUNDLE_STDOUT_XPATH).text[-5:],
            'hello')
        # Check that the date is a parseable date
        datetime.strptime(
            self.driver.find_element_by_xpath(self.BUNDLE_STDOUT_XPATH).text[:-6],
            '%a %b %d %H:%M:%S %Z %Y')
        self.bundles_created.append(
            self.driver.find_element_by_xpath(self.BUNDLE_UUID_XPATH).text
        )

    def step7_edit_source_save(self):
        """Tests that we can view source and edit the source."""
        self.get_testing_worksheet()
        self.driver.find_element_by_css_selector('.btn-group > button:nth-child(2)').click()
        WebDriverWait(self.driver, self.TIMEOUT_SECONDS).until(
            ec.presence_of_element_located((By.ID, 'worksheet-editor')))
        self.driver.find_element_by_id('worksheet-editor').send_keys("# Testing header 1\n")
        self.driver.find_element_by_css_selector('.btn-group > button:nth-child(1)').click()
        WebDriverWait(self.driver, self.TIMEOUT_SECONDS).until(
            ec.presence_of_element_located((By.ID, 'testing-header-1')))
        self.assertEqual(
            self.driver.find_element_by_id('testing-header-1').tag_name,
            'h1')

    def step8_cl_interface(self):
        """Tests that we can use the web cl interace"""
        self.get_testing_worksheet()
        self.driver.find_element_by_id('command_line').click()
        WebDriverWait(self.driver, self.TIMEOUT_SECONDS).until(
            ec.presence_of_element_located((By.CLASS_NAME, 'actionbar-focus')))

        def cli_command(command, wait_for):
            self.driver.find_element_by_id('command_line').send_keys(command + Keys.RETURN)
            WebDriverWait(self.driver, self.TIMEOUT_SECONDS).until(
                ec.text_to_be_present_in_element((By.ID, 'command_line'), wait_for))

        # Try ls command
        cli_command('ls', wait_for='a.txt')
        cmd_out = self.driver.find_element_by_id('command_line').text.split()
        cmd_out = cmd_out[cmd_out.index('a.txt'):]
        self.assertTrue(
            cmd_out[0] == 'a.txt' and
            cmd_out[1] == self.username and
            cmd_out[8] == 'b.txt' and
            cmd_out[9] == self.username
            )

        # Delete the bundles and worksheet!
        for uuid in reversed(self.bundles_created):
            # Don't delete by uuid or the wait condition may get confused and fail
            cli_command('rm ^', wait_for=uuid)
        # Force required because the worksheet still has some markdown on it
        cli_command('wrm --force' + self.worksheet_uuid, wait_for=self.worksheet_uuid)

    def _steps(self):
        for name in sorted(dir(self)):
            if name.startswith("step"):
                yield name, getattr(self, name)

    def test_steps(self):
        """
        Run all the steps in sequential order.

        This is what actually gets called by the test runner.
        """
        for name, step in self._steps():
            step()

    def tearDown(self):
        self.driver.close()
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
