## Machine learning echo system
![technical-debt](/images/technical-debt-ml-model.png)
[Image courtesy](https://www.youtube.com/watch?v=EI2QisCvEM4)  

Actual training of a machine model constitutes a small portion of a machine learning echo system. 
```
Sculley, David, et al. "Hidden technical debt in machine learning systems." Advances in neural information processing systems. 2015.
```

## Preprocessing 
![label_preprocessing](/images/talentai7.png)

## Feature store
It stores features along with their meta data in a Big data storage system e.g., NoSql. A data scientist should have the ability to reuse features generated from another ML pipeline through simple python style interface ```df = featurestore.get_features(['mean_age', 'max_age'])``` and store their own features with ```featurestore.store_feature("log_income", df['income'].log())```

Upon reading features from feature store, features need to be prepared for ML framework being used. For example, convert df to tfrecords when tensorflow is being used, numpy for pytorch, etc.

Feature store should provide version controlling and letting users use a given version. 

## Model deployment
* [Quantization](https://www.youtube.com/watch?v=IPQmGzYuxmc)
* Pruning

## Post Deployment
* Check model performance
Track model's score. Generate alert when the score becomes an anomaly.

* Track click-through rate. It helps to identify if the new model is increasing user's interaction

* Adapt model prediction using reinforcement learning e.g., Multi-arm bandit
