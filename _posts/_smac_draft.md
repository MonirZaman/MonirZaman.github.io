# SMAC
Hyperparameter optimization can be defined as as follows: given an algorithm A (the target algorithm), a set (or distribution) of problem instances I and a cost metric c, find Hyperparameter settings of A that minimize c on I.

* Applies Random Forest as acquisition function with runtime as objective 
* Use computation graph feature such as mean, number of nodes, etc as features
* Use Sample size, number of configurations 
* Apply all these features through RF model and predict runtime

* Calculate Expected improvement over all the past configurations
* Take top 10 configurations
* Perform a local search of these 10 configuration
  * Change one categorical hyperparameter
  * Scale numerical hyperparameter so that they are [0, 1]
  * Change value of numerical hyperparameter to 4 neighbors
  * Predict EI for each of these hyperparameter configurations without evaluating the model 
    and using acquisition function
  
