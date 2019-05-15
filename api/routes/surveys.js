var express = require('express');
var router = express.Router();
const {listSurveysEndpoints, getSurveys,saveSurveys,getAssets,saveAssets, getAsset,getSurvey}= require('../services/surveys');

router.get('/endpoints', async (req, res) => {
  try{
  let data = await listSurveysEndpoints();
  res.status(201).json({data: data})

  }catch(err){
    console.log(err)
  }
});
router.get('/', async (req, res) => {
  try{
  let endpoints = await listSurveysEndpoints(req.query.url,req.query.user,req.query.password);
  let surveys = await getSurveys(endpoints,req.query.user,req.query.password);
  res.status(201).json({data: surveys})

  }catch(err){
    console.log(err)
  }
});

router.get('/save', async (req, res) => {
  try{
  let endpoints = await listSurveysEndpoints(req.query.url,req.query.user,req.query.password);
  let surveys = await getSurveys(endpoints,req.query.user,req.query.password);
  let result = await saveSurveys(surveys);
  res.status(201).json({message: 'Surveys saved!'})

  }catch(err){
    console.log(err)
  }
});
router.get('/assets', async (req, res) => {
  try{
  let endpoints = await listSurveysEndpoints(req.query.url,req.query.user,req.query.password);
  let surveys = await getAssets(endpoints,req.query.url,req.query.user,req.query.password);
  let result = await saveAssets(surveys);
  res.status(201).json({result})

  }catch(err){
    console.log(err)
  }
});

router.get('/survey', async (req, res) => {
  try{
  let assets = await getAsset(req.query.url,req.query.user,req.query.password);
  let survey = await getSurvey(req.query.url,req.query.user,req.query.password);
  console.log(assets)
  res.status(201).json({survey})

  }catch(err){
    console.log(err)
  }
});
module.exports = router;
