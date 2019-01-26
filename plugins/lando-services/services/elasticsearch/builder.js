'use strict';

// Modules
const _ = require('lodash');

// Builder
module.exports = {
  name: 'elasticsearch',
  config: {
    version: '6',
    supported: ['6', '6.5.x', '5', '5.6.x'],
    patchesSupported: true,
    confSrc: __dirname,
    healthcheck: 'curl -XGET localhost:9200',
    plugins: [],
    port: '9200',
    mem: '1025m',
    defaultFiles: {
      server: 'config.yml',
    },
    remoteFiles: {
      server: '/opt/bitnami/elasticsearch/config/elasticsearch_custom.yml',
    },
  },
  parent: '_service',
  builder: (parent, config) => class LandoElasticSearch extends parent {
    constructor(id, options = {}) {
      options = _.merge({}, config, options);
      const elasticsearch = {
        image: `bitnami/elasticsearch:${options.version}`,
        command: '/entrypoint.sh /run.sh',
        environment: {
          ELASTICSEARCH_IS_DEDICATED_NODE: 'yes',
          ELASTICSEARCH_CLUSTER_NAME: 'bespin',
          ELASTICSEARCH_NODE_TYPE: 'master',
          ELASTICSEARCH_NODE_NAME: 'lando',
          ELASTICSEARCH_PORT_NUMBER: 9200,
          ELASTICSEARCH_PLUGINS: options.plugins.join(';'),
          ELASTICSEARCH_HEAP_SIZE: options.mem,
        },
        volumes: [
          `${options.confDest}/${options.defaultFiles.server}:${options.remoteFiles.server}`,
          `${options.data}:/bitnami/elasticsearch/data`,
        ],
      };
      // Add some info
      options.info = {environment: elasticsearch.environment};
      // Send it downstream
      super(id, options, {services: _.set({}, options.name, elasticsearch)});
    };
  },
};
