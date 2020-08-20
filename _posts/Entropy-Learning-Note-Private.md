Brief update on uncertainty estimation  

* Dealing with uncertainty:
  * Objective # 1: ML Model's performance should not vary a lot due to minor change in training data
    * Typical solution is to apply adversarial training [Ref](https://arxiv.org/pdf/1705.07204.pdf)
    * Reduce Aleatoric uncertainty aka input noise
    
  * Objective # 2: Model should generalize to unseen test set
    * Typical solution is to ensemble different version of the same model using different parameter initialization or drop out at test time. [Ref](https://arxiv.org/pdf/1506.02142.pdf)
    * Reduce epistemic uncertainty aka model uncertainty.  

* Data uncertainty /noise is partial observable.
* Model uncertainty reduces in the limit of infinite data.
* Calibration: study between model confidence and accuracy

* Metrics for computing uncertainty in image segmentation
  * Point-wise uncertainty (aka Pixel-wise uncertainty)
    * There are multiple predictions for the same pixel (objective # 1, # 2 or both)
    * Metric is the Entropy that is calculated utilizing relative frequencies of different class labels from the multiple predictions of the pixel 
 
  * Structure-wise uncertainty
    * Metric is the average Dice score over all pairs of predictions (objective # 1, # 2 or both) for a given image. [Ref](https://arxiv.org/pdf/1804.07046.pdf)
    * Dice score calculates overlap between two predictions. It is also known as F1 score. 

 * NLL
  * Sensitive to outlier
 * Brier score
  * Quadratic penalty bounded range [0, 1]
  
Use of uncertainty. 
- Out of distribution
