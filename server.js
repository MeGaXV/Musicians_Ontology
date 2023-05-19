const express = require('express');
const axios = require('axios');
const SparqlClient = require('sparql-client-2');

const app = express();
app.use(express.static('public'));

app.get('/', (req, res) => {
  const ontologyUrl = 'http://localhost/ontology/musicians.rdf';

  axios
    .get(ontologyUrl)
    .then(response => {
      const ontologyData = response.data;
      // Process the ontology data as needed
      console.log(ontologyData);

      const defaultQuery = `
      PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
      PREFIX owl: <http://www.w3.org/2002/07/owl#>
      PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
      PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
      PREFIX ont: <http://www.semanticweb.org/khale/ontologies/2023/4/untitled-ontology-4#>

     SELECT ?person ?role
     WHERE {
      ?person rdf:type ont:Person.
      ont:Metallica ont:hasMember ?person.
      ?person ont:hasRole ?role.
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
          const variables = results.head.vars;
          const bindings = results.results.bindings;
          const result = bindings.map(binding => {
            const row = {};
            for (const variable of variables) {
              row[variable] = binding[variable].value;
              }
              return row;
          })

          const tableHtml = generateTableHtml(result, variables);

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
                  border: 1px solid white;
                  padding: 8px;
                }
                th {
                  background-color: black;
                  color: white;
                }
                td{
                  color: white;
                  -webkit-text-stroke: 0.2px black;
                }
                .grey-row {
                  background-color: grey;
                  color: white;
                }
                h1 {
                  color: white;
                  text-align: center;
                }
                input{
                  width: 25%;
                }
                textarea{
                  width: 100%;
                  background-color: black;
                  color: white;
                }
                .center-button {
                  text-align: center;
                }
                body {
                  background-image: url("/background.jpg");
                  background-repeat: no-repeat;
                  background-size: cover;
                }
                label {
                  color: white;
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

function generateTableHtml(data, vars) {
  let tableHtml = '<table>';

  tableHtml += '<thead>';
  tableHtml += '<tr>';
  for(const head of vars)
  {
    tableHtml += `<th>${head}</th>`;
  }
  tableHtml += '</tr>';
    tableHtml += '</thead>';


  // Generate table body
  tableHtml += '<tbody>';
  for (const item of data) {
    tableHtml += '<tr>';
    for(const var1 of vars){
    tableHtml += `<td>${item[var1]}</td>`;
    }
    tableHtml += '</tr>';
  }
  tableHtml += '</tbody>';

  tableHtml += '</table>';

  

  return tableHtml;
}


app.listen(8080, () => {
  console.log('Server started on port 8080');
});
