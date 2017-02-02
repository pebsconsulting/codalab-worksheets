# Frontend Tests

Tests for the CodaLab Worksheets frontend are written in Selenium Driver.
Currently we use the Firefox driver, but we could use other drivers
in the future if desired.

0. Make sure you're in the base directory of the repo first:

        cd path/to/codalab-worksheets

1. Ensure that you have selenium installed.

        ./setup.sh

2. Download and install [Mozilla geckodriver](https://github.com/mozilla/geckodriver).

    On Linux:

        wget https://github.com/mozilla/geckodriver/releases/download/v0.13.0/geckodriver-v0.13.0-linux64.tar.gz
        tar xzvf geckodriver-v0.13.0-linux64.tar.gz

    Then put the unzipped `geckodriver` executable into your `PATH`.

    On macOS:

        brew install geckodriver


3. Run the tests:

        ./test.sh

4. When prompted, follow the instructions.
