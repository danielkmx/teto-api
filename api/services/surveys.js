let request = require("request");
let MongoClient = require("mongodb").MongoClient;
let mongoose = require("mongoose");

require("dotenv").config();

module.exports.listSurveysEndpoints = (url, user, password) => {
  return new Promise((resolve, reject) => {
    request(configureHeader(url, user, password), (error, response, body) => {
      if (!error) resolve(JSON.parse(body));
      else reject(error);
    });
  });
};

module.exports.getSurveys = (surveysEndpoints, user, password) => {
  return new Promise((resolve, reject) => {
    let surveys = [];
    surveysEndpoints.forEach(async (endpoint, index) => {
      try {
        let survey = await getSurvey(endpoint, user, password);
        surveys.push(survey);
      } catch (error) {
        console.log(error);
      }

      if (index === surveysEndpoints.length - 1) {
        resolve(surveys);
      }
    });
  });
};
module.exports.getAssets = (surveysEndpoints, url, user, password) => {
  return new Promise((resolve, reject) => {
    let surveys = [];
    let url_asset =
      url === "https://kc.humanitarianresponse.info/api/v1/data"
        ? "https://kobo.humanitarianresponse.info/assets/"
        : "https://koboform.docker.kobo.techo.org/assets/";

    surveysEndpoints.forEach(async (endpoint, index) => {
      try {
        let endpoint_new_url = {
          ...endpoint,
          url: url_asset + endpoint.id_string
        };
        let survey = await getAsset(endpoint_new_url, user, password);
        surveys.push(survey);
      } catch (error) {
        console.log(error);
      }

      if (index === surveysEndpoints.length - 1) {
        console.log('endpoints: ' + surveysEndpoints.length);
        console.log('surveys:' + surveys.length)
        resolve(surveys);
      }
    });
  });
};
module.exports.saveSurveys = surveys => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(process.env.MONGO_URL, function(err, client) {
      let i, collection;
      if (err) {
        reject(err);
      }
      let db = client.db("tetobrasil");
      surveys.forEach(async (survey, index) => {
        const collections = await db.collections();
        if (
          collections.map(c => c.s.name).includes(survey.name + "_Original")
        ) {
          await db.dropCollection(survey.name + "_Original");
        }
        collection = db.collection(survey.name + "_Original");
        collection.insertMany(survey.data);
        if (index === surveys.length - 1) {
          resolve();
        }
      });
    });
  });
};
module.exports.saveAssets = surveys => {
  return new Promise((resolve, reject) => {
    surveys.map(survey => {
      if (survey.assets.content.choices) {
        survey.assets.content.choices = survey.assets.content.choices.map(choice => {
          let newChoices = {};

          for (const [key, value] of Object.entries(choice)) {
            newChoices = filterDollarSign(key,value);
          }
          return newChoices;
        });
      }
      survey.assets.content.survey = survey.assets.content.survey.map(survey => {
        let newSurvey = {};

        for (const [key, value] of Object.entries(survey)) {
          newSurvey = filterDollarSign(key,value);
        }
        return newSurvey;
      });
      return survey;
    });
    resolve(surveys)
      // MongoClient.connect(process.env.MONGO_URL, function(err, client) {
      //   let i, collection;
      //   if (err) {
      //     reject(err);
      //   }
      //   let db = client.db("tetobrasil");
      //   surveys.forEach(async (survey, index) => {
      //     const collections = await db.collections();
      //     if (
      //       collections.map(c => c.s.name).includes(survey.name + "_Assets")
      //     ) {
      //       await db.dropCollection(survey.name + "_Assets");
      //     }
      //     collection = db.collection(survey.name + "_Assets");
      //     collection.insert(survey.assets);
      //     if (index === surveys.length - 1) {
      //       resolve();
      //     }
      //   });
      // });
  });
};
const filterDollarSign = (key,value) => {
  const obj = {};
  if(typeof value === 'string'){
  if(key.includes('$') && value.includes('$')) obj[key.replace('$','//s')] = value.replace('$','//s');
  else if(key.includes('$') && !value.includes('$')) obj[key.replace('$','//s')] = value;
  else if(!key.includes('$') && value.includes('$')) obj[key] = value.replace('$','//s');
  else obj[key] = value
  }else{
    key.includes('$') ? obj[key.replace('$', '//s')] = value : obj[key] = value
  }
}
module.exports.getAsset = (endpoint, user, password) => {
  return new Promise((resolve, reject) => {
    request(
      configureHeader(endpoint.url + ".json", user, password),
      (error, response, body) => {
        if(error) console.log(error)
        resolve({
          assets: JSON.parse(body),
          name: endpoint.title
        });
      }
    );
  });
};
module.exports.getSurvey = (endpoint, user, password) => {
  return new Promise((resolve, reject) => {
    request(
      configureHeader(endpoint.url + ".json", user, password),
      (error, response, body) => {
        resolve({
          id_string: endpoint.id_string,
          data: JSON.parse(body),
          name: endpoint.title
        });
      }
    );
  });
};
const configureHeader = (url, user, password) => {
  let base64 = require("base-64");
  let headers = {
    Authorization: "Basic " + base64.encode(user + ":" + password),
    "Content-Type": "text/json"
  };
  let options = {
    url: url,
    method: "GET",
    headers: headers,
    agentOptions: {
      rejectUnauthorized: false
    }
  };
  return options;
};
