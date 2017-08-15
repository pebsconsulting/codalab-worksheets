FROM ubuntu:16.04
MAINTAINER Fabian Chan <fabianc@stanford.edu>

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update
RUN apt-get install -y build-essential curl git
RUN apt-get install -y python-dev python-software-properties python-virtualenv
RUN apt-get install -y software-properties-common

# Install Node.js
RUN curl -sL https://deb.nodesource.com/setup_4.x | bash -
RUN apt-get install -y nodejs
RUN echo '{ "allow_root": true }' > /root/.bowerrc

# Install Python, npm, bower dependencies (time consuming)
COPY requirements.txt /opt/codalab-worksheets/requirements.txt
RUN cd /opt/codalab-worksheets && virtualenv venv && venv/bin/pip install -r requirements.txt
COPY codalab/apps/web/package.json /opt/codalab-worksheets/codalab/apps/web/package.json
RUN cd /opt/codalab-worksheets/codalab/apps/web && npm install
COPY codalab/apps/web/bower.json /opt/codalab-worksheets/codalab/apps/web/bower.json
RUN cd /opt/codalab-worksheets/codalab/apps/web && npm run bower

# Install code
COPY . /opt/codalab-worksheets
ENV CODALAB_HOME=/home/codalab
RUN cd /opt/codalab-worksheets && ./setup.sh

# Export the static files as a volume
VOLUME ["/opt/codalab-worksheets/codalab/apps/web/static"]

EXPOSE 2700

WORKDIR /opt/codalab-worksheets/codalab
#ENTRYPOINT ["./manage", "runserver", "0.0.0.0:2700"]
