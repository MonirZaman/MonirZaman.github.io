# Tutorial: Sequential model-based optimization for general algorithm configuration (SMAC)

```
Hutter, Frank, Holger H. Hoos, and Kevin Leyton-Brown. "Sequential model-based optimization for general algorithm configuration." International conference on learning and intelligent optimization. Springer, Berlin, Heidelberg, 2011.
```

Hyperparameter optimization can be defined as as follows: given an algorithm A (the target algorithm), a set (or distribution) of problem instances I and a cost metric c, find Hyperparameter settings of A that minimize c on I.  
It has following three steps  
[1]. It starts by running the target algorithm with some initial parameter configurations.   
[2]. Fitting a surrogate model / response surface model using the existing data.  
[3]. Selecting a list of promising configurations.  
[4]. Running the target algorithm on (some of) the selected configurations until a given time bound is reached. 

A core part of the SMAC algorithm is the intensify of a configuration. A summary of the intensify operations are given below:  
* Takes a set of promising configurations and incumbent configurations that were chosen before
* For each promising configuration, perform the following steps
 * Few random instances (few of the many multi-task learning problems) are randomly selected and incumbent configuration are run against these instances to increase confidence on the incumbent. Incumbent is the parameter configurations that were previously chosen
 
 * A new sets of problem instances are taken where the incumbent ran but promising config did not run. when we compare the empirical cost statistics of two parameter configurations across multiple instances, the variance in this comparison is lower if we use the same N instances to compute both estimates.
 * Run the promising configuration on the sampled problem instances for the target algorithm
 * When promising configurations ran as many rounds as the incumbent and still as good as the incumbent, then it becomes the incumbent.


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
  
