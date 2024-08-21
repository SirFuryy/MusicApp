import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'API of snm project',
    description: 'I dont know what else to write here',
  },
  host: 'localhost:3000'
};

const outputFile = './swagger-output.json';
const routes = ['./index.js'];


swaggerAutogen()(outputFile, routes, doc);