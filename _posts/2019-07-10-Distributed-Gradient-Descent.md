Training a neural network can take weeks. A faster training method will save researcher and practitioner's time. 
There are various methods to train a neural network in a distributed manner. Few are outlined here:  

## Delay compensated Asynchronous Stochastic Gradient Descent
```
Zheng, Shuxin, et al. "Asynchronous stochastic gradient descent with delay compensation." 
Proceedings of the 34th International Conference on Machine Learning-Volume 70. JMLR. org, 2017.
```

* Setup involves a parameter server and many workers. 
* Workers receive a chunk of the training dataset and compute gradient on them. They send the computed gradient to the 
parameter serve
* Parameter server who maintains the global gradient by aggregating gradients from all the worker nodes. However, it does not
wait for all the workers to finish their iteration. When a worker node sends its gradient, the server updates the weights and send
the weights to the worker that just communicated. The worker then can start the next iteration of gradient computation.

* Asynchonous setting runs into problem when there are slow workers. Gradient sent by a slow worker can lag by few iterations than
weights that are stored at the server.
* Delay compensation technique allows a server to store a backup of each worker weights. When a worker sends its gradient, it
corrects the gradient based on an approximate Hessian matrix as well as considering the difference between the fresh weights 
of the parameter server and the possibly stale weights of the worker by using the backup. 

* Vanilla ASGD consider 0th term in the Taylor Series Expansion to approaximate a fresh gradient of the parameter server at a given time step. Vanilla ASGD ignores all the higher order term in the expansion series. If it considers the higher order term during the update, the optimization will converge. However, applying higher order term of the Taylor series is computation intensive.

* It is possible to show that element wise product of gradients becomes close to the Hessian matrix when iteration number t approaches infinity. Intuitively, after training for sufficient epoch or iteration, a neural network can approaximate any function. Let denote lambda * g(t) DOT g(t) as the term to approaximate the Hessian matrix. 

* When the parameter server updates the global gradient by adding the stale gradient from the slow worker, it approximates the slow worker's gradient as if it were fresh. The approximation is the correction. It replaces stale g(t) by g(t) + lambda * g(t) DOT g(t) DOT (w(t+p)-w(t)) where w(t+p) is the fresh weight of the parameter server and w(t) the last fresh update of the slowest worker from the backup stored at the parameter server.

* Zheng et al. show the delay compensated method performs close to Synchonous SGD on ImageNet dataset





