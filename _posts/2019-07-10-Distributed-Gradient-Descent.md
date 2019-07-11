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
* Zheng et al. show the delay compensated method performs close to Synchonous SGD on ImageNet dataset





