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

      const defaultQuery = `
      PREFIX owl: <http://www.w3.org/2002/07/owl#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX ont: <http://www.semanticweb.org/khale/ontologies/2023/4/untitled-ontology-4#>

      SELECT ?band
      WHERE {
        ?band rdf:type ont:Band .
      }
      `;

      // SPARQL query
      const query = req.query.query || defaultQuery;

      const endpoint = 'http://localhost:3030/Ontology/sparql'; // Replace with your SPARQL endpoint URL

      const client = new SparqlClient(endpoint);
      client.query(query).execute((error, results) => {
        if (error) {
          console.error('SPARQL query error:', error);
          res.status(500).send('Internal Server Error');
        } else {
          const bands = results.results.bindings.map(binding => binding.band.value);
          console.log(bands);

          const tableHtml = generateTableHtml(bands);

          const html = `
          <html>
            <head>
              <style>
                table {
                  border-collapse: collapse;
                  margin: 0 auto;
                  text-align: center;
                  width: 100%;
                }
                th, td {
                  border: 1px solid black;
                  padding: 8px;
                }
                th {
                  background-color: #f2f2f2;
                }
                .grey-row {
                  background-color: grey;
                  color: white;
                }
                h1 {
                  text-align: center;
                }
                input{
                  width: 25%;
                }
                textarea{
                  width: 100%;
                }
                .center-button {
                  text-align: center;
                }
              </style>
            </head>
            <body>
              <h1>SPARQL Query Results</h1>
              <form action="/" method="get">
                <label for="query">SPARQL Query:</label><br>
                <textarea id="query" name="query" rows="14" cols="120" width="100%">${query}</textarea><br>
                <div class="center-button">
                  <input type="submit" value="Submit">
                </div>
              </form>
              <br>
              ${tableHtml}
            </body>
          </html>
          `;

          res.send(html);
        }
      });
    })
    .catch(error => {
      console.error('Error fetching ontology:', error);
      res.status(500).send('Internal Server Error');
    });
});

function generateTableHtml(data) {
  let tableHtml = '<table>';

  // Generate table header
  tableHtml += '<thead>';
  tableHtml += '<tr>';
  tableHtml += '<th>Band</th>';
  tableHtml += '</tr>';
  tableHtml += '</thead>';

  // Generate table body
  tableHtml += '<tbody>';
  for (const item of data) {
    tableHtml += '<tr>';
    tableHtml += `<td>${item}</td>`;
    tableHtml += '</tr>';
  }
  tableHtml += '</tbody>';

  tableHtml += '</table>';

  return tableHtml;
}

app.listen(8080, () => {
  console.log('Server started on port 8080');
});
