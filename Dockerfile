FROM ubuntu:14.04
MAINTAINER Fabian Chan <fabianc@stanford.edu>

ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update && apt-get install -y \
  build-essential \
  curl \
  git \
  python-dev \
  python-software-properties \
  python-virtualenv \
  software-properties-common

# Install NodeJS
RUN curl -sL https://deb.nodesource.com/setup_4.x | bash -
RUN apt-get install -y nodejs
RUN echo '{ "allow_root": true }' > /root/.bowerrc

COPY . /opt/codalab-worksheets

ENV CODALAB_HOME=/home/codalab
RUN cd /opt/codalab-worksheets && ./setup.sh

# Export the static files as a volume
VOLUME ["/opt/codalab-worksheets/codalab/apps/web/static"]

EXPOSE 2700

WORKDIR /opt/codalab-worksheets/codalab
CMD ["./manage", "runserver", "0.0.0.0:2700"]
