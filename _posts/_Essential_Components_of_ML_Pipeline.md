## Preprocessing 
![label_preprocessing](/images/talentai7.png)

## Feature store
It stores features along with their meta data in a Big data storage system e.g., NoSql. A data scientist should have the ability to reuse features generated from another ML pipeline through simple python style interface ```df = featurestore.get_features(['mean_age', 'max_age'])``` and store their own features with ```df.store_features("feature_store_name")```

## Post Deployment
* Check model performance
Track model's score. Generate alert when the score becomes an anomaly.

* Track click-through rate. It helps to identify if the new model is increasing user's interaction

* Adapt model prediction using reinforcement learning e.g., Multi-arm bandit
