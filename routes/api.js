/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = /*process.env.DB*/"mongodb://admin:tsakvasi3594@ds115613.mlab.com:15613/issue";

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(function (req, res){
      console.log('get request');
      let project = req.params.project;

    MongoClient.connect(CONNECTION_STRING, function (err, db) {
      const query = Object.assign({}, req.query);
            if (query.open) query.open = query.open == 'true' ? true : false;
          db.collection(project).find(query).toArray((err, issues) => {
            if (err) console.log(err);
               res.json(issues);
          db.close();
           })
       })
    })

    .post(function (req, res){
      console.log('post request');
      var project = req.params.project;

      if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by) return res.send('Missing required fields!');

      MongoClient.connect(CONNECTION_STRING, function(err, db) {
            if (err)  console.log (err);

               const issueObj = Object.assign({}, req.body);
               issueObj.open = true;
               issueObj._id = new ObjectId();
               issueObj.updated_on = new Date().toUTCString().split(',')[1];
               issueObj.created_on = new Date().toUTCString().split(',')[1];

          db.collection(project).insertOne(issueObj, (err, doc) => {
            if (err)  console.log(err);

            if(doc.insertedCount === 1) res.json(doc.ops[0]);
             else console.log('insert error');

          db.close();
             });
          });
       })

     .put(function (req, res){
       console.log('put request');
        var project = req.params.project;
        var _id = ObjectId(req.body._id);
        const fieldsObj = Object.assign({}, req.body);
        let newObj = {};

      for (let k of Object.keys(fieldsObj))
        if (fieldsObj[k] != '') newObj[k] = fieldsObj[k];

      delete newObj._id;

        if (Object.keys(newObj).length === 0) return res.send('no updated field sent');

        newObj.updated_on = new Date().toUTCString().split(',')[1];
        if (newObj.open) newObj.open = newObj.open == 'true' ? true : false;

    MongoClient.connect(CONNECTION_STRING, function(err, db) {
      db.collection(project).findOneAndUpdate({_id: _id},{$set: newObj},
           (err, result) => {
        if (err) console.log(err);

        if(result.modifiedCount == 0) return res.send('could not update ' + req.body._id);
         else return res.send('successfully updated');
            db.close();
            });
        });
    })

    .delete(function (req, res){
      var project = req.params.project;
      var _id = req.body._id;
      console.log(project);
      console.log('delete request');
      console.log(req.body);
      const myregexp = /^[0-9a-fA-F]{24}$/;

     if(!_id.match(myregexp) || !_id) return res.send('_id error');
      else var deleteId = {_id: ObjectId(_id)}

      MongoClient.connect(CONNECTION_STRING, function(err, db) {
             db.collection(project).findOneAndDelete(deleteId, (err, response) => {
                if (err || response.deletedCount === 0) {
                  console.log(err)
                  return res.send('could not delete id:'+ _id);
                }
                else{
                  return  res.send('deleted id:'+ _id);
                }
              db.close();
             });
        });
   });
};
