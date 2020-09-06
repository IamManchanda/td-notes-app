const express = require("express");
const moment = require("moment");
const { v4: uuidv4 } = require("uuid");
const AWS = require("aws-sdk");

const isEmpty = require("../utils/isEmpty");

const router = express.Router();
AWS.config.update({
  region: "eu-west-1",
});
const documentClient = new AWS.DynamoDB.DocumentClient();

const tableName = "td_notes";
const user_id = "test_user";
const user_name = "Test User";

router.post("/api/note", (req, res, next) => {
  const item = req.body.Item;
  item.user_id = user_id;
  item.user_name = user_name;
  item.note_id = `${user_id}:${uuidv4()}`;
  item.timestamp = moment().unix();
  item.timestamp_expiry = moment().add(90, "days").unix();

  const params = {
    TableName: tableName,
    Item: item,
  };

  documentClient.put(params, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(err.statusCode).send({
        message: err.message,
        status: err.statusCode,
      });
    } else {
      return res.status(200).send(item);
    }
  });
});

router.patch("/api/note", (req, res, next) => {
  const item = req.body.Item;
  item.user_id = user_id;
  item.user_name = user_name;

  item.timestamp_expiry = moment().add(90, "days").unix();

  const params = {
    TableName: tableName,
    Item: item,
    ConditionExpression: "#t = :t",
    ExpressionAttributeNames: {
      "#t": "timestamp",
    },
    ExpressionAttributeValues: {
      ":t": item.timestamp,
    },
  };

  documentClient.put(params, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(err.statusCode).send({
        message: err.message,
        status: err.statusCode,
      });
    } else {
      return res.status(200).send(item);
    }
  });
});

router.get("/api/notes", (req, res, next) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 5;
  const params = {
    TableName: tableName,
    KeyConditionExpression: "user_id = :uid",
    ExpressionAttributeValues: {
      ":uid": user_id,
    },
    Limit: limit,
    ScanIndexForward: false,
  };

  const startTimestamp = req.query.start ? parseInt(req.query.start) : 0;
  if (startTimestamp > 0) {
    params.ExclusiveStartKey = {
      user_id,
      timestamp: startTimestamp,
    };
  }
  documentClient.query(params, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(err.statusCode).send({
        message: err.message,
        status: err.statusCode,
      });
    } else {
      return res.status(200).send(data);
    }
  });
});

router.get("/api/note/:note_id", (req, res, next) => {
  const { note_id } = req.params;
  const params = {
    TableName: tableName,
    IndexName: "note_id-index",
    KeyConditionExpression: "note_id = :note_id",
    ExpressionAttributeValues: {
      ":note_id": note_id,
    },
    Limit: 1,
  };

  documentClient.query(params, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(err.statusCode).send({
        message: err.message,
        status: err.statusCode,
      });
    } else {
      if (!isEmpty(data.Items)) {
        return res.status(200).send(data.Items[0]);
      } else {
        return res.status(404).send();
      }
    }
  });
});

router.delete("/api/note/:timestamp", (req, res, next) => {
  const timestamp = parseInt(req.params.timestamp);
  const params = {
    TableName: tableName,
    Key: {
      user_id,
      timestamp,
    },
  };

  documentClient.delete(params, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(err.statusCode).send({
        message: err.message,
        status: err.statusCode,
      });
    } else {
      return res.status(200).send();
    }
  });
});

module.exports = router;
