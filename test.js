'use strict';

const functions = require('firebase-functions');
const {
    WebhookClient
} = require('dialogflow-fulfillment');
const {
    Card,
    Suggestion
} = require('dialogflow-fulfillment');
const axios = require('axios');

process.env.DEBUG = 'dialogflow:debug';

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    const agent = new WebhookClient({
        request,
        response
    });

    function findEmployees(agent) {
        const {
            number,
            typebudget,
            poste,
            optionmobilite,
            location,
            optionregulier,
            optionsicouchante,
            jours,
            nounoulocation,
        } = agent.parameters.type;

        const params = {
            number,
            typebudget,
            poste,
            optionmobilite,
            location: location.city,
            optionregulier,
            optionsicouchante,
            jours,
            nounoulocation,
            sheet: 'employees2',
        };

        return new Promise((resolve, reject) => {
            axios
                .get('https://sheetdb.io/api/v1/tkk4e7owill76/search', {
                    params
                })
                .then(function (response) {
                    const employeesResults = response.data;
                    if (employeesResults) {
                        let results = employeesResults.map(r => `${r.name}: ${r.name}`);
                        agent.add(
                            `Parfait, nous avons ${
results.length
} personnes correspondant parfaitement à vos critères:`
                        );
                        agent.add(results);
                    } else {
                        agent.add('Not found');
                    }
                    resolve();
                })
                .catch(() => {
                    resolve();
                });
        });
    }

    function saveEmployee(agent) {
        const {
            number,
            typebudget,
            poste,
            optionmobilite,
            location,
            optionregulier,
            optionsicouchante,
            jours,
            nounoulocation,
        } = agent.parameters.type;

        const data = {
            number,
            typebudget,
            poste,
            optionmobilite,
            location: location.city,
            optionregulier,
            optionsicouchante,
            jours,
            nounoulocation,
            sheet: 'employees2',
        };

        return new Promise((resolve, reject) => {
            axios
                .post('https://sheetdb.io/api/v1/tkk4e7owill76?sheet=employees_2', data)
                .then(() => {
                    agent.add(
                        `Sauvegarde réussie`
                    );
                    resolve();
                })
                .catch(() => {
                    resolve();
                });
        });
    }

    let intentMap = new Map();
    intentMap.set('01-get-info-employeur', findEmployees);
    intentMap.set('7-get-sansville-nonregulier-couchante-tarif', saveEmployee);
    intentMap.set('7-get-sansville-nonregulier-noncouchante-tarif', saveEmployee);
    intentMap.set('7-get-sansville-regulier-couchante-tarif', saveEmployee);
    intentMap.set('7-get-sansville-regulier-noncouchante-tarifAdd', saveEmployee);
    intentMap.set('7-get-ville-nonregulier-couchante-tarif', saveEmployee);
    intentMap.set('7-get-ville-nonregulier-noncouchante-tarif', saveEmployee);
    intentMap.set('7-get-ville-regulier-couchante-tarif', saveEmployee);
    intentMap.set('7-get-ville-regulier-noncouchante-tarif', saveEmployee);
    agent.handleRequest(intentMap);
});