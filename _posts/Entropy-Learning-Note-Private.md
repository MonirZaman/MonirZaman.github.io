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

 * NLL.  
   * Sensitive to outlier
 * Brier score
  * Quadratic penalty bounded range [0, 1]

Class by Balaji et. al. from Google Brain.  

Use of uncertainty. 
- Out of distribution
- Natural data distribution shift e.g., Time, country
- Unknown new class: Open set recognition

Application: BO, Medical imaging.  

Benchmark dataset:  
ImageNet-C: Varying intensity for dataset shift
- Models assign high confidence prediction to out of distribution record
- Adversarial example with noise. It is worst case/ hardest example to quantify uncertainty.  


Probabilistic approach:  

marginal likelihood is not trackable because of the high dimensional parameters
Inference: Variation, MCMC, ensemble
Average

Optimize with SGD. 

Bayesian Neural Network:  
- Select prior
- Approaximate true posterior

- Evidence lower bound (ELBO)

How do you select prior:  
- Standard normal prior.  
- Approaximate posterior.  

Heuristics.  
- Simple Baseline: Recalibration
  - Held out out of distribution
  - Smooth out model's temperature
 
- Monte Carlo Dropout: Test time dropout
- Deep ensemble
  - Different initialization
  - Very effective predictive uncertainty

  - Explore multiple modes of diversity in loss surface
  - Compute heavy especially big neural net 
  
- BatchEnsemble
  - Factorization of weight metrics
  
- Gaussian Processes
  - Can compute integral analytically
  - Low data regime
  - Gold standard for uncertainty estimate
  - Infinite wide NN are GPs
  - Neural Tangents library to play around infinite wide networks
  
Recent works:  
 - Implicit prior - AugMix
 - GP layer in NN
 - Diverse ensembles - Hyperparameters, regularizer, initialization
 - Edward2, uncertainty-baselines
 
 Open challenges
 - Need to close gap between theory and practice
 - Efficient marginalize over high dimension
 - What are good priors?
 - Need good realistic benchmarks
  




