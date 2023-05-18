const express = require('express');
const axios = require('axios');
const SparqlClient = require('sparql-client-2');

const app = express();

app.get('/', (req, res) => {
  const ontologyUrl = 'http://localhost/ontology/musicians.rdf';

  axios
    .get(ontologyUrl)
    .then(response => {
      const ontologyData = response.data;
      // Process the ontology data as needed
      console.log(ontologyData);

      // SPARQL query
      const query = `
      PREFIX owl: <http://www.w3.org/2002/07/owl#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX ont: <http://www.semanticweb.org/khale/ontologies/2023/4/untitled-ontology-4#>

      SELECT ?band
      WHERE {
    ?band rdf:type ont:Band .
    }

    `;

      const endpoint = 'http://localhost:3030/Ontology/sparql'; // Replace with your SPARQL endpoint URL

      const client = new SparqlClient(endpoint);
      client.query(query).execute((error, results) => {
        if (error) {
          console.error('SPARQL query error:', error);
          res.status(500).send('Internal Server Error');
        } else {
          const bands = results.results.bindings.map(binding => binding.band.value);
          console.log(bands.ontologyData);
          let table = "<table><tr><td>"
          table += "test hello</td></tr></table>"
          res.send(table);
        }
      });
    })
    .catch(error => {
      console.error('Error fetching ontology:', error);
      res.status(500).send('Internal Server Error');
    });
});

app.listen(8080, () => {
  console.log('Server started on port 8080');
});
